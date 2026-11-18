import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { RiskScoreCard } from "@/components/RiskScoreCard";
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

function TimePickerPopover({
  value,
  onChange,
  subtitle = "Broker Time",
}: {
  value: string;
  onChange: (val: string) => void;
  subtitle?: string;
}) {
  const [hour = "20", minute = "00"] = (value || "20:00").split(":");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center justify-between w-full h-[32px] px-2.5 cursor-pointer ${INPUT_BASE}`}
        >
          <span>{value}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Clock size={11} />
            {subtitle}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[156px] p-0 border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-[#1C1C20]"
        align="start"
      >
        <div className="flex p-1.5 gap-1.5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex-1 bg-[#2563EB] text-white font-bold text-center py-1 rounded-lg text-[12.5px] tabular-nums">
            {hour}
          </div>
          <div className="flex-1 bg-[#2563EB] text-white font-bold text-center py-1 rounded-lg text-[12.5px] tabular-nums">
            {minute}
          </div>
        </div>
        <div className="flex h-[196px]">
          <div className="flex-1 overflow-y-auto border-r border-slate-100 dark:border-white/[0.06] amazing-scrollbar">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = i.toString().padStart(2, "0");
              return (
                <button
                  key={`h-${h}`}
                  type="button"
                  onClick={() => onChange(`${h}:${minute}`)}
                  className={`w-full text-center py-2 text-[12px] tabular-nums transition-colors cursor-pointer ${
                    h === hour
                      ? "bg-blue-50 dark:bg-blue-500/15 font-bold text-[#2563EB] dark:text-blue-400"
                      : "text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto amazing-scrollbar">
            {Array.from({ length: 60 }).map((_, i) => {
              const m = i.toString().padStart(2, "0");
              return (
                <button
                  key={`m-${m}`}
                  type="button"
                  onClick={() => onChange(`${hour}:${m}`)}
                  className={`w-full text-center py-2 text-[12px] tabular-nums transition-colors cursor-pointer ${
                    m === minute
                      ? "bg-blue-50 dark:bg-blue-500/15 font-bold text-[#2563EB] dark:text-blue-400"
                      : "text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
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
  const [maxDrawdown, setMaxDrawdown] = useState(5);
  const [weeklyDrawdown, setWeeklyDrawdown] = useState(20);
  const [monthlyDrawdown, setMonthlyDrawdown] = useState(25);
  const [stopAfterLoss, setStopAfterLoss] = useState(false);
  const [martingaleMultiplier, setMartingaleMultiplier] = useState(1.5);
  const [allowedTicker, setAllowedTicker] = useState("XAUUSD");
  const [strategyName, setStrategyName] = useState("Breakout Pro");
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
    lastClosedTrade,
    tradesToday,
    todayProfit,
    accountMetrics,
    avgDisciplineScore,
    lastImportTime,
  } = useDashboardData();

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
  const [maxLot, setMaxLot] = useState(0.1);
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
  const [martingaleDetection, setMartingaleDetection] = useState(false);
  const [oneInstrumentMode, setOneInstrumentMode] = useState(false);
  const [oneStrategyRule, setOneStrategyRule] = useState(false);

  const [stopLossRequired, setStopLossRequired] = useState(false);
  const [stopLossAction, setStopLossAction] = useState("block");
  const [stopLossMethod, setStopLossMethod] = useState("pips");
  const [minRiskReward, setMinRiskReward] = useState(2.4);
  const [minRiskRewardActive, setMinRiskRewardActive] = useState(false);
  const [weekendLock, setWeekendLock] = useState(false);
  const [equityHardStop, setEquityHardStop] = useState(1000);
  const [equityHardStopActive, setEquityHardStopActive] = useState(false);
  const [dailyProfitTarget, setDailyProfitTarget] = useState(500);
  const [dailyProfitTargetActive, setDailyProfitTargetActive] = useState(false);

  const [consecutiveWins, setConsecutiveWins] = useState(3);
  const [stopAfterWin, setStopAfterWin] = useState(false);
  const [emotionalTradingDetector, setEmotionalTradingDetector] =
    useState(false);
  const [newsFilter, setNewsFilter] = useState(false);
  const [sleepProtection, setSleepProtection] = useState(false);
  const [preTradeChecklist, setPreTradeChecklist] = useState(false);
  const [psychologyCheck, setPsychologyCheck] = useState(false);
  const [aiWeeklyReview, setAiWeeklyReview] = useState(false);
  const [aiVoiceWarning, setAiVoiceWarning] = useState(false);
  const [noTradingAfterTime, setNoTradingAfterTime] = useState("20:00");
  const [noTradingAfterTimeActive, setNoTradingAfterTimeActive] =
    useState(false);

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
      if (dbConfig.max_lot_size !== null) setMaxLot(dbConfig.max_lot_size);
      if (dbConfig.target_capital !== null)
        setTargetCapital(dbConfig.target_capital);
      if (dbConfig.max_daily_loss_percent !== null)
        setMaxDrawdown(dbConfig.max_daily_loss_percent);
      if (dbConfig.max_open_trades !== null)
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
      if (config.maxDrawdown) setMaxDrawdown(config.maxDrawdown);
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
      if (config.tradeLimit) setTradeLimit(config.tradeLimit);
      if (config.waitPeriod) setWaitPeriod(config.waitPeriod);
      if (config.selectedSessions)
        setSelectedSessions(config.selectedSessions);
      if (config.sessionTimes) setSessionTimes(config.sessionTimes);
      if (config.maxLot) setMaxLot(config.maxLot);
      if (config.targetCapital) setTargetCapital(config.targetCapital);
      if (config.maxOpenPositions !== undefined)
        setMaxOpenPositions(config.maxOpenPositions);
      if (config.noAveragingDown !== undefined)
        setNoAveragingDown(config.noAveragingDown);
      if (config.martingaleDetection !== undefined)
        setMartingaleDetection(config.martingaleDetection);
      if (config.oneInstrumentMode !== undefined)
        setOneInstrumentMode(config.oneInstrumentMode);
      if (config.oneStrategyRule !== undefined)
        setOneStrategyRule(config.oneStrategyRule);
      if (config.stopLossRequired !== undefined)
        setStopLossRequired(config.stopLossRequired);
      if (config.minRiskReward !== undefined)
        setMinRiskReward(config.minRiskReward);
      if (config.minRiskRewardActive !== undefined)
        setMinRiskRewardActive(config.minRiskRewardActive);
      if (config.weekendLock !== undefined) setWeekendLock(config.weekendLock);
      if (config.equityHardStop !== undefined)
        setEquityHardStop(config.equityHardStop);
      if (config.equityHardStopActive !== undefined)
        setEquityHardStopActive(config.equityHardStopActive);
      if (config.dailyProfitTarget !== undefined)
        setDailyProfitTarget(config.dailyProfitTarget);
      if (config.dailyProfitTargetActive !== undefined)
        setDailyProfitTargetActive(config.dailyProfitTargetActive);
      if (config.consecutiveWins !== undefined)
        setConsecutiveWins(config.consecutiveWins);
      if (config.stopAfterWin !== undefined)
        setStopAfterWin(config.stopAfterWin);
      if (config.emotionalTradingDetector !== undefined)
        setEmotionalTradingDetector(config.emotionalTradingDetector);
      if (config.newsFilter !== undefined) setNewsFilter(config.newsFilter);
      if (config.sleepProtection !== undefined)
        setSleepProtection(config.sleepProtection);
      if (config.preTradeChecklist !== undefined)
        setPreTradeChecklist(config.preTradeChecklist);
      if (config.psychologyCheck !== undefined)
        setPsychologyCheck(config.psychologyCheck);
      if (config.aiWeeklyReview !== undefined)
        setAiWeeklyReview(config.aiWeeklyReview);
      if (config.aiVoiceWarning !== undefined)
        setAiVoiceWarning(config.aiVoiceWarning);
      if (config.noTradingAfterTimeActive !== undefined)
        setNoTradingAfterTimeActive(config.noTradingAfterTimeActive);
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
    maxDrawdown,
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
    martingaleDetection,
    oneInstrumentMode,
    oneStrategyRule,
    stopLossRequired,
    minRiskReward,
    minRiskRewardActive,
    weekendLock,
    equityHardStop,
    equityHardStopActive,
    dailyProfitTarget,
    dailyProfitTargetActive,
    consecutiveWins,
    stopAfterWin,
    emotionalTradingDetector,
    newsFilter,
    sleepProtection,
    preTradeChecklist,
    psychologyCheck,
    aiWeeklyReview,
    aiVoiceWarning,
    noTradingAfterTimeActive,
    pinActive,
  });

  const handleSave = async () => {
    if (user?.id) {
      await saveConfig({
        max_lot_size: maxLotActive ? maxLot : 0,
        target_capital: targetCapital,
        max_daily_loss_percent: drawdownGuardActive ? maxDrawdown : 0,
        max_open_trades: disciplineActive ? tradeLimit : 0,
      }).catch(console.error);
    }

    localStorage.setItem(
      "fialgo_risk_config",
      JSON.stringify(buildConfigPayload())
    );

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

      if (user?.id) {
        saveConfig({
          max_lot_size: maxLotActive ? maxLot : 0,
          target_capital: targetCapital,
          max_daily_loss_percent: drawdownGuardActive ? maxDrawdown : 0,
          max_open_trades: disciplineActive ? tradeLimit : 0,
        }).catch(console.error);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    maxLotActive,
    drawdownGuardActive,
    disciplineActive,
    sessionActive,
    maxDrawdown,
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
    martingaleDetection,
    oneInstrumentMode,
    oneStrategyRule,
    stopLossRequired,
    minRiskReward,
    minRiskRewardActive,
    weekendLock,
    equityHardStop,
    equityHardStopActive,
    dailyProfitTarget,
    dailyProfitTargetActive,
    consecutiveWins,
    stopAfterWin,
    emotionalTradingDetector,
    newsFilter,
    sleepProtection,
    preTradeChecklist,
    psychologyCheck,
    aiWeeklyReview,
    aiVoiceWarning,
    noTradingAfterTimeActive,
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
      activeMarket !== "indian" && oneStrategyRule,
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
    martingaleDetection,
    oneInstrumentMode,
    oneStrategyRule,
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
                        Level {gamificationState.level}{" "}
                        {getTitleForLevel(gamificationState.level)}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden md:inline text-[11px] text-slate-400 tabular-nums">
                        <strong className="font-semibold text-slate-700 dark:text-neutral-200">
                          {sym}
                          {(startingCapital || balance || 0).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 0 }
                          )}
                        </strong>
                        {" → "}
                        <strong className="font-semibold text-[#2563EB] dark:text-blue-400">
                          {sym}
                          {targetCapital.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </strong>{" "}
                        {iso}
                      </span>

                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400">
                        <Trophy size={11} />
                        <span className="text-[11px] font-semibold tabular-nums">
                          {gamificationState.xp.toLocaleString()} XP
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
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
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
                        value={`${maxLot} ${
                          activeMarket === "indian" ? "Qty" : "Lots"
                        }`}
                        active={maxLotActive}
                        onToggle={setMaxLotActive}
                        intent="trading"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex items-center w-[116px] shrink-0">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={maxLot}
                              onChange={(e) =>
                                setMaxLot(Number(e.target.value))
                              }
                              className={`w-full pl-2.5 pr-9 h-[32px] ${INPUT_BASE}`}
                            />
                            <span className="absolute right-2.5 text-[10px] font-semibold text-slate-400">
                              {activeMarket === "indian" ? "Qty" : "Lots"}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.01"
                            max="10.00"
                            step="0.01"
                            value={maxLot}
                            onChange={(e) =>
                              setMaxLot(Number(e.target.value))
                            }
                            className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                          />
                        </div>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={TrendingDown}
                          title="No Averaging Down"
                          description="Prevent adding to losing positions"
                          active={noAveragingDown}
                          onToggle={setNoAveragingDown}
                          intent="trading"
                        >
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>Mode</label>
                              <Select defaultValue="strict">
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="strict">
                                    Strict Block
                                  </SelectItem>
                                  <SelectItem value="warning">
                                    Warning Only
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Scope</label>
                              <Select defaultValue="symbol_dir">
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="symbol_dir">
                                    Same Symbol + Dir
                                  </SelectItem>
                                  <SelectItem value="symbol_only">
                                    Same Symbol
                                  </SelectItem>
                                  <SelectItem value="all">
                                    Global Account
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
                          description="Block increasing lot sizes after a loss"
                          value={`${martingaleMultiplier.toFixed(1)}×`}
                          active={martingaleDetection}
                          onToggle={setMartingaleDetection}
                          intent="warning"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-[72px] shrink-0 h-[32px] flex items-center justify-center ${INPUT_BASE}`}
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
                        </RiskGuardCard>
                      )}

                      <RiskGuardCard
                        icon={Crosshair}
                        title="One Instrument Mode"
                        description="Limit trading to a single ticker"
                        value={allowedTicker}
                        active={oneInstrumentMode}
                        onToggle={setOneInstrumentMode}
                        intent="trading"
                      >
                        <Select
                          value={allowedTicker}
                          onValueChange={setAllowedTicker}
                        >
                          <SelectTrigger className={SELECT_TRIGGER}>
                            <SelectValue placeholder="Select an instrument..." />
                          </SelectTrigger>
                          <SelectContent>
                            {activeMarket === "indian" ? (
                              <>
                                <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
                                <SelectItem value="BANKNIFTY">
                                  BANKNIFTY
                                </SelectItem>
                                <SelectItem value="RELIANCE">RELIANCE</SelectItem>
                                <SelectItem value="HDFCBANK">HDFCBANK</SelectItem>
                                <SelectItem value="INFY">INFY</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="XAUUSD">
                                  XAUUSD — Gold
                                </SelectItem>
                                <SelectItem value="EURUSD">
                                  EURUSD — Euro / US Dollar
                                </SelectItem>
                                <SelectItem value="GBPUSD">
                                  GBPUSD — British Pound / US Dollar
                                </SelectItem>
                                <SelectItem value="US30">
                                  US30 — Wall Street 30
                                </SelectItem>
                                <SelectItem value="NAS100">
                                  NAS100 — US Tech 100
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={CheckSquare}
                          title="Allowed Strategy Only"
                          description="Allow trades only from selected strategy"
                          value={strategyName}
                          active={oneStrategyRule}
                          onToggle={setOneStrategyRule}
                          intent="trading"
                        >
                          <Select
                            value={strategyName}
                            onValueChange={setStrategyName}
                          >
                            <SelectTrigger className={SELECT_TRIGGER}>
                              <SelectValue placeholder="Select a strategy..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Breakout Pro">
                                Breakout Pro — Magic #1024
                              </SelectItem>
                              <SelectItem value="Trend Follower">
                                Trend Follower — Magic #2048
                              </SelectItem>
                              <SelectItem value="Mean Reversion">
                                Mean Reversion — Magic #4096
                              </SelectItem>
                              <SelectItem value="News Scalper">
                                News Scalper — Magic #8192
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </RiskGuardCard>
                      )}
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
                            ? "Max Daily Loss"
                            : "Drawdown Guard"
                        }
                        description="Max daily drawdown limits"
                        value={
                          activeMarket === "indian"
                            ? `${sym}${maxDrawdown * 1000}`
                            : `${maxDrawdown.toFixed(1)}%`
                        }
                        active={drawdownGuardActive}
                        onToggle={setDrawdownGuardActive}
                        intent="emergency"
                      >
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-[105px_1fr] gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>
                                {activeMarket === "indian" ? "Limit (₹)" : "Limit"}
                              </label>
                              <div
                                className={`flex items-center h-[32px] overflow-hidden ${INPUT_BASE}`}
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
                                      value={maxDrawdown * 1000}
                                      onChange={(e) =>
                                        setMaxDrawdown(
                                          Number(e.target.value) / 1000
                                        )
                                      }
                                      className="w-full bg-transparent outline-none pr-2"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <input
                                      type="number"
                                      min="0.5"
                                      max="20.0"
                                      step={0.5}
                                      value={maxDrawdown}
                                      onChange={(e) =>
                                        setMaxDrawdown(Number(e.target.value))
                                      }
                                      className="w-full bg-transparent outline-none pl-2.5 text-center"
                                    />
                                    <span className="pr-2.5 text-slate-400">
                                      %
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Basis</label>
                              <Select defaultValue="balance">
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="balance">
                                    Start-of-day balance
                                  </SelectItem>
                                  <SelectItem value="equity">
                                    Start-of-day equity
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {activeMarket !== "indian" && (
                            <input
                              type="range"
                              min="0.5"
                              max="20.0"
                              step="0.5"
                              value={maxDrawdown}
                              onChange={(e) =>
                                setMaxDrawdown(Number(e.target.value))
                              }
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
                        description={
                          activeMarket === "indian"
                            ? "Kill when profit ≥ target"
                            : "Lock terminal after profit"
                        }
                        value={`${sym}${dailyProfitTarget}`}
                        active={dailyProfitTargetActive}
                        onToggle={setDailyProfitTargetActive}
                        intent="trading"
                      >
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className={FIELD_LABEL}>
                              {activeMarket === "indian"
                                ? "Target (₹)"
                                : "Target Amount"}
                            </label>
                            <div className="relative flex items-center">
                              <span className="absolute left-2.5 text-[11.5px] font-semibold text-slate-400">
                                {sym}
                              </span>
                              <input
                                type="number"
                                value={dailyProfitTarget}
                                onChange={(e) =>
                                  setDailyProfitTarget(Number(e.target.value))
                                }
                                className={`w-full pl-6 pr-10 h-[32px] ${INPUT_BASE}`}
                              />
                              <span className="absolute right-2.5 text-[9.5px] font-semibold text-slate-400">
                                {iso}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className={FIELD_LABEL}>Calculation</label>
                            <Select defaultValue="closed">
                              <SelectTrigger className={SELECT_TRIGGER}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="closed">
                                  Closed P&amp;L
                                </SelectItem>
                                <SelectItem value="equity">
                                  Equity Profit
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={StopCircle}
                          title="Stop Loss Required"
                          description="Require SL on every execution"
                          active={stopLossRequired}
                          onToggle={setStopLossRequired}
                          intent="trading"
                        >
                          <div
                            className={
                              stopLossAction === "auto"
                                ? "grid grid-cols-[1.2fr_1fr_0.7fr] gap-2"
                                : ""
                            }
                          >
                            <div>
                              <label className={FIELD_LABEL}>Action</label>
                              <Select
                                value={stopLossAction}
                                onValueChange={setStopLossAction}
                              >
                                <SelectTrigger className={SELECT_TRIGGER}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="block">
                                    Block trades without SL
                                  </SelectItem>
                                  <SelectItem value="auto">
                                    Auto add SL
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {stopLossAction === "auto" && (
                              <>
                                <div>
                                  <label className={FIELD_LABEL}>Method</label>
                                  <Select
                                    value={stopLossMethod}
                                    onValueChange={setStopLossMethod}
                                  >
                                    <SelectTrigger className={SELECT_TRIGGER}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pips">Pips</SelectItem>
                                      <SelectItem value="percent">
                                        Percent (%)
                                      </SelectItem>
                                      <SelectItem value="atr">ATR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className={FIELD_LABEL}>Value</label>
                                  <input
                                    type="number"
                                    value={defaultStopLoss}
                                    onChange={(e) =>
                                      setDefaultStopLoss(Number(e.target.value))
                                    }
                                    className={`w-full px-2.5 h-[32px] ${INPUT_BASE}`}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={TrendingUp}
                          title="Min Risk/Reward"
                          description="Minimum reward-to-risk ratio"
                          value={`1:${minRiskReward}`}
                          active={minRiskRewardActive}
                          onToggle={setMinRiskRewardActive}
                          intent="trading"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex items-center w-[96px] shrink-0 h-[32px] overflow-hidden ${INPUT_BASE}`}
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
                            ? "Auto kill at specific IST time"
                            : "Auto flatten before Friday close"
                        }
                        value={weekendCloseTime}
                        active={weekendLock}
                        onToggle={setWeekendLock}
                        intent="warning"
                      >
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className={FIELD_LABEL}>
                              {activeMarket === "indian"
                                ? "Kill Time (IST)"
                                : "Close Time"}
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
                            <Select defaultValue="both">
                              <SelectTrigger className={SELECT_TRIGGER}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="both">
                                  Close &amp; block
                                </SelectItem>
                                <SelectItem value="close">
                                  Close positions
                                </SelectItem>
                                <SelectItem value="block">
                                  Block new trades
                                </SelectItem>
                              </SelectContent>
                            </Select>
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
                        description="Minimum equity floor level"
                        value={`${sym}${equityHardStop}`}
                        active={equityHardStopActive}
                        onToggle={setEquityHardStopActive}
                        intent="emergency"
                      >
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-[11.5px] font-semibold text-slate-400">
                            {sym}
                          </span>
                          <input
                            type="number"
                            value={equityHardStop}
                            onChange={(e) =>
                              setEquityHardStop(Number(e.target.value))
                            }
                            className={`w-full pl-6 pr-10 h-[32px] ${INPUT_BASE}`}
                          />
                          <span className="absolute right-2.5 text-[9.5px] font-semibold text-slate-400">
                            {iso}
                          </span>
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
                            ? "Kill after N orders"
                            : "Maximum executions per day"
                        }
                        value={`${tradeLimit}/day`}
                        active={disciplineActive}
                        onToggle={setDisciplineActive}
                        intent="discipline"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-medium text-slate-400">
                            {activeMarket === "indian"
                              ? "Max orders/day"
                              : "Daily limit"}
                          </span>
                          <div className="flex items-center gap-1.5 w-[132px]">
                            <button
                              type="button"
                              onClick={() =>
                                setTradeLimit((prev) => Math.max(1, prev - 1))
                              }
                              className="tactile-white-pill w-7 h-7 rounded-[8px] flex items-center justify-center font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span
                              className={`flex-1 h-[30px] flex items-center justify-center ${INPUT_BASE}`}
                            >
                              {!isProOrElite && tradeLimit > 5 ? 5 : tradeLimit}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isProOrElite && tradeLimit >= 5) {
                                  toast.error("Pro Feature", {
                                    description:
                                      "Upgrade to Pro to increase daily execution limits above 5.",
                                  });
                                  return;
                                }
                                setTradeLimit((prev) => Math.min(20, prev + 1));
                              }}
                              className="tactile-white-pill w-7 h-7 rounded-[8px] flex items-center justify-center font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={ShieldOff}
                        title="Loss Cooldown"
                        description="Locks execution after losing trades"
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
                      >
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className={FIELD_LABEL}>
                              Duration ({waitPeriod}m)
                            </label>
                            <div
                              className={`flex items-center gap-2 px-2.5 h-[32px] ${INPUT_BASE}`}
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
                            <Select defaultValue="every">
                              <SelectTrigger className={SELECT_TRIGGER}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="every">Every loss</SelectItem>
                                <SelectItem value="consecutive">
                                  Consecutive losses
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Clock}
                        title="Session Sentinel"
                        description="Custom hourly trading windows"
                        value={`${selectedSessions.length} active`}
                        active={sessionActive}
                        onToggle={setSessionActive}
                        intent="discipline"
                      >
                        <div className="flex flex-wrap gap-1.5">
                          {sessionButtons.map((session) => {
                            const isSelected = selectedSessions.includes(
                              session.id
                            );
                            return (
                              <button
                                key={session.id}
                                type="button"
                                onClick={() => toggleSession(session.id)}
                                className={`px-2.5 h-[27px] rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-50 text-[#2563EB] border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                                    : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/10"
                                }`}
                              >
                                {session.label}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() =>
                              toast.info(
                                "Custom session windows sync with your broker clock."
                              )
                            }
                            className="px-2.5 h-[27px] rounded-lg text-[11px] font-semibold border border-dashed border-slate-300 dark:border-white/15 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                          >
                            + Custom
                          </button>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Trophy}
                        title="Win Streak Cooldown"
                        description="Lock trading after consecutive wins"
                        value={`${consecutiveWins} Wins`}
                        active={stopAfterWin}
                        onToggle={setStopAfterWin}
                        intent="discipline"
                      >
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className={FIELD_LABEL}>Max Wins</label>
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
                                className={`flex-1 h-[32px] flex items-center justify-center ${INPUT_BASE}`}
                              >
                                {consecutiveWins}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setConsecutiveWins((prev) => prev + 1)
                                }
                                className="tactile-white-pill w-7 h-7 rounded-[8px] flex items-center justify-center font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className={FIELD_LABEL}>Action</label>
                            <Select defaultValue="pause">
                              <SelectTrigger className={SELECT_TRIGGER}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pause">
                                  Pause trading
                                </SelectItem>
                                <SelectItem value="confirm">
                                  Require confirm
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Sunrise}
                        title="No Trading After Time"
                        description="Daily hard cutoff time"
                        value={noTradingAfterTime}
                        active={noTradingAfterTimeActive}
                        onToggle={setNoTradingAfterTimeActive}
                        intent="discipline"
                      >
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className={FIELD_LABEL}>Cutoff Time</label>
                            <TimePickerPopover
                              value={noTradingAfterTime}
                              onChange={setNoTradingAfterTime}
                              subtitle="Broker"
                            />
                          </div>
                          <div>
                            <label className={FIELD_LABEL}>Action</label>
                            <Select defaultValue="block">
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
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={HeartPulse}
                          title="Behavioural Risk Detector"
                          description="AI overtrading & tilt detection"
                          value={`${emotionSensitivity}%`}
                          active={emotionalTradingDetector}
                          onToggle={setEmotionalTradingDetector}
                          intent="discipline"
                        >
                          <div className="flex items-center gap-2.5 h-[30px]">
                            <span className="text-[10px] font-medium text-slate-400">
                              Low
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="10"
                              value={emotionSensitivity}
                              onChange={(e) =>
                                setEmotionSensitivity(Number(e.target.value))
                              }
                              className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                            />
                            <span className="text-[10px] font-medium text-slate-400">
                              High
                            </span>
                          </div>
                        </RiskGuardCard>
                      )}

                      <RiskGuardCard
                        icon={AlertTriangle}
                        title="News Filter"
                        description="Block trading around major news"
                        active={newsFilter}
                        onToggle={setNewsFilter}
                        intent="warning"
                      >
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
                                defaultValue="30"
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
                                defaultValue="15"
                                className="w-full bg-transparent outline-none text-center"
                              />
                              <span className="text-[9px] text-slate-400">m</span>
                            </div>
                          </div>
                        </div>
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={Moon}
                        title="Sleep Protection"
                        description="Disable late-night trading"
                        active={sleepProtection}
                        onToggle={setSleepProtection}
                        intent="discipline"
                      >
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className={FIELD_LABEL}>Start</label>
                            <input
                              type="time"
                              value={sleepTimeStart}
                              onChange={(e) =>
                                setSleepTimeStart(e.target.value)
                              }
                              className={`w-full px-2.5 h-[32px] ${INPUT_BASE}`}
                            />
                          </div>
                          <div>
                            <label className={FIELD_LABEL}>End</label>
                            <input
                              type="time"
                              defaultValue="06:00"
                              className={`w-full px-2.5 h-[32px] ${INPUT_BASE}`}
                            />
                          </div>
                        </div>
                      </RiskGuardCard>

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={CheckSquare}
                          title="Pre-Trade Checklist"
                          description="Mandatory popup before entry"
                          active={preTradeChecklist}
                          onToggle={setPreTradeChecklist}
                          intent="discipline"
                        >
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className={FIELD_LABEL}>Preset</label>
                              <Select defaultValue="standard">
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
                                    "Checklist editor saved with your active preset."
                                  )
                                }
                                className="tactile-white-pill w-full h-[32px] rounded-[9px] text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Settings size={11} />
                                <span>Edit Items</span>
                              </button>
                            </div>
                          </div>
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={Brain}
                          title="Psychology Check"
                          description="Mandatory mindset check-in"
                          active={psychologyCheck}
                          onToggle={setPsychologyCheck}
                          intent="discipline"
                        >
                          <Select defaultValue="first">
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
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={Sparkles}
                          title="AI Weekly Review"
                          description="Automated weekly trade audit"
                          active={aiWeeklyReview}
                          onToggle={setAiWeeklyReview}
                          intent="discipline"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className={FIELD_LABEL}>Day</label>
                              <Select defaultValue="friday">
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
                              <input
                                type="time"
                                defaultValue="17:00"
                                className={`w-full px-1.5 h-[32px] ${INPUT_BASE}`}
                              />
                            </div>
                            <div>
                              <label className={FIELD_LABEL}>Send</label>
                              <Select defaultValue="in_app">
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
                        </RiskGuardCard>
                      )}

                      {activeMarket !== "indian" && (
                        <RiskGuardCard
                          icon={Volume2}
                          title="AI Voice Warning"
                          description="Audible limit alerts"
                          value={`${voiceVolume}%`}
                          active={aiVoiceWarning}
                          onToggle={setAiVoiceWarning}
                          intent="warning"
                        >
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
                              <Select defaultValue="critical">
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
                        </RiskGuardCard>
                      )}

                      <RiskGuardCard
                        icon={Key}
                        title="Guardian PIN"
                        description="Require 4-digit PIN to override"
                        value={pinActive ? "Locked" : undefined}
                        active={pinActive}
                        onToggle={setPinActive}
                        intent="emergency"
                      >
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
                                className={`w-full pl-2.5 pr-7 h-[32px] tracking-widest ${INPUT_BASE}`}
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
                                className={`w-full pl-2.5 pr-7 h-[32px] tracking-widest ${INPUT_BASE}`}
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
                      </RiskGuardCard>

                      <RiskGuardCard
                        icon={MonitorOff}
                        title="Terminal Hard Stop"
                        description="Force lock terminal on limit breach"
                        value={hardStopActive ? "Engaged" : undefined}
                        active={hardStopActive}
                        onToggle={setHardStopActive}
                        intent="emergency"
                      >
                        <div className="grid grid-cols-[1.35fr_0.65fr] gap-2.5">
                          <div>
                            <label className={FIELD_LABEL}>Trigger</label>
                            <Select defaultValue="drawdown">
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
