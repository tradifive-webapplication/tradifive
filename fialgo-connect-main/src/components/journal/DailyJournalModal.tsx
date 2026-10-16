import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import { 
  X, TrendingUp, TrendingDown, Award, AlertTriangle, 
  Smile, AlignLeft, Calendar, FileText, CheckCircle,
  HelpCircle, ChevronRight, ChevronLeft, Activity, DollarSign, Percent, Share2,
  Star, Pin, Download
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import tradifiveLogo from "@/assets/tradifive-logo.png";
import tradifiveDarkLogo from "@/assets/tradifive-login-logo.png";
import TradeSlideOver from "./TradeSlideOver";
import { formatUTCDate, formatHoldDuration } from "@/utils/tradeUtils";

interface Trade {
  id: string;
  symbol: string;
  profit: number;
  type: string; // "BUY" or "SELL" (or 0/1 from real trades)
  volume: number | string;
  closed_at: string;
  open_price?: number;
  close_price?: number;
  open_time?: string;
  ticket?: string;
}

interface DailyJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  trades: Trade[];
  accountBalance: number;
}

interface JournalEntry {
  emotion: string;
  notes: string;
  mistakes: string;
  whatWentWell: string;
  summary: string;
  manualRR: string;
  marketCondition?: string;
  marketDescription?: string;
  isManualEmotion?: boolean;
  isManualMarket?: boolean;
}

const EMOTIONAL_STATES = [
  { level: 1, label: "Impatient", color: "from-red-500/10 to-amber-500/10 border-red-500/20 text-red-600 dark:text-red-400", message: "Felt impatient and rushed. Entered trades without confirmations, chased the market, and ignored plan rules." },
  { level: 2, label: "Stressed", color: "from-amber-500/10 to-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400", message: "Felt stressed or anxious. Fear of missing out (FOMO) was high, hesitated on entry, and closed winners too early." },
  { level: 3, label: "Neutral", color: "from-slate-500/10 to-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400", message: "Felt calm and objective. Traded average setups, accepted outcomes neutrally, and stayed composed." },
  { level: 4, label: "Disciplined", color: "from-emerald-500/10 to-indigo-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400", message: "Felt highly disciplined. Sticked to system rules strictly, accepted stop losses gracefully, and maintained focus." },
  { level: 5, label: "Calm", color: "from-teal-500/10 to-[#10B981]/10 border-[#10B981]/20 text-[#10B981]", message: "Felt calm and focused. Accepted losses and moved on. Could improve patience during reversals." },
];

const formatTradeTime = (timeStr?: string) => {
  if (!timeStr) return "—";
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch (e) {
    return timeStr;
  }
};

const formatWithBullets = (text: string) => {
  if (!text) return "";
  return text
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("• ")) return line;
      if (trimmed.startsWith("•")) return "• " + trimmed.substring(1).trimStart();
      return "• " + line;
    })
    .join("\n");
};

export default function DailyJournalModal({ isOpen, onClose, date, trades, accountBalance }: DailyJournalModalProps) {
  const { formatMoney, hideBalance, percentageOnly } = useJournalSettings();
  const [userId, setUserId] = useState<string>("demo");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const fmtDailyValueStr = (usdVal: number, opts?: { showSign?: boolean }) => {
    if (hideBalance) return "•••••";
    if (percentageOnly) {
      const pct = accountBalance > 0 ? (usdVal / accountBalance) * 100 : 0;
      const sign = opts?.showSign ? (pct >= 0 ? "+" : "-") : (pct < 0 ? "-" : "");
      return `${sign}${Math.abs(pct).toFixed(2)}%`;
    }
    return formatMoney(usdVal, opts);
  };

  const fmtDailyValue = (usdVal: number, opts?: { showSign?: boolean }) => {
    let str = "";
    if (percentageOnly) {
      const pct = accountBalance > 0 ? (usdVal / accountBalance) * 100 : 0;
      const sign = opts?.showSign ? (pct >= 0 ? "+" : "-") : (pct < 0 ? "-" : "");
      str = `${sign}${Math.abs(pct).toFixed(2)}%`;
    } else {
      str = formatMoney(usdVal, { ...opts, raw: true });
    }
    return hideBalance ? <span className="blur-[5.5px] select-none opacity-40 transition-all duration-300">{str}</span> : str;
  };
  
  const [entry, setEntry] = useState<JournalEntry>({
    emotion: "Neutral",
    notes: "",
    mistakes: "",
    whatWentWell: "",
    summary: "",
    manualRR: "",
    marketCondition: "Volatile",
    marketDescription: "High volatility in London session created good opportunities.",
    isManualEmotion: false,
    isManualMarket: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [currentPage, setCurrentPage] = useState(1);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const checkTheme = () => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDark(darkActive);
    };
    checkTheme();
    window.addEventListener("storage", checkTheme);
    return () => window.removeEventListener("storage", checkTheme);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("storage"));
  };

  // Format Date label
  const dateLabel = useMemo(() => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  // Construct stable date key (YYYY-MM-DD)
  const dateKey = useMemo(() => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [date]);

  // Fetch Supabase User ID & Load Saved Journal Entry
  useEffect(() => {
    const loadEntry = async () => {
      let activeUserId = "demo";
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          activeUserId = session.user.id;
          setUserId(activeUserId);
        }
      } catch (err) {
        console.error("Auth Session Error in Journal Modal:", err);
      }

      const storageKey = `fialgo_journal_log_${activeUserId}_${dateKey}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setEntry({
            emotion: parsed.emotion || "Neutral",
            notes: formatWithBullets(parsed.notes || ""),
            mistakes: formatWithBullets(parsed.mistakes || ""),
            whatWentWell: formatWithBullets(parsed.whatWentWell || ""),
            summary: formatWithBullets(parsed.summary || ""),
            manualRR: parsed.manualRR || "",
            marketCondition: parsed.marketCondition || "Volatile",
            marketDescription: formatWithBullets(parsed.marketDescription || "High volatility in London session created good opportunities."),
            isManualEmotion: parsed.isManualEmotion || false,
            isManualMarket: parsed.isManualMarket || false
          });
        } catch (e) {
          console.error("Failed to parse saved journal entry", e);
        }
      } else {
        // Reset to default if not saved
        setEntry({
          emotion: "Neutral",
          notes: "",
          mistakes: "",
          whatWentWell: "",
          summary: "",
          manualRR: "",
          marketCondition: "Volatile",
          marketDescription: formatWithBullets("High volatility in London session created good opportunities."),
          isManualEmotion: false,
          isManualMarket: false
        });
      }
      setSaveStatus("idle");
    };

    if (isOpen) {
      loadEntry();
    }
  }, [isOpen, dateKey]);

  // Persistent Autosave function
  const saveJournalEntry = (updatedEntry: JournalEntry) => {
    setSaveStatus("saving");
    const storageKey = `fialgo_journal_log_${userId}_${dateKey}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedEntry));
    setTimeout(() => {
      setSaveStatus("saved");
    }, 400);
  };

  const handleInputChange = (field: keyof JournalEntry, value: string) => {
    const updated = { ...entry, [field]: value };
    setEntry(updated);
    saveJournalEntry(updated);
  };

  const handleTextareaChange = (field: keyof JournalEntry, value: string) => {
    const updated = { ...entry, [field]: value };
    setEntry(updated);
    saveJournalEntry(updated);
  };

  const handleTextareaBlur = (field: keyof JournalEntry, value: string) => {
    const formatted = formatWithBullets(value);
    const updated = { ...entry, [field]: formatted };
    setEntry(updated);
    saveJournalEntry(updated);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, field: keyof JournalEntry) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      
      const newValue = value.substring(0, start) + "\n• " + value.substring(end);
      const updated = { ...entry, [field]: newValue };
      setEntry(updated);
      saveJournalEntry(updated);
      
      const target = e.currentTarget;
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 3;
      }, 0);
    }
  };

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>, field: keyof JournalEntry) => {
    if (!e.currentTarget.value) {
      const updated = { ...entry, [field]: "• " };
      setEntry(updated);
      saveJournalEntry(updated);
      const target = e.currentTarget;
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = 2;
      }, 0);
    }
  };

  // Metrics calculations for the day's trades
  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        total: 0,
        buys: 0,
        sells: 0,
        winners: 0,
        losers: 0,
        winRate: 0,
        netPnl: 0,
        netPct: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        calculatedRR: 0,
        bestTrade: null,
        worstTrade: null,
        chartData: []
      };
    }

    let netPnl = 0;
    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let buys = 0;
    let sells = 0;
    let bestTrade: Trade | null = null;
    let worstTrade: Trade | null = null;

    // Chronological order for P&L chart progression
    const sortedTrades = [...trades].sort((a, b) => {
      const aTime = a.closed_at ? new Date(a.closed_at).getTime() : 0;
      const bTime = b.closed_at ? new Date(b.closed_at).getTime() : 0;
      return aTime - bTime;
    });

    const chartData: { name: string; pnl: number }[] = [{ name: "Start", pnl: 0 }];
    let cumulativePnl = 0;

    sortedTrades.forEach((t, index) => {
      const p = t.profit || 0;
      netPnl += p;
      cumulativePnl += p;
      chartData.push({
        name: `Trade ${index + 1}`,
        pnl: Number(cumulativePnl.toFixed(2))
      });

      // Direction check
      const tType = String(t.type !== undefined ? t.type : (t.trade_type !== undefined ? t.trade_type : "")).toUpperCase();
      if (tType === "BUY" || tType === "0") {
        buys++;
      } else {
        sells++;
      }

      // Win/Loss categorization
      if (p > 0) {
        wins++;
        grossProfit += p;
      } else if (p < 0) {
        losses++;
        grossLoss += Math.abs(p);
      }

      // Best & Worst trade trackers
      if (!bestTrade || p > bestTrade.profit) {
        bestTrade = t;
      }
      if (!worstTrade || p < worstTrade.profit) {
        worstTrade = t;
      }
    });

    if (bestTrade && worstTrade && bestTrade.id === worstTrade.id) {
      worstTrade = null;
    }

    const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? grossProfit : 0;
    const avgWin = wins > 0 ? grossProfit / wins : 0;
    const avgLoss = losses > 0 ? grossLoss / losses : 0;
    const calculatedRR = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : 0;

    // Percentage of account balance
    const netPct = accountBalance > 0 ? (netPnl / accountBalance) * 100 : 0;

    return {
      total: trades.length,
      buys,
      sells,
      winners: wins,
      losers: losses,
      winRate,
      netPnl,
      netPct,
      profitFactor,
      avgWin,
      avgLoss,
      calculatedRR,
      bestTrade,
      worstTrade,
      chartData
    };
  }, [trades, accountBalance]);

  // Best and worst trade directions and R-units
  const { bestDirection, bestR, worstDirection, worstR } = useMemo(() => {
    let bestDirection = "LONG";
    let bestR = "0.0";
    if (stats.bestTrade) {
      const bestType = String(stats.bestTrade.type !== undefined ? stats.bestTrade.type : (stats.bestTrade.trade_type !== undefined ? stats.bestTrade.trade_type : "")).toUpperCase();
      bestDirection = (bestType === "BUY" || bestType === "0") ? "LONG" : "SHORT";
      bestR = ((stats.bestTrade.profit) / 50).toFixed(1);
    }

    let worstDirection = "SHORT";
    let worstR = "0.0";
    if (stats.worstTrade) {
      const worstType = String(stats.worstTrade.type !== undefined ? stats.worstTrade.type : (stats.worstTrade.trade_type !== undefined ? stats.worstTrade.trade_type : "")).toUpperCase();
      worstDirection = (worstType === "BUY" || worstType === "0") ? "LONG" : "SHORT";
      worstR = Math.abs((stats.worstTrade.profit) / 50).toFixed(1);
    }

    return { bestDirection, bestR, worstDirection, worstR };
  }, [stats.bestTrade, stats.worstTrade]);

  // Session Performance Calculations
  const sessionPerformance = useMemo(() => {
    let londonProfit = 0;
    let nyProfit = 0;
    let asianProfit = 0;

    trades.forEach(t => {
      if (!t.closed_at) return;
      const date = new Date(t.closed_at);
      const hour = date.getUTCHours(); // UTC hours
      
      // London Session: 07:00 to 15:00 UTC
      if (hour >= 7 && hour < 15) {
        londonProfit += t.profit;
      }
      // NY Session: 15:00 to 22:00 UTC
      else if (hour >= 15 && hour < 22) {
        nyProfit += t.profit;
      }
      // Asian Session: 22:00 to 07:00 UTC
      else {
        asianProfit += t.profit;
      }
    });

    const getPctStr = (prof: number) => {
      const pct = accountBalance > 0 ? (prof / accountBalance) * 100 : 0;
      if (pct === 0) return "0%";
      return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
    };

    return {
      london: getPctStr(londonProfit),
      londonVal: londonProfit,
      ny: getPctStr(nyProfit),
      nyVal: nyProfit,
      asian: getPctStr(asianProfit),
      asianVal: asianProfit
    };
  }, [trades, accountBalance]);

  // Derive automatic emotion based on stats and trades
  const autoEmotion = useMemo(() => {
    if (!trades || trades.length === 0) {
      return "Neutral";
    }

    const netPct = stats.netPct;
    const total = stats.total;
    const winRate = stats.winRate;

    // Impatient (Level 1): Huge loss (<= -2.5% of balance) or revenge trading (>= 8 trades and net loss)
    if (netPct <= -2.5 || (total >= 8 && stats.netPnl < 0)) {
      return "Impatient";
    }

    // Stressed (Level 2): Moderate loss (<= -1.0% of balance) or low win rate (< 35%) with net loss
    if (stats.netPnl < 0) {
      if (netPct <= -1.0 || winRate < 35 || total >= 5) {
        return "Stressed";
      }
      return "Neutral";
    }

    // Neutral (Level 3): Break-even
    if (Math.abs(stats.netPnl) < 10 || Math.abs(netPct) < 0.15) {
      return "Neutral";
    }

    // Calm (Level 5): High performance, high win rate, and solid profit
    if (stats.netPnl > 0 && winRate >= 75 && total >= 3 && netPct >= 1.5) {
      return "Calm";
    }

    // Disciplined (Level 4): Moderate green day
    if (stats.netPnl > 0) {
      return "Disciplined";
    }

    return "Neutral";
  }, [stats, trades]);

  // Active emotion based on user override flag
  const activeEmotionLabel = useMemo(() => {
    if (entry.isManualEmotion) {
      return entry.emotion;
    }
    return autoEmotion;
  }, [entry.isManualEmotion, entry.emotion, autoEmotion]);

  // Derive automatic market environment based on trades and stats
  const autoMarket = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        condition: "Range-bound",
        description: "• No trading activity was recorded on this day.\n• Preserved capital and waited for clear setups."
      };
    }

    // Identify main session
    let londonCount = 0;
    let nyCount = 0;
    let asianCount = 0;
    const symbolsMap: Record<string, number> = {};

    trades.forEach(t => {
      if (t.symbol) {
        symbolsMap[t.symbol] = (symbolsMap[t.symbol] || 0) + 1;
      }
      if (!t.closed_at) return;
      const date = new Date(t.closed_at);
      const hour = date.getUTCHours();
      if (hour >= 7 && hour < 15) {
        londonCount++;
      } else if (hour >= 15 && hour < 22) {
        nyCount++;
      } else {
        asianCount++;
      }
    });

    let mainSession = "London";
    if (nyCount > londonCount && nyCount > asianCount) {
      mainSession = "New York";
    } else if (asianCount > londonCount && asianCount > nyCount) {
      mainSession = "Asian";
    }

    // Top traded symbols (max 3)
    const sortedSymbols = Object.entries(symbolsMap)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3);
    const symbolsStr = sortedSymbols.join(" / ") || "multiple assets";

    let condition = "Range-bound";
    let description = "";

    const winRate = stats.winRate;
    const profitFactor = stats.profitFactor;

    if (profitFactor >= 2.0 || winRate >= 70) {
      condition = "Trending";
      description = `• Clean trend expansions observed during the ${mainSession} session.\n• Strong momentum provided high-probability entries in ${symbolsStr}.`;
    } else if (profitFactor > 0 && profitFactor < 0.8 && winRate <= 35) {
      condition = "Choppy";
      description = `• Choppy and indecisive market behavior dominated the ${mainSession} session.\n• Tight ranges and frequent false breakouts were observed in ${symbolsStr}.`;
    } else if (stats.total > 0 && Math.abs(stats.netPnl) / stats.total > 40) {
      condition = "Volatile";
      description = `• High volatility and rapid price movements witnessed in ${symbolsStr}.\n• The ${mainSession} session offered fast executions and wide trading ranges.`;
    } else {
      condition = "Range-bound";
      description = `• Steady, range-bound price action in ${symbolsStr} during the ${mainSession} session.\n• Mean reversion setups performed best within support and resistance levels.`;
    }

    return { condition, description };
  }, [trades, stats]);

  const activeMarketCondition = useMemo(() => {
    if (entry.isManualMarket) {
      return entry.marketCondition || autoMarket.condition;
    }
    return autoMarket.condition;
  }, [entry.isManualMarket, entry.marketCondition, autoMarket]);

  const activeMarketDescription = useMemo(() => {
    if (entry.isManualMarket) {
      return entry.marketDescription || autoMarket.description;
    }
    return autoMarket.description;
  }, [entry.isManualMarket, entry.marketDescription, autoMarket]);

  // Selected emotion config
  const selectedEmotion = useMemo(() => {
    return EMOTIONAL_STATES.find(e => e.label === activeEmotionLabel) || EMOTIONAL_STATES[0];
  }, [activeEmotionLabel]);

  const tickStyle = { fontSize: 9, fill: "#94a3b8", fontWeight: 500 };
  const tooltipStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    fontSize: "11px",
    fontWeight: "600",
  };

  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [dateKey]);

  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return trades.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [trades, currentPage]);

  const totalPages = Math.ceil(trades.length / ITEMS_PER_PAGE);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-[4px] flex items-center justify-center p-2 sm:p-4"
            onClick={onClose}
          >
            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="bg-white dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-[24px] sm:rounded-[32px] shadow-2xl w-full max-w-6xl h-[94vh] sm:h-[88vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Header section */}
              <div className="flex items-center justify-between px-3.5 py-3 sm:px-8 sm:py-5 border-b border-slate-150 dark:border-white/10 bg-white dark:bg-[#141414] gap-2">
                <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                  <div className="shrink-0">
                    <img src={tradifiveLogo} alt="TradiFive Logo" className="h-[28px] sm:h-[42px] w-auto object-contain" />
                  </div>
                  <div className="w-px h-5 sm:h-6 bg-slate-200 dark:bg-white/10 shrink-0" />
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div className="p-1 sm:p-1.5 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-lg text-indigo-500 dark:text-indigo-400 shrink-0">
                      <Calendar size={14} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[13px] sm:text-[16px] font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">{dateLabel}</h2>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400/90 tracking-wide uppercase truncate">Daily Performance</p>
                    </div>
                  </div>
                </div>
                
                {/* Autosave status & action buttons */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  {saveStatus === "saving" && (
                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded tracking-widest animate-pulse">Autosaving...</span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="hidden sm:flex text-[10px] font-bold uppercase text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded tracking-widest items-center gap-1">
                      <CheckCircle size={10} /> Saved
                    </span>
                  )}
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 shadow-sm text-indigo-600 dark:text-indigo-400 hover:scale-105 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all"
                    title="Share Report"
                  >
                    <Share2 size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Share Report</span>
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 shadow-sm flex items-center justify-center text-[#393939] dark:text-white hover:scale-105 transition-all shrink-0"
                    title="Close"
                  >
                    <X size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Scrollable Layout Body */}
              <div className="flex-1 overflow-y-auto amazing-scrollbar p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 bg-[#F8F9FA] dark:bg-[#111111]">
                
                {/* 1. Daily Metrics Section */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                  {/* Card 1: Net Result */}
                  <div className={`p-4 sm:p-5 md:p-6 rounded-[18px] sm:rounded-[22px] border-2 border-white dark:border-white/5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]
                    ${stats.netPnl >= 0 
                      ? "bg-gradient-to-b from-[#EBF9F3] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#C2F0DD] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#A5E5CB] dark:bg-none dark:bg-[#10B981]/5 dark:border-[1px] dark:border-[#10B981]/20 dark:shadow-none dark:hover:shadow-none"
                      : "bg-gradient-to-b from-[#FFF0F0] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#FCD1D1] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#FAA2A2] dark:bg-none dark:bg-[#F06363]/5 dark:border-[1px] dark:border-[#F06363]/20 dark:shadow-none dark:hover:shadow-none"
                    }`}
                  >
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400/30 group-hover:text-slate-400/50 transition-colors">
                      <DollarSign size={16} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#393939] dark:text-slate-400 uppercase tracking-widest block mb-1.5 sm:mb-2 truncate">Daily Net Return</span>
                    <h3 className={`text-[19px] sm:text-[22px] md:text-[26px] font-bold tracking-tight leading-none truncate ${stats.netPnl >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                      {fmtDailyValue(stats.netPnl, { showSign: true })}
                    </h3>
                    <p className={`text-[10px] sm:text-[11px] font-bold mt-1.5 sm:mt-2 truncate ${stats.netPnl >= 0 ? "text-[#10B981]/70" : "text-[#F06363]/70"}`}>
                      {percentageOnly ? "account P&L" : `${stats.netPnl >= 0 ? "+" : ""}${stats.netPct.toFixed(2)}% account P&L`}
                    </p>
                  </div>

                  {/* Card 2: Win Rate */}
                  <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-5 md:p-6 rounded-[18px] sm:rounded-[22px] relative overflow-hidden group shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none">
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400/30 group-hover:text-slate-400/50 transition-colors">
                      <Award size={16} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#393939] dark:text-slate-400 uppercase tracking-widest block mb-1.5 sm:mb-2 truncate">Win Rate</span>
                    <h3 className="text-[19px] sm:text-[22px] md:text-[26px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                      {stats.winRate}%
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400/90 mt-1.5 sm:mt-2 truncate">
                      {stats.winners} won · {stats.losers} lost
                    </p>
                  </div>

                  {/* Card 3: Total Trades */}
                  <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-5 md:p-6 rounded-[18px] sm:rounded-[22px] relative overflow-hidden group shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none">
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400/30 group-hover:text-slate-400/50 transition-colors">
                      <Activity size={16} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#393939] dark:text-slate-400 uppercase tracking-widest block mb-1.5 sm:mb-2 truncate">Total Trades</span>
                    <h3 className="text-[19px] sm:text-[22px] md:text-[26px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                      {stats.total}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400/90 mt-1.5 sm:mt-2 truncate">
                      {stats.buys} Buy · {stats.sells} Sell
                    </p>
                  </div>

                  {/* Card 4: Profit Factor */}
                  <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-5 md:p-6 rounded-[18px] sm:rounded-[22px] relative overflow-hidden group shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none">
                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400/30 group-hover:text-slate-400/50 transition-colors">
                      <Percent size={16} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#393939] dark:text-slate-400 uppercase tracking-widest block mb-1.5 sm:mb-2 truncate">Profit Factor</span>
                    <h3 className="text-[19px] sm:text-[22px] md:text-[26px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                      {stats.profitFactor || "N/A"}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400/90 mt-1.5 sm:mt-2 truncate">
                      Gross wins / losses
                    </p>
                  </div>

                  {/* Card 5: R:R Achieved */}
                  <div className="col-span-2 sm:col-span-1 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-5 md:p-6 rounded-[18px] sm:rounded-[22px] relative overflow-hidden group shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#393939] dark:text-slate-400 uppercase tracking-widest block mb-1.5 sm:mb-2 truncate">R:R Achieved</span>
                    <h3 className="text-[19px] sm:text-[22px] md:text-[26px] font-bold tracking-tight leading-none text-slate-900 dark:text-white truncate">
                      {stats.calculatedRR ? `1:${stats.calculatedRR}` : "N/A"}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400/90 mt-1.5 sm:mt-2 truncate">
                      Avg Win / Loss ratio
                    </p>
                  </div>
                </div>

                {/* 2. Daily Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
                  {/* Card 1: Best Trade */}
                  <div className="bg-gradient-to-b from-[#EBF9F3] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#10B981]/5 dark:border-[1px] dark:border-[#10B981]/20 p-6 rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#C2F0DD] dark:shadow-none relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#A5E5CB] dark:hover:shadow-none">
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#10B981]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] shrink-0">
                          <Star size={18} className="fill-[#10B981]/10" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#393939] dark:text-slate-400 uppercase tracking-widest block">Best Trade</span>
                          <h4 className="text-[15px] font-bold text-slate-900 dark:text-white uppercase leading-none mt-1">
                            {stats.bestTrade ? stats.bestTrade.symbol : "N/A"}
                          </h4>
                        </div>
                      </div>
                      {stats.bestTrade && (
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.08em] ${
                          bestDirection === "LONG"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#F06363]/10 text-[#F06363]"
                        }`}>
                          {bestDirection}
                        </span>
                      )}
                    </div>

                    {stats.bestTrade ? (
                      <div className="mt-3">
                        <h3 className={`text-[26px] font-bold tracking-tight leading-none tabular-nums ${stats.bestTrade.profit >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                          {fmtDailyValue(stats.bestTrade.profit, { showSign: true })}
                        </h3>
                        <p className={`text-[11px] font-bold tabular-nums mt-1.5 ${stats.bestTrade.profit >= 0 ? "text-[#10B981]/70" : "text-[#F06363]/70"}`}>
                          {Number(bestR) >= 0 ? "+" : ""}{bestR}R achieved
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-semibold py-4 text-center">No trades logged</p>
                    )}
                  </div>

                  {/* Card 2: Worst Trade */}
                  <div className="bg-gradient-to-b from-[#FFF0F0] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#F06363]/5 dark:border-[1px] dark:border-[#F06363]/20 p-6 rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#FCD1D1] dark:shadow-none relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#FAA2A2] dark:hover:shadow-none">
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#F06363]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F06363]/10 flex items-center justify-center text-[#F06363] shrink-0">
                          <Pin size={18} className="rotate-45 text-[#F06363]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#393939] dark:text-slate-400 uppercase tracking-widest block">Worst Trade</span>
                          <h4 className="text-[15px] font-bold text-slate-900 dark:text-white uppercase leading-none mt-1">
                            {stats.worstTrade ? stats.worstTrade.symbol : "N/A"}
                          </h4>
                        </div>
                      </div>
                      {stats.worstTrade && (
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.08em] ${
                          worstDirection === "LONG"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#F06363]/10 text-[#F06363]"
                        }`}>
                          {worstDirection}
                        </span>
                      )}
                    </div>

                    {stats.worstTrade ? (
                      <div className="mt-3">
                        <h3 className={`text-[26px] font-bold tracking-tight leading-none tabular-nums ${stats.worstTrade.profit >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                          {fmtDailyValue(stats.worstTrade.profit, { showSign: true })}
                        </h3>
                        <p className={`text-[11px] font-bold tabular-nums mt-1.5 ${stats.worstTrade.profit >= 0 ? "text-[#10B981]/70" : "text-[#F06363]/70"}`}>
                          {stats.worstTrade.profit < 0 ? "" : "+"}{((stats.worstTrade.profit) / 50).toFixed(1)}R {stats.worstTrade.profit < 0 ? "incurred" : "achieved"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-semibold py-4 text-center">{stats.total > 0 ? "N/A" : "No trades logged"}</p>
                    )}
                  </div>
                </div>

                {/* 3. Emotional State picker & Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-6">
                  {/* Left block: Emotional State Card */}
                  <div className="col-span-1 bg-gradient-to-b from-[#F5F7FB] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-6 rounded-[18px] sm:rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none flex flex-col justify-between relative overflow-hidden group min-h-[220px] sm:min-h-[280px] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] dark:hover:shadow-none">
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Card Title */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-lg text-[#5C52E5] dark:text-indigo-400">
                            <Smile size={16} />
                          </div>
                          <h4 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">Emotional State</h4>
                        </div>
                        {entry.isManualEmotion ? (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...entry, isManualEmotion: false };
                              setEntry(updated);
                              saveJournalEntry(updated);
                            }}
                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
                          >
                            Reset to Auto
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Auto
                          </span>
                        )}
                      </div>

                      {/* Face buttons row */}
                      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3.5 mb-4 sm:mb-6">
                        {EMOTIONAL_STATES.map((state) => {
                          const isSelected = activeEmotionLabel === state.label;
                          return (
                            <button
                              key={state.label}
                              type="button"
                              onClick={() => {
                                const updated = { ...entry, emotion: state.label, isManualEmotion: true };
                                  setEntry(updated);
                                  saveJournalEntry(updated);
                              }}
                              className={`relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-all duration-200
                                bg-[#E5E5FC] dark:bg-[#3A3A3C] text-[#5C52E5] dark:text-[#A594FD]
                                ${isSelected
                                  ? "ring-2 ring-offset-2 ring-[#5C52E5] dark:ring-offset-[#2C2C2E] scale-105"
                                  : "opacity-80 hover:opacity-100 hover:scale-105"
                                }`}
                            >
                              {/* Draw SVG Face outline */}
                              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                <circle cx="8.5" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
                                <circle cx="15.5" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
                                {state.level === 1 && (
                                  <>
                                    <path d="M7 6.5 L10 7.5" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M17 6.5 L14 7.5" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M8 17 Q12 13 16 17" />
                                  </>
                                )}
                                {state.level === 2 && <path d="M9 16 Q12 14 15 16" />}
                                {state.level === 3 && <line x1="9" y1="15.5" x2="15" y2="15.5" />}
                                {state.level === 4 && <path d="M9 14.5 Q12 16.5 15 14.5" />}
                                {state.level === 5 && <path d="M8 14 Q12 19 16 14" />}
                              </svg>
                            </button>
                          );
                        })}
                      </div>

                      {/* Info & Meditating Illustration Side-by-Side */}
                      <div className="flex items-end justify-between gap-2 mt-auto">
                        <div className="flex-1 space-y-1 pb-1">
                          <h5 className="text-[14px] sm:text-[15px] font-black text-[#5C52E5] dark:text-[#A594FD] tracking-tight">
                            {selectedEmotion.label}
                          </h5>
                          <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
                            {selectedEmotion.message}
                          </p>
                        </div>
                        {/* Meditation Illustration SVG */}
                        <div className="shrink-0 -mb-2 -mr-2">
                          <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-28 sm:h-28 text-[#5C52E5] dark:text-[#A594FD]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            {/* Stars / Sparkles */}
                            <path d="M98,22 L100,25 L103,26 L100,27 L98,30 L96,27 L93,26 L96,25 Z" fill="currentColor" className="opacity-45" stroke="none" />
                            <path d="M18,35 L20,38 L23,39 L20,40 L18,43 L16,40 L13,39 L16,38 Z" fill="currentColor" className="opacity-45" stroke="none" />
                            <path d="M102,52 L103,54 L105,55 L103,56 L102,58 L101,56 L99,55 L101,54 Z" fill="currentColor" className="opacity-45" stroke="none" />
                            
                            {/* Head & Hair */}
                            <path d="M52,26 C43,26 43,35 45,38 C42,39 44,43 45,43 C46,45 48,45 50,45 C52,45 54,45 55,45 C57,43 59,43 57,38 C59,35 59,26 52,26 Z" fill="currentColor" className="opacity-20 text-[#5C52E5]" />
                            <path d="M47,29 C45,32 45,36 47,38" />
                            <path d="M57,29 C59,32 59,36 57,38" />
                            <path d="M52,26 C47,26 45,30 46,34 C49,32 55,32 58,34 C59,30 57,26 52,26 Z" fill="currentColor" className="text-[#5C52E5]" />
                            
                            {/* Face details */}
                            <path d="M47,38 C49,40 51,40 53,38" />
                            <path d="M57,38 C59,40 61,40 63,38" />
                            <path d="M52,43 C54,45 56,43 57,42" strokeWidth="1.2" />
                            <path d="M51,47 Q55,50 59,47" />

                            {/* Ears */}
                            <path d="M44,39 C43,39 43,42 44,42" />
                            <path d="M60,39 C61,39 61,42 60,42" />
                            
                            {/* Neck */}
                            <path d="M50,49 L50,54 L54,54 L54,49" />
                            
                            {/* Hands & Arms in Mudra pose */}
                            <path d="M40,58 C32,59 28,68 34,74 C36,76 39,78 43,76" />
                            <circle cx="43" cy="76" r="2" fill="currentColor" />
                            <path d="M44,74 C46,74 47,76 46,78" />

                            <path d="M64,58 C72,59 76,68 70,74 C68,76 65,78 61,76" />
                            <circle cx="61" cy="76" r="2" fill="currentColor" />
                            <path d="M60,74 C58,74 57,76 58,78" />

                            {/* Torso / Clothes */}
                            <path d="M44,54 L60,54 L63,68 L41,68 Z" fill="currentColor" className="opacity-30 text-[#5C52E5]" />
                            <path d="M44,54 L60,54 L63,68 L41,68 Z" />
                            <path d="M44,54 L39,59 L42,62 L45,58" />
                            <path d="M60,54 L65,59 L62,62 L59,58" />
                            
                            {/* Crossed Legs (Lotus pose) */}
                            <path d="M26,76 C20,76 22,86 40,88 L64,88 C82,86 84,76 78,76 C72,76 68,82 52,82 C36,82 32,76 26,76 Z" fill="currentColor" className="opacity-15 text-[#5C52E5]" />
                            <path d="M26,76 C20,76 22,86 40,88 L64,88 C82,86 84,76 78,76 C72,76 68,82 52,82 C36,82 32,76 26,76 Z" />
                            <circle cx="34" cy="81" r="2.5" fill="currentColor" className="opacity-55" />
                            <circle cx="70" cy="81" r="2.5" fill="currentColor" className="opacity-55" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right block: P&L Chart over time */}
                  <div className="col-span-1 lg:col-span-2 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-6 rounded-[18px] sm:rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none flex flex-col min-h-[220px] sm:min-h-[280px] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] dark:hover:shadow-none relative">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <TrendingUp size={12} /> Intraday P&L Over Time
                      </h4>
                      <span className={`text-[12px] sm:text-[13px] font-bold ${stats.netPnl >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                        {fmtDailyValue(stats.netPnl, { showSign: true })}
                      </span>
                    </div>
                    <div className="w-full relative min-h-[160px] flex-1" style={{ height: 160, minHeight: 160 }}>
                      {stats.chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={160}>
                          <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="modalPnlGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-white/[0.02]" />
                            <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                            <YAxis tick={{ ...tickStyle, filter: hideBalance ? 'blur(2px)' : 'none', opacity: hideBalance ? 0.4 : 1 }} axisLine={false} tickLine={false} tickFormatter={(v) => { let s = ""; if (percentageOnly) { const pct = accountBalance > 0 ? (v / accountBalance) * 100 : 0; s = `${pct >= 0 ? "+" : "-"}${Math.abs(pct).toFixed(2)}%`; } else { s = formatMoney(v, { raw: true }); } return s; }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isDark ? "#2C2C2E" : "#fff",
                                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                                fontSize: "11px",
                                fontWeight: "600",
                                color: isDark ? "#fff" : "#0f172a",
                              }}
                              formatter={(value: any) => [fmtDailyValue(Number(value), { showSign: true }), "Cumulative P&L"]}
                            />
                            <Area type="monotone" dataKey="pnl" stroke="#6366f1" strokeWidth={2} fill="url(#modalPnlGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-[11px] font-semibold">
                          Need closed trades to calculate intraday curve
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Interactive Inputs Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-6">
                  {/* Notes & Observations (col-span-2) */}
                  <div className="col-span-1 lg:col-span-2 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-6 rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#393939] dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <FileText size={13} className="text-slate-400" /> Notes & Observations
                    </h4>
                    <textarea
                      value={entry.notes}
                      onChange={e => handleTextareaChange("notes", e.target.value)}
                      onKeyDown={e => handleTextareaKeyDown(e, "notes")}
                      onFocus={e => handleTextareaFocus(e, "notes")}
                      onBlur={e => handleTextareaBlur("notes", e.target.value)}
                      rows={8}
                      placeholder="Write down details about market behavior, trading setups, etc..."
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-[13px] font-medium leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                    />
                  </div>

                  {/* Market Environment (col-span-1) */}
                  <div className="col-span-1 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-6 rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#393939] dark:text-slate-400 flex items-center gap-1.5">
                            <Activity size={13} className="text-slate-400" /> Market Environment
                          </h4>
                          {entry.isManualMarket ? (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...entry, isManualMarket: false };
                                setEntry(updated);
                                saveJournalEntry(updated);
                              }}
                              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
                            >
                              Reset to Auto
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Auto
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 mb-3">
                          <select
                            value={activeMarketCondition}
                            onChange={e => {
                              const updated = { ...entry, marketCondition: e.target.value, isManualMarket: true };
                              setEntry(updated);
                              saveJournalEntry(updated);
                            }}
                            className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                          >
                            <option value="Volatile">Volatile</option>
                            <option value="Trending">Trending</option>
                            <option value="Range-bound">Range-bound</option>
                            <option value="Choppy">Choppy</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={activeMarketDescription}
                        onChange={e => {
                          const updated = { ...entry, marketDescription: e.target.value, isManualMarket: true };
                          setEntry(updated);
                          saveJournalEntry(updated);
                        }}
                        onKeyDown={e => handleTextareaKeyDown(e, "marketDescription")}
                        onFocus={e => handleTextareaFocus(e, "marketDescription")}
                        onBlur={e => {
                          const formatted = formatWithBullets(e.target.value);
                          const updated = { ...entry, marketDescription: formatted, isManualMarket: true };
                          setEntry(updated);
                          saveJournalEntry(updated);
                        }}
                        rows={5}
                        placeholder="Describe the session market environment..."
                        className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-[13px] font-medium leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none shadow-inner flex-1 mt-2"
                      />
                    </div>
                  </div>

                  {/* What Went Well (col-span-1) */}
                  <div className="col-span-1 bg-gradient-to-b from-[#EBF9F3] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#10B981]/5 dark:border-[1px] dark:border-[#10B981]/20 p-4 sm:p-6 rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#C2F0DD] dark:shadow-none flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#A5E5CB] dark:hover:shadow-none">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#10B981] mb-3 flex items-center gap-1.5">
                      <CheckCircle size={13} className="text-[#10B981]" /> What Went Well
                    </h4>
                    <textarea
                      value={entry.whatWentWell}
                      onChange={e => handleTextareaChange("whatWentWell", e.target.value)}
                      onKeyDown={e => handleTextareaKeyDown(e, "whatWentWell")}
                      onFocus={e => handleTextareaFocus(e, "whatWentWell")}
                      onBlur={e => handleTextareaBlur("whatWentWell", e.target.value)}
                      rows={5}
                      placeholder="Did you follow your risk management plan? Excellent executions? Write here..."
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-[13px] font-medium leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]/40 transition-all resize-none shadow-inner"
                    />
                  </div>

                  {/* Mistakes & Rules Violated (col-span-1) */}
                  <div className="col-span-1 bg-gradient-to-b from-[#FFF0F0] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#F06363]/5 dark:border-[1px] dark:border-[#F06363]/20 p-4 sm:p-6 rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#FCD1D1] dark:shadow-none flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#FAA2A2] dark:hover:shadow-none">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#F06363] mb-3 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-[#F06363]" /> Mistakes & Rules Violated
                    </h4>
                    <textarea
                      value={entry.mistakes}
                      onChange={e => handleTextareaChange("mistakes", e.target.value)}
                      onKeyDown={e => handleTextareaKeyDown(e, "mistakes")}
                      onFocus={e => handleTextareaFocus(e, "mistakes")}
                      onBlur={e => handleTextareaBlur("mistakes", e.target.value)}
                      rows={5}
                      placeholder="Chased a breakout? Revenge trading? Boredom entry? Log it to avoid it next time..."
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-[13px] font-medium leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F06363]/20 focus:border-[#F06363]/40 transition-all resize-none shadow-inner"
                    />
                  </div>

                  {/* Daily Summary Comment (col-span-1) */}
                  <div className="col-span-1 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 p-4 sm:p-6 rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#393939] dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <AlignLeft size={13} className="text-slate-400" /> Daily Summary Comment
                    </h4>
                    <textarea
                      value={entry.summary}
                      onChange={e => handleTextareaChange("summary", e.target.value)}
                      onKeyDown={e => handleTextareaKeyDown(e, "summary")}
                      onFocus={e => handleTextareaFocus(e, "summary")}
                      onBlur={e => handleTextareaBlur("summary", e.target.value)}
                      rows={5}
                      placeholder="Provide a final high-level review or comment on this day's performance..."
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-[13px] font-medium leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                    />
                  </div>
                </div>

                {/* 5. Complete Trade History for the Day */}
                <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] border-2 border-white dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 rounded-[22px] overflow-hidden shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none transition-all duration-300 hover:scale-[1.002] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] dark:hover:shadow-none">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/20 dark:bg-white/[0.005]">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Activity size={12} /> Today's Executed Trades ({trades.length})
                    </h4>
                  </div>
                  {trades.length > 0 ? (
                    <>
                      <div className="overflow-x-auto max-h-[460px] overflow-y-auto amazing-scrollbar relative">
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-100 dark:bg-[#141414] text-left border-b border-slate-100 dark:border-white/10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ticket</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Symbol</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Type</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Volume</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Open Price</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Close Price</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Time Closed</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Commission</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Swaps</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Gross P&L</th>
                              <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Net P&L</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                            {paginatedTrades.map((t, index) => {
                              const isWin = t.profit >= 0;
                              const tType = String(t.type !== undefined ? t.type : (t.trade_type !== undefined ? t.trade_type : "")).toUpperCase();
                              const isBuy = tType === "BUY" || tType === "0";
                              return (
                                <tr 
                                  key={t.id || index} 
                                  onClick={() => {
                                    const mapped = {
                                      id: t.ticket || t.id,
                                      asset: t.symbol,
                                      direction: String(t.type).toUpperCase() === "BUY" || String(t.type) === "0" ? "BUY" as const : "SELL" as const,
                                      pnl: Number(t.profit),
                                      entryTime: formatUTCDate(t.open_time || t.opened_at || new Date().toISOString()),
                                      exitTime: t.closed_at ? formatUTCDate(t.closed_at) : "Open",
                                      entryPrice: Number(t.open_price || 0),
                                      exitPrice: Number(t.close_price || 0),
                                      stopLoss: (t as any).stop_loss ? Number((t as any).stop_loss) : undefined,
                                      takeProfit: (t as any).take_profit ? Number((t as any).take_profit) : undefined,
                                      setups: [],
                                      mistakes: [],
                                      notes: "",
                                      holdDuration: formatHoldDuration(t.open_time || t.opened_at || new Date().toISOString(), t.closed_at),
                                      rawTrade: t
                                    };
                                    setSelectedTrade(mapped);
                                    setIsSlideOverOpen(true);
                                  }}
                                  className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all cursor-pointer"
                                >
                                  <td className="py-3 px-5 text-[11px] text-slate-400 font-sans font-medium">
                                    {t.ticket || t.id.slice(0, 8)}
                                  </td>
                                  <td className="py-3 px-5 text-[12px] font-bold text-slate-900 dark:text-slate-100 tracking-wide">
                                    {t.symbol}
                                  </td>
                                  <td className="py-3 px-5 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.08em] ${
                                      isBuy
                                        ? "bg-[#10B981]/10 text-[#10B981]"
                                        : "bg-[#F06363]/10 text-[#F06363]"
                                    }`}>
                                      {isBuy ? "BUY" : "SELL"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-5 text-[11.5px] font-bold text-right text-slate-700 dark:text-slate-300 font-sans">
                                    {Number(((t as any).lot_size ?? t.volume) || 0).toFixed(2)}
                                  </td>
                                  <td className="py-3 px-5 text-[11.5px] font-semibold text-right text-slate-700 dark:text-slate-300 font-sans">
                                    {t.open_price ? t.open_price.toFixed(5) : "—"}
                                  </td>
                                  <td className="py-3 px-5 text-[11.5px] font-semibold text-right text-slate-700 dark:text-slate-300 font-sans">
                                    {t.close_price ? t.close_price.toFixed(5) : "—"}
                                  </td>
                                  <td className="py-3 px-5 text-[11px] text-slate-400 font-bold text-center font-sans">
                                    {t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                                  </td>
                                  <td className="py-3 px-5 text-[11.5px] font-semibold text-right text-slate-700 dark:text-slate-300 font-sans">
                                    {(t as any).commission !== undefined && (t as any).commission !== null ? formatMoney(Number((t as any).commission), { raw: true, showSign: true }) : "-"}
                                  </td>
                                  <td className="py-3 px-5 text-[11.5px] font-semibold text-right text-slate-700 dark:text-slate-300 font-sans">
                                    {(t as any).swap !== undefined && (t as any).swap !== null ? formatMoney(Number((t as any).swap), { raw: true, showSign: true }) : "-"}
                                  </td>
                                  <td className={`py-3 px-5 text-[12px] font-bold text-right font-sans ${
                                    (Number(t.profit || 0) - Number((t as any).commission || 0) - Number((t as any).swap || 0) - Number((t as any).fee || 0)) >= 0 ? "text-[#10B981]" : "text-[#F06363]"
                                  }`}>
                                    {fmtDailyValue(Number(t.profit || 0) - Number((t as any).commission || 0) - Number((t as any).swap || 0) - Number((t as any).fee || 0), { showSign: true })}
                                  </td>
                                  <td className={`py-3 px-5 text-[12px] font-bold text-right font-sans ${
                                    isWin ? "text-[#10B981]" : "text-[#F06363]"
                                  }`}>
                                    {fmtDailyValue(t.profit, { showSign: true })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      {trades.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/20 dark:bg-[#141414]">
                          <div className="text-[11px] font-bold text-slate-400">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, trades.length)} of {trades.length} trades
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-300 transition-all ${
                                currentPage === 1 
                                  ? "opacity-40 cursor-not-allowed" 
                                  : "hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
                              }`}
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-300 transition-all ${
                                currentPage === totalPages 
                                  ? "opacity-40 cursor-not-allowed" 
                                  : "hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white"
                              }`}
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-[11px] font-semibold">
                      No trades recorded on this calendar day.
                    </div>
                  )}
                </div>

              </div>

              {/* Footer row */}
              <div className="px-4 py-3 sm:px-8 sm:py-5 border-t border-slate-100 dark:border-white/10 flex flex-col gap-4 bg-slate-50/50 dark:bg-[#141414] shrink-0">
                {/* Quotation banner in new white card */}
                <div className="bg-white dark:bg-[#2C2C2E] border border-slate-100 dark:border-white/10 px-4 py-3 sm:px-6 sm:py-3.5 rounded-[16px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-slate-700 dark:text-slate-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C52E5] fill-current shrink-0" stroke="none">
                      <path d="M11.192 15.757c0-.907-.188-1.745-.562-2.512A5.572 5.572 0 0 0 9.07 11.23a4.57 4.57 0 0 0-2.31-.586c-.503 0-1.002.096-1.498.286A4.316 4.316 0 0 0 3.73 12.01c-.37.382-.646.852-.828 1.41a5.617 5.617 0 0 0-.273 1.777c0 .907.188 1.745.563 2.512A5.573 5.573 0 0 0 4.75 19.73a4.57 4.57 0 0 0 2.31.587c.503 0 1.002-.096 1.498-.286a4.314 4.314 0 0 0 1.532-1.079c.37-.382.646-.852.828-1.41a5.618 5.618 0 0 0 .274-1.785zm10.238 0c0-.907-.188-1.745-.563-2.512a5.572 5.572 0 0 0-1.558-2.015 4.57 4.57 0 0 0-2.31-.586c-.503 0-1.002.096-1.498.286a4.317 4.317 0 0 0-1.532 1.079c-.37.382-.646.852-.828 1.41a5.616 5.616 0 0 0-.273 1.777c0 .907.188 1.745.563 2.512a5.573 5.573 0 0 0 1.558 2.015 4.57 4.57 0 0 0 2.31.587c.503 0 1.002-.096 1.498-.286a4.314 4.314 0 0 0 1.532-1.079c.37-.382.646-.852.828-1.41a5.618 5.618 0 0 0 .274-1.785z"/>
                    </svg>
                    <p className="text-[11.5px] sm:text-[12px] font-medium leading-relaxed">
                      Discipline is choosing between what you want now and what you want most.
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0 self-end sm:self-auto">— Tradifive</span>
                </div>
              </div>
            </motion.div>
            
            {/* Share Preview Dialog Modal */}
            <AnimatePresence>
              {showShareModal && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[440px] rounded-[32px] overflow-hidden bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 shadow-2xl p-6 flex flex-col space-y-6"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Header with logo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={tradifiveLogo} alt="TradiFive Logo" className="h-[36px] object-contain" />
                        <span className="text-[12px] font-bold text-slate-400 mt-1">REPORT</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            const text = `TradiFive Trading Report - ${dateLabel}\n----------------------------------\nNet Return: ${fmtDailyValueStr(stats.netPnl, { showSign: true })} ${!percentageOnly ? `(${stats.netPct.toFixed(2)}%)` : ""}\nWin Rate: ${stats.winRate}%\nTotal Trades: ${stats.total}\nBest Trade: ${stats.bestTrade ? `${stats.bestTrade.symbol} (${fmtDailyValueStr(stats.bestTrade.profit, { showSign: true })})` : "—"}\nWorst Trade: ${stats.worstTrade ? `${stats.worstTrade.symbol} (${fmtDailyValueStr(stats.worstTrade.profit, { showSign: true })})` : "—"}\nMarket Condition: ${entry.marketCondition || "Volatile"}\nEmotional State: ${activeEmotionLabel}\nNotes: ${entry.notes || "No notes logged."}\n----------------------------------\nDiscipline is choosing between what you want now and what you want most. — Tradifive`;
                            navigator.clipboard.writeText(text);
                            toast.success("Performance report copied to clipboard!");
                          }}
                          className="w-[36px] h-[36px] rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center justify-center text-[#393939] dark:text-white hover:scale-105 transition-transform"
                          title="Copy Summary to Clipboard"
                        >
                          <Share2 size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => toast.info("Image download feature coming soon!")}
                          className="w-[36px] h-[36px] rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center justify-center text-[#393939] dark:text-white hover:scale-105 transition-transform"
                          title="Download Report Image"
                        >
                          <Download size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => setShowShareModal(false)} 
                          className="w-[36px] h-[36px] rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F4] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center justify-center text-[#393939] dark:text-white hover:scale-105 transition-transform"
                          title="Close"
                        >
                          <X size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Report Graphic Panel */}
                    <div className="flex flex-col gap-3.5">
                      {/* Date Box */}
                      <div className="flex flex-col bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 rounded-[14px] p-3.5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Trading Performance summary</span>
                        <h3 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">{dateLabel}</h3>
                      </div>

                      {/* Summary Metric list */}
                      <div className="grid grid-cols-2 gap-3 font-sans">
                        <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 rounded-[14px] p-3.5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Daily Net Return</span>
                          <span className={`text-[17px] leading-tight font-bold ${stats.netPnl >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                            {fmtDailyValue(stats.netPnl, { showSign: true })} {!percentageOnly && `(${stats.netPct.toFixed(2)}%)`}
                          </span>
                        </div>
                        <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 rounded-[14px] p-3.5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Win Rate / Trades</span>
                          <span className="text-[17px] leading-tight font-bold text-slate-900 dark:text-white">
                            {stats.winRate}% <span className="text-[13px] text-slate-500">({stats.total} trades)</span>
                          </span>
                        </div>
                        <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 rounded-[14px] p-3.5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Market Condition</span>
                          <span className="text-[14px] leading-tight font-bold text-slate-800 dark:text-slate-200">
                            {entry.marketCondition || "Volatile"}
                          </span>
                        </div>
                        <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 rounded-[14px] p-3.5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Emotional State</span>
                          <span className="text-[14px] leading-tight font-bold text-slate-800 dark:text-slate-200">
                            {activeEmotionLabel}
                          </span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2 text-[12px] font-medium leading-relaxed font-sans bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border-[1.5px] border-white dark:bg-none dark:bg-[#252525] dark:border-[1px] dark:border-white/5 rounded-[14px] p-3.5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none">
                        {stats.bestTrade && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Best Trade</span>
                            <span className="text-[#10B981] font-bold">{stats.bestTrade.symbol} ({fmtDailyValue(stats.bestTrade.profit, { showSign: true })})</span>
                          </div>
                        )}
                        {stats.worstTrade && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Worst Trade</span>
                            <span className="text-[#F06363] font-bold">{stats.worstTrade.symbol} ({fmtDailyValue(stats.worstTrade.profit, { showSign: true })})</span>
                          </div>
                        )}
                      </div>

                      {/* Notes & Summary */}
                      {entry.notes && (
                        <div className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed italic border-t border-slate-200/50 dark:border-white/10 pt-3">
                          &ldquo;{entry.notes.length > 150 ? `${entry.notes.slice(0, 150)}...` : entry.notes}&rdquo;
                        </div>
                      )}

                    </div>

                    {/* Quote Footer */}
                    <div className="bg-slate-50 dark:bg-[#141414] px-4 py-3 rounded-[14px] text-[10px] text-slate-500 italic border border-slate-100 dark:border-white/5 text-center mt-2">
                      &ldquo;Discipline is choosing between what you want now and what you want most.&rdquo; — Tradifive
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
      
      {/* Trade Slide-Over details viewer */}
      <TradeSlideOver
        trade={selectedTrade}
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
      />
    </AnimatePresence>,
    document.body
  );
}
