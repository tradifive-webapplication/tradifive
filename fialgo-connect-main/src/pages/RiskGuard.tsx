import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Gauge } from "@/components/ui/charts";
import {
  Zap,
  Power,
  AlertTriangle,
  Target,
  TrendingDown,
  ShieldCheck,
  Clock,
  Calendar,
  Brain,
  Trophy,
  Star,
  Sparkles,
  ShieldAlert,
  Settings,
  Pencil,
  FlaskConical,
  Minus,
  Plus,
  MonitorOff,
  Key,
  Eye,
  EyeOff,
  Crown,
  HeartPulse,
  CheckSquare,
  Volume2,
  Moon,
  Sunrise,
  TrendingUp,
  Crosshair,
  Layers,
  StopCircle,
  Wallet,
  ShieldOff,
  RefreshCw,
  Lock,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePlan } from "@/hooks/usePlan";
import { useNavigate } from "react-router-dom";
import { useRiskConfig } from "@/hooks/useRiskConfig";
import { getGamificationState } from "@/utils/gamification";
import { useMarket } from "@/contexts/MarketContext";
import { RiskGuardCard } from "@/components/RiskGuardCard";
import { TradeSlotsBlobStrip } from "@/components/ui/TradeSlotBlobCheckbox";
import {
  getPinnedRiskWidgets,
  type RiskWidgetId,
} from "@/components/dashboard/RiskGuardWidgets";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";

const SURFACE_CARD =
  "bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none";

const INPUT_BASE =
  "bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-[9px] text-[12px] font-semibold text-slate-900 dark:text-white outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all tabular-nums";

const SELECT_TRIGGER =
  "w-full bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-[9px] px-2.5 h-[32px] text-[12px] font-semibold text-slate-900 dark:text-white tabular-nums focus:ring-2 focus:ring-[#2563EB]/20";

const FIELD_LABEL =
  "text-[9.5px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1 block";

const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: EXPO_OUT },
  },
};

type RiskTab = "trading_control" | "risk_management" | "behaviour";

function formatTime12h(hhmm: string): string {
  const [hStr = "20", mStr = "00"] = (hhmm || "20:00").split(":");
  const h24 = Number(hStr);
  const safeH = Number.isFinite(h24) ? Math.max(0, Math.min(23, h24)) : 20;
  const period = safeH >= 12 ? "PM" : "AM";
  const h12 = safeH % 12 === 0 ? 12 : safeH % 12;
  const safeM = String(Math.max(0, Math.min(59, Number(mStr) || 0))).padStart(2, "0");
  return `${h12}:${safeM} ${period}`;
}

function TimePickerPopover({
  value,
  onChange,
  subtitle = "Broker Time",
}: {
  value: string;
  onChange: (val: string) => void;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hRaw = "20", mRaw = "00"] = (value || "20:00").split(":");
  const h24 = Math.max(0, Math.min(23, Number(hRaw) || 0));
  const minute = String(Math.max(0, Math.min(59, Number(mRaw) || 0))).padStart(2, "0");
  const isPm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const commitTime = (nextH12: number, nextMin: string, nextPm: boolean) => {
    const converted24 = nextPm
      ? nextH12 === 12
        ? 12
        : nextH12 + 12
      : nextH12 === 12
      ? 0
      : nextH12;
    const hStr = String(converted24).padStart(2, "0");
    onChange(`${hStr}:${nextMin}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center justify-between w-full h-[32px] px-2.5 cursor-pointer ${INPUT_BASE}`}
        >
          <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
            {formatTime12h(value)}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Clock size={11} />
            {subtitle}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[228px] p-2.5 border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl bg-white dark:bg-[#1C1C20]"
        align="start"
      >
        {/* Top Live Preview + AM/PM Segmented Switcher */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.07]">
          <div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
              {subtitle}
            </span>
            <span className="text-[14px] font-bold text-slate-900 dark:text-white tabular-nums">
              {String(h12).padStart(2, "0")}:{minute}{" "}
              <span className="text-[#2563EB] dark:text-blue-400">
                {isPm ? "PM" : "AM"}
              </span>
            </span>
          </div>

          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06]">
            {(["AM", "PM"] as const).map((period) => {
              const activePeriod = (period === "PM") === isPm;
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => commitTime(h12, minute, period === "PM")}
                  className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    activePeriod
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {period}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column Labels */}
        <div className="grid grid-cols-2 gap-2 px-1 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 text-center">
          <span>Hour</span>
          <span>Minute</span>
        </div>

        {/* Clean Rounded Columns */}
        <div className="grid grid-cols-2 gap-2 h-[184px]">
          <div className="overflow-y-auto amazing-scrollbar pr-0.5 space-y-0.5">
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((itemH) => {
              const selected = itemH === h12;
              return (
                <button
                  key={`h12-${itemH}`}
                  type="button"
                  onClick={() => commitTime(itemH, minute, isPm)}
                  className={`w-full text-center py-1.5 rounded-lg text-[12px] tabular-nums transition-colors cursor-pointer ${
                    selected
                      ? "bg-blue-50 dark:bg-blue-500/20 font-bold text-[#2563EB] dark:text-blue-300"
                      : "text-slate-600 dark:text-neutral-300 hover:bg-slate-100/70 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {String(itemH).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <div className="overflow-y-auto amazing-scrollbar pr-0.5 space-y-0.5 border-l border-slate-100 dark:border-white/[0.06] pl-1.5">
            {Array.from({ length: 60 }).map((_, i) => {
              const m = i.toString().padStart(2, "0");
              const selected = m === minute;
              return (
                <button
                  key={`m-${m}`}
                  type="button"
                  onClick={() => commitTime(h12, m, isPm)}
                  className={`w-full text-center py-1.5 rounded-lg text-[12px] tabular-nums transition-colors cursor-pointer ${
                    selected
                      ? "bg-blue-50 dark:bg-blue-500/20 font-bold text-[#2563EB] dark:text-blue-300"
                      : "text-slate-600 dark:text-neutral-300 hover:bg-slate-100/70 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-white/[0.07]">
          <span className="text-[10px] font-medium text-slate-400">
            Selected: {formatTime12h(value)}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10.5px] font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function RiskGuard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Guardian PIN & Hard Stop States
  const [pinActive, setPinActive] = useState(false);
  const [guardianPin, setGuardianPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [hardStopActive, setHardStopActive] = useState(false);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<RiskTab>("trading_control");

  // SEBI Indian Market Daily Login State
  const [dailyTokenActive, setDailyTokenActive] = useState(() => {
    try {
      return sessionStorage.getItem("indian_daily_token") === "active";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
      } else {
        setUser(session.user);
        setAuthChecked(true);
      }
    };
    checkUser();
  }, [navigate]);

  // A. Risk Framework States
  const [maxLotActive, setMaxLotActive] = useState(false);
  const [drawdownGuardActive, setDrawdownGuardActive] = useState(false);
  const [ddPeriod, setDdPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [maxDrawdown, setMaxDrawdown] = useState(5);
  const [drawdownBasis, setDrawdownBasis] = useState<"balance" | "equity">("balance");
  const [weeklyDrawdown, setWeeklyDrawdown] = useState(10);
  const [monthlyDrawdown, setMonthlyDrawdown] = useState(20);
  const [stopAfterLoss, setStopAfterLoss] = useState(false);
  const [martingaleMultiplier, setMartingaleMultiplier] = useState(1.5);
  const [allowedTicker, setAllowedTicker] = useState("XAUUSD");
  const [defaultStopLoss, setDefaultStopLoss] = useState(15);
  const [weekendCloseTime, setWeekendCloseTime] = useState("20:00");
  const [emotionSensitivity, setEmotionSensitivity] = useState(80);
  const [newsImpactLevel, setNewsImpactLevel] = useState("high");
  const [sleepTimeStart, setSleepTimeStart] = useState("23:00");
  const [voiceVolume, setVoiceVolume] = useState(80);

  // B. AI Bot Engine States
  const [autoTrading, setAutoTrading] = useState(() => {
    try {
      const saved = localStorage.getItem("fialgo_risk_config");
      if (saved) return JSON.parse(saved).autoTrading === true;
    } catch {
      /* ignore */
    }
    return false;
  });
  const [tradeFreq, setTradeFreq] = useState("Medium");
  const [allowHedging, setAllowHedging] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fialgo_risk_config");
      const config = saved ? JSON.parse(saved) : {};
      if (config.autoTrading !== autoTrading) {
        config.autoTrading = autoTrading;
        localStorage.setItem("fialgo_risk_config", JSON.stringify(config));
        window.dispatchEvent(new Event("fialgo_config_changed"));
      }
    } catch {
      /* ignore */
    }
  }, [autoTrading]);

  const {
    balance,
    equity,
    isConnected,
    recentTrades,
    lastClosedTrade,
    tradesToday,
    todayProfit,
    accountMetrics,
    avgDisciplineScore,
    lastImportTime,
  } = useDashboardData();

  // Custom Tickers & Searchable Pair Picker (Card #4: One Instrument Mode)
  const [tickerPickerOpen, setTickerPickerOpen] = useState(false);
  const [tickerSearch, setTickerSearch] = useState("");
  const [customTickers, setCustomTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fialgo_custom_tickers");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const addCustomTicker = (raw: string) => {
    const clean = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (!clean) return;
    setAllowedTicker(clean);
    setCustomTickers((prev) => {
      if (prev.includes(clean)) return prev;
      const next = [clean, ...prev];
      try {
        localStorage.setItem("fialgo_custom_tickers", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setTickerSearch("");
    setTickerPickerOpen(false);
    toast.success(`Locked symbol updated to ${clean}`);
  };

  // Demo Preview & Dashboard Widget Pinning
  const [demoDataOverride, setDemoDataOverride] = useState<boolean | null>(null);
  const useDemoData = demoDataOverride !== null ? demoDataOverride : !isConnected;
  const [demoOpenLots, setDemoOpenLots] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem("fialgo_demo_open_lots"));
      return Number.isFinite(saved) && saved >= 0 ? saved : 0.65;
    } catch {
      return 0.65;
    }
  });
  const [demoDdByPeriod, setDemoDdByPeriod] = useState<{
    daily: number;
    weekly: number;
    monthly: number;
  }>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("fialgo_demo_dd_periods") || "null");
      if (saved && typeof saved === "object") {
        return {
          daily: Number.isFinite(Number(saved.daily)) ? Number(saved.daily) : 2.8,
          weekly: Number.isFinite(Number(saved.weekly)) ? Number(saved.weekly) : 6.2,
          monthly: Number.isFinite(Number(saved.monthly)) ? Number(saved.monthly) : 11.4,
        };
      }
      const legacy = Number(localStorage.getItem("fialgo_demo_drawdown_pct"));
      return {
        daily: Number.isFinite(legacy) && legacy >= 0 ? legacy : 2.8,
        weekly: 6.2,
        monthly: 11.4,
      };
    } catch {
      return { daily: 2.8, weekly: 6.2, monthly: 11.4 };
    }
  });
  const [pinnedWidgets, setPinnedWidgets] = useState<RiskWidgetId[]>(() =>
    getPinnedRiskWidgets()
  );

  useEffect(() => {
    try {
      localStorage.setItem("fialgo_demo_open_lots", String(demoOpenLots));
      window.dispatchEvent(new Event("fialgo_config_changed"));
    } catch {
      /* ignore */
    }
  }, [demoOpenLots]);

  useEffect(() => {
    try {
      localStorage.setItem("fialgo_demo_dd_periods", JSON.stringify(demoDdByPeriod));
      localStorage.setItem("fialgo_demo_drawdown_pct", String(demoDdByPeriod.daily));
      window.dispatchEvent(new Event("fialgo_config_changed"));
    } catch {
      /* ignore */
    }
  }, [demoDdByPeriod]);

  useEffect(() => {
    const syncWidgets = () => setPinnedWidgets(getPinnedRiskWidgets());
    window.addEventListener("tradifive:risk-widgets-changed", syncWidgets);
    return () =>
      window.removeEventListener("tradifive:risk-widgets-changed", syncWidgets);
  }, []);

  // C. Institutional Discipline States
  const { isProOrElite } = usePlan();
  const [disciplineActive, setDisciplineActive] = useState(false);
  const { activeMarket } = useMarket();
  const sym = activeMarket === "indian" ? "₹" : "$";
  const iso = activeMarket === "indian" ? "INR" : "USD";

  const [revengeGuard, setRevengeGuard] = useState(false);
  const [tradeLimit, setTradeLimit] = useState(3);
  const [waitPeriod, setWaitPeriod] = useState(5);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastDetectedTradeId, setLastDetectedTradeId] = useState<string | null>(
    null
  );

  // Restore cooldown from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fialgo_cooldown");
      if (saved) {
        const cd = JSON.parse(saved);
        if (cd.active && cd.endsAt > Date.now()) {
          setCooldownActive(true);
          setCooldownSeconds(Math.ceil((cd.endsAt - Date.now()) / 1000));
        } else {
          localStorage.removeItem("fialgo_cooldown");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Cooldown Timer
  useEffect(() => {
    if (!cooldownActive || cooldownSeconds <= 0) {
      if (cooldownActive && cooldownSeconds <= 0) {
        setCooldownActive(false);
        localStorage.removeItem("fialgo_cooldown");
        window.dispatchEvent(new Event("fialgo_cooldown_changed"));
      }
      return;
    }
    const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownActive, cooldownSeconds]);

  // Auto-detect losing trades and trigger cooldown
  useEffect(() => {
    if (!revengeGuard || !lastClosedTrade || cooldownActive) return;
    const tradeId = lastClosedTrade.id || lastClosedTrade.deal_id;
    if (tradeId === lastDetectedTradeId) return;

    const profit = lastClosedTrade.profit ?? 0;
    if (profit < 0) {
      setLastDetectedTradeId(tradeId);
      const cooldownDurationSec = waitPeriod * 60;
      setCooldownActive(true);
      setCooldownSeconds(cooldownDurationSec);

      const cooldownData = {
        active: true,
        endsAt: Date.now() + cooldownDurationSec * 1000,
        waitPeriodMinutes: waitPeriod,
        triggeredBy: `${
          lastClosedTrade.symbol || lastClosedTrade.pair || "Trade"
        } ${sym}${profit.toFixed(2)}`,
      };
      localStorage.setItem("fialgo_cooldown", JSON.stringify(cooldownData));
      window.dispatchEvent(new Event("fialgo_cooldown_changed"));
      toast.error(
        `Loss detected — Cooldown Shield activated for ${waitPeriod} minutes`,
        {
          description: `${
            lastClosedTrade.symbol || lastClosedTrade.pair || "Trade"
          } closed at ${sym}${profit.toFixed(2)}. Execution locked.`,
          duration: 6000,
        }
      );

      fetch(
        "https://n8n-webhooks.fialgo.ai/webhook/tradifive-riskcop-trigger",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            action: "LOCK_TRADING",
            durationMinutes: waitPeriod,
            triggeredBy: `${
              lastClosedTrade.symbol || lastClosedTrade.pair || "Trade"
            } ${sym}${profit.toFixed(2)}`,
          }),
        }
      ).catch((err) => console.error("Webhook trigger failed:", err));
    }
  }, [
    lastClosedTrade,
    revengeGuard,
    cooldownActive,
    waitPeriod,
    lastDetectedTradeId,
    sym,
    user?.id,
  ]);

  // D. Session Sentinel States
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([
    "NY",
    "London",
    "Morning",
    "Afternoon",
  ]);
  const [sessionTimes, setSessionTimes] = useState<
    Record<string, { start: string; end: string }>
  >({
    London: { start: "13:30", end: "22:00" },
    Sydney: { start: "03:30", end: "12:00" },
    NY: { start: "17:30", end: "02:00" },
    Asian: { start: "05:30", end: "14:30" },
    PreMarket: { start: "09:00", end: "09:15" },
    Morning: { start: "09:15", end: "12:00" },
    Afternoon: { start: "12:00", end: "15:30" },
    PostMarket: { start: "15:40", end: "16:00" },
  });

  // E. Capital & Risk States
  const [maxLot, setMaxLot] = useState(1.0);
  const [targetCapital, setTargetCapital] = useState(2000);

  const [startingCapital, setStartingCapital] = useState(() => {
    try {
      const saved = localStorage.getItem("fialgo_starting_capital");
      if (saved) return parseFloat(saved);
    } catch {
      /* ignore */
    }
    return 0;
  });

  useEffect(() => {
    if (balance > 0 && startingCapital === 0) {
      setStartingCapital(balance);
      localStorage.setItem("fialgo_starting_capital", balance.toString());
    }
  }, [balance, startingCapital]);

  // Expanded RiskGuard States
  const [maxOpenPositions, setMaxOpenPositions] = useState(5);
  const [noAveragingDown, setNoAveragingDown] = useState(false);
  const [noAvgMode, setNoAvgMode] = useState("strict");
  const [martingaleDetection, setMartingaleDetection] = useState(false);
  const [oneInstrumentMode, setOneInstrumentMode] = useState(false);

  const [stopLossRequired, setStopLossRequired] = useState(false);
  const [stopLossAction, setStopLossAction] = useState("block");
  const [stopLossMethod, setStopLossMethod] = useState("pips");
  const [minRiskReward, setMinRiskReward] = useState(2.0);
  const [minRiskRewardActive, setMinRiskRewardActive] = useState(false);
  const [weekendLock, setWeekendLock] = useState(false);
  const [weekendAction, setWeekendAction] = useState<"both" | "close" | "block">("both");
  const [equityHardStop, setEquityHardStop] = useState(1000);
  const [equityHardStopActive, setEquityHardStopActive] = useState(false);
  const [dailyProfitTarget, setDailyProfitTarget] = useState(500);
  const [profitTargetCalc, setProfitTargetCalc] = useState<"closed" | "equity">("closed");
  const [dailyProfitTargetActive, setDailyProfitTargetActive] = useState(false);
  const [demoProfitToday, setDemoProfitToday] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem("fialgo_demo_profit_today"));
      return Number.isFinite(saved) && saved >= 0 ? saved : 320;
    } catch {
      return 320;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fialgo_demo_profit_today", String(demoProfitToday));
      window.dispatchEvent(new Event("fialgo_config_changed"));
    } catch {
      /* ignore */
    }
  }, [demoProfitToday]);

  const [consecutiveWins, setConsecutiveWins] = useState(3);
  const [winStreakAction, setWinStreakAction] = useState<"pause" | "confirm">("pause");
  const [stopAfterWin, setStopAfterWin] = useState(false);
  const [lossCooldownTrigger, setLossCooldownTrigger] = useState<"every" | "consecutive">("every");
  const [emotionalTradingDetector, setEmotionalTradingDetector] =
    useState(false);
  const [newsFilter, setNewsFilter] = useState(false);
  const [newsBeforeMins, setNewsBeforeMins] = useState(30);
  const [newsAfterMins, setNewsAfterMins] = useState(15);
  const [sleepProtection, setSleepProtection] = useState(false);
  const [sleepTimeEnd, setSleepTimeEnd] = useState("06:00");
  const [preTradeChecklist, setPreTradeChecklist] = useState(false);
  const [checklistPreset, setChecklistPreset] = useState<"basic" | "standard" | "strict">("standard");
  const [psychologyCheck, setPsychologyCheck] = useState(false);
  const [psychologyFreq, setPsychologyFreq] = useState<"first" | "loss" | "every" | "daily">("first");
  const [aiWeeklyReview, setAiWeeklyReview] = useState(false);
  const [aiReviewDay, setAiReviewDay] = useState<"friday" | "saturday" | "sunday">("friday");
  const [aiReviewTime, setAiReviewTime] = useState("17:00");
  const [aiReviewSend, setAiReviewSend] = useState<"in_app" | "email">("in_app");
  const [aiVoiceWarning, setAiVoiceWarning] = useState(false);
  const [voiceTrigger, setVoiceTrigger] = useState<"all" | "critical" | "drawdown">("critical");
  const [noTradingAfterTime, setNoTradingAfterTime] = useState("20:00");
  const [noTradeAfterAction, setNoTradeAfterAction] = useState<"block" | "close">("block");
  const [noTradingAfterTimeActive, setNoTradingAfterTimeActive] =
    useState(false);
  const [hardStopTrigger, setHardStopTrigger] = useState<"drawdown" | "equity" | "rules">("drawdown");
  const [demoTradesToday, setDemoTradesToday] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem("fialgo_demo_trades_today"));
      return Number.isFinite(saved) && saved >= 0 ? saved : 2;
    } catch {
      return 2;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fialgo_demo_trades_today", String(demoTradesToday));
      window.dispatchEvent(new Event("fialgo_config_changed"));
    } catch {
      /* ignore */
    }
  }, [demoTradesToday]);

  const [dayBasedKillActive, setDayBasedKillActive] = useState(false);
  const [dayBasedKillDays, setDayBasedKillDays] = useState<string[]>(["Thu"]);
  const [dayBasedKillTime, setDayBasedKillTime] = useState("13:00");

  const [specificDateKillActive, setSpecificDateKillActive] = useState(false);
  const [specificDateKillDate, setSpecificDateKillDate] = useState("");
  const [specificDateKillTime, setSpecificDateKillTime] = useState("13:00");

  const currentProfit = Math.max(
    0,
    balance - (startingCapital || balance || 0)
  );
  const progressPercent =
    targetCapital > 0
      ? Math.min(100, (currentProfit / targetCapital) * 100)
      : 0;

  const [gamificationState, setGamificationState] = useState(
    getGamificationState()
  );

  useEffect(() => {
    const handleUpdate = () => setGamificationState(getGamificationState());
    window.addEventListener("tradifive_xp_update", handleUpdate);
    return () =>
      window.removeEventListener("tradifive_xp_update", handleUpdate);
  }, []);

  const getTitleForLevel = (level: number) => {
    if (level < 5) return "Initiate";
    if (level < 10) return "Apprentice";
    if (level < 20) return "Architect";
    if (level < 30) return "Master";
    if (level < 50) return "Grandmaster";
    return "Legend";
  };

  const { config: dbConfig, saveConfig } = useRiskConfig(user?.id);

  useEffect(() => {
    if (dbConfig) {
      if (dbConfig.max_lot_size !== null && dbConfig.max_lot_size > 0) {
        setMaxLot(dbConfig.max_lot_size);
      }
      if (dbConfig.target_capital !== null)
        setTargetCapital(dbConfig.target_capital);
      if (dbConfig.max_daily_loss_percent !== null && dbConfig.max_daily_loss_percent > 0)
        setMaxDrawdown(dbConfig.max_daily_loss_percent);
      if (dbConfig.max_open_trades !== null && dbConfig.max_open_trades > 0)
        setTradeLimit(dbConfig.max_open_trades);
    }
  }, [dbConfig]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fialgo_risk_config");
      if (!saved) return;
      const config = JSON.parse(saved);
      if (config.maxLotActive !== undefined)
        setMaxLotActive(config.maxLotActive);
      if (config.drawdownGuardActive !== undefined)
        setDrawdownGuardActive(config.drawdownGuardActive);
      if (config.disciplineActive !== undefined)
        setDisciplineActive(config.disciplineActive);
      if (config.sessionActive !== undefined)
        setSessionActive(config.sessionActive);
      if (config.maxDrawdown !== undefined) setMaxDrawdown(config.maxDrawdown);
      if (config.ddPeriod === "daily" || config.ddPeriod === "weekly" || config.ddPeriod === "monthly")
        setDdPeriod(config.ddPeriod);
      if (config.drawdownBasis === "balance" || config.drawdownBasis === "equity")
        setDrawdownBasis(config.drawdownBasis);
      if (config.weeklyDrawdown !== undefined)
        setWeeklyDrawdown(config.weeklyDrawdown);
      if (config.monthlyDrawdown !== undefined)
        setMonthlyDrawdown(config.monthlyDrawdown);
      if (config.stopAfterLoss !== undefined)
        setStopAfterLoss(config.stopAfterLoss);
      if (config.autoTrading !== undefined) setAutoTrading(config.autoTrading);
      if (config.tradeFreq) setTradeFreq(config.tradeFreq);
      if (config.allowHedging !== undefined)
        setAllowHedging(config.allowHedging);
      if (config.revengeGuard !== undefined)
        setRevengeGuard(config.revengeGuard);
      if (config.tradeLimit && config.tradeLimit > 0) setTradeLimit(config.tradeLimit);
      if (config.waitPeriod && config.waitPeriod > 0) setWaitPeriod(config.waitPeriod);
      if (config.lossCooldownTrigger) setLossCooldownTrigger(config.lossCooldownTrigger);
      if (config.selectedSessions)
        setSelectedSessions(config.selectedSessions);
      if (config.sessionTimes) setSessionTimes(config.sessionTimes);
      if (config.maxLot && config.maxLot > 0) setMaxLot(config.maxLot);
      if (config.targetCapital) setTargetCapital(config.targetCapital);
      if (config.maxOpenPositions !== undefined)
        setMaxOpenPositions(config.maxOpenPositions);
      if (config.noAveragingDown !== undefined)
        setNoAveragingDown(config.noAveragingDown);
      if (config.noAvgMode) setNoAvgMode(config.noAvgMode);
      if (config.martingaleDetection !== undefined)
        setMartingaleDetection(config.martingaleDetection);
      if (config.martingaleMultiplier)
        setMartingaleMultiplier(config.martingaleMultiplier);
      if (config.oneInstrumentMode !== undefined)
        setOneInstrumentMode(config.oneInstrumentMode);
      if (config.allowedTicker) setAllowedTicker(config.allowedTicker);
      if (config.stopLossRequired !== undefined)
        setStopLossRequired(config.stopLossRequired);
      if (config.stopLossAction) setStopLossAction(config.stopLossAction);
      if (config.stopLossMethod) setStopLossMethod(config.stopLossMethod);
      if (config.defaultStopLoss !== undefined)
        setDefaultStopLoss(config.defaultStopLoss);
      if (config.minRiskReward !== undefined)
        setMinRiskReward(config.minRiskReward);
      if (config.minRiskRewardActive !== undefined)
        setMinRiskRewardActive(config.minRiskRewardActive);
      if (config.weekendLock !== undefined) setWeekendLock(config.weekendLock);
      if (config.weekendCloseTime) setWeekendCloseTime(config.weekendCloseTime);
      if (config.weekendAction) setWeekendAction(config.weekendAction);
      if (config.equityHardStop !== undefined)
        setEquityHardStop(config.equityHardStop);
      if (config.equityHardStopActive !== undefined)
        setEquityHardStopActive(config.equityHardStopActive);
      if (config.dailyProfitTarget !== undefined)
        setDailyProfitTarget(config.dailyProfitTarget);
      if (config.profitTargetCalc === "closed" || config.profitTargetCalc === "equity")
        setProfitTargetCalc(config.profitTargetCalc);
      if (config.dailyProfitTargetActive !== undefined)
        setDailyProfitTargetActive(config.dailyProfitTargetActive);
      if (config.consecutiveWins !== undefined)
        setConsecutiveWins(config.consecutiveWins);
      if (config.winStreakAction) setWinStreakAction(config.winStreakAction);
      if (config.stopAfterWin !== undefined)
        setStopAfterWin(config.stopAfterWin);
      if (config.emotionalTradingDetector !== undefined)
        setEmotionalTradingDetector(config.emotionalTradingDetector);
      if (config.emotionSensitivity !== undefined)
        setEmotionSensitivity(config.emotionSensitivity);
      if (config.newsFilter !== undefined) setNewsFilter(config.newsFilter);
      if (config.newsImpactLevel) setNewsImpactLevel(config.newsImpactLevel);
      if (config.newsBeforeMins !== undefined) setNewsBeforeMins(config.newsBeforeMins);
      if (config.newsAfterMins !== undefined) setNewsAfterMins(config.newsAfterMins);
      if (config.sleepProtection !== undefined)
        setSleepProtection(config.sleepProtection);
      if (config.sleepTimeStart) setSleepTimeStart(config.sleepTimeStart);
      if (config.sleepTimeEnd) setSleepTimeEnd(config.sleepTimeEnd);
      if (config.preTradeChecklist !== undefined)
        setPreTradeChecklist(config.preTradeChecklist);
      if (config.checklistPreset) setChecklistPreset(config.checklistPreset);
      if (config.psychologyCheck !== undefined)
        setPsychologyCheck(config.psychologyCheck);
      if (config.psychologyFreq) setPsychologyFreq(config.psychologyFreq);
      if (config.aiWeeklyReview !== undefined)
        setAiWeeklyReview(config.aiWeeklyReview);
      if (config.aiReviewDay) setAiReviewDay(config.aiReviewDay);
      if (config.aiReviewTime) setAiReviewTime(config.aiReviewTime);
      if (config.aiReviewSend) setAiReviewSend(config.aiReviewSend);
      if (config.aiVoiceWarning !== undefined)
        setAiVoiceWarning(config.aiVoiceWarning);
      if (config.voiceVolume !== undefined) setVoiceVolume(config.voiceVolume);
      if (config.voiceTrigger) setVoiceTrigger(config.voiceTrigger);
      if (config.noTradingAfterTime) setNoTradingAfterTime(config.noTradingAfterTime);
      if (config.noTradeAfterAction) setNoTradeAfterAction(config.noTradeAfterAction);
      if (config.noTradingAfterTimeActive !== undefined)
        setNoTradingAfterTimeActive(config.noTradingAfterTimeActive);
      if (config.hardStopTrigger) setHardStopTrigger(config.hardStopTrigger);
      if (config.pinActive !== undefined) setPinActive(config.pinActive);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (activeMarket === "indian" && weekendCloseTime === "20:00") {
      setWeekendCloseTime("15:15");
    }
  }, [activeMarket, weekendCloseTime]);

  const buildConfigPayload = () => ({
    maxLotActive,
    drawdownGuardActive,
    disciplineActive,
    sessionActive,
    ddPeriod,
    maxDrawdown,
    drawdownBasis,
    weeklyDrawdown,
    monthlyDrawdown,
    stopAfterLoss,
    autoTrading,
    tradeFreq,
    allowHedging,
    revengeGuard,
    tradeLimit,
    waitPeriod,
    selectedSessions,
    sessionTimes,
    maxLot,
    targetCapital,
    maxOpenPositions,
    noAveragingDown,
    noAvgMode,
    martingaleDetection,
    martingaleMultiplier,
    oneInstrumentMode,
    allowedTicker,
    stopLossRequired,
    stopLossAction,
    stopLossMethod,
    defaultStopLoss,
    minRiskReward,
    minRiskRewardActive,
    weekendLock,
    weekendCloseTime,
    weekendAction,
    equityHardStop,
    equityHardStopActive,
    dailyProfitTarget,
    profitTargetCalc,
    dailyProfitTargetActive,
    consecutiveWins,
    winStreakAction,
    stopAfterWin,
    lossCooldownTrigger,
    emotionalTradingDetector,
    emotionSensitivity,
    newsFilter,
    newsImpactLevel,
    newsBeforeMins,
    newsAfterMins,
    sleepProtection,
    sleepTimeStart,
    sleepTimeEnd,
    preTradeChecklist,
    checklistPreset,
    psychologyCheck,
    psychologyFreq,
    aiWeeklyReview,
    aiReviewDay,
    aiReviewTime,
    aiReviewSend,
    aiVoiceWarning,
    voiceVolume,
    voiceTrigger,
    noTradingAfterTime,
    noTradeAfterAction,
    noTradingAfterTimeActive,
    hardStopTrigger,
    pinActive,
  });

  const syncProfileLotCap = async (userId: string, activeLotCap: number) => {
    try {
      await Promise.all([
        (supabase.from("profiles") as any)
          .update({ max_lot_size: activeLotCap })
          .eq("id", userId),
        (supabase.from("system_settings") as any).upsert({
          id: `risk_guard_rules_${userId}`,
          value: {
            no_averaging_down: noAveragingDown,
            no_avg_mode: noAvgMode,
            martingale_detection: martingaleDetection,
            martingale_multiplier: martingaleMultiplier,
            one_instrument_mode: oneInstrumentMode,
            allowed_ticker: allowedTicker,
            drawdown_guard_active: drawdownGuardActive,
            daily_dd_pct: maxDrawdown,
            weekly_dd_pct: weeklyDrawdown,
            monthly_dd_pct: monthlyDrawdown,
            drawdown_basis: drawdownBasis,
            daily_profit_target_active: dailyProfitTargetActive,
            daily_profit_target: dailyProfitTarget,
            profit_target_calc: profitTargetCalc,
            stop_loss_required: stopLossRequired,
            stop_loss_action: stopLossAction,
            stop_loss_method: stopLossMethod,
            default_stop_loss: defaultStopLoss,
            min_risk_reward_active: minRiskRewardActive,
            min_risk_reward: minRiskReward,
            weekend_lock: weekendLock,
            weekend_close_time: weekendCloseTime,
            weekend_action: weekendAction,
            equity_hard_stop_active: equityHardStopActive,
            equity_hard_stop: equityHardStop,
            no_trade_after_active: noTradingAfterTimeActive,
            no_trade_after_time: noTradingAfterTime,
            no_trade_after_action: noTradeAfterAction,
            sleep_protection: sleepProtection,
            sleep_start: sleepTimeStart,
            sleep_end: sleepTimeEnd,
            session_active: sessionActive,
            selected_sessions: selectedSessions,
            updated_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        }),
      ]);
    } catch {
      /* optional extended sync */
    }
  };

  const handleSave = async () => {
    const activeLotCap = maxLotActive ? maxLot : 0;
    if (user?.id) {
      await Promise.all([
        saveConfig({
          max_lot_size: activeLotCap,
          target_capital: targetCapital,
          max_daily_loss_percent: drawdownGuardActive ? maxDrawdown : 0,
          max_open_trades: disciplineActive ? tradeLimit : 0,
        }).catch(console.error),
        syncProfileLotCap(user.id, activeLotCap),
      ]);
    }

    localStorage.setItem(
      "fialgo_risk_config",
      JSON.stringify(buildConfigPayload())
    );
    window.dispatchEvent(new Event("fialgo_config_changed"));

    toast.success("Risk Guard Settings Synchronized", {
      description: "All automated safety brackets are now live.",
    });
  };

  // Autosave (debounced 800ms)
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const timer = setTimeout(() => {
      localStorage.setItem(
        "fialgo_risk_config",
        JSON.stringify(buildConfigPayload())
      );
      window.dispatchEvent(new Event("fialgo_config_changed"));

      if (user?.id) {
        const activeLotCap = maxLotActive ? maxLot : 0;
        saveConfig({
          max_lot_size: activeLotCap,
          target_capital: targetCapital,
          max_daily_loss_percent: drawdownGuardActive ? maxDrawdown : 0,
          max_open_trades: disciplineActive ? tradeLimit : 0,
        }).catch(console.error);
        syncProfileLotCap(user.id, activeLotCap);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    maxLotActive,
    drawdownGuardActive,
    disciplineActive,
    sessionActive,
    ddPeriod,
    maxDrawdown,
    drawdownBasis,
    weeklyDrawdown,
    monthlyDrawdown,
    stopAfterLoss,
    autoTrading,
    tradeFreq,
    allowHedging,
    revengeGuard,
    tradeLimit,
    waitPeriod,
    selectedSessions,
    sessionTimes,
    maxLot,
    targetCapital,
    maxOpenPositions,
    noAveragingDown,
    noAvgMode,
    martingaleDetection,
    martingaleMultiplier,
    oneInstrumentMode,
    allowedTicker,
    stopLossRequired,
    stopLossAction,
    stopLossMethod,
    defaultStopLoss,
    minRiskReward,
    minRiskRewardActive,
    weekendLock,
    weekendCloseTime,
    weekendAction,
    equityHardStop,
    equityHardStopActive,
    dailyProfitTarget,
    profitTargetCalc,
    dailyProfitTargetActive,
    consecutiveWins,
    winStreakAction,
    stopAfterWin,
    lossCooldownTrigger,
    emotionalTradingDetector,
    emotionSensitivity,
    newsFilter,
    newsImpactLevel,
    newsBeforeMins,
    newsAfterMins,
    sleepProtection,
    sleepTimeStart,
    sleepTimeEnd,
    preTradeChecklist,
    checklistPreset,
    psychologyCheck,
    psychologyFreq,
    aiWeeklyReview,
    aiReviewDay,
    aiReviewTime,
    aiReviewSend,
    aiVoiceWarning,
    voiceVolume,
    voiceTrigger,
    noTradingAfterTime,
    noTradeAfterAction,
    noTradingAfterTimeActive,
    hardStopTrigger,
    pinActive,
    user?.id,
  ]);

  // Tab active-guard counts
  const tabCounts = useMemo(() => {
    const tradingControl = [
      maxLotActive,
      activeMarket !== "indian" && noAveragingDown,
      activeMarket !== "indian" && martingaleDetection,
      oneInstrumentMode,
    ].filter(Boolean).length;

    const riskManagement = [
      drawdownGuardActive,
      dailyProfitTargetActive,
      activeMarket !== "indian" && stopLossRequired,
      activeMarket !== "indian" && minRiskRewardActive,
      weekendLock,
      activeMarket === "indian" && dayBasedKillActive,
      activeMarket === "indian" && specificDateKillActive,
      equityHardStopActive,
    ].filter(Boolean).length;

    const behaviour = [
      disciplineActive,
      isProOrElite && revengeGuard,
      sessionActive,
      stopAfterWin,
      noTradingAfterTimeActive,
      activeMarket !== "indian" && emotionalTradingDetector,
      newsFilter,
      sleepProtection,
      activeMarket !== "indian" && preTradeChecklist,
      activeMarket !== "indian" && psychologyCheck,
      activeMarket !== "indian" && aiWeeklyReview,
      activeMarket !== "indian" && aiVoiceWarning,
      pinActive,
      hardStopActive,
    ].filter(Boolean).length;

    return {
      trading_control: tradingControl,
      risk_management: riskManagement,
      behaviour,
      total: tradingControl + riskManagement + behaviour,
    };
  }, [
    activeMarket,
    maxLotActive,
    noAveragingDown,
    noAvgMode,
    martingaleDetection,
    martingaleMultiplier,
    oneInstrumentMode,
    allowedTicker,
    drawdownGuardActive,
    dailyProfitTargetActive,
    stopLossRequired,
    minRiskRewardActive,
    weekendLock,
    dayBasedKillActive,
    specificDateKillActive,
    equityHardStopActive,
    disciplineActive,
    isProOrElite,
    revengeGuard,
    sessionActive,
    stopAfterWin,
    noTradingAfterTimeActive,
    emotionalTradingDetector,
    newsFilter,
    sleepProtection,
    preTradeChecklist,
    psychologyCheck,
    aiWeeklyReview,
    aiVoiceWarning,
    pinActive,
    hardStopActive,
  ]);

  const sessionButtons =
    activeMarket === "indian"
      ? [
          { id: "PreMarket", label: "Pre-Market" },
          { id: "Morning", label: "Morning" },
          { id: "Afternoon", label: "Afternoon" },
          { id: "PostMarket", label: "Post-Market" },
        ]
      : [
          { id: "London", label: "London" },
          { id: "Sydney", label: "Sydney" },
          { id: "NY", label: "New York" },
          { id: "Asian", label: "Asian" },
        ];

  const toggleSession = (id: string) => {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Card #1 (Max Lot Size) Live MetaApi + Demo Telemetry
  const lotTelemetry = useMemo(() => {
    const isIndian = activeMarket === "indian";
    const unit = isIndian ? "Qty" : "Lots";
    const safeCap = Math.max(isIndian ? 1 : 0.01, Number(maxLot) || (isIndian ? 50 : 1.0));
    const accountOpen = Array.isArray(accountMetrics?.open_positions)
      ? accountMetrics.open_positions
      : [];
    const tradesOpen = (recentTrades || []).filter(
      (t: any) => !t.closed_at && !t.is_pending
    );
    const livePositions = accountOpen.length > 0 ? accountOpen : tradesOpen;
    const liveOpenSum = livePositions.reduce(
      (sum: number, p: any) => sum + Number(p.lot ?? p.lot_size ?? p.volume ?? 0),
      0
    );

    const openLots = useDemoData
      ? isIndian
        ? Math.max(0, Math.round(demoOpenLots * 100))
        : Math.max(0, Number(demoOpenLots.toFixed(2)))
      : Number(liveOpenSum.toFixed(isIndian ? 0 : 2));

    const openCount = useDemoData ? (openLots > 0 ? 2 : 0) : livePositions.length;
    const remainingLots = Math.max(0, Number((safeCap - openLots).toFixed(isIndian ? 0 : 2)));
    const exceededBy = Math.max(0, Number((openLots - safeCap).toFixed(isIndian ? 0 : 2)));
    const pct = Math.min(100, Math.max(0, Math.round((openLots / safeCap) * 100)));
    const isBreached = openLots > safeCap;
    const isWarning = !isBreached && pct >= 70;

    const gradientColors = isBreached || pct >= 95
      ? ["#FB7185", "#E11D48", "#BE123C"]
      : isWarning
      ? ["#FBBF24", "#F59E0B", "#D97706"]
      : ["#60A5FA", "#2563EB", "#0031F2"];

    const fmt = (val: number) => (isIndian ? String(Math.round(val)) : val.toFixed(2));

    // Card #2 (No Averaging Down)
    const losingOpenCount = useDemoData
      ? 1
      : livePositions.filter((p: any) => Number(p.profit ?? 0) < 0).length;

    const liveAvgAdds = useDemoData
      ? 0
      : (() => {
          const grouped = new Map<string, number[]>();
          livePositions.forEach((p: any) => {
            const symKey = String(p.symbol || "").toUpperCase();
            const dirKey = String(p.trade_type ?? p.type ?? "");
            const k = `${symKey}:${dirKey}`;
            const list = grouped.get(k) || [];
            list.push(Number(p.profit ?? 0));
            grouped.set(k, list);
          });
          let extraAdds = 0;
          grouped.forEach((profits) => {
            if (profits.length > 1 && profits.some((pr) => pr < 0)) {
              extraAdds += profits.length - 1;
            }
          });
          return extraAdds;
        })();

    const noAvgCleanPct =
      liveAvgAdds === 0 ? 100 : Math.max(20, 100 - liveAvgAdds * 30);

    // Card #3 (Martingale Protection)
    const closedTrades = (recentTrades || []).filter((t: any) => t.closed_at);
    const lastLossTrade = closedTrades.find((t: any) => Number(t.profit ?? 0) < 0);
    const lastLossLot = useDemoData
      ? 0.4
      : Number(lastLossTrade?.lot_size ?? lastLossTrade?.volume ?? 0.2);
    const martingaleMaxNext = Number((lastLossLot * martingaleMultiplier).toFixed(2));
    const martingaleCurrent = useDemoData ? 0.35 : Number(liveOpenSum.toFixed(2));
    const martingalePct =
      martingaleMaxNext > 0
        ? Math.min(100, Math.round((martingaleCurrent / martingaleMaxNext) * 100))
        : 0;
    const martingaleGrad =
      martingalePct >= 95
        ? ["#FB7185", "#E11D48", "#BE123C"]
        : martingalePct >= 70
        ? ["#FBBF24", "#F59E0B", "#D97706"]
        : ["#60A5FA", "#2563EB", "#0031F2"];

    // Card #4 (One Instrument Mode) — Segmented Pair Distribution
    const allTrades = (recentTrades || []) as any[];
    const symbolCounts = new Map<string, number>();
    if (useDemoData) {
      symbolCounts.set(allowedTicker.toUpperCase(), 4);
      symbolCounts.set(allowedTicker.toUpperCase() === "EURUSD" ? "GBPUSD" : "EURUSD", 1);
    } else {
      allTrades.forEach((t) => {
        const s = String(t.symbol || "").trim().toUpperCase();
        if (s) symbolCounts.set(s, (symbolCounts.get(s) || 0) + 1);
      });
    }

    const totalSymbolTrades = Array.from(symbolCounts.values()).reduce((a, b) => a + b, 0);
    const onTickerTrades = symbolCounts.get(allowedTicker.toUpperCase()) ||
      Array.from(symbolCounts.entries()).reduce(
        (acc, [s, c]) => (s.includes(allowedTicker.toUpperCase()) ? acc + c : acc),
        0
      );
    const offTickerTrades = Math.max(0, totalSymbolTrades - onTickerTrades);
    const instrFocusPct =
      totalSymbolTrades > 0
        ? Math.round((onTickerTrades / totalSymbolTrades) * 100)
        : 100;

    const pairBreakdown = Array.from(symbolCounts.entries())
      .map(([symbol, count]) => ({
        symbol,
        count,
        pct: totalSymbolTrades > 0 ? Math.round((count / totalSymbolTrades) * 100) : 0,
        isAllowed:
          symbol === allowedTicker.toUpperCase() ||
          symbol.includes(allowedTicker.toUpperCase()),
      }))
      .sort((a, b) => Number(b.isAllowed) - Number(a.isAllowed) || b.count - a.count)
      .slice(0, 4);

    // Build searchable symbol list: Account Symbols + Custom Symbols + Popular Presets
    const presetList =
      activeMarket === "indian"
        ? [
            { symbol: "NIFTY50", label: "NIFTY 50 Index" },
            { symbol: "BANKNIFTY", label: "BANKNIFTY Index" },
            { symbol: "FINNIFTY", label: "FINNIFTY Index" },
            { symbol: "SENSEX", label: "BSE SENSEX" },
            { symbol: "RELIANCE", label: "Reliance Industries" },
            { symbol: "HDFCBANK", label: "HDFC Bank" },
            { symbol: "ICICIBANK", label: "ICICI Bank" },
            { symbol: "INFY", label: "Infosys" },
            { symbol: "TCS", label: "Tata Consultancy" },
            { symbol: "SBIN", label: "State Bank of India" },
          ]
        : [
            { symbol: "XAUUSD", label: "Gold / US Dollar" },
            { symbol: "EURUSD", label: "Euro / US Dollar" },
            { symbol: "GBPUSD", label: "British Pound / USD" },
            { symbol: "USDJPY", label: "US Dollar / Yen" },
            { symbol: "US30", label: "Wall Street 30" },
            { symbol: "NAS100", label: "US Tech 100" },
            { symbol: "SPX500", label: "S&P 500 Index" },
            { symbol: "GER40", label: "DAX 40 Germany" },
            { symbol: "AUDUSD", label: "Australian Dollar / USD" },
            { symbol: "USDCAD", label: "US Dollar / Canadian" },
            { symbol: "GBPJPY", label: "British Pound / Yen" },
            { symbol: "EURJPY", label: "Euro / Japanese Yen" },
            { symbol: "XAGUSD", label: "Silver / US Dollar" },
            { symbol: "BTCUSD", label: "Bitcoin / US Dollar" },
            { symbol: "USOIL", label: "WTI Crude Oil" },
          ];

    const mergedMap = new Map<string, { symbol: string; label: string; tag?: string }>();
    customTickers.forEach((s) =>
      mergedMap.set(s, { symbol: s, label: "Custom Pair", tag: "Custom" })
    );
    allTrades.forEach((t) => {
      const s = String(t.symbol || "").trim().toUpperCase();
      if (s && !mergedMap.has(s)) {
        mergedMap.set(s, { symbol: s, label: "Traded on Account", tag: "Account" });
      }
    });
    presetList.forEach((p) => {
      if (!mergedMap.has(p.symbol)) {
        mergedMap.set(p.symbol, p);
      }
    });
    const tickerOptions = Array.from(mergedMap.values());

    // Tab 2 Card #1 (Drawdown Guard) — Daily / Weekly / Monthly Peak Drawdown ("till when drawdown it went")
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const liveFloatPnl =
      equity > 0 && balance > 0
        ? equity - balance
        : livePositions.reduce((sum: number, p: any) => sum + Number(p.profit ?? 0), 0);

    const computeDdPeriod = (
      key: "daily" | "weekly" | "monthly",
      label: string,
      worstLabel: string,
      startDate: Date,
      configuredPct: number,
      demoPeakPct: number
    ) => {
      const capPct = Math.max(0, Number(configuredPct) || 0);
      const isOff = capPct <= 0;

      const periodClosed = allTrades
        .filter((t) => {
          const dt = t.closed_at ? new Date(t.closed_at) : null;
          return dt && dt >= startDate;
        })
        .sort(
          (a, b) =>
            new Date(a.closed_at || a.created_at).getTime() -
            new Date(b.closed_at || b.created_at).getTime()
        );

      const realizedPnl = periodClosed.reduce(
        (sum, t) => sum + Number(t.profit ?? 0),
        0
      );
      const currentPnl = realizedPnl + liveFloatPnl;

      let running = 0;
      let worstRunning = Math.min(0, currentPnl, liveFloatPnl);
      periodClosed.forEach((t) => {
        running += Number(t.profit ?? 0);
        if (running < worstRunning) worstRunning = running;
      });

      const baseCap = useDemoData
        ? isIndian
          ? 100000
          : 10000
        : Math.max(
            100,
            (drawdownBasis === "equity" ? equity || balance : balance) > 0
              ? (drawdownBasis === "equity" ? equity || balance : balance) - realizedPnl
              : startingCapital || 10000
          );

      const capAmt = isIndian
        ? Math.round(capPct * 1000)
        : Number(((baseCap * capPct) / 100).toFixed(2));

      const peakPct = useDemoData
        ? Number(Math.max(0, demoPeakPct).toFixed(1))
        : isIndian
        ? Math.max(0, Math.round(-worstRunning))
        : Number(((Math.max(0, -worstRunning) / baseCap) * 100).toFixed(2));

      const peakAmt = useDemoData
        ? isIndian
          ? Math.round(demoPeakPct * 1000)
          : Number(((baseCap * Math.max(0, demoPeakPct)) / 100).toFixed(2))
        : Number(Math.max(0, -worstRunning).toFixed(isIndian ? 0 : 2));

      const gaugePct = isOff
        ? 0
        : isIndian
        ? capAmt > 0
          ? Math.min(100, Math.round((peakAmt / capAmt) * 100))
          : 0
        : Math.min(100, Math.round((peakPct / capPct) * 100));

      const breached = !isOff && (isIndian ? peakAmt >= capAmt : peakPct >= capPct);
      const warning = !isOff && !breached && gaugePct >= 70;
      const grad =
        breached || gaugePct >= 95
          ? ["#FB7185", "#E11D48", "#BE123C"]
          : warning
          ? ["#FBBF24", "#F59E0B", "#D97706"]
          : ["#60A5FA", "#2563EB", "#0031F2"];

      return {
        key,
        label,
        worstLabel,
        isOff,
        capPct,
        capAmt,
        peakPct,
        peakAmt,
        gaugePct,
        breached,
        warning,
        grad,
        remainingPct: Math.max(0, Number((capPct - peakPct).toFixed(1))),
        remainingAmt: Math.max(0, Number((capAmt - peakAmt).toFixed(isIndian ? 0 : 2))),
        exceededPct: Math.max(0, Number((peakPct - capPct).toFixed(1))),
        exceededAmt: Math.max(0, Number((peakAmt - capAmt).toFixed(isIndian ? 0 : 2))),
      };
    };

    const ddDaily = computeDdPeriod(
      "daily",
      "Daily",
      "Worst Today",
      startOfToday,
      maxDrawdown,
      demoDdByPeriod.daily
    );
    const ddWeekly = computeDdPeriod(
      "weekly",
      "Weekly",
      "Worst Week",
      startOfWeek,
      weeklyDrawdown,
      demoDdByPeriod.weekly
    );
    const ddMonthly = computeDdPeriod(
      "monthly",
      "Monthly",
      "Worst Month",
      startOfMonth,
      monthlyDrawdown,
      demoDdByPeriod.monthly
    );
    const ddPeriods = { daily: ddDaily, weekly: ddWeekly, monthly: ddMonthly };
    const ddActiveView = ddPeriods[ddPeriod];
    const activeDdCount = [ddDaily, ddWeekly, ddMonthly].filter((p) => !p.isOff).length;

    // Tab 2 Card #2 (Daily Profit Target)
    const safeProfitTarget = Math.max(isIndian ? 500 : 10, Number(dailyProfitTarget) || (isIndian ? 5000 : 500));
    const liveTodayClosedProfit = allTrades
      .filter((t) => t.closed_at && new Date(t.closed_at) >= startOfToday)
      .reduce((s, t) => s + Number(t.profit ?? 0), 0);
    const liveProfitVal =
      profitTargetCalc === "equity"
        ? liveTodayClosedProfit + liveFloatPnl
        : liveTodayClosedProfit;
    const profitToday = useDemoData
      ? isIndian
        ? Math.round(demoProfitToday * 10)
        : Number(demoProfitToday.toFixed(0))
      : Number(liveProfitVal.toFixed(isIndian ? 0 : 2));
    const profitGaugePct = Math.min(
      100,
      Math.max(0, Math.round((Math.max(0, profitToday) / safeProfitTarget) * 100))
    );
    const profitReached = profitToday >= safeProfitTarget;
    const profitRemaining = Math.max(0, Number((safeProfitTarget - profitToday).toFixed(0)));
    const profitGrad = profitReached
      ? ["#34D399", "#10B981", "#047857"]
      : ["#6EE7B7", "#10B981", "#059669"];

    // Tab 2 Card #3 (Stop Loss Required)
    const slOpenTotal = useDemoData ? 3 : livePositions.length;
    const slMissingCount = useDemoData
      ? 0
      : livePositions.filter((p: any) => !p.sl || Number(p.sl) <= 0).length;
    const slWithCount = Math.max(0, slOpenTotal - slMissingCount);
    const slCoveragePct =
      slOpenTotal > 0 ? Math.round((slWithCount / slOpenTotal) * 100) : 100;

    // Tab 2 Card #4 (Min Risk/Reward)
    const safeMinRR = Math.max(1.0, Number(minRiskReward) || 1.5);
    const liveRRList = allTrades
      .map((t) => {
        const op = Number(t.open_price || 0);
        const sl = Number(t.sl || 0);
        const tp = Number(t.tp || 0);
        const risk = Math.abs(op - sl);
        const rew = Math.abs(tp - op);
        return risk > 0 && rew > 0 ? rew / risk : null;
      })
      .filter((v): v is number => v !== null);
    const avgRR = useDemoData
      ? Number(Math.max(safeMinRR + 0.4, 2.2).toFixed(1))
      : liveRRList.length > 0
      ? Number(
          (liveRRList.reduce((a, b) => a + b, 0) / liveRRList.length).toFixed(1)
        )
      : Number(safeMinRR.toFixed(1));
    const rrRiskSharePct = Math.round((1 / (1 + safeMinRR)) * 100);

    // Tab 2 Card #5 (Weekend Lock / Time Kill)
    const dowSun0 = now.getDay(); // 0=Sun..5=Fri, 6=Sat
    const [wkH, wkM] = (weekendCloseTime || "20:00").split(":").map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const wkMins = (Number.isFinite(wkH) ? wkH : 20) * 60 + (Number.isFinite(wkM) ? wkM : 0);
    const isWeekendWindow = isIndian
      ? nowMins >= wkMins
      : dowSun0 === 6 || dowSun0 === 0 || (dowSun0 === 5 && nowMins >= wkMins);
    const weekProgressPct = isIndian
      ? Math.min(100, Math.max(5, Math.round((nowMins / Math.max(1, wkMins)) * 100)))
      : dowSun0 === 0 || dowSun0 === 6
      ? 100
      : Math.min(
          100,
          Math.max(
            8,
            Math.round((((dowSun0 - 1) * 1440 + nowMins) / (4 * 1440 + wkMins)) * 100)
          )
        );

    // Tab 2 Card #6 (Account Protection / Equity Hard Stop)
    const liveEquityVal = useDemoData
      ? isIndian
        ? 100000
        : 10000
      : Math.max(0, Number((equity || balance || startingCapital || 10000).toFixed(0)));
    const safeFloor = Math.max(0, Number(equityHardStop) || 0);
    const eqCushionAmt = Math.max(0, Math.round(liveEquityVal - safeFloor));
    const eqBreached = safeFloor > 0 && liveEquityVal <= safeFloor;
    const eqBufferPct =
      liveEquityVal > 0
        ? Math.min(100, Math.max(0, Math.round(((liveEquityVal - safeFloor) / liveEquityVal) * 100)))
        : 100;

    // Tab 3 Telemetry (Behaviour & Discipline)
    const safeTradeCap = Math.max(1, !isProOrElite && tradeLimit > 5 ? 5 : Number(tradeLimit) || 3);
    const usedTradesToday = useDemoData ? Math.max(0, demoTradesToday) : Math.max(0, Number(tradesToday || 0));
    const tradesLeft = Math.max(0, safeTradeCap - usedTradesToday);
    const tradesPct = Math.min(100, Math.round((usedTradesToday / safeTradeCap) * 100));
    const tradesBreached = usedTradesToday >= safeTradeCap;
    const tradesGrad = tradesBreached
      ? ["#FB7185", "#E11D48", "#BE123C"]
      : tradesPct >= 75
      ? ["#FBBF24", "#F59E0B", "#D97706"]
      : ["#60A5FA", "#2563EB", "#0031F2"];

    const [cutH, cutM] = (noTradingAfterTime || "20:00").split(":").map(Number);
    const cutMins = (Number.isFinite(cutH) ? cutH : 20) * 60 + (Number.isFinite(cutM) ? cutM : 0);
    const cutoffProgressPct = Math.min(100, Math.max(5, Math.round((nowMins / Math.max(1, cutMins)) * 100)));
    const isPastCutoff = nowMins >= cutMins;

    // Tilt / Calm Trendline (7-point recent discipline series)
    const recentClosed7 = allTrades.filter((t) => t.closed_at).slice(0, 7).reverse();
    const tiltSeries = useDemoData
      ? [92, 88, 90, 76, 84, 89, 94]
      : recentClosed7.length >= 2
      ? recentClosed7.map((t) =>
          Number(t.discipline_score ?? (Number(t.profit || 0) >= 0 ? 88 : 66))
        )
      : [85, 87, 84, 89, 90, 88, 92];
    const calmScore = Math.round(
      tiltSeries.reduce((a, b) => a + b, 0) / Math.max(1, tiltSeries.length)
    );

    // Sleep window duration
    const [slpSH, slpSM] = (sleepTimeStart || "23:00").split(":").map(Number);
    const [slpEH, slpEM] = (sleepTimeEnd || "06:00").split(":").map(Number);
    const sStartMin = (Number.isFinite(slpSH) ? slpSH : 23) * 60 + (Number.isFinite(slpSM) ? slpSM : 0);
    const sEndMin = (Number.isFinite(slpEH) ? slpEH : 6) * 60 + (Number.isFinite(slpEM) ? slpEM : 0);
    const sleepSpanMins = sEndMin >= sStartMin ? sEndMin - sStartMin : 1440 - sStartMin + sEndMin;
    const sleepHoursLabel = `${Math.max(1, Math.round(sleepSpanMins / 60))}h rest lock`;

    return {
      unit,
      safeCap,
      openLots,
      openCount,
      remainingLots,
      exceededBy,
      pct,
      isBreached,
      isWarning,
      gradientColors,
      fmt,
      noAvg: {
        losingOpenCount,
        extraAdds: liveAvgAdds,
        cleanPct: noAvgCleanPct,
      },
      martingale: {
        lastLossLot,
        maxNext: martingaleMaxNext,
        current: martingaleCurrent,
        pct: martingalePct,
        grad: martingaleGrad,
      },
      instr: {
        onTickerTrades,
        offTickerTrades,
        focusPct: instrFocusPct,
        pairBreakdown,
        tickerOptions,
      },
      drawdown: {
        periods: ddPeriods,
        active: ddActiveView,
        activeCount: activeDdCount,
      },
      profitTarget: {
        target: safeProfitTarget,
        today: profitToday,
        pct: profitGaugePct,
        reached: profitReached,
        remaining: profitRemaining,
        grad: profitGrad,
      },
      stopLoss: {
        total: slOpenTotal,
        missing: slMissingCount,
        withSl: slWithCount,
        coveragePct: slCoveragePct,
      },
      rr: {
        min: safeMinRR,
        avg: avgRR,
        riskSharePct: rrRiskSharePct,
      },
      weekend: {
        isWindow: isWeekendWindow,
        progressPct: weekProgressPct,
      },
      equityFloor: {
        current: liveEquityVal,
        floor: safeFloor,
        cushion: eqCushionAmt,
        breached: eqBreached,
        bufferPct: eqBufferPct,
      },
      behaviour: {
        tradeCap: safeTradeCap,
        tradesUsed: usedTradesToday,
        tradesLeft,
        tradesPct,
        tradesBreached,
        tradesGrad,
        cutoffProgressPct,
        isPastCutoff,
        tiltSeries,
        calmScore,
        sleepHoursLabel,
      },
    };
  }, [
    activeMarket,
    maxLot,
    accountMetrics,
    recentTrades,
    useDemoData,
    demoOpenLots,
    demoDdByPeriod,
    demoProfitToday,
    demoTradesToday,
    tradesToday,
    tradeLimit,
    isProOrElite,
    martingaleMultiplier,
    allowedTicker,
    customTickers,
    ddPeriod,
    maxDrawdown,
    weeklyDrawdown,
    monthlyDrawdown,
    drawdownBasis,
    dailyProfitTarget,
    profitTargetCalc,
    minRiskReward,
    weekendCloseTime,
    noTradingAfterTime,
    sleepTimeStart,
    sleepTimeEnd,
    equityHardStop,
    balance,
    equity,
    startingCapital,
  ]);

  if (!authChecked) {
    return (
      <DashboardLayout
        breadcrumbs={[{ label: "Risk Guard" }]}
        noScroll={true}
        noPadding={true}
      >
        <div className="flex-1 h-full bg-[#F7F8FA] dark:bg-[#141416] p-5 sm:p-6 animate-pulse space-y-5">
          <div className="h-8 w-44 bg-slate-200 dark:bg-white/10 rounded-lg" />
          <div className="h-28 w-full bg-white dark:bg-[#17171A] rounded-[18px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-36 bg-white dark:bg-[#17171A] rounded-[18px]" />
            <div className="h-36 bg-white dark:bg-[#17171A] rounded-[18px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Risk Guard" }]}
      noScroll={true}
      noPadding={true}
    >
      <div className="flex-1 h-full min-h-0 bg-[#F7F8FA] dark:bg-[#141416] flex flex-col overflow-hidden font-sans select-none transition-colors">
        {/* ── Pinned Risk Guard Header ─────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: EXPO_OUT }}
          className="shrink-0 bg-[#F7F8FA]/95 dark:bg-[#141416]/95 backdrop-blur-md z-30"
        >
          <div className="max-w-[1380px] mx-auto px-3.5 sm:px-6 pt-3 sm:pt-3.5 pb-2.5">
            {/* Single Row: Risk Guard (Left) + Sync & Kill Switch (Right) */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2 flex-wrap">
                <h1 className="text-[18px] sm:text-[21px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap">
                  Risk Guard
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400 tabular-nums whitespace-nowrap">
                  {tabCounts.total} active
                </span>
                {cooldownActive && cooldownSeconds > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 tabular-nums whitespace-nowrap">
                    {formatCountdown(cooldownSeconds)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setDemoDataOverride(!useDemoData)}
                  className={`inline-flex items-center gap-1.5 h-[32px] sm:h-[34px] px-2.5 sm:px-3 rounded-[10px] text-[11px] sm:text-[11.5px] font-semibold border transition-all cursor-pointer shrink-0 ${
                    useDemoData
                      ? "bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  }`}
                  title={
                    useDemoData
                      ? "Showing simulated demo exposure for preview (click for live broker data)"
                      : "Showing live MetaApi/broker exposure (click to preview with demo data)"
                  }
                >
                  <FlaskConical size={12} />
                  <span>{useDemoData ? "Demo Data" : "Live Data"}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleSave}
                  className="tactile-white-pill inline-flex items-center gap-1.5 h-[32px] sm:h-[34px] px-2.5 sm:px-3 rounded-[10px] text-[11px] sm:text-[11.5px] font-semibold cursor-pointer shrink-0"
                  title="Sync Risk Guard settings"
                >
                  <RefreshCw size={12} />
                  <span>Sync</span>
                </motion.button>

                {/* Kill Switch Pill (always accessible on right) */}
                <div
                  className={`inline-flex items-center gap-2 sm:gap-2.5 h-[32px] sm:h-[34px] pl-2 pr-1.5 sm:pl-2.5 sm:pr-2 rounded-[11px] border transition-all shrink-0 ${
                    killSwitchActive
                      ? "bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30"
                      : "bg-white dark:bg-[#17171A] border-slate-200/80 dark:border-white/10 shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        killSwitchActive
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-neutral-400"
                      }`}
                    >
                      <Power size={11} strokeWidth={2.5} />
                    </span>
                    <span
                      className={`text-[11px] sm:text-[11.5px] font-semibold whitespace-nowrap ${
                        killSwitchActive
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-800 dark:text-white"
                      }`}
                    >
                      Kill Switch
                    </span>
                  </div>
                  <Switch
                    size="sm"
                    checked={killSwitchActive}
                    onChange={(val) => {
                      if (val) {
                        if (
                          window.confirm(
                            "KILL SWITCH: This will immediately close ALL open positions and halt all trading. Are you sure?"
                          )
                        ) {
                          setKillSwitchActive(true);
                          toast.error("KILL SWITCH ACTIVATED", {
                            description:
                              "All positions closing. Trading halted immediately.",
                            duration: 6000,
                          });
                        }
                      } else {
                        setKillSwitchActive(false);
                        toast.success(
                          "Kill switch deactivated. Trading resumed."
                        );
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* ── Scrollable Body Strictly Inside Curved Box ───────────────────── */}
        <div
          style={{
            WebkitOverflowScrolling: "touch",
            willChange: "scroll-position",
          }}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain amazing-scrollbar"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1380px] mx-auto px-3.5 sm:px-6 pt-2 pb-12 space-y-4"
          >
            {/* SEBI Compliance Banner for Indian Market */}
            {activeMarket === "indian" && !dailyTokenActive && (
              <motion.div
                variants={sectionVariants}
                className={`${SURFACE_CARD} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
                      SEBI Compliance: Daily Login Required
                    </p>
                    <p className="text-[11.5px] text-slate-500 dark:text-neutral-400">
                      Authorize your broker for live monitoring and auto-kill switch today.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Broker API Authorized for Today", {
                      description:
                        "Live monitoring active until 3:30 PM market close.",
                    });
                    setDailyTokenActive(true);
                    sessionStorage.setItem("indian_daily_token", "active");
                  }}
                  className="tactile-black-pill rounded-full px-4 py-1.5 text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Key size={13} />
                  <span>Connect for Today</span>
                </button>
              </motion.div>
            )}

            {/* Main 2-Column Layout: Left Controls + Right Sticky Telemetry */}
            <div className="flex flex-col xl:flex-row gap-5 items-start">
              <div className="flex-1 w-full min-w-0 space-y-4">
                {/* 1. Primary Compact Protocol Architecture Bar */}
                <motion.section
                  variants={sectionVariants}
                  className={`${SURFACE_CARD} px-4 py-3 sm:px-5 sm:py-3.5 border-blue-200/60 dark:border-blue-500/20`}
                >
                  {/* Top compact line: Label + Level + Start/Target + XP + Edit */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/15 shrink-0">
                        Protocol Architecture
                      </span>
                      <h2 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate tabular-nums">
                        Level <AnimatedNumber value={gamificationState.level} duration={700} />{" "}
                        {getTitleForLevel(gamificationState.level)}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden md:inline text-[11px] text-slate-400 tabular-nums">
                        <strong className="font-semibold text-slate-700 dark:text-neutral-200">
                          {sym}
                          <AnimatedNumber
                            value={startingCapital || balance || 0}
                            duration={900}
                            format={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          />
                        </strong>
                        {" → "}
                        <strong className="font-semibold text-[#2563EB] dark:text-blue-400">
                          {sym}
                          <AnimatedNumber
                            value={targetCapital}
                            duration={900}
                            delay={80}
                            format={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          />
                        </strong>{" "}
                        {iso}
                      </span>

                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400">
                        <Trophy size={11} />
                        <span className="text-[11px] font-semibold tabular-nums">
                          <AnimatedNumber
                            value={gamificationState.xp}
                            duration={850}
                            delay={120}
                            format={(v) => v.toLocaleString()}
                          />{" "}
                          XP
                        </span>
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="tactile-white-pill w-7 h-7 rounded-[9px] flex items-center justify-center cursor-pointer"
                            title="Edit target capital"
                          >
                            <Pencil size={12} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-56 p-3.5 rounded-2xl bg-white dark:bg-[#1C1C20] border border-slate-200 dark:border-white/10 shadow-xl"
                          align="end"
                          sideOffset={8}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-[11.5px]">
                              <span className="text-slate-400 font-medium">
                                Starting Balance
                              </span>
                              <span className="font-semibold text-[#2563EB] dark:text-blue-400 tabular-nums">
                                {sym}
                                {(startingCapital || balance).toLocaleString()}
                              </span>
                            </div>
                            <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                              <label className={FIELD_LABEL}>
                                Target Balance
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[12px]">
                                  {sym}
                                </span>
                                <input
                                  type="number"
                                  autoFocus
                                  onFocus={(e) => e.target.select()}
                                  value={targetCapital}
                                  onChange={(e) =>
                                    setTargetCapital(Number(e.target.value))
                                  }
                                  className={`w-full pl-7 pr-2.5 h-[34px] ${INPUT_BASE}`}
                                />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Slim Progress Track + Compact Milestone Ticks */}
                  <div className="mt-2.5 space-y-1.5">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.7, ease: EXPO_OUT }}
                        className="h-full bg-[#2563EB] rounded-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {[0, 0.25, 0.5, 0.75, 1].map((multiplier, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1"
                        >
                          <Star
                            size={8}
                            className={
                              progressPercent >= multiplier * 100 && i > 0
                                ? "text-[#2563EB] fill-[#2563EB]"
                                : i === 0
                                ? "text-[#2563EB] fill-[#2563EB]"
                                : "text-slate-300 dark:text-neutral-600"
                            }
                          />
                          <span className="text-[9.5px] font-semibold text-slate-400 dark:text-neutral-400 tabular-nums">
                            {sym}
                            {(multiplier * targetCapital).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>

                {/* 2. Category Tabs Directly Below Protocol Architecture */}
                <motion.div
                  variants={sectionVariants}
                  className="flex items-center p-1 rounded-[13px] bg-slate-200/70 dark:bg-white/[0.06] overflow-x-auto no-scrollbar"
                >
                  {(
                    [
                      {
                        id: "trading_control" as const,
                        label: "Trading Control",
                        count: tabCounts.trading_control,
                      },
                      {
                        id: "risk_management" as const,
                        label: "Risk Management",
                        count: tabCounts.risk_management,
                      },
                      {
                        id: "behaviour" as const,
                        label: "Behaviour & Discipline",
                        count: tabCounts.behaviour,
                      },
                    ] as const
                  ).map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 min-w-[130px] px-3 py-2 rounded-[10px] text-[12.5px] font-semibold transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                          active
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="riskguard-tab-pill"
                            transition={{
                              type: "spring",
                              stiffness: 460,
                              damping: 34,
                            }}
                            className="absolute inset-0 bg-white dark:bg-[#26262B] rounded-[10px] shadow-[0_1px_5px_rgba(15,23,42,0.09)]"
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                        {tab.count > 0 && (
                          <span
                            className={`relative z-10 px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
                              active
                                ? "bg-blue-50 text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-400"
                                : "bg-slate-300/60 dark:bg-white/10 text-slate-600 dark:text-neutral-300"
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {/* ═══ TAB 1: TRADING CONTROL ═══ */}
                  {activeTab === "trading_control" && (
                    <motion.div
                      key="tab-trading"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: EXPO_OUT }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start"
                    >
                      <RiskGuardCard
                        icon={Layers}
                        title={
                          activeMarket === "indian"
                            ? "Max Quantity Limit"
                            : "Max Lot Size"
                        }
                        description={
                          activeMarket === "indian"
                            ? "Hard cap on quantity per trade"
                            : "Hard cap on lot size per trade"
                        }
                        value={`${lotTelemetry.fmt(lotTelemetry.safeCap)} ${lotTelemetry.unit}`}
                        active={maxLotActive}
                        onToggle={setMaxLotActive}
                        intent={lotTelemetry.isBreached ? "emergency" : "trading"}
                        hasDashboardWidget={pinnedWidgets.includes("max_lot")}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            {/* 72-Notch Dial Gauge with Ruler & Line Needle */}
                            <div className="w-[134px] shrink-0 flex flex-col items-center">
                              <Gauge
                                compact
                                ariaLabel="Max Lot Exposure Gauge"
                                value={lotTelemetry.pct}
                                centerValue={lotTelemetry.pct}
                                defaultLabel={`${lotTelemetry.fmt(lotTelemetry.openLots)} / ${lotTelemetry.fmt(lotTelemetry.safeCap)} ${lotTelemetry.unit}`}
                                suffix="%"
                                needle="line"
                                ruler
                                totalNotches={72}
                                spacing={40}
                                notchLengthPercent={34}
                                notchCornerRadius={2}
                                startAngle={148}
                                endAngle={392}
                                enterTransition={{
                                  type: "spring",
                                  visualDuration: 1.4,
                                  bounce: 0,
                                }}
                                enterStaggerScale={2}
                                inactiveFillOpacity={0.4}
                                useGradient
                                gradientColors={lotTelemetry.gradientColors}
                              />
                            </div>

                            {/* Live / Demo Breakdown Rows */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-400 dark:text-neutral-500 font-medium">
                                  Lock Set
                                </span>
                                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                                  {lotTelemetry.fmt(lotTelemetry.safeCap)} {lotTelemetry.unit}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-400 dark:text-neutral-500 font-medium inline-flex items-center gap-1">
                                  <span>Open Now</span>
                                  <span
                                    className={`px-1 py-[1px] rounded text-[8.5px] font-bold uppercase tracking-wide ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                <div className="flex items-center gap-1">
                                  {useDemoData && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDemoOpenLots((v) =>
                                          Math.max(0, Number((v - 0.1).toFixed(2)))
                                        )
                                      }
                                      className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] flex items-center justify-center text-slate-600 dark:text-neutral-300 cursor-pointer"
                                      title="Decrease demo open lot"
                                    >
                                      <Minus size={9} />
                                    </button>
                                  )}
                                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                    {lotTelemetry.fmt(lotTelemetry.openLots)} {lotTelemetry.unit}
                                  </span>
                                  {useDemoData && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDemoOpenLots((v) =>
                                          Number((v + 0.1).toFixed(2))
                                        )
                                      }
                                      className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] flex items-center justify-center text-slate-600 dark:text-neutral-300 cursor-pointer"
                                      title="Increase demo open lot"
                                    >
                                      <Plus size={9} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-400 dark:text-neutral-500 font-medium">
                                  {lotTelemetry.isBreached ? "Exceeded" : "Remaining"}
                                </span>
                                <span
                                  className={`font-bold tabular-nums ${
                                    lotTelemetry.isBreached
                                      ? "text-rose-600 dark:text-rose-400"
                                      : lotTelemetry.isWarning
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {lotTelemetry.isBreached
                                    ? `+${lotTelemetry.fmt(lotTelemetry.exceededBy)} ${lotTelemetry.unit} over`
                                    : `${lotTelemetry.fmt(lotTelemetry.remainingLots)} ${lotTelemetry.unit} left`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center w-[112px] shrink-0">
                              <input
                                type="number"
                                step={activeMarket === "indian" ? "1" : "0.01"}
                                min={activeMarket === "indian" ? "1" : "0.01"}
                                value={maxLot}
                                onChange={(e) =>
                                  setMaxLot(Number(e.target.value))
                                }
                                className={`w-full pl-2.5 pr-9 h-[30px] ${INPUT_BASE}`}
                              />
                              <span className="absolute right-2.5 text-[10px] font-semibold text-slate-400">
                                {lotTelemetry.unit}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={activeMarket === "indian" ? "1" : "0.01"}
                              max={activeMarket === "indian" ? "500" : "10.00"}
                              step={activeMarket === "indian" ? "1" : "0.01"}
                              value={maxLot}
                              onChange={(e) =>
                                setMaxLot(Number(e.target.value))
                              }
                              className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                            />
                          </div>
                        </div>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={TrendingDown}
                          title="No Averaging Down"
                          description="Stop adding more trades on a losing position"
                          value={`${lotTelemetry.noAvg.cleanPct}% clean`}
                          active={noAveragingDown}
                          onToggle={setNoAveragingDown}
                          intent="trading"
                          hasDashboardWidget={pinnedWidgets.includes("no_avg")}
                        >
                          <div className="space-y-2.5">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                  <span>Loss-Add Guard</span>
                                  <span
                                    className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                  {lotTelemetry.noAvg.losingOpenCount} losing open ·{" "}
                                  {lotTelemetry.noAvg.extraAdds} extra adds
                                </span>
                              </div>
                              <Gauge
                                orientation="linear"
                                ariaLabel="No Averaging Down Linear Gauge"
                                value={lotTelemetry.noAvg.cleanPct}
                                totalNotches={42}
                                linearHeight={14}
                                spacing={2}
                                notchCornerRadius={3}
                                inactiveFillOpacity={0.35}
                                useGradient
                                gradientColors={
                                  lotTelemetry.noAvg.extraAdds > 0
                                    ? ["#FB7185", "#E11D48", "#BE123C"]
                                    : ["#34D399", "#10B981", "#059669"]
                                }
                              />
                            </div>

                            <div>
                              <label className={FIELD_LABEL}>Action When Added</label>
                              <Select value={noAvgMode} onValueChange={setNoAvgMode}>
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="strict">
                                    Auto-Close Extra Order (Strict Block)
                                  </SelectItem>
                                  <SelectItem value="warning">
                                    Warning Alert Only
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={AlertTriangle}
                          title="Martingale Protection"
                          description="Don't double or oversize trades after a loss"
                          value={`${martingaleMultiplier.toFixed(1)}×`}
                          active={martingaleDetection}
                          onToggle={setMartingaleDetection}
                          intent="warning"
                          hasDashboardWidget={pinnedWidgets.includes("martingale")}
                        >
                          <div className="space-y-2.5">
                            {/* Simple Visual Step Flow: Last Loss -> Multiplier -> Next Max Allowed */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                              <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.07]">
                                <span className="text-[9.5px] font-medium text-slate-400 dark:text-neutral-500 block">
                                  Last Losing Lot
                                </span>
                                <span className="text-[12.5px] font-bold text-slate-800 dark:text-white tabular-nums">
                                  {lotTelemetry.martingale.lastLossLot.toFixed(2)} Lots
                                </span>
                              </div>

                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 tabular-nums">
                                × {martingaleMultiplier.toFixed(1)}
                              </span>

                              <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/25 text-right">
                                <span className="text-[9.5px] font-medium text-emerald-700/80 dark:text-emerald-400/80 block">
                                  Max Next Trade
                                </span>
                                <span className="text-[12.5px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                                  {lotTelemetry.martingale.maxNext.toFixed(2)} Lots
                                </span>
                              </div>
                            </div>

                            {/* Linear Safety Scale vs Current Open Exposure */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                  <span>
                                    Open: {lotTelemetry.martingale.current.toFixed(2)} Lots
                                  </span>
                                  <span
                                    className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                  {lotTelemetry.martingale.pct}% of cap ({lotTelemetry.martingale.maxNext.toFixed(2)} max)
                                </span>
                              </div>
                              <Gauge
                                orientation="linear"
                                ariaLabel="Martingale Scale Cap Bar"
                                value={lotTelemetry.martingale.pct}
                                totalNotches={42}
                                linearHeight={12}
                                spacing={2}
                                notchCornerRadius={3}
                                inactiveFillOpacity={0.35}
                                useGradient
                                gradientColors={lotTelemetry.martingale.grad}
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className={`w-[72px] shrink-0 h-[30px] flex items-center justify-center ${INPUT_BASE}`}
                              >
                                {martingaleMultiplier.toFixed(1)}×
                              </div>
                              <input
                                type="range"
                                min="1.1"
                                max="5.0"
                                step="0.1"
                                value={martingaleMultiplier}
                                onChange={(e) =>
                                  setMartingaleMultiplier(
                                    Number(e.target.value)
                                  )
                                }
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                              />
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      <RiskGuardCard
                        icon={Crosshair}
                        title="One Instrument Mode"
                        description="Switch ON to trade only 1 pair · OFF allows any pair"
                        value={oneInstrumentMode ? `Only ${allowedTicker}` : "Any Pair"}
                        active={oneInstrumentMode}
                        onToggle={setOneInstrumentMode}
                        intent="trading"
                        hasDashboardWidget={pinnedWidgets.includes("one_instrument")}
                      >
                        <div className="space-y-2.5">
                          {/* Pair Activity & Active Status Header */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    oneInstrumentMode
                                      ? "bg-[#2563EB]"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                <span>
                                  {oneInstrumentMode
                                    ? `${allowedTicker} Only Active`
                                    : "Any Pair Allowed"}
                                </span>
                                <span
                                  className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                    useDemoData
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  }`}
                                >
                                  {useDemoData ? "Demo" : "Live"}
                                </span>
                              </span>
                              <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                {lotTelemetry.instr.focusPct}% on {allowedTicker}
                              </span>
                            </div>

                            {/* Clean Proportional Multi-Pair Bar */}
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.07] overflow-hidden flex gap-[2px]">
                              {lotTelemetry.instr.pairBreakdown.length > 0 ? (
                                lotTelemetry.instr.pairBreakdown.map((seg, idx) => (
                                  <div
                                    key={seg.symbol}
                                    style={{ flexGrow: Math.max(1, seg.count), flexBasis: 0 }}
                                    title={`${seg.symbol}: ${seg.count} trades (${seg.pct}%)`}
                                    className={`h-full transition-all duration-500 ${
                                      idx === 0 ? "rounded-l-full" : ""
                                    } ${
                                      idx === lotTelemetry.instr.pairBreakdown.length - 1
                                        ? "rounded-r-full"
                                        : ""
                                    } ${
                                      seg.isAllowed
                                        ? "bg-[#2563EB] dark:bg-blue-500"
                                        : oneInstrumentMode
                                        ? "bg-amber-400/80 dark:bg-amber-400/75"
                                        : "bg-slate-300 dark:bg-white/25"
                                    }`}
                                  />
                                ))
                              ) : (
                                <div className="w-full h-full rounded-full bg-[#2563EB] dark:bg-blue-500" />
                              )}
                            </div>

                            {/* Pair Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {lotTelemetry.instr.pairBreakdown.map((seg) => (
                                <span
                                  key={seg.symbol}
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tabular-nums border ${
                                    seg.isAllowed
                                      ? "bg-blue-50/80 text-[#2563EB] border-blue-200/70 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30"
                                      : oneInstrumentMode
                                      ? "bg-amber-50/70 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25"
                                      : "bg-slate-50 text-slate-600 border-slate-200/70 dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/[0.08]"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      seg.isAllowed
                                        ? "bg-[#2563EB]"
                                        : oneInstrumentMode
                                        ? "bg-amber-500"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  <span>
                                    {seg.symbol} {seg.pct}%
                                  </span>
                                  {oneInstrumentMode && seg.isAllowed && (
                                    <span className="text-[8.5px] uppercase font-bold opacity-80">
                                      Active
                                    </span>
                                  )}
                                  {oneInstrumentMode && !seg.isAllowed && (
                                    <span className="text-[8.5px] uppercase font-bold opacity-75">
                                      Paused
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Searchable Symbol Picker + Add Custom Pair */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className={`${FIELD_LABEL} mb-0`}>
                                Allowed Pair (When ON)
                              </label>
                              <span className="text-[9.5px] font-medium text-slate-400 dark:text-neutral-500">
                                Can&apos;t find yours? Type to add
                              </span>
                            </div>
                            <Popover
                              open={tickerPickerOpen}
                              onOpenChange={setTickerPickerOpen}
                            >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={`flex items-center justify-between w-full ${SELECT_TRIGGER} cursor-pointer`}
                              >
                                <span className="truncate font-semibold">
                                  {lotTelemetry.instr.tickerOptions.find(
                                    (o) => o.symbol === allowedTicker
                                  )
                                    ? `${allowedTicker} — ${
                                        lotTelemetry.instr.tickerOptions.find(
                                          (o) => o.symbol === allowedTicker
                                        )?.label
                                      }`
                                    : allowedTicker}
                                </span>
                                <ChevronDown size={14} className="text-slate-400 shrink-0" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-[290px] p-2.5 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C20] shadow-xl z-50"
                            >
                              <div className="relative mb-2">
                                <Search
                                  size={13}
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                  type="text"
                                  value={tickerSearch}
                                  onChange={(e) => setTickerSearch(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && tickerSearch.trim()) {
                                      e.preventDefault();
                                      addCustomTicker(tickerSearch);
                                    }
                                  }}
                                  placeholder="Search or type pair (e.g. USDJPY)..."
                                  className={`w-full pl-8 pr-2.5 h-[32px] ${INPUT_BASE}`}
                                  autoFocus
                                />
                              </div>

                              <div className="max-h-[190px] overflow-y-auto amazing-scrollbar space-y-0.5">
                                {(() => {
                                  const q = tickerSearch.trim().toUpperCase();
                                  const filtered = lotTelemetry.instr.tickerOptions.filter(
                                    (opt) =>
                                      !q ||
                                      opt.symbol.toUpperCase().includes(q) ||
                                      opt.label.toUpperCase().includes(q)
                                  );
                                  const exactExists = lotTelemetry.instr.tickerOptions.some(
                                    (opt) => opt.symbol.toUpperCase() === q
                                  );

                                  return (
                                    <>
                                      {q.length >= 2 && !exactExists && (
                                        <button
                                          type="button"
                                          onClick={() => addCustomTicker(q)}
                                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 text-[#2563EB] dark:text-blue-300 text-[11.5px] font-bold transition-colors cursor-pointer mb-1"
                                        >
                                          <span className="inline-flex items-center gap-1.5">
                                            <Plus size={13} />
                                            <span>Add &amp; Lock &ldquo;{q}&rdquo;</span>
                                          </span>
                                          <span className="text-[9.5px] uppercase font-semibold opacity-75">
                                            Custom
                                          </span>
                                        </button>
                                      )}

                                      {filtered.map((opt) => {
                                        const isSelected =
                                          opt.symbol.toUpperCase() ===
                                          allowedTicker.toUpperCase();
                                        return (
                                          <button
                                            key={opt.symbol}
                                            type="button"
                                            onClick={() => {
                                              setAllowedTicker(opt.symbol);
                                              setTickerPickerOpen(false);
                                              setTickerSearch("");
                                            }}
                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                                              isSelected
                                                ? "bg-blue-50/80 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-300"
                                                : "hover:bg-slate-100/80 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-200"
                                            }`}
                                          >
                                            <div className="min-w-0">
                                              <span className="text-[12px] font-semibold block leading-tight">
                                                {opt.symbol}
                                              </span>
                                              <span className="text-[10px] text-slate-400 dark:text-neutral-500 block truncate">
                                                {opt.label}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              {opt.tag && (
                                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-neutral-400">
                                                  {opt.tag}
                                                </span>
                                              )}
                                              {isSelected && (
                                                <Check size={13} className="text-[#2563EB]" />
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}

                                      {filtered.length === 0 && q.length < 2 && (
                                        <p className="text-[11px] text-slate-400 text-center py-3">
                                          Type symbol name to add custom pair
                                        </p>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </RiskGuardCard>
                    </motion.div>
                  )}

                  {/* ═══ TAB 2: RISK MANAGEMENT ═══ */}
                  {activeTab === "risk_management" && (
                    <motion.div
                      key="tab-risk"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: EXPO_OUT }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      <RiskGuardCard
                        icon={ShieldAlert}
                        title={
                          activeMarket === "indian"
                            ? "Max Loss Guard"
                            : "Drawdown Guard"
                        }
                        description="Set Daily, Weekly or Monthly loss caps — any hit locks trading"
                        value={
                          lotTelemetry.drawdown.active.isOff
                            ? `${lotTelemetry.drawdown.active.label}: Off`
                            : activeMarket === "indian"
                            ? `${sym}${lotTelemetry.drawdown.active.capAmt.toLocaleString()}`
                            : `${lotTelemetry.drawdown.active.capPct.toFixed(1)}% ${lotTelemetry.drawdown.active.label}`
                        }
                        active={drawdownGuardActive}
                        onToggle={setDrawdownGuardActive}
                        intent="emergency"
                        hasDashboardWidget={pinnedWidgets.includes("drawdown")}
                      >
                        <div className="space-y-2.5">
                          {/* Daily / Weekly / Monthly Selector Pills */}
                          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.05]">
                            {(["daily", "weekly", "monthly"] as const).map((pKey) => {
                              const pData = lotTelemetry.drawdown.periods[pKey];
                              const selected = ddPeriod === pKey;
                              return (
                                <button
                                  key={pKey}
                                  type="button"
                                  onClick={() => setDdPeriod(pKey)}
                                  className={`py-1 px-2 rounded-lg text-[10.5px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    selected
                                      ? "bg-white dark:bg-[#1E1E24] text-slate-900 dark:text-white shadow-sm"
                                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200"
                                  }`}
                                >
                                  <span>{pData.label}</span>
                                  <span
                                    className={`text-[9.5px] font-bold tabular-nums ${
                                      pData.isOff
                                        ? "text-slate-400"
                                        : pData.breached
                                        ? "text-rose-500"
                                        : selected
                                        ? "text-[#2563EB] dark:text-blue-400"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {pData.isOff
                                      ? "Off"
                                      : activeMarket === "indian"
                                      ? `${sym}${Math.round(pData.capAmt / 1000)}k`
                                      : `${pData.capPct}%`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-3">
                            {/* 72-Notch Drawdown Depth Gauge */}
                            <div className="w-[134px] shrink-0 flex flex-col items-center">
                              <Gauge
                                compact
                                ariaLabel="Period Drawdown Depth Gauge"
                                value={lotTelemetry.drawdown.active.gaugePct}
                                centerValue={lotTelemetry.drawdown.active.gaugePct}
                                defaultLabel={
                                  lotTelemetry.drawdown.active.isOff
                                    ? `${lotTelemetry.drawdown.active.label} Cap Off`
                                    : activeMarket === "indian"
                                    ? `${sym}${lotTelemetry.drawdown.active.peakAmt.toLocaleString()} / ${sym}${lotTelemetry.drawdown.active.capAmt.toLocaleString()}`
                                    : `${lotTelemetry.drawdown.active.peakPct}% / ${lotTelemetry.drawdown.active.capPct.toFixed(1)}%`
                                }
                                suffix="%"
                                needle="line"
                                ruler
                                totalNotches={72}
                                spacing={40}
                                notchLengthPercent={34}
                                notchCornerRadius={2}
                                startAngle={148}
                                endAngle={392}
                                enterTransition={{
                                  type: "spring",
                                  visualDuration: 1.4,
                                  bounce: 0,
                                }}
                                enterStaggerScale={2}
                                inactiveFillOpacity={0.4}
                                useGradient
                                gradientColors={lotTelemetry.drawdown.active.grad}
                              />
                            </div>

                            {/* Peak Drawdown Telemetry Rows */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-400 dark:text-neutral-500 font-medium">
                                  {lotTelemetry.drawdown.active.label} Cap
                                </span>
                                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                                  {lotTelemetry.drawdown.active.isOff
                                    ? "Off (Skipped)"
                                    : activeMarket === "indian"
                                    ? `${sym}${lotTelemetry.drawdown.active.capAmt.toLocaleString()}`
                                    : `${lotTelemetry.drawdown.active.capPct.toFixed(1)}% (${sym}${Math.round(lotTelemetry.drawdown.active.capAmt).toLocaleString()})`}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-400 dark:text-neutral-500 font-medium inline-flex items-center gap-1">
                                  <span>{lotTelemetry.drawdown.active.worstLabel}</span>
                                  <span
                                    className={`px-1 py-[1px] rounded text-[8.5px] font-bold uppercase tracking-wide ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                <div className="flex items-center gap-1">
                                  {useDemoData && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDemoDdByPeriod((prev) => ({
                                          ...prev,
                                          [ddPeriod]: Math.max(
                                            0,
                                            Number((prev[ddPeriod] - 0.5).toFixed(1))
                                          ),
                                        }))
                                      }
                                      className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] flex items-center justify-center text-slate-600 dark:text-neutral-300 cursor-pointer"
                                      title="Decrease demo drawdown"
                                    >
                                      <Minus size={9} />
                                    </button>
                                  )}
                                  <span
                                    className={`font-bold tabular-nums ${
                                      lotTelemetry.drawdown.active.breached
                                        ? "text-rose-600 dark:text-rose-400"
                                        : lotTelemetry.drawdown.active.peakPct > 0
                                        ? "text-slate-900 dark:text-white"
                                        : "text-emerald-600 dark:text-emerald-400"
                                    }`}
                                  >
                                    {activeMarket === "indian"
                                      ? `-${sym}${lotTelemetry.drawdown.active.peakAmt.toLocaleString()}`
                                      : `-${lotTelemetry.drawdown.active.peakPct}%`}
                                  </span>
                                  {useDemoData && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDemoDdByPeriod((prev) => ({
                                          ...prev,
                                          [ddPeriod]: Number(
                                            (prev[ddPeriod] + 0.5).toFixed(1)
                                          ),
                                        }))
                                      }
                                      className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] flex items-center justify-center text-slate-600 dark:text-neutral-300 cursor-pointer"
                                      title="Increase demo drawdown"
                                    >
                                      <Plus size={9} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-400 dark:text-neutral-500 font-medium">
                                  {lotTelemetry.drawdown.active.isOff
                                    ? "Enforced Caps"
                                    : lotTelemetry.drawdown.active.breached
                                    ? "Limit Reached"
                                    : "Buffer Left"}
                                </span>
                                <span
                                  className={`font-bold tabular-nums ${
                                    lotTelemetry.drawdown.active.isOff
                                      ? "text-slate-500"
                                      : lotTelemetry.drawdown.active.breached
                                      ? "text-rose-600 dark:text-rose-400"
                                      : lotTelemetry.drawdown.active.warning
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {lotTelemetry.drawdown.active.isOff
                                    ? `${lotTelemetry.drawdown.activeCount} active`
                                    : lotTelemetry.drawdown.active.breached
                                    ? activeMarket === "indian"
                                      ? `+${sym}${lotTelemetry.drawdown.active.exceededAmt.toLocaleString()} over`
                                      : `+${lotTelemetry.drawdown.active.exceededPct}% over`
                                    : activeMarket === "indian"
                                    ? `${sym}${lotTelemetry.drawdown.active.remainingAmt.toLocaleString()} left`
                                    : `${lotTelemetry.drawdown.active.remainingPct}% (${sym}${Math.round(lotTelemetry.drawdown.active.remainingAmt).toLocaleString()})`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-[105px_1fr] gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>
                                {lotTelemetry.drawdown.active.label} Limit (0 = Off)
                              </label>
                              <div
                                className={`flex items-center h-[30px] overflow-hidden ${INPUT_BASE}`}
                              >
                                {activeMarket === "indian" ? (
                                  <>
                                    <span className="pl-2.5 pr-1 text-slate-400">
                                      {sym}
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="500"
                                      value={Math.round(lotTelemetry.drawdown.active.capAmt)}
                                      onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value) / 1000);
                                        if (ddPeriod === "daily") setMaxDrawdown(val);
                                        else if (ddPeriod === "weekly") setWeeklyDrawdown(val);
                                        else setMonthlyDrawdown(val);
                                      }}
                                      className="w-full bg-transparent outline-none pr-2"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <input
                                      type="number"
                                      min="0"
                                      max={ddPeriod === "daily" ? "20.0" : ddPeriod === "weekly" ? "35.0" : "50.0"}
                                      step={0.5}
                                      value={lotTelemetry.drawdown.active.capPct}
                                      onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value) || 0);
                                        if (ddPeriod === "daily") setMaxDrawdown(val);
                                        else if (ddPeriod === "weekly") setWeeklyDrawdown(val);
                                        else setMonthlyDrawdown(val);
                                      }}
                                      className="w-full bg-transparent outline-none pl-2.5 text-center"
                                    />
                                    <span className="pr-2.5 text-slate-400">%</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Calculated From</label>
                              <Select
                                value={drawdownBasis}
                                onValueChange={(v) =>
                                  setDrawdownBasis(v as "balance" | "equity")
                                }
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="balance">
                                    Start-of-{ddPeriod === "daily" ? "day" : ddPeriod === "weekly" ? "week" : "month"} balance
                                  </SelectItem>
                                  <SelectItem value="equity">
                                    Current Equity Basis
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {activeMarket !== "indian" && (
                            <input
                              type="range"
                              min="0"
                              max={ddPeriod === "daily" ? "20.0" : ddPeriod === "weekly" ? "35.0" : "50.0"}
                              step="0.5"
                              value={lotTelemetry.drawdown.active.capPct}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (ddPeriod === "daily") setMaxDrawdown(val);
                                else if (ddPeriod === "weekly") setWeeklyDrawdown(val);
                                else setMonthlyDrawdown(val);
                              }}
                              className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                            />
                          )}
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Target}
                        title={
                          activeMarket === "indian"
                            ? "Profit Target"
                            : "Daily Profit Target"
                        }
                        description="Secure your green day automatically once your goal is hit"
                        value={`+${sym}${lotTelemetry.profitTarget.target.toLocaleString()}`}
                        active={dailyProfitTargetActive}
                        onToggle={setDailyProfitTargetActive}
                        intent="positive"
                        hasDashboardWidget={pinnedWidgets.includes("profit_target")}
                      >
                        <div className="space-y-3">
                          {/* Uplifting Positive Milestone Flow: Earned Today -> % Milestone -> Lock Goal */}
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <div className="px-2.5 py-2 rounded-xl bg-emerald-50/75 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/25">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[9.5px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 inline-flex items-center gap-1">
                                  <span>Earned Today</span>
                                  <span
                                    className={`px-1 py-[0.5px] rounded text-[8px] font-bold uppercase ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                {useDemoData && (
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDemoProfitToday((v) => Math.max(0, v - 50))
                                      }
                                      className="w-3.5 h-3.5 rounded bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-white/[0.08] flex items-center justify-center text-emerald-800 dark:text-neutral-200 cursor-pointer"
                                      title="Decrease demo profit"
                                    >
                                      <Minus size={8} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDemoProfitToday((v) => v + 50)}
                                      className="w-3.5 h-3.5 rounded bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-white/[0.08] flex items-center justify-center text-emerald-800 dark:text-neutral-200 cursor-pointer"
                                      title="Increase demo profit"
                                    >
                                      <Plus size={8} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                                {lotTelemetry.profitTarget.today >= 0 ? "+" : "-"}
                                {sym}
                                {Math.abs(Math.round(lotTelemetry.profitTarget.today)).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-col items-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums shadow-xs ${
                                  lotTelemetry.profitTarget.reached
                                    ? "bg-emerald-500 text-white"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                }`}
                              >
                                {lotTelemetry.profitTarget.reached
                                  ? "Goal Hit!"
                                  : `${lotTelemetry.profitTarget.pct}%`}
                              </span>
                            </div>

                            <div className="px-2.5 py-2 rounded-xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-right">
                              <span className="text-[9.5px] font-semibold text-slate-400 dark:text-neutral-500 block mb-0.5">
                                Lock Goal
                              </span>
                              <span className="text-[14px] font-bold text-slate-800 dark:text-white tabular-nums">
                                +{sym}
                                {lotTelemetry.profitTarget.target.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Emerald Milestone Progress Track */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                {lotTelemetry.profitTarget.reached
                                  ? "Goal Achieved · Wins Locked In"
                                  : `+${sym}${lotTelemetry.profitTarget.remaining.toLocaleString()} more to lock your green day`}
                              </span>
                              <span className="text-slate-400 dark:text-neutral-500 font-semibold tabular-nums">
                                {lotTelemetry.profitTarget.pct}%
                              </span>
                            </div>

                            <Gauge
                              orientation="linear"
                              ariaLabel="Daily Profit Milestone Progress"
                              value={lotTelemetry.profitTarget.pct}
                              totalNotches={42}
                              linearHeight={13}
                              spacing={2}
                              notchCornerRadius={3}
                              inactiveFillOpacity={0.32}
                              useGradient
                              gradientColors={lotTelemetry.profitTarget.grad}
                            />

                            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 dark:text-neutral-500 tabular-nums px-0.5">
                              <span>Start</span>
                              <span className={lotTelemetry.profitTarget.pct >= 50 ? "text-emerald-600 dark:text-emerald-400" : ""}>
                                50% Halfway
                              </span>
                              <span className={lotTelemetry.profitTarget.reached ? "text-emerald-600 dark:text-emerald-400" : ""}>
                                100% Lock Wins
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>
                                {activeMarket === "indian"
                                  ? "Target (₹)"
                                  : "Target Amount"}
                              </label>
                              <div className="relative flex items-center">
                                <span className="absolute left-2.5 text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  {sym}
                                </span>
                                <input
                                  type="number"
                                  min={activeMarket === "indian" ? "500" : "10"}
                                  step={activeMarket === "indian" ? "500" : "25"}
                                  value={dailyProfitTarget}
                                  onChange={(e) =>
                                    setDailyProfitTarget(Number(e.target.value))
                                  }
                                  className={`w-full pl-6 pr-10 h-[30px] ${INPUT_BASE}`}
                                />
                                <span className="absolute right-2.5 text-[9.5px] font-semibold text-slate-400">
                                  {iso}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Count Profit From</label>
                              <Select
                                value={profitTargetCalc}
                                onValueChange={(v) =>
                                  setProfitTargetCalc(v as "closed" | "equity")
                                }
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="closed">
                                    Closed Trades Only
                                  </SelectItem>
                                  <SelectItem value="equity">
                                    Closed + Open Profit
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <input
                            type="range"
                            min={activeMarket === "indian" ? "500" : "50"}
                            max={activeMarket === "indian" ? "50000" : "5000"}
                            step={activeMarket === "indian" ? "500" : "50"}
                            value={dailyProfitTarget}
                            onChange={(e) =>
                              setDailyProfitTarget(Number(e.target.value))
                            }
                            className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-500/15 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={StopCircle}
                          title="Stop Loss Required"
                          description="Never let an open trade run without a Stop-Loss"
                          value={`${lotTelemetry.stopLoss.coveragePct}% SL`}
                          active={stopLossRequired}
                          onToggle={setStopLossRequired}
                          intent="trading"
                        >
                          <div className="space-y-2.5">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                  <span>Open SL Check</span>
                                  <span
                                    className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                  {lotTelemetry.stopLoss.withSl} protected ·{" "}
                                  {lotTelemetry.stopLoss.missing} missing SL
                                </span>
                              </div>
                              <Gauge
                                orientation="linear"
                                ariaLabel="Stop Loss Coverage Linear Gauge"
                                value={lotTelemetry.stopLoss.coveragePct}
                                totalNotches={42}
                                linearHeight={12}
                                spacing={2}
                                notchCornerRadius={3}
                                inactiveFillOpacity={0.35}
                                useGradient
                                gradientColors={
                                  lotTelemetry.stopLoss.missing > 0
                                    ? ["#FB7185", "#E11D48", "#BE123C"]
                                    : ["#34D399", "#10B981", "#059669"]
                                }
                              />
                            </div>

                            <div
                              className={
                                stopLossAction === "auto"
                                  ? "grid grid-cols-[1.2fr_1fr_0.75fr] gap-2"
                                  : ""
                              }
                            >
                              <div>
                                <label className={FIELD_LABEL}>
                                  When SL Is Missing
                                </label>
                                <Select
                                  value={stopLossAction}
                                  onValueChange={setStopLossAction}
                                >
                                  <SelectTrigger className={SELECT_TRIGGER}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="block">
                                      Auto-Close Trade (Strict Block)
                                    </SelectItem>
                                    <SelectItem value="auto">
                                      Auto-Attach Default SL
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {stopLossAction === "auto" && (
                                <>
                                  <div>
                                    <label className={FIELD_LABEL}>Distance</label>
                                    <Select
                                      value={stopLossMethod === "percent" ? "percent" : "pips"}
                                      onValueChange={(v) => {
                                        setStopLossMethod(v);
                                        if (v === "percent" && defaultStopLoss > 10) {
                                          setDefaultStopLoss(0.5);
                                        } else if (v === "pips" && defaultStopLoss < 2) {
                                          setDefaultStopLoss(15);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className={SELECT_TRIGGER}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pips">Pips</SelectItem>
                                        <SelectItem value="percent">
                                          Percent (%)
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className={FIELD_LABEL}>Value</label>
                                    <div className="relative flex items-center">
                                      <input
                                        type="number"
                                        min={stopLossMethod === "percent" ? "0.1" : "1"}
                                        step={stopLossMethod === "percent" ? "0.1" : "1"}
                                        value={defaultStopLoss}
                                        onChange={(e) =>
                                          setDefaultStopLoss(Number(e.target.value))
                                        }
                                        className={`w-full pl-2.5 pr-9 h-[30px] ${INPUT_BASE}`}
                                      />
                                      <span className="absolute right-2 text-[9.5px] font-semibold text-slate-400">
                                        {stopLossMethod === "percent" ? "%" : "pips"}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={TrendingUp}
                          title="Min Risk/Reward"
                          description="Only allow trades where potential gain beats risk"
                          value={`1:${lotTelemetry.rr.min.toFixed(1)}`}
                          active={minRiskRewardActive}
                          onToggle={setMinRiskRewardActive}
                          intent="trading"
                        >
                          <div className="space-y-2.5">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                  <span>Risk vs Reward Split</span>
                                  <span
                                    className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                  Your Avg 1:{lotTelemetry.rr.avg} · Min 1:{lotTelemetry.rr.min.toFixed(1)}
                                </span>
                              </div>

                              {/* Risk vs Reward Visual Ratio Bar */}
                              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.07] overflow-hidden flex gap-[2px]">
                                <div
                                  style={{ width: `${lotTelemetry.rr.riskSharePct}%` }}
                                  className="h-full rounded-l-full bg-rose-400/90 transition-all duration-300"
                                  title="Risk (1x SL)"
                                />
                                <div
                                  style={{ width: `${100 - lotTelemetry.rr.riskSharePct}%` }}
                                  className="h-full rounded-r-full bg-emerald-500 transition-all duration-300"
                                  title={`Target Reward (${lotTelemetry.rr.min.toFixed(1)}x TP)`}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-semibold">
                                <span className="text-rose-600 dark:text-rose-400">
                                  Risk: 1.0× ($100)
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  Min Reward: {lotTelemetry.rr.min.toFixed(1)}× ($
                                  {Math.round(lotTelemetry.rr.min * 100)})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center w-[96px] shrink-0 h-[30px] overflow-hidden ${INPUT_BASE}`}
                              >
                                <span className="pl-2.5 pr-1 text-slate-400">
                                  1:
                                </span>
                                <input
                                  type="number"
                                  min="1.0"
                                  max="5.0"
                                  step={0.1}
                                  value={minRiskReward}
                                  onChange={(e) =>
                                    setMinRiskReward(Number(e.target.value))
                                  }
                                  className="w-full bg-transparent outline-none pr-2"
                                />
                              </div>
                              <input
                                type="range"
                                min="1.0"
                                max="5.0"
                                step="0.1"
                                value={minRiskReward}
                                onChange={(e) =>
                                  setMinRiskReward(Number(e.target.value))
                                }
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                              />
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      <RiskGuardCard
                        icon={Calendar}
                        title={
                          activeMarket === "indian"
                            ? "Time-Based Kill"
                            : "Weekend Lock"
                        }
                        description={
                          activeMarket === "indian"
                            ? "Auto square-off at daily IST cutoff time"
                            : "Auto flatten before Friday close to avoid weekend gaps"
                        }
                        value={formatTime12h(weekendCloseTime)}
                        active={weekendLock}
                        onToggle={setWeekendLock}
                        intent="warning"
                      >
                        <div className="space-y-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    lotTelemetry.weekend.isWindow
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                <span>
                                  {lotTelemetry.weekend.isWindow
                                    ? "Cutoff Window Active"
                                    : activeMarket === "indian"
                                    ? `Daily Cutoff @ ${formatTime12h(weekendCloseTime)} IST`
                                    : `Friday @ ${formatTime12h(weekendCloseTime)} Broker`}
                                </span>
                              </span>
                              <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                {lotTelemetry.weekend.progressPct}% to cutoff
                              </span>
                            </div>
                            <Gauge
                              orientation="linear"
                              ariaLabel="Weekend Lock Countdown Gauge"
                              value={lotTelemetry.weekend.progressPct}
                              totalNotches={42}
                              linearHeight={10}
                              spacing={2}
                              notchCornerRadius={3}
                              inactiveFillOpacity={0.35}
                              useGradient
                              gradientColors={
                                lotTelemetry.weekend.isWindow
                                  ? ["#FB7185", "#E11D48", "#BE123C"]
                                  : ["#FBBF24", "#F59E0B", "#D97706"]
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>
                                {activeMarket === "indian"
                                  ? "Kill Time (IST)"
                                  : "Friday Close Time"}
                              </label>
                              <TimePickerPopover
                                value={weekendCloseTime}
                                onChange={setWeekendCloseTime}
                                subtitle={
                                  activeMarket === "indian" ? "IST" : "Broker"
                                }
                              />
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Action</label>
                              <Select
                                value={weekendAction}
                                onValueChange={(v) =>
                                  setWeekendAction(v as "both" | "close" | "block")
                                }
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="both">
                                    Close &amp; Block New
                                  </SelectItem>
                                  <SelectItem value="close">
                                    Close Open Only
                                  </SelectItem>
                                  <SelectItem value="block">
                                    Block New Entries
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        {activeMarket === "indian" && (
                          <p className="mt-2 text-[10px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Zap size={10} />
                            <span>Set 12:00 PM on expiry days for premium spikes.</span>
                          </p>
                        )}
                      </RiskGuardCard>

                      {activeMarket === "indian" && (
                        <>
                          <RiskGuardCard
                            icon={Calendar}
                            title="Day-Based Kill"
                            description="Kill on selected weekdays + time"
                            active={dayBasedKillActive}
                            onToggle={setDayBasedKillActive}
                            intent="warning"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {["Mon", "Tue", "Wed", "Thu", "Fri"].map(
                                  (day) => (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() =>
                                        setDayBasedKillDays((prev) =>
                                          prev.includes(day)
                                            ? prev.filter((d) => d !== day)
                                            : [...prev, day]
                                        )
                                      }
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                                        dayBasedKillDays.includes(day)
                                          ? "bg-blue-50 text-[#2563EB] border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/10"
                                      }`}
                                    >
                                      {day}
                                    </button>
                                  )
                                )}
                              </div>
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="time"
                                  value={dayBasedKillTime}
                                  onChange={(e) =>
                                    setDayBasedKillTime(e.target.value)
                                  }
                                  className={`w-[130px] px-2.5 h-[32px] ${INPUT_BASE}`}
                                />
                                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                  Thu = Weekly expiry
                                </span>
                              </div>
                            </div>
                          </RiskGuardCard>

                          <RiskGuardCard
                            icon={Calendar}
                            title="Specific Dates"
                            description="Kill on exact calendar dates"
                            active={specificDateKillActive}
                            onToggle={setSpecificDateKillActive}
                            intent="warning"
                          >
                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className={FIELD_LABEL}>Date</label>
                                <input
                                  type="date"
                                  value={specificDateKillDate}
                                  onChange={(e) =>
                                    setSpecificDateKillDate(e.target.value)
                                  }
                                  className={`w-full px-2.5 h-[32px] ${INPUT_BASE}`}
                                />
                              </div>
                              <div>
                                <label className={FIELD_LABEL}>Time (IST)</label>
                                <input
                                  type="time"
                                  value={specificDateKillTime}
                                  onChange={(e) =>
                                    setSpecificDateKillTime(e.target.value)
                                  }
                                  className={`w-full px-2.5 h-[32px] ${INPUT_BASE}`}
                                />
                              </div>
                            </div>
                          </RiskGuardCard>
                        </>
                      )}

                      <RiskGuardCard
                        icon={Wallet}
                        title="Account Protection"
                        description="Hard stop: lock account if equity drops to this floor"
                        value={`${sym}${lotTelemetry.equityFloor.floor.toLocaleString()}`}
                        active={equityHardStopActive}
                        onToggle={setEquityHardStopActive}
                        intent="emergency"
                        hasDashboardWidget={pinnedWidgets.includes("equity_floor")}
                      >
                        <div className="space-y-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                <span>
                                  Equity: {sym}{lotTelemetry.equityFloor.current.toLocaleString()}
                                </span>
                                <span
                                  className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                    useDemoData
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  }`}
                                >
                                  {useDemoData ? "Demo" : "Live"}
                                </span>
                              </span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  lotTelemetry.equityFloor.breached
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {lotTelemetry.equityFloor.breached
                                  ? "Floor Breached!"
                                  : `+${sym}${lotTelemetry.equityFloor.cushion.toLocaleString()} cushion`}
                              </span>
                            </div>

                            <Gauge
                              orientation="linear"
                              ariaLabel="Account Equity Floor Safety Buffer"
                              value={lotTelemetry.equityFloor.bufferPct}
                              totalNotches={42}
                              linearHeight={12}
                              spacing={2}
                              notchCornerRadius={3}
                              inactiveFillOpacity={0.35}
                              useGradient
                              gradientColors={
                                lotTelemetry.equityFloor.breached
                                  ? ["#FB7185", "#E11D48", "#BE123C"]
                                  : ["#34D399", "#10B981", "#059669"]
                              }
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative flex items-center flex-1 min-w-0">
                              <span className="absolute left-2.5 text-[11.5px] font-semibold text-slate-400">
                                {sym}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step={activeMarket === "indian" ? "1000" : "100"}
                                value={equityHardStop}
                                onChange={(e) =>
                                  setEquityHardStop(Math.max(0, Number(e.target.value)))
                                }
                                className={`w-full pl-6 pr-10 h-[30px] ${INPUT_BASE}`}
                              />
                              <span className="absolute right-2.5 text-[9.5px] font-semibold text-slate-400">
                                {iso}
                              </span>
                            </div>

                            {/* Quick Floor Presets (% of current equity) */}
                            <div className="flex items-center gap-1 shrink-0">
                              {[50, 75, 90].map((pctOfEq) => {
                                const presetAmt = Math.round(
                                  (lotTelemetry.equityFloor.current * pctOfEq) / 100
                                );
                                return (
                                  <button
                                    key={pctOfEq}
                                    type="button"
                                    onClick={() => setEquityHardStop(presetAmt)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                                      Math.abs(equityHardStop - presetAmt) < 10
                                        ? "bg-blue-50 text-[#2563EB] border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30"
                                        : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/10"
                                    }`}
                                    title={`Set floor to ${pctOfEq}% of current equity`}
                                  >
                                    {pctOfEq}%
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>
                    </motion.div>
                  )}

                  {/* ═══ TAB 3: BEHAVIOUR & DISCIPLINE ═══ */}
                  {activeTab === "behaviour" && (
                    <motion.div
                      key="tab-behaviour"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: EXPO_OUT }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      <RiskGuardCard
                        icon={ShieldCheck}
                        title={
                          activeMarket === "indian"
                            ? "Max Trades"
                            : "Daily Trade Limit"
                        }
                        description={
                          activeMarket === "indian"
                            ? "Lock trading after N orders today"
                            : "Stop overtrading after max orders per day"
                        }
                        value={`${lotTelemetry.behaviour.tradeCap}/day`}
                        active={disciplineActive}
                        onToggle={setDisciplineActive}
                        intent="discipline"
                        hasDashboardWidget={pinnedWidgets.includes("trade_limit")}
                      >
                        <div className="space-y-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                <span>
                                  Today: {lotTelemetry.behaviour.tradesUsed} /{" "}
                                  {lotTelemetry.behaviour.tradeCap}
                                </span>
                                <span
                                  className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                    useDemoData
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  }`}
                                >
                                  {useDemoData ? "Demo" : "Live"}
                                </span>
                                {useDemoData && (
                                  <span className="inline-flex items-center gap-0.5 ml-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDemoTradesToday((v) => Math.max(0, v - 1))
                                      }
                                      className="w-3.5 h-3.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 cursor-pointer"
                                      title="Decrease demo trade count"
                                    >
                                      <Minus size={8} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDemoTradesToday((v) => v + 1)
                                      }
                                      className="w-3.5 h-3.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 cursor-pointer"
                                      title="Increase demo trade count"
                                    >
                                      <Plus size={8} />
                                    </button>
                                  </span>
                                )}
                              </span>
                              <span
                                className={`font-semibold tabular-nums ${
                                  lotTelemetry.behaviour.tradesBreached
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {lotTelemetry.behaviour.tradesBreached
                                  ? "Limit reached"
                                  : `${lotTelemetry.behaviour.tradesLeft} left today`}
                              </span>
                            </div>
                            <TradeSlotsBlobStrip
                              total={lotTelemetry.behaviour.tradeCap}
                              completed={lotTelemetry.behaviour.tradesUsed}
                              interactive={useDemoData}
                              onSelectCount={setDemoTradesToday}
                            />
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                              {activeMarket === "indian"
                                ? "Max orders per day"
                                : "Max trades per day"}
                            </span>
                            <div className="flex items-center gap-1.5 w-[132px]">
                              <button
                                type="button"
                                onClick={() =>
                                  setTradeLimit((prev) => Math.max(1, (prev || 1) - 1))
                                }
                                className="tactile-white-pill w-7 h-7 rounded-[8px] flex items-center justify-center font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span
                                className={`flex-1 h-[30px] flex items-center justify-center ${INPUT_BASE}`}
                              >
                                {lotTelemetry.behaviour.tradeCap}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isProOrElite && lotTelemetry.behaviour.tradeCap >= 5) {
                                    toast.error("Pro Feature", {
                                      description:
                                        "Upgrade to Pro to increase daily execution limits above 5.",
                                    });
                                    return;
                                  }
                                  setTradeLimit((prev) =>
                                    Math.min(20, (prev || 1) + 1)
                                  );
                                }}
                                className="tactile-white-pill w-7 h-7 rounded-[8px] flex items-center justify-center font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={ShieldOff}
                        title="Loss Cooldown"
                        description="Take a mandatory break after losing trades"
                        value={!isProOrElite ? "Pro" : `${waitPeriod}m`}
                        active={!isProOrElite ? false : revengeGuard}
                        onToggle={(val) => {
                          if (!isProOrElite) {
                            toast.error("Pro Feature", {
                              description:
                                "Upgrade to Pro to unlock Loss Cooldown.",
                              icon: (
                                <Crown size={15} className="text-amber-500" />
                              ),
                            });
                            return;
                          }
                          setRevengeGuard(val);
                        }}
                        intent="discipline"
                        hasDashboardWidget={pinnedWidgets.includes("loss_cooldown")}
                      >
                        <div className="space-y-2.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    cooldownActive
                                      ? "bg-rose-500 animate-pulse"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                <span>
                                  {cooldownActive
                                    ? "Cooldown Running"
                                    : `Wait ${waitPeriod}m to cool off`}
                                </span>
                              </span>
                              <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                {cooldownActive
                                  ? formatCountdown(cooldownSeconds)
                                  : lossCooldownTrigger === "consecutive"
                                  ? "After 2+ losses"
                                  : "After every loss"}
                              </span>
                            </div>
                            <Gauge
                              orientation="linear"
                              ariaLabel="Loss Cooldown Wait Duration"
                              value={
                                cooldownActive && waitPeriod > 0
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (cooldownSeconds / (waitPeriod * 60)) * 100
                                      )
                                    )
                                  : Math.min(100, Math.round((waitPeriod / 120) * 100))
                              }
                              totalNotches={42}
                              linearHeight={10}
                              spacing={2}
                              notchCornerRadius={3}
                              inactiveFillOpacity={0.35}
                              useGradient
                              gradientColors={
                                cooldownActive
                                  ? ["#FB7185", "#E11D48", "#BE123C"]
                                  : ["#60A5FA", "#2563EB", "#0031F2"]
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>
                                Break ({waitPeriod}m)
                              </label>
                              <div
                                className={`flex items-center gap-2 px-2.5 h-[30px] ${INPUT_BASE}`}
                              >
                                <input
                                  type="range"
                                  min={5}
                                  max={120}
                                  step={5}
                                  value={waitPeriod}
                                  onChange={(e) => setWaitPeriod(+e.target.value)}
                                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#2563EB] bg-slate-200 dark:bg-white/10"
                                />
                              </div>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Trigger</label>
                              <Select
                                value={lossCooldownTrigger}
                                onValueChange={(v) =>
                                  setLossCooldownTrigger(v as "every" | "consecutive")
                                }
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="every">Every loss</SelectItem>
                                  <SelectItem value="consecutive">
                                    2+ losses in row
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Clock}
                        title="Session Sentinel"
                        description="Allow trades only inside your selected market hours"
                        value={`${selectedSessions.length} active`}
                        active={sessionActive}
                        onToggle={setSessionActive}
                        intent="discipline"
                        hasDashboardWidget={pinnedWidgets.includes("session")}
                      >
                        <div className="space-y-2.5">
                          {/* Visual Market Session Allocation Strip */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-neutral-400">
                              <span>Allowed Sessions</span>
                              <span className="text-[#2563EB] dark:text-blue-400">
                                {selectedSessions.length} of {sessionButtons.length} selected
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {sessionButtons.map((s) => {
                                const on = selectedSessions.includes(s.id);
                                return (
                                  <div
                                    key={`bar-${s.id}`}
                                    className={`h-2 rounded-full transition-colors ${
                                      on
                                        ? "bg-[#2563EB] dark:bg-blue-500"
                                        : "bg-slate-200 dark:bg-white/10"
                                    }`}
                                    title={`${s.label}: ${on ? "Active" : "Blocked"}`}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {sessionButtons.map((session) => {
                              const isSelected = selectedSessions.includes(
                                session.id
                              );
                              const times = sessionTimes[session.id];
                              return (
                                <button
                                  key={session.id}
                                  type="button"
                                  onClick={() => toggleSession(session.id)}
                                  className={`px-2.5 h-[28px] rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                    isSelected
                                      ? "bg-blue-50 text-[#2563EB] border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                                      : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/10"
                                  }`}
                                >
                                  <span>{session.label}</span>
                                  {times && (
                                    <span className="text-[9px] opacity-70 font-medium">
                                      {formatTime12h(times.start).replace(":00", "")}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Trophy}
                        title="Win Streak Cooldown"
                        description="Protect profits after a hot win streak"
                        value={`${consecutiveWins} Wins`}
                        active={stopAfterWin}
                        onToggle={setStopAfterWin}
                        intent="positive"
                      >
                        <div className="space-y-2.5">
                          {/* Visual Win Milestone Dots */}
                          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-50/75 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20">
                            <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300">
                              Lock gains after {consecutiveWins} green trades
                            </span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(6, consecutiveWins) }).map(
                                (_, idx) => (
                                  <span
                                    key={idx}
                                    className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"
                                  />
                                )
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>Win Streak</label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConsecutiveWins((prev) =>
                                      Math.max(1, prev - 1)
                                    )
                                  }
                                  className="tactile-white-pill w-7 h-7 rounded-[8px] flex items-center justify-center font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <span
                                  className={`flex-1 h-[30px] flex items-center justify-center ${INPUT_BASE}`}
                                >
                                  {consecutiveWins}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConsecutiveWins((prev) =>
                                      Math.min(10, prev + 1)
                                    )
                                  }
                                  className="tactile-white-pill w-7 h-7 rounded-[8px] flex items-center justify-center font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Action</label>
                              <Select
                                value={winStreakAction}
                                onValueChange={(v) =>
                                  setWinStreakAction(v as "pause" | "confirm")
                                }
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pause">
                                    Pause trading
                                  </SelectItem>
                                  <SelectItem value="confirm">
                                    Warning prompt
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Sunrise}
                        title="No Trading After Time"
                        description="Daily hard cutoff time to avoid late fatigue"
                        value={formatTime12h(noTradingAfterTime)}
                        active={noTradingAfterTimeActive}
                        onToggle={setNoTradingAfterTimeActive}
                        intent="discipline"
                      >
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    lotTelemetry.behaviour.isPastCutoff
                                      ? "bg-rose-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                <span>
                                  {lotTelemetry.behaviour.isPastCutoff
                                    ? `Past ${formatTime12h(noTradingAfterTime)} cutoff`
                                    : `Cutoff @ ${formatTime12h(noTradingAfterTime)}`}
                                </span>
                              </span>
                              <span className="text-slate-500 dark:text-neutral-400 font-semibold tabular-nums">
                                {lotTelemetry.behaviour.cutoffProgressPct}% of day
                              </span>
                            </div>
                            <Gauge
                              orientation="linear"
                              ariaLabel="Daily Cutoff Progress Bar"
                              value={lotTelemetry.behaviour.cutoffProgressPct}
                              totalNotches={42}
                              linearHeight={10}
                              spacing={2}
                              notchCornerRadius={3}
                              inactiveFillOpacity={0.35}
                              useGradient
                              gradientColors={
                                lotTelemetry.behaviour.isPastCutoff
                                  ? ["#FB7185", "#E11D48", "#BE123C"]
                                  : ["#60A5FA", "#2563EB", "#0031F2"]
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>Cutoff Time</label>
                              <TimePickerPopover
                                value={noTradingAfterTime}
                                onChange={setNoTradingAfterTime}
                                subtitle={
                                  activeMarket === "indian" ? "IST" : "Broker"
                                }
                              />
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Action</label>
                              <Select
                                value={noTradeAfterAction}
                                onValueChange={(v) =>
                                  setNoTradeAfterAction(v as "block" | "close")
                                }
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="block">
                                    Block new trades
                                  </SelectItem>
                                  <SelectItem value="close">
                                    Close &amp; block
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={HeartPulse}
                          title="Behavioural Risk Detector"
                          description="Spots emotional tilt & revenge overtrading early"
                          value={`${emotionSensitivity}%`}
                          active={emotionalTradingDetector}
                          onToggle={setEmotionalTradingDetector}
                          intent="discipline"
                          hasDashboardWidget={pinnedWidgets.includes("tilt_score")}
                        >
                          <div className="space-y-2.5">
                            {/* Smooth Calm / Tilt Trendline */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
                                  <span>
                                    Calm Score: {lotTelemetry.behaviour.calmScore}%
                                  </span>
                                  <span
                                    className={`px-1 py-[0.5px] rounded text-[8.5px] font-bold uppercase ${
                                      useDemoData
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                    }`}
                                  >
                                    {useDemoData ? "Demo" : "Live"}
                                  </span>
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {lotTelemetry.behaviour.calmScore >= 75
                                    ? "Steady mindset"
                                    : "Watch tilt risk"}
                                </span>
                              </div>
                              <div className="w-full h-9 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] px-2 py-1 overflow-hidden">
                                <svg
                                  viewBox="0 0 220 32"
                                  preserveAspectRatio="none"
                                  className="w-full h-full overflow-visible"
                                >
                                  <defs>
                                    <linearGradient
                                      id="tiltTrendFill"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="0%"
                                        stopColor="#2563EB"
                                        stopOpacity="0.22"
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor="#2563EB"
                                        stopOpacity="0"
                                      />
                                    </linearGradient>
                                  </defs>
                                  {(() => {
                                    const pts = lotTelemetry.behaviour.tiltSeries;
                                    const coords = pts.map((v, idx) => {
                                      const x =
                                        (idx / Math.max(1, pts.length - 1)) * 220;
                                      const y =
                                        28 -
                                        ((Math.max(40, Math.min(100, v)) - 40) /
                                          60) *
                                          24;
                                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                                    });
                                    const linePath = `M ${coords.join(" L ")}`;
                                    const areaPath = `${linePath} L 220,32 L 0,32 Z`;
                                    return (
                                      <>
                                        <path d={areaPath} fill="url(#tiltTrendFill)" />
                                        <path
                                          d={linePath}
                                          fill="none"
                                          stroke="#2563EB"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </>
                                    );
                                  })()}
                                </svg>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 h-[26px]">
                              <span className="text-[10px] font-medium text-slate-400">
                                Relaxed
                              </span>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                step="10"
                                value={emotionSensitivity}
                                onChange={(e) =>
                                  setEmotionSensitivity(Number(e.target.value))
                                }
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                              />
                              <span className="text-[10px] font-medium text-slate-400">
                                Strict
                              </span>
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      <RiskGuardCard
                        icon={AlertTriangle}
                        title="News Filter"
                        description="Pause trading before & after high-impact news spikes"
                        value={`${newsBeforeMins + newsAfterMins}m buffer`}
                        active={newsFilter}
                        onToggle={setNewsFilter}
                        intent="warning"
                      >
                        <div className="space-y-2.5">
                          {/* Visual News Blackout Buffer Timeline */}
                          <div className="flex items-center gap-1 text-[9.5px] font-semibold">
                            <div className="flex-1 py-1 px-2 rounded-l-lg bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-center tabular-nums">
                              -{newsBeforeMins}m Pause
                            </div>
                            <div className="py-1 px-2 rounded bg-rose-100 dark:bg-rose-500/25 text-rose-700 dark:text-rose-300 font-bold">
                              News Spike
                            </div>
                            <div className="flex-1 py-1 px-2 rounded-r-lg bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-center tabular-nums">
                              +{newsAfterMins}m Pause
                            </div>
                          </div>

                          <div className="grid grid-cols-[1.2fr_0.65fr_0.65fr] gap-2">
                            <div>
                              <label className={FIELD_LABEL}>Impact</label>
                              <Select
                                value={newsImpactLevel}
                                onValueChange={setNewsImpactLevel}
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">High Only</SelectItem>
                                  <SelectItem value="medium_high">
                                    Med &amp; High
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Before</label>
                              <div
                                className={`flex items-center h-[32px] px-1.5 ${INPUT_BASE}`}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  value={newsBeforeMins}
                                  onChange={(e) =>
                                    setNewsBeforeMins(Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-full bg-transparent outline-none text-center"
                                />
                                <span className="text-[9px] text-slate-400">m</span>
                              </div>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>After</label>
                              <div
                                className={`flex items-center h-[32px] px-1.5 ${INPUT_BASE}`}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  value={newsAfterMins}
                                  onChange={(e) =>
                                    setNewsAfterMins(Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-full bg-transparent outline-none text-center"
                                />
                                <span className="text-[9px] text-slate-400">m</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Moon}
                        title="Sleep Protection"
                        description="Block late-night tired trading hours"
                        value={lotTelemetry.behaviour.sleepHoursLabel}
                        active={sleepProtection}
                        onToggle={setSleepProtection}
                        intent="discipline"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.07] text-[10.5px]">
                            <span className="font-semibold text-slate-600 dark:text-neutral-300">
                              Rest Window
                            </span>
                            <span className="font-bold text-[#2563EB] dark:text-blue-400 tabular-nums">
                              {formatTime12h(sleepTimeStart)} → {formatTime12h(sleepTimeEnd)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>Sleep Start</label>
                              <TimePickerPopover
                                value={sleepTimeStart}
                                onChange={setSleepTimeStart}
                                subtitle="Local"
                              />
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Wake Up</label>
                              <TimePickerPopover
                                value={sleepTimeEnd}
                                onChange={setSleepTimeEnd}
                                subtitle="Local"
                              />
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={CheckSquare}
                          title="Pre-Trade Checklist"
                          description="Quick discipline check before placing an order"
                          value={
                            checklistPreset === "basic"
                              ? "3 Checks"
                              : checklistPreset === "strict"
                              ? "8 Checks"
                              : "5 Checks"
                          }
                          active={preTradeChecklist}
                          onToggle={setPreTradeChecklist}
                          intent="discipline"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(checklistPreset === "basic"
                                ? ["SL Set", "Trend Aligned", "Lot Safe"]
                                : checklistPreset === "strict"
                                ? ["SL Set", "Min 1:2 R:R", "No News", "Trend OK", "+4 more"]
                                : ["SL Set", "Lot Safe", "In Session", "+2 more"]
                              ).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-md bg-blue-50/70 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-300 text-[9.5px] font-semibold"
                                >
                                  ✓ {tag}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className={FIELD_LABEL}>Preset</label>
                                <Select
                                  value={checklistPreset}
                                  onValueChange={(v) =>
                                    setChecklistPreset(
                                      v as "basic" | "standard" | "strict"
                                    )
                                  }
                                >
                                  <SelectTrigger className={SELECT_TRIGGER}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="basic">
                                      Basic (3)
                                    </SelectItem>
                                    <SelectItem value="standard">
                                      Standard (5)
                                    </SelectItem>
                                    <SelectItem value="strict">
                                      Strict (8)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className={FIELD_LABEL}>Items</label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toast.info(
                                      `Active checklist preset: ${checklistPreset.toUpperCase()}`
                                    )
                                  }
                                  className="tactile-white-pill w-full h-[32px] rounded-[9px] text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Settings size={11} />
                                  <span>Edit Items</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={Brain}
                          title="Psychology Check"
                          description="10-second calm mindset check-in before trading"
                          value={
                            psychologyFreq === "every"
                              ? "Every Trade"
                              : psychologyFreq === "loss"
                              ? "After Loss"
                              : psychologyFreq === "daily"
                              ? "Once Daily"
                              : "1st Trade"
                          }
                          active={psychologyCheck}
                          onToggle={setPsychologyCheck}
                          intent="discipline"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5">
                              {["Calm", "Focused", "Patient"].map((mood) => (
                                <span
                                  key={mood}
                                  className="flex-1 text-center py-1 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.07] text-[10px] font-semibold text-slate-600 dark:text-neutral-300"
                                >
                                  {mood}
                                </span>
                              ))}
                            </div>
                            <Select
                              value={psychologyFreq}
                              onValueChange={(v) =>
                                setPsychologyFreq(
                                  v as "first" | "loss" | "every" | "daily"
                                )
                              }
                            >
                              <SelectTrigger className={SELECT_TRIGGER}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="first">
                                  Before first trade
                                </SelectItem>
                                <SelectItem value="loss">
                                  After a losing trade
                                </SelectItem>
                                <SelectItem value="every">
                                  Before every trade
                                </SelectItem>
                                <SelectItem value="daily">Once daily</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={Sparkles}
                          title="AI Weekly Review"
                          description="Automatic weekend report on habits & leaks"
                          value={formatTime12h(aiReviewTime)}
                          active={aiWeeklyReview}
                          onToggle={setAiWeeklyReview}
                          intent="discipline"
                        >
                          <div className="space-y-2.5">
                            <div className="px-2.5 py-1.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-[10px] font-semibold text-[#2563EB] dark:text-blue-300">
                              Delivers win-rate, rule breaks &amp; best setups every week
                            </div>
                            <div className="grid grid-cols-[0.75fr_1.35fr_0.9fr] gap-2">
                              <div>
                                <label className={FIELD_LABEL}>Day</label>
                                <Select
                                  value={aiReviewDay}
                                  onValueChange={(v) =>
                                    setAiReviewDay(
                                      v as "friday" | "saturday" | "sunday"
                                    )
                                  }
                                >
                                  <SelectTrigger className={SELECT_TRIGGER}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="friday">Fri</SelectItem>
                                    <SelectItem value="saturday">Sat</SelectItem>
                                    <SelectItem value="sunday">Sun</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className={FIELD_LABEL}>Time</label>
                                <TimePickerPopover
                                  value={aiReviewTime}
                                  onChange={setAiReviewTime}
                                  subtitle=""
                                />
                              </div>
                              <div>
                                <label className={FIELD_LABEL}>Send</label>
                                <Select
                                  value={aiReviewSend}
                                  onValueChange={(v) =>
                                    setAiReviewSend(v as "in_app" | "email")
                                  }
                                >
                                  <SelectTrigger className={SELECT_TRIGGER}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="in_app">In-app</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={Volume2}
                          title="AI Voice Warning"
                          description="Spoken alert before you break a limit"
                          value={`${voiceVolume}%`}
                          active={aiVoiceWarning}
                          onToggle={setAiVoiceWarning}
                          intent="warning"
                        >
                          <div className="space-y-2.5">
                            <Gauge
                              orientation="linear"
                              ariaLabel="Voice Alert Output Level"
                              value={voiceVolume}
                              totalNotches={36}
                              linearHeight={9}
                              spacing={2}
                              notchCornerRadius={3}
                              inactiveFillOpacity={0.3}
                              useGradient
                              gradientColors={["#FBBF24", "#F59E0B", "#D97706"]}
                            />
                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className={FIELD_LABEL}>Volume</label>
                                <div className="flex items-center gap-1.5 h-[32px]">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={voiceVolume}
                                    onChange={(e) =>
                                      setVoiceVolume(Number(e.target.value))
                                    }
                                    className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toast.info(
                                        `Voice alert preview: ${voiceVolume}%`
                                      )
                                    }
                                    className="tactile-white-pill w-[30px] h-[30px] rounded-[8px] flex items-center justify-center cursor-pointer shrink-0"
                                    title="Test audio alert"
                                  >
                                    <Volume2 size={12} />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className={FIELD_LABEL}>Triggers</label>
                                <Select
                                  value={voiceTrigger}
                                  onValueChange={(v) =>
                                    setVoiceTrigger(
                                      v as "all" | "critical" | "drawdown"
                                    )
                                  }
                                >
                                  <SelectTrigger className={SELECT_TRIGGER}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All warnings
                                    </SelectItem>
                                    <SelectItem value="critical">
                                      Critical only
                                    </SelectItem>
                                    <SelectItem value="drawdown">
                                      Drawdown only
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      <RiskGuardCard
                        icon={Key}
                        title="Guardian PIN"
                        description="Require 4-digit PIN before turning off any lock"
                        value={
                          guardianPin.length === 4 && guardianPin === confirmPin
                            ? "PIN Set"
                            : "Setup"
                        }
                        active={pinActive}
                        onToggle={(val) => {
                          if (
                            val &&
                            (guardianPin.length !== 4 || guardianPin !== confirmPin)
                          ) {
                            toast.error("Set Matching 4-Digit PIN First", {
                              description:
                                "Enter and confirm the same 4 digits before activating PIN lock.",
                            });
                            return;
                          }
                          setPinActive(val);
                        }}
                        intent="emergency"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-semibold">
                            <span className="text-slate-400">PIN Status</span>
                            <span
                              className={
                                guardianPin.length === 4 &&
                                guardianPin === confirmPin
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }
                            >
                              {guardianPin.length === 4 &&
                              guardianPin === confirmPin
                                ? "✓ 4-digit PIN ready"
                                : guardianPin.length === 4
                                ? "PINs do not match yet"
                                : "Enter 4 digits below"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>Enter PIN</label>
                              <div className="relative flex items-center">
                                <input
                                  type={showPin ? "text" : "password"}
                                  value={guardianPin}
                                  onChange={(e) =>
                                    setGuardianPin(
                                      e.target.value.replace(/\D/g, "").slice(0, 4)
                                    )
                                  }
                                  placeholder="••••"
                                  className={`w-full pl-2.5 pr-7 h-[30px] tracking-widest ${INPUT_BASE}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPin(!showPin)}
                                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                                >
                                  {showPin ? (
                                    <EyeOff size={12} />
                                  ) : (
                                    <Eye size={12} />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Confirm PIN</label>
                              <div className="relative flex items-center">
                                <input
                                  type={showPin ? "text" : "password"}
                                  value={confirmPin}
                                  onChange={(e) =>
                                    setConfirmPin(
                                      e.target.value.replace(/\D/g, "").slice(0, 4)
                                    )
                                  }
                                  placeholder="••••"
                                  className={`w-full pl-2.5 pr-7 h-[30px] tracking-widest ${INPUT_BASE}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPin(!showPin)}
                                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                                >
                                  {showPin ? (
                                    <EyeOff size={12} />
                                  ) : (
                                    <Eye size={12} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={MonitorOff}
                        title="Terminal Hard Stop"
                        description="Emergency lock: flattens open orders & blocks trading today"
                        value={hardStopActive ? "Locked" : "Armed"}
                        active={hardStopActive}
                        onToggle={setHardStopActive}
                        intent="emergency"
                      >
                        <div className="space-y-2">
                          <div className="px-2.5 py-1.5 rounded-xl bg-rose-50/75 dark:bg-rose-500/10 border border-rose-200/70 dark:border-rose-500/20 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                            Flattens open orders &amp; blocks entries for rest of the day
                          </div>
                          <div className="grid grid-cols-[1.35fr_0.65fr] gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>Trigger On</label>
                              <Select
                                value={hardStopTrigger}
                                onValueChange={(v) =>
                                  setHardStopTrigger(
                                    v as "drawdown" | "equity" | "rules"
                                  )
                                }
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="drawdown">
                                    Max Drawdown breach
                                  </SelectItem>
                                  <SelectItem value="equity">
                                    Equity stop limit hit
                                  </SelectItem>
                                  <SelectItem value="rules">
                                    Repeated rule violation
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Preview</label>
                              <button
                                type="button"
                                onClick={() => setHardStopActive(true)}
                                className="w-full h-[32px] flex items-center justify-center gap-1 bg-rose-50 dark:bg-rose-500/15 border border-rose-200/80 dark:border-rose-500/30 rounded-[9px] text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
                              >
                                <MonitorOff size={11} />
                                <span>Test Lock</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Right Column: Sticky Risk Score Telemetry ── */}
              <motion.aside
                variants={sectionVariants}
                className="w-full xl:w-[320px] shrink-0 space-y-4 xl:sticky xl:top-2 self-start"
              >
                <RiskScoreCard
                  score={avgDisciplineScore ?? 0}
                  activeGuardsCount={tabCounts.total}
                />
              </motion.aside>
            </div>
          </motion.div>
        </div>

        {/* HARD STOP OVERLAY */}
        <AnimatePresence>
          {hardStopActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EXPO_OUT }}
              className="fixed inset-0 z-[99999] bg-[#0A0A0C]/95 backdrop-blur-xl flex flex-col items-center justify-center text-center px-6 overflow-hidden"
            >
              <div className="w-20 h-20 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-3">
                HARD STOP <span className="text-rose-500">ENGAGED</span>
              </h1>

              <p className="text-[15px] md:text-[17px] text-slate-300 max-w-xl mx-auto leading-relaxed">
                You have reached your daily drawdown limit. All open positions
                have been squared off and new order entry is locked.
              </p>

              <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl px-8 py-5">
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-2">
                  Terminal Lockout Ends In
                </p>
                <div className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-bold text-white tabular-nums">
                  <span>04</span>
                  <span className="text-rose-500/60">:</span>
                  <span>12</span>
                  <span className="text-rose-500/60">:</span>
                  <span>59</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-2">
                  Access restores automatically at next session open
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHardStopActive(false)}
                className="mt-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[12px] font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Exit Test Lock
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
