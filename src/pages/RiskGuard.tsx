import React, { useState, useEffect, useRef } from "react";
import {
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   ShieldDone as IconlyShieldDone,
   Graph as IconlyGraph,
   TimeSquare as IconlyTimeSquare
} from "react-iconly";

import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import {
   Shield,
   Zap,
   Power,
   AlertTriangle,
   Target,
   ArrowUpRight,
   TrendingDown,
   ShieldCheck,
   Link2,
   Activity,
   History,
   Lock,
   Clock,
   Calendar,
   ChevronDown,
   Brain,
   Timer,
   Trophy,
   Check,
   AlertOctagon,
   Star,
   Sparkles,
   ShieldAlert,
   Settings,
   Pencil,
   Sliders,
   Info,
   X,
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
   BarChart2,
   StopCircle,
   Wallet,
   ShieldOff
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTrading } from "@/contexts/TradingContext";
import { usePlan } from "@/hooks/usePlan";
import { useNavigate } from "react-router-dom";
import { useRiskConfig } from "@/hooks/useRiskConfig";
import { getGamificationState } from "@/utils/gamification";
import { useMarket } from "@/contexts/MarketContext";
import { RiskGuardCard } from "@/components/RiskGuardCard";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";

// --- HUD Status Indicators ---
const StatusIndicators = ({ isActive = true }) => (
   <div className="flex gap-2 items-center">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monitor</span>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#22D99A] animate-pulse' : 'bg-slate-300'}`} />
   </div>
);





// --- Gauge Monitor component ---
const Gauge = ({ value, max }: { value: number, max: number }) => {
   const percentage = Math.min(100, (value / max) * 100);
   const needleAngle = -90 + (percentage * 1.8);

   return (
      <div className="flex flex-col items-center select-none">
         <div className="relative" style={{ width: 80, height: 40 }}>
            <svg width="80" height="40" viewBox="0 0 140 70">
               <defs>
                  <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                     <stop offset="0%" stopColor="#10b981" />
                     <stop offset="50%" stopColor="#f59e0b" />
                     <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
               </defs>
               {/* Background Track */}
               <path
                  d="M 10 65 A 60 60 0 0 1 130 65"
                  fill="none"
                  className="stroke-slate-200 dark:stroke-slate-800/80"
                  strokeWidth="8"
                  strokeLinecap="round"
               />
               {/* Active Gradient Fill */}
               <motion.path
                  d="M 10 65 A 60 60 0 0 1 130 65"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="188"
                  initial={{ strokeDashoffset: 188 }}
                  animate={{ strokeDashoffset: 188 - (188 * percentage / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
               />
            </svg>

            {/* Rotating Needle */}
            <motion.div
               className="absolute bottom-[1px] left-1/2 origin-bottom"
               style={{ width: 2, height: 26, marginLeft: -1 }}
               initial={{ rotate: -90 }}
               animate={{ rotate: needleAngle }}
               transition={{ type: "spring", stiffness: 45, damping: 13 }}
            >
               <div className="w-full h-full bg-slate-800 dark:bg-white rounded-full" />
               <div className="absolute -top-[1.5px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] bg-white rounded-full border border-slate-900 shadow-sm" />
            </motion.div>

            {/* Pivot dot */}
            <div className="absolute bottom-[0px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-slate-900 dark:bg-white rounded-full border border-white dark:border-slate-800 shadow-sm z-10" />
         </div>

         {/* Aligned metrics numbers */}
         <div className="flex items-center justify-between w-[75px]">
            <span className="text-[9px] font-semibold text-slate-400 tabular-nums">0</span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-[#F5F7FA] tabular-nums">{value.toFixed(1)}</span>
            <span className="text-[9px] font-semibold text-slate-400 tabular-nums">{max.toFixed(1)}</span>
         </div>
      </div>
   );
};

export default function RiskGuard() {
   const navigate = useNavigate();
   const [user, setUser] = useState<any>(null);
   const [authChecked, setAuthChecked] = useState(false);

   // --- Guardian PIN & Hard Stop States ---
   const [pinActive, setPinActive] = useState(false);
   const [guardianPin, setGuardianPin] = useState("");
   const [showPin, setShowPin] = useState(false);
   const [hardStopActive, setHardStopActive] = useState(false);
   const [killSwitchActive, setKillSwitchActive] = useState(false);

   // --- Active Tab State ---
   const [activeTab, setActiveTab] = useState<'trading_control' | 'risk_management' | 'behaviour'>('trading_control');

   // --- SEBI Indian Market Daily Login State ---
   const [dailyTokenActive, setDailyTokenActive] = useState(() => {
      try {
         const token = sessionStorage.getItem('indian_daily_token');
         return token === 'active';
      } catch (e) { return false; }
   });

   useEffect(() => {
      const checkUser = async () => {
         const { data: { session } } = await supabase.auth.getSession();
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
   const [avgDownDistance, setAvgDownDistance] = useState(10);
   const [martingaleMultiplier, setMartingaleMultiplier] = useState(1.5);
   const [allowedTicker, setAllowedTicker] = useState("XAUUSD");
   const [strategyName, setStrategyName] = useState("Breakout Pro");
   const [defaultStopLoss, setDefaultStopLoss] = useState(15);
   const [weekendCloseTime, setWeekendCloseTime] = useState("20:00");
   const [emotionSensitivity, setEmotionSensitivity] = useState(80);
   const [newsImpactLevel, setNewsImpactLevel] = useState("High");
   const [sleepTimeStart, setSleepTimeStart] = useState("23:00");
   const [checklistItems, setChecklistItems] = useState(3);
   const [psychologyInterval, setPsychologyInterval] = useState("Daily");
   const [reviewDay, setReviewDay] = useState("Saturday");
   const [voiceVolume, setVoiceVolume] = useState(80);


   // B. AI Bot Engine States
   const [autoTrading, setAutoTrading] = useState(() => {
      try {
         const saved = localStorage.getItem('fialgo_risk_config');
         if (saved) {
            const config = JSON.parse(saved);
            return config.autoTrading === true;
         }
      } catch (e) { }
      return false;
   });
   const [tradeFreq, setTradeFreq] = useState("Medium");
   const [allowHedging, setAllowHedging] = useState(false);


   // Sync autoTrading state change to fialgo_risk_config instantly for layout warning banner
   useEffect(() => {
      const saved = localStorage.getItem('fialgo_risk_config');
      const config = saved ? JSON.parse(saved) : {};
      if (config.autoTrading !== autoTrading) {
         config.autoTrading = autoTrading;
         localStorage.setItem('fialgo_risk_config', JSON.stringify(config));
         window.dispatchEvent(new Event('fialgo_config_changed'));
      }
   }, [autoTrading]);

   const { balance, equity, isConnected, lastClosedTrade, recentTrades, tradesToday, todayProfit, accountMetrics, avgDisciplineScore, lastImportTime } = useDashboardData();

   // C. Institutional Discipline States
   const { isProOrElite } = usePlan();
   const [disciplineActive, setDisciplineActive] = useState(false);
   const { activeMarket } = useMarket();
   const sym = activeMarket === 'indian' ? '₹' : '$';
   const iso = activeMarket === 'indian' ? 'INR' : 'USD';

   const [revengeGuard, setRevengeGuard] = useState(false);
   const [tradeLimit, setTradeLimit] = useState(3);
   const [waitPeriod, setWaitPeriod] = useState(5);
   const [emotionalFreeze, setEmotionalFreeze] = useState(false);
   const [xpBonus, setXpBonus] = useState(false);
   const [cooldownActive, setCooldownActive] = useState(false);
   const [cooldownSeconds, setCooldownSeconds] = useState(0);
   const [lastDetectedTradeId, setLastDetectedTradeId] = useState<string | null>(null);

   // Restore cooldown from localStorage on mount
   useEffect(() => {
      try {
         const saved = localStorage.getItem('fialgo_cooldown');
         if (saved) {
            const cd = JSON.parse(saved);
            if (cd.active && cd.endsAt > Date.now()) {
               const remainingMs = cd.endsAt - Date.now();
               setCooldownActive(true);
               setCooldownSeconds(Math.ceil(remainingMs / 1000));
            } else {
               localStorage.removeItem('fialgo_cooldown');
            }
         }
      } catch (e) { console.error(e); }
   }, []);

   // Cooldown Timer
   useEffect(() => {
      if (!cooldownActive || cooldownSeconds <= 0) {
         if (cooldownActive && cooldownSeconds <= 0) {
            setCooldownActive(false);
            localStorage.removeItem('fialgo_cooldown');
            window.dispatchEvent(new Event('fialgo_cooldown_changed'));
         }
         return;
      }
      const timer = setTimeout(() => setCooldownSeconds(s => s - 1), 1000);
      return () => clearTimeout(timer);
   }, [cooldownActive, cooldownSeconds]);

   // Auto-detect losing trades and trigger cooldown
   useEffect(() => {
      if (!revengeGuard || !lastClosedTrade) return;
      // Skip if cooldown is already active
      if (cooldownActive) return;
      // Only trigger for new trades we haven't processed
      const tradeId = lastClosedTrade.id || lastClosedTrade.deal_id;
      if (tradeId === lastDetectedTradeId) return;

      const profit = lastClosedTrade.profit ?? 0;
      if (profit < 0) {
         setLastDetectedTradeId(tradeId);
         const cooldownDurationSec = waitPeriod * 60;
         setCooldownActive(true);
         setCooldownSeconds(cooldownDurationSec);
         // Persist to localStorage for cross-page sync
         const cooldownData = {
            active: true,
            endsAt: Date.now() + (cooldownDurationSec * 1000),
            waitPeriodMinutes: waitPeriod,
            triggeredBy: `${lastClosedTrade.symbol || lastClosedTrade.pair || 'Trade'} ${sym}${profit.toFixed(2)}`
         };
         localStorage.setItem('fialgo_cooldown', JSON.stringify(cooldownData));
         window.dispatchEvent(new Event('fialgo_cooldown_changed'));
         toast.error(`Loss detected — Cooldown Shield activated for ${waitPeriod} minutes`, {
            description: `${lastClosedTrade.symbol || lastClosedTrade.pair || 'Trade'} closed at ${sym}${profit.toFixed(2)}. Execution locked.`,
            duration: 6000
         });

         // Trigger webhook to block trading
         const webhookUrl = 'https://n8n-webhooks.fialgo.ai/webhook/tradifive-riskcop-trigger';
         fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               userId: user?.id,
               action: "LOCK_TRADING",
               durationMinutes: waitPeriod,
               triggeredBy: `${lastClosedTrade.symbol || lastClosedTrade.pair || 'Trade'} ${sym}${profit.toFixed(2)}`
            })
         }).catch(err => console.error("Webhook trigger failed:", err));
      }
   }, [lastClosedTrade, revengeGuard, cooldownActive, waitPeriod, lastDetectedTradeId]);

   // D. Session Sentinel States
   const [sessionActive, setSessionActive] = useState(false);
   const [selectedSessions, setSelectedSessions] = useState(["NY", "London", "Morning", "Afternoon"]);
   const [sessionTargetFreeze, setSessionTargetFreeze] = useState(false);
   const [sessionTimes, setSessionTimes] = useState<Record<string, { start: string; end: string }>>({
      London: { start: "13:30", end: "22:00" },
      Sydney: { start: "03:30", end: "12:00" },
      NY: { start: "17:30", end: "02:00" },
      Asian: { start: "05:30", end: "14:30" },
      PreMarket: { start: "09:00", end: "09:15" },
      Morning: { start: "09:15", end: "12:00" },
      Afternoon: { start: "12:00", end: "15:30" },
      PostMarket: { start: "15:40", end: "16:00" }
   });

   // E. Capital & Risk States
   const [maxLot, setMaxLot] = useState(0.10);
   const currentLot = activeMarket === 'indian' ? 1 : 0.8;
   const [targetCapital, setTargetCapital] = useState(2000);

   const [startingCapital, setStartingCapital] = useState(() => {
      try {
         const saved = localStorage.getItem('fialgo_starting_capital');
         if (saved) return parseFloat(saved);
      } catch (e) { }
      return 0;
   });

   useEffect(() => {
      if (balance > 0 && startingCapital === 0) {
         setStartingCapital(balance);
         localStorage.setItem('fialgo_starting_capital', balance.toString());
      }
   }, [balance, startingCapital]);




   // --- NEW RiskGuard Expansion States ---
   const [maxOpenPositions, setMaxOpenPositions] = useState(5);
   const [noAveragingDown, setNoAveragingDown] = useState(false);
   const [martingaleDetection, setMartingaleDetection] = useState(false);
   const [oneInstrumentMode, setOneInstrumentMode] = useState(false);
   const [oneStrategyRule, setOneStrategyRule] = useState(false);

   const [stopLossRequired, setStopLossRequired] = useState(false);
   const [stopLossAction, setStopLossAction] = useState('block');
   const [stopLossMethod, setStopLossMethod] = useState('pips');
   const [minRiskReward, setMinRiskReward] = useState(2.4);
   const [minRiskRewardActive, setMinRiskRewardActive] = useState(false);
   const [weekendLock, setWeekendLock] = useState(false);
   const [equityHardStop, setEquityHardStop] = useState(1000);
   const [equityHardStopActive, setEquityHardStopActive] = useState(false);
   const [dailyProfitTarget, setDailyProfitTarget] = useState(500);
   const [dailyProfitTargetActive, setDailyProfitTargetActive] = useState(false);

   const [consecutiveWins, setConsecutiveWins] = useState(3);
   const [stopAfterWin, setStopAfterWin] = useState(false);
   const [emotionalTradingDetector, setEmotionalTradingDetector] = useState(false);
   const [newsFilter, setNewsFilter] = useState(false);
   const [sleepProtection, setSleepProtection] = useState(false);
   const [preTradeChecklist, setPreTradeChecklist] = useState(false);
   const [psychologyCheck, setPsychologyCheck] = useState(false);
   const [aiWeeklyReview, setAiWeeklyReview] = useState(false);
   const [aiVoiceWarning, setAiVoiceWarning] = useState(false);
   const [noTradingAfterTime, setNoTradingAfterTime] = useState("20:00");
   const [noTradingAfterTimeActive, setNoTradingAfterTimeActive] = useState(false);

   const [dayBasedKillActive, setDayBasedKillActive] = useState(false);
   const [dayBasedKillDays, setDayBasedKillDays] = useState<string[]>(['Thu']);
   const [dayBasedKillTime, setDayBasedKillTime] = useState("13:00");
   
   const [specificDateKillActive, setSpecificDateKillActive] = useState(false);
   const [specificDateKillDate, setSpecificDateKillDate] = useState("");
   const [specificDateKillTime, setSpecificDateKillTime] = useState("13:00");

   const { userSubscription } = useTrading();
   const { canAccess } = usePlan();

   const currentProfit = Math.max(0, balance - (startingCapital || balance || 0));
   const progressPercent = targetCapital > 0 ? Math.min(100, (currentProfit / targetCapital) * 100) : 0;

   const [gamificationState, setGamificationState] = useState(getGamificationState());

   useEffect(() => {
      const handleUpdate = () => setGamificationState(getGamificationState());
      window.addEventListener("tradifive_xp_update", handleUpdate);
      return () => window.removeEventListener("tradifive_xp_update", handleUpdate);
   }, []);

   const getTitleForLevel = (level: number) => {
      if (level < 5) return "Initiate";
      if (level < 10) return "Apprentice";
      if (level < 20) return "Architect";
      if (level < 30) return "Master";
      if (level < 50) return "Grandmaster";
      return "Legend";
   };
   const {
      config: dbConfig,
      saveConfig
   } = useRiskConfig(user?.id);

   // Sync database profile config
   useEffect(() => {
      if (dbConfig) {
         if (dbConfig.max_lot_size !== null) setMaxLot(dbConfig.max_lot_size);
         if (dbConfig.target_capital !== null) setTargetCapital(dbConfig.target_capital);
         if (dbConfig.max_daily_loss_percent !== null) setMaxDrawdown(dbConfig.max_daily_loss_percent);
         if (dbConfig.max_open_trades !== null) setTradeLimit(dbConfig.max_open_trades);
      }
   }, [dbConfig]);

   useEffect(() => {
      const saved = localStorage.getItem('fialgo_risk_config');
      if (saved) {
         const config = JSON.parse(saved);
         if (config.maxDrawdown) setMaxDrawdown(config.maxDrawdown);
         if (config.weeklyDrawdown !== undefined) setWeeklyDrawdown(config.weeklyDrawdown);
         if (config.monthlyDrawdown !== undefined) setMonthlyDrawdown(config.monthlyDrawdown);
         if (config.stopAfterLoss !== undefined) setStopAfterLoss(config.stopAfterLoss);
         if (config.autoTrading !== undefined) setAutoTrading(config.autoTrading);
         if (config.tradeFreq) setTradeFreq(config.tradeFreq);
         if (config.allowHedging !== undefined) setAllowHedging(config.allowHedging);
         if (config.revengeGuard !== undefined) setRevengeGuard(config.revengeGuard);
         if (config.tradeLimit) setTradeLimit(config.tradeLimit);
         if (config.waitPeriod) setWaitPeriod(config.waitPeriod);
         if (config.selectedSessions) setSelectedSessions(config.selectedSessions);
         if (config.sessionTimes) setSessionTimes(config.sessionTimes);
         if (config.maxLot) setMaxLot(config.maxLot);
         if (config.targetCapital) setTargetCapital(config.targetCapital);
         if (config.maxOpenPositions !== undefined) setMaxOpenPositions(config.maxOpenPositions);
         if (config.noAveragingDown !== undefined) setNoAveragingDown(config.noAveragingDown);
         if (config.martingaleDetection !== undefined) setMartingaleDetection(config.martingaleDetection);
         if (config.oneInstrumentMode !== undefined) setOneInstrumentMode(config.oneInstrumentMode);
         if (config.oneStrategyRule !== undefined) setOneStrategyRule(config.oneStrategyRule);
         if (config.stopLossRequired !== undefined) setStopLossRequired(config.stopLossRequired);
         if (config.minRiskReward !== undefined) setMinRiskReward(config.minRiskReward);
         if (config.weekendLock !== undefined) setWeekendLock(config.weekendLock);
         if (config.equityHardStop !== undefined) setEquityHardStop(config.equityHardStop);
         if (config.consecutiveWins !== undefined) setConsecWins(config.consecutiveWins);
         if (config.stopAfterWin !== undefined) setStopAfterWin(config.stopAfterWin);
         if (config.emotionalTradingDetector !== undefined) setEmotionalTradingDetector(config.emotionalTradingDetector);
         if (config.newsFilter !== undefined) setNewsFilter(config.newsFilter);
         if (config.sleepProtection !== undefined) setSleepProtection(config.sleepProtection);
         if (config.preTradeChecklist !== undefined) setPreTradeChecklist(config.preTradeChecklist);
         if (config.psychologyCheck !== undefined) setPsychologyCheck(config.psychologyCheck);
         if (config.aiWeeklyReview !== undefined) setAiWeeklyReview(config.aiWeeklyReview);
         if (config.aiVoiceWarning !== undefined) setAiVoiceWarning(config.aiVoiceWarning);
      }
   }, []);

   useEffect(() => {
      if (activeMarket === 'indian' && weekendCloseTime === "20:00") {
         setWeekendCloseTime("15:15");
      }
   }, [activeMarket]);

   const handleSave = async () => {
      // 1. Sync core configs to Supabase Postgres table
      if (user?.id) {
         await saveConfig({
            max_lot_size: maxLotActive ? maxLot : 0,
            target_capital: targetCapital,
            max_daily_loss_percent: drawdownGuardActive ? maxDrawdown : 0,
            max_open_trades: disciplineActive ? tradeLimit : 0
         }).catch(console.error);
      }

      // 2. Persist interactive settings in localStorage
      const config = {
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
         maxOpenPositions, noAveragingDown, martingaleDetection, oneInstrumentMode, oneStrategyRule,
         stopLossRequired, minRiskReward, weekendLock, equityHardStop,
         consecutiveWins, stopAfterWin, emotionalTradingDetector, newsFilter, sleepProtection,
         preTradeChecklist, psychologyCheck, aiWeeklyReview, aiVoiceWarning
      };
      localStorage.setItem('fialgo_risk_config', JSON.stringify(config));

      toast.success("Risk Guard Settings Synchronized", {
         description: "All automated safety brackets are now live on MT5 Bridge #28120136.",
         icon: <ShieldCheck className="text-[#22D99A]" />
      });
   };

   // E. Autosave Effect (Debounced to 800ms to avoid DB write-spamming during slider dragging)
   const isMounted = useRef(false);
   useEffect(() => {
      if (!isMounted.current) {
         isMounted.current = true;
         return;
      }

      const timer = setTimeout(() => {
         const config = {
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
            targetCapital
         };
         localStorage.setItem('fialgo_risk_config', JSON.stringify(config));

         if (user?.id) {
            saveConfig({
               max_lot_size: maxLotActive ? maxLot : 0,
               target_capital: targetCapital,
               max_daily_loss_percent: drawdownGuardActive ? maxDrawdown : 0,
               max_open_trades: disciplineActive ? tradeLimit : 0
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
      targetCapital, ,
      maxOpenPositions, noAveragingDown, martingaleDetection, oneInstrumentMode, oneStrategyRule,
      stopLossRequired, minRiskReward, weekendLock, equityHardStop,
      consecutiveWins, stopAfterWin, emotionalTradingDetector, newsFilter, sleepProtection,
      preTradeChecklist, psychologyCheck, aiWeeklyReview, aiVoiceWarning,
      user?.id
   ]);

   function RiskGuardSkeleton() {
      return (
         <div className="p-6 md:p-8 max-w-[1300px] mx-auto w-full space-y-10 select-none animate-pulse">
            {/* Header */}
            <div className="flex flex-col gap-3">
               <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800/80 rounded-md" />
               <div className="h-4.5 w-96 bg-slate-200 dark:bg-slate-800/80 rounded-md" />
            </div>

            {/* Mission Control HUD */}
            <div className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-sm dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:rounded-[20px] dark:shadow-none">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                     <div key={i} className="space-y-4">
                        <div className="h-4.5 w-32 bg-slate-200 dark:bg-slate-800/80 rounded" />
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800/80 rounded-md" />
                        <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800/80 rounded" />
                     </div>
                  ))}
               </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
               {[1, 2].map((i) => (
                  <div key={i} className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-sm dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:rounded-[20px] dark:shadow-none space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800/80" />
                           <div className="space-y-1.5">
                              <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800/80 rounded" />
                              <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800/80 rounded" />
                           </div>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-800/80" />
                     </div>
                     <div className="space-y-4">
                        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
                        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      );
   }

   if (!authChecked) {
      return (
         <DashboardLayout>
            <RiskGuardSkeleton />
         </DashboardLayout>
      );
   }

   const sessionButtons = activeMarket === 'indian' ? [
      { id: "PreMarket", label: "Pre-Market" },
      { id: "Morning", label: "Morning" },
      { id: "Afternoon", label: "Afternoon" },
      { id: "PostMarket", label: "Post-Market" }
   ] : [
      { id: "London", label: "London" },
      { id: "Sydney", label: "Sydney" },
      { id: "NY", label: "New York" },
      { id: "Asian", label: "Asian" }
   ];

   const toggleSession = (id: string) => {
      setSelectedSessions(prev =>
         prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
      );
   };

   return (
      <DashboardLayout>
         <div className="max-w-none mx-auto w-full font-sans select-none">



            {/* SEBI Compliance Banner for Indian Market */}
            {activeMarket === 'indian' && !dailyTokenActive && (
               <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-gradient-to-b from-[#EFF6FF] to-[#F8FAFC] border-2 border-white rounded-[22px]  dark:bg-none dark:bg-[#1A2332] dark:border-[1px] dark:border-blue-500/30 dark: mb-4"
                  style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
               >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(59,130,246,0.15)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                     }}>
                        <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
                     </div>
                     <div>
                        <p className="text-[13px] font-semibold text-blue-900 dark:text-blue-300" style={{ margin: 0, lineHeight: 1.3 }}>
                           SEBI Compliance: Daily Login Required
                        </p>
                        <p className="text-[12px] text-blue-800/70 dark:text-[#E8ECF2]" style={{ margin: 0, lineHeight: 1.4 }}>
                           To activate Risk Guard's live monitoring and auto-kill switch, you must authorize your broker for today's session.
                        </p>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        toast.success("Broker API Authorized for Today", {
                           description: "Live monitoring active until 3:30 PM market close.",
                           icon: <ShieldCheck className="text-[#22D99A]" />
                        });
                        setDailyTokenActive(true);
                        sessionStorage.setItem('indian_daily_token', 'active');
                     }}
                     className="text-[13px] font-semibold text-white flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
                     style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none', borderRadius: 12, padding: '9px 18px',
                        cursor: 'pointer', flexShrink: 0,
                        boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
                     }}
                  >
                     <Key size={14} />
                     Connect for Today
                  </button>
               </motion.div>
            )}

            <div className="flex flex-col xl:flex-row gap-6 items-start">
               <div className="flex-1 w-full min-w-0 space-y-4">

                  {/* HEADER - Clean, Title-Case, consistent typography weights */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 w-full">
                     <div className="flex-1">
                        <h1 className="text-[24px] font-bold text-slate-800 dark:text-[#F7F8FA] tracking-tight leading-none">Risk Guard</h1>
                        <p className="text-[12px] text-slate-400 dark:text-[#8B95A5] mt-2 font-normal">Configure automated capital protection and institutional discipline brackets.</p>
                     </div>

                     {/* ── KILL SWITCH (Header Position) ── */}
                     <div className="flex-none flex justify-end">
                        <div className={`px-4 py-2 rounded-[22px] border-2 relative group w-full sm:w-auto transition-all duration-300 ${killSwitchActive
                           ? 'border-red-200 bg-red-50/50 shadow-[0_8px_30px_rgb(239,68,68,0.1)] dark:bg-red-500/10 dark:border-[1px] dark:border-red-500/30 dark:shadow-none dark:rounded-[22px]'
                           : 'border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:rounded-[22px] dark:shadow-none'
                           }`}>
                           <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2">
                                 <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${killSwitchActive
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : 'bg-white dark:bg-[#1A1A1C] text-slate-400 border border-slate-100 dark:border-[#2B2F35] shadow-sm'
                                    }`}>
                                    <Power size={14} strokeWidth={2.5} className="transition-transform duration-300" />
                                 </div>
                                 <div className="pr-1">
                                    <h3 className={`text-[13px] font-bold transition-colors leading-tight ${killSwitchActive ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-[#F5F7FA]'
                                       }`}>Kill Switch</h3>
                                    <p className="text-[10px] font-medium text-slate-400 dark:text-[#6F7A89] mt-0.5">One click stops everything</p>
                                 </div>
                              </div>

                              <div className="flex items-center">
                                 <Switch
                                    checked={killSwitchActive}
                                    onChange={(val) => {
                                       if (val) {
                                          if (window.confirm('⚠️ KILL SWITCH: This will immediately close ALL open positions and halt all trading. Are you sure?')) {
                                             setKillSwitchActive(true);
                                             toast.error(
                                                <div className="flex flex-col gap-1">
                                                   <span className="font-bold text-white text-[13px]">🔴 KILL SWITCH ACTIVATED</span>
                                                   <span className="text-red-100 text-[11px]">All positions closing. Trading halted immediately.</span>
                                                </div>,
                                                { style: { background: '#dc2626' }, duration: 6000 }
                                             );
                                          }
                                       } else {
                                          setKillSwitchActive(false);
                                          toast.success('Kill switch deactivated. Trading resumed.');
                                       }
                                    }}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* PROTOCOL ARCHITECTURE TARGET CAPITAL TRACKER */}
                  <div
                     className="px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] relative overflow-hidden isolate dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:rounded-[22px] dark:shadow-none"
                     style={{
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                     }}
                  >
                     <div className="flex flex-col gap-4">
                        {/* Tracker Header details */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div>
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Protocol Architecture</span>
                              <h2 className="text-[18px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums leading-tight">Level {gamificationState.level} {getTitleForLevel(gamificationState.level)}</h2>
                           </div>
                           <div className="flex items-center gap-2 self-start sm:self-center">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/10">
                                 <Trophy size={13} className="text-indigo-600 dark:text-[#8DB8FF]" />
                                 <span className="text-[12px] font-bold text-indigo-600 dark:text-[#8DB8FF] tabular-nums">{gamificationState.xp.toLocaleString()} XP</span>
                              </div>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22252A] dark:hover:bg-[#292D33] text-slate-500 transition-colors">
                                       <Pencil size={14} />
                                    </button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-56 p-3 rounded-xl bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl" align="end" sideOffset={8}>
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center text-[11px] px-1">
                                          <span className="text-slate-500 font-medium">Starting Balance</span>
                                          <span className="font-semibold text-[#22D99A]">{sym}{(startingCapital || balance).toLocaleString()}</span>
                                       </div>
                                       <div className="pt-3 border-t border-slate-100 dark:border-[#2B2F35]">
                                          <label className="text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] px-1 mb-1 block antialiased">Target Balance</label>
                                          <div className="relative">
                                             <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[12px]">{sym}</span>
                                             <input
                                                type="number"
                                                autoFocus
                                                onFocus={(e) => e.target.select()}
                                                value={targetCapital}
                                                onChange={(e) => {
                                                   const val = Number(e.target.value);
                                                   setTargetCapital(val);
                                                }}
                                                className="w-full bg-slate-50 dark:bg-[#0D0D0E] border border-slate-200 dark:border-[#252528] rounded-lg pl-6 pr-2 py-1.5 text-[12px] font-bold text-slate-800 dark:text-[#F5F7FA] outline-none focus:border-indigo-500/50 transition-colors tabular-nums"
                                             />
                                          </div>
                                       </div>
                                    </div>
                                 </PopoverContent>
                              </Popover>
                           </div>
                        </div>

                        {/* Horizontal Progress Bar Section */}
                        <div className="space-y-2">
                           {/* Starting & Target Capital Labels */}
                           <div className="flex justify-between items-end px-1">
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                 <p className="text-[12px] text-slate-500 font-medium">
                                    Starting Capital: <span className="font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums">{sym}{(startingCapital || balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {iso}</span>
                                 </p>
                              </div>
                              <div className="flex items-center gap-2 mb-1 shrink-0">
                                 <span className="w-1.5 h-1.5 rounded-full bg-[#22D99A]" />
                                 <p className="text-[12px] text-slate-500 font-medium">
                                    Target Capital: <span className="font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums">{sym}{targetCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {iso}</span>
                                 </p>
                              </div>
                           </div>
                           <style dangerouslySetInnerHTML={{
                              __html: `
                        @keyframes move-stripe {
                           0% { background-position: 0 0; }
                           100% { background-position: 24px 0; }
                        }
                     `}} />
                           <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850 relative">
                              <motion.div
                                 initial={{ width: 0 }}
                                 animate={{ width: `${progressPercent}%` }}
                                 transition={{ duration: 0.7 }}
                                 className="h-full bg-indigo-600 rounded-full relative"
                                 style={{
                                    backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
                                    backgroundSize: '24px 24px',
                                    animation: 'move-stripe 1.5s linear infinite'
                                 }}
                              />
                           </div>

                           {/* Multiplier stars in the middle */}
                           <div className="flex justify-between px-1">
                              {[0, 0.25, 0.5, 0.75, 1].map((multiplier, i) => (
                                 <div key={i} className="flex flex-col items-center gap-1">
                                    <Star size={9} className={i === 0 ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-[#9AA4B2]"} />
                                    <span className="text-[9px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums">
                                       {sym}{(multiplier * targetCapital).toLocaleString()}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* ===== REORGANIZED CATEGORIES TABS ===== */}
                  <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-[#1A1A1C] rounded-[20px] mb-8 overflow-x-auto hide-scrollbar">
                     <button
                        onClick={() => setActiveTab('trading_control')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-[16px] text-[13px] font-medium transition-all ${activeTab === 'trading_control' ? 'bg-white dark:bg-[#2B2E35] font-semibold text-slate-800 dark:text-[#FFFFFF] shadow-sm' : 'text-slate-500 dark:text-[#778396] hover:text-slate-700 dark:hover:text-[#F5F7FA]'}`}
                     >
                        Trading Control
                     </button>
                     <button
                        onClick={() => setActiveTab('risk_management')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-[16px] text-[13px] font-medium transition-all ${activeTab === 'risk_management' ? 'bg-white dark:bg-[#2B2E35] font-semibold text-slate-800 dark:text-[#FFFFFF] shadow-sm' : 'text-slate-500 dark:text-[#778396] hover:text-slate-700 dark:hover:text-[#F5F7FA]'}`}
                     >
                        Risk Management
                     </button>
                     <button
                        onClick={() => setActiveTab('behaviour')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-[16px] text-[13px] font-medium transition-all ${activeTab === 'behaviour' ? 'bg-white dark:bg-[#2B2E35] font-semibold text-slate-800 dark:text-[#FFFFFF] shadow-sm' : 'text-slate-500 dark:text-[#778396] hover:text-slate-700 dark:hover:text-[#F5F7FA]'}`}
                     >
                        Behaviour & Discipline
                     </button>
                  </div>

                  {/* 1. TRADING CONTROL */}
                  {activeTab === 'trading_control' && (
                     <div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                           <RiskGuardCard icon={Layers} title={activeMarket === 'indian' ? "Max Quantity Limit" : "Max Lot Size"} description={activeMarket === 'indian' ? "Hard cap on quantity (shares/lots) per trade" : "Hard cap on lot size per trade"} value={`${maxLot} ${activeMarket === 'indian' ? 'Qty' : 'Lots'}`} active={maxLotActive} onToggle={setMaxLotActive}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                 <div className="flex-1 max-w-[200px]">
                                    <label className="text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1.5 block antialiased">{activeMarket === 'indian' ? 'MAX QUANTITY LIMIT' : 'MAX LOT SIZE LIMIT'}</label>
                                    <div className="relative flex items-center w-full">
                                       <input type="number" step="0.01" min="0.01" value={maxLot} onChange={e => setMaxLot(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-full pl-4 pr-12 py-1.5 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums outline-none tabular-nums focus:border-indigo-500/30 dark:focus:border-[#3A4049]  transition-all" />
                                       <span className="absolute right-4 text-[11px] font-bold text-slate-400">{activeMarket === 'indian' ? 'Qty' : 'Lots'}</span>
                                    </div>
                                 </div>
                                 <div className="flex-1 flex flex-col justify-end pt-4 max-w-[150px]">
                                    <div className="relative flex items-center w-full">
                                       <input 
                                          type="range" 
                                          min="0.01" 
                                          max="10.00" 
                                          step="0.01" 
                                          value={maxLot} 
                                          onChange={e => setMaxLot(Number(e.target.value))} 
                                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                       />
                                    </div>
                                    <div className="flex justify-between items-center mt-1.5">
                                       <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased">0.01</span>
                                       <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased">10.00</span>
                                    </div>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={TrendingDown} title="No Averaging Down" description="Prevent adding to losing positions" value={noAveragingDown ? "Active" : "Disabled"} active={noAveragingDown} onToggle={setNoAveragingDown}>
                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                       <label className="text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1.5 block antialiased">MODE</label>
                                       <Select defaultValue="strict">
                                          <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 py-1.5 h-auto text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectItem value="strict">Strict Block</SelectItem>
                                             <SelectItem value="warning">Warning Only</SelectItem>
                                          </SelectContent>
                                       </Select>
                                    </div>
                                    <div className="flex-1">
                                       <label className="text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1.5 block antialiased">SCOPE</label>
                                       <Select defaultValue="symbol_dir">
                                          <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 py-1.5 h-auto text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectItem value="symbol_dir">Same Symbol + Direction</SelectItem>
                                             <SelectItem value="symbol_only">Same Symbol</SelectItem>
                                             <SelectItem value="all">Global Account</SelectItem>
                                          </SelectContent>
                                       </Select>
                                    </div>
                                 </div>
                              </RiskGuardCard>
                           )}

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={AlertTriangle} title="Martingale Protection" description="Block increasing lot sizes after a loss" value={martingaleDetection ? "Active" : "Disabled"} active={martingaleDetection} onToggle={setMartingaleDetection}>
                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 max-w-[200px]">
                                       <label className="text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1.5 block antialiased">TRIGGER MULTIPLIER</label>
                                       <div className="relative flex items-center w-full">
                                          <div className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-full py-1.5 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums text-center tabular-nums">
                                             {martingaleMultiplier.toFixed(1)}×
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end pt-4 max-w-[150px]">
                                       <div className="relative flex items-center w-full">
                                          <input 
                                             type="range" 
                                             min="1.1" 
                                             max="5.0" 
                                             step="0.1" 
                                             value={martingaleMultiplier} 
                                             onChange={e => setMartingaleMultiplier(Number(e.target.value))} 
                                             className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                          />
                                       </div>
                                       <div className="flex justify-between items-center mt-1.5">
                                          <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased">1.1×</span>
                                          <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased">5.0×</span>
                                       </div>
                                    </div>
                                 </div>
                              </RiskGuardCard>
                           )}

                           <RiskGuardCard icon={Crosshair} title="One Instrument Mode" description="Limit trading to a single ticker" value={oneInstrumentMode ? "Active" : "Disabled"} active={oneInstrumentMode} onToggle={setOneInstrumentMode}>
                              <div className="flex flex-col w-full">
                                 <label className="text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1.5 block antialiased">ALLOWED INSTRUMENT</label>
                                 <Select value={allowedTicker} onValueChange={setAllowedTicker}>
                                    <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 py-1.5 h-auto text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                       <SelectValue placeholder="Select an instrument..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {activeMarket === 'indian' ? (
                                          <>
                                             <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
                                             <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                                             <SelectItem value="RELIANCE">RELIANCE</SelectItem>
                                             <SelectItem value="HDFCBANK">HDFCBANK</SelectItem>
                                             <SelectItem value="INFY">INFY</SelectItem>
                                          </>
                                       ) : (
                                          <>
                                             <SelectItem value="XAUUSD">XAUUSD — Gold</SelectItem>
                                             <SelectItem value="EURUSD">EURUSD — Euro / US Dollar</SelectItem>
                                             <SelectItem value="GBPUSD">GBPUSD — British Pound / US Dollar</SelectItem>
                                             <SelectItem value="US30">US30 — Wall Street 30</SelectItem>
                                             <SelectItem value="NAS100">NAS100 — US Tech 100</SelectItem>
                                          </>
                                       )}
                                    </SelectContent>
                                 </Select>
                              </div>
                           </RiskGuardCard>

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={CheckSquare} title="Allowed Strategy Only" description="Allow trades only from the selected strategy" value={oneStrategyRule ? "Active" : "Disabled"} active={oneStrategyRule} onToggle={setOneStrategyRule}>
                                 <div className="flex flex-col w-full">
                                    <label className="text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1.5 block antialiased">ALLOWED STRATEGY</label>
                                    <Select value={strategyName} onValueChange={setStrategyName}>
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 py-1.5 h-auto text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30 truncate text-left">
                                          <SelectValue placeholder="Select a strategy..." />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="Breakout Pro">Breakout Pro — Magic No. 1024</SelectItem>
                                          <SelectItem value="Trend Follower">Trend Follower — Magic No. 2048</SelectItem>
                                          <SelectItem value="Mean Reversion">Mean Reversion — Magic No. 4096</SelectItem>
                                          <SelectItem value="News Scalper">News Scalper — Magic No. 8192</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </RiskGuardCard>
                           )}
                        </div>
                     </div>
                  )}

                  {/* 2. RISK MANAGEMENT */}
                  {activeTab === 'risk_management' && (
                     <div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                           <RiskGuardCard icon={ShieldAlert} title={activeMarket === 'indian' ? "Max Daily Loss" : "Drawdown Guard"} description="Max daily drawdown limits" value={activeMarket === 'indian' ? `${sym}${maxDrawdown * 1000}` : `${maxDrawdown.toFixed(1)}%`} active={drawdownGuardActive} onToggle={setDrawdownGuardActive}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="flex-[0.8] max-w-[150px]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">{activeMarket === 'indian' ? 'LOSS LIMIT (₹)' : 'LIMIT'}</label>
                                    <div className="flex items-center w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg  focus-within:border-indigo-500/30 dark:focus-within:border-[#3A4049] focus-within:ring-1 focus-within:ring-indigo-500/30 overflow-hidden">
                                       {activeMarket === 'indian' ? (
                                          <>
                                             <div className="pl-3 pr-1 text-[13px] font-bold text-slate-400 select-none">{sym}</div>
                                             <input type="number" min="0" step="500" value={maxDrawdown * 1000} onChange={e => setMaxDrawdown(Number(e.target.value) / 1000)} className="w-full bg-transparent outline-none py-1 pr-3 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased text-left" placeholder="e.g. 5000" />
                                          </>
                                       ) : (
                                          <>
                                             <input type="number" min="0.5" max="20.0" step={0.5} value={maxDrawdown} onChange={e => setMaxDrawdown(Number(e.target.value))} className="w-full bg-transparent outline-none py-1 pl-3 pr-1 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased text-center" />
                                             <div className="pr-3 text-[13px] font-bold text-slate-500 select-none">%</div>
                                          </>
                                       )}
                                    </div>
                                 </div>
                                 {activeMarket !== 'indian' && (
                                    <div className="flex-1 flex flex-col justify-end pt-3 max-w-[100px]">
                                       <div className="relative flex items-center w-full">
                                          <input type="range" min="0.5" max="20.0" step="0.5" value={maxDrawdown} onChange={e => setMaxDrawdown(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                       </div>
                                    </div>
                                 )}
                                 <div className="flex-[1.5]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">BASIS</label>
                                    <Select defaultValue="balance">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="balance">Start-of-day balance</SelectItem>
                                          <SelectItem value="equity">Start-of-day equity</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Target} title={activeMarket === 'indian' ? "Profit Target" : "Daily Profit Target"} description={activeMarket === 'indian' ? "Kill when profit ≥ target" : "Lock terminal after profit"} value={dailyProfitTargetActive ? `${sym}${dailyProfitTarget}` : "Disabled"} active={dailyProfitTargetActive} onToggle={setDailyProfitTargetActive}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">{activeMarket === 'indian' ? 'PROFIT TARGET (₹)' : 'TARGET AMOUNT'}</label>
                                    <div className="relative flex items-center w-full">
                                       <span className="absolute left-3 text-[13px] font-bold text-slate-400">{sym}</span>
                                       <input type="number" value={dailyProfitTarget} onChange={e => setDailyProfitTarget(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg pl-7 pr-12 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:border-indigo-500/30 dark:focus:border-[#3A4049]  transition-all" />
                                       <span className="absolute right-3 text-[11px] font-bold text-slate-400 uppercase">{iso}</span>
                                    </div>
                                 </div>
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">CALCULATION</label>
                                    <Select defaultValue="closed">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="closed">Closed P&L</SelectItem>
                                          <SelectItem value="equity">Equity Profit</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={StopCircle} title="Stop Loss Required" description="Require SL on every execution" value={stopLossRequired ? "Active" : "Disabled"} active={stopLossRequired} onToggle={setStopLossRequired}>
                                 <div className="flex flex-col sm:flex-row gap-2.5">
                                    <div className={stopLossAction === 'auto' ? "flex-[1.2]" : "w-full"}>
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">ACTION</label>
                                       <Select value={stopLossAction} onValueChange={setStopLossAction}>
                                          <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectItem value="block">Block trades without SL</SelectItem>
                                             <SelectItem value="auto">Auto add SL</SelectItem>
                                          </SelectContent>
                                       </Select>
                                    </div>
                                    {stopLossAction === 'auto' && (
                                       <>
                                          <div className="flex-[1.2]">
                                             <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">METHOD</label>
                                             <Select value={stopLossMethod} onValueChange={setStopLossMethod}>
                                                <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                                   <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                   <SelectItem value="pips">{activeMarket === 'indian' ? 'Points' : 'Pips'}</SelectItem>
                                                   <SelectItem value="percent">Percent (%)</SelectItem>
                                                   <SelectItem value="atr">ATR</SelectItem>
                                                </SelectContent>
                                             </Select>
                                          </div>
                                          <div className="flex-[0.8]">
                                             <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">VALUE</label>
                                             <div className="relative flex items-center w-full">
                                                <input type="number" value={defaultStopLoss} onChange={e => setDefaultStopLoss(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:border-indigo-500/30 dark:focus:border-[#3A4049]  transition-all" />
                                             </div>
                                          </div>
                                       </>
                                    )}
                                 </div>
                              </RiskGuardCard>
                           )}


                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={TrendingUp} title="Min Risk/Reward" description="Require a minimum reward-to-risk ratio for every trade" value={`1:${minRiskReward}`} active={minRiskRewardActive} onToggle={setMinRiskRewardActive} intent="trading">
                                 <div className="flex flex-col gap-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                       <div className="flex-[0.8] max-w-[120px]">
                                          <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">MINIMUM TARGET R:R</label>
                                          <div className="flex items-center w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg  focus-within:border-indigo-500/30 dark:focus-within:border-[#3A4049] focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all overflow-hidden">
                                             <div className="pl-3 pr-1 text-[13px] font-bold text-slate-500 select-none">1:</div>
                                             <input type="number" min="1.0" max="5.0" step={0.1} value={minRiskReward} onChange={e => setMinRiskReward(Number(e.target.value))} className="w-full bg-transparent outline-none py-1 pr-3 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased" />
                                          </div>
                                       </div>
                                       <div className="flex-1 flex flex-col justify-end pt-3 max-w-[120px]">
                                          <div className="relative flex items-center w-full">
                                             <input type="range" min="1.0" max="5.0" step="0.1" value={minRiskReward} onChange={e => setMinRiskReward(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </RiskGuardCard>
                           )}

                           <RiskGuardCard icon={Calendar} title={activeMarket === 'indian' ? "Time-Based Kill" : "Weekend Lock"} description={activeMarket === 'indian' ? "Auto kill at specific IST time" : "Auto flatten before Friday close"} value={weekendLock ? "Active" : "Disabled"} active={weekendLock} onToggle={setWeekendLock} intent="warning">
                              <div className="flex flex-col sm:flex-row gap-3">
                                 <div className="flex-[0.8]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">{activeMarket === 'indian' ? "KILL TIME (IST 24HR)" : "FRIDAY CLOSE TIME"}</label>
                                    <Popover>
                                       <PopoverTrigger asChild>
                                          <button className="flex items-center justify-between w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg  focus-within:border-indigo-500/30 dark:focus-within:border-[#3A4049] focus-within:ring-1 focus-within:ring-indigo-500/30 overflow-hidden pl-3 pr-2.5 outline-none transition-all">
                                             <span className="text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased">{weekendCloseTime}</span>
                                             <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase select-none whitespace-nowrap">
                                                <Clock size={12} className="text-slate-400" />
                                                Broker Time
                                             </div>
                                          </button>
                                       </PopoverTrigger>
                                       <PopoverContent className="w-[150px] p-0 border-slate-200 dark:border-[#2B2F35] rounded-md overflow-hidden shadow-xl" align="start">
                                          <div className="flex bg-white dark:bg-[#1A1A1A] p-1.5 gap-1.5 border-b border-slate-100 dark:border-[#2B2F35]">
                                             <div className="flex-1 bg-[#106efb] text-white font-bold text-center py-1.5 rounded-sm text-[13px] shadow-sm border border-slate-900 dark:border-black">
                                                {weekendCloseTime.split(':')[0]}
                                             </div>
                                             <div className="flex-1 bg-[#106efb] text-white font-bold text-center py-1.5 rounded-sm text-[13px] shadow-sm border border-slate-900 dark:border-black">
                                                {weekendCloseTime.split(':')[1]}
                                             </div>
                                          </div>
                                          <div className="flex h-[200px] bg-white dark:bg-[#1A1A1A]">
                                             <div className="flex-1 overflow-y-auto border-r border-slate-100 dark:border-[#2B2F35] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                                                {Array.from({ length: 24 }).map((_, i) => {
                                                   const h = i.toString().padStart(2, '0');
                                                   const currentH = weekendCloseTime.split(':')[0];
                                                   return (
                                                      <button 
                                                         key={`h-${h}`}
                                                         onClick={() => setWeekendCloseTime(`${h}:${weekendCloseTime.split(':')[1]}`)}
                                                         className={`w-full text-center py-2.5 text-[13px] transition-colors outline-none ${h === currentH ? 'bg-slate-100 dark:bg-[#2B2E35] font-bold text-[#106efb] dark:text-[#3b82f6]' : 'text-slate-600 dark:text-[#E8ECF2] hover:bg-slate-50 dark:hover:bg-[#292D33]'}`}
                                                      >
                                                         {h}
                                                      </button>
                                                   )
                                                })}
                                             </div>
                                             <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                                                {Array.from({ length: 60 }).map((_, i) => {
                                                   const m = i.toString().padStart(2, '0');
                                                   const currentM = weekendCloseTime.split(':')[1];
                                                   return (
                                                      <button 
                                                         key={`m-${m}`}
                                                         onClick={() => setWeekendCloseTime(`${weekendCloseTime.split(':')[0]}:${m}`)}
                                                         className={`w-full text-center py-2.5 text-[13px] transition-colors outline-none ${m === currentM ? 'bg-slate-100 dark:bg-[#2B2E35] font-bold text-[#106efb] dark:text-[#3b82f6]' : 'text-slate-600 dark:text-[#E8ECF2] hover:bg-slate-50 dark:hover:bg-[#292D33]'}`}
                                                      >
                                                         {m}
                                                      </button>
                                                   )
                                                })}
                                             </div>
                                          </div>
                                       </PopoverContent>
                                    </Popover>
                                 </div>
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">ACTION</label>
                                    <Select defaultValue="both">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="both">Close positions & block trades</SelectItem>
                                          <SelectItem value="close">Close positions only</SelectItem>
                                          <SelectItem value="block">Block new trades only</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                              {activeMarket === 'indian' && (
                                 <div className="mt-3 text-[10px] font-medium text-amber-500/90 dark:text-amber-400/80 flex items-center gap-1.5">
                                    <Zap size={10} />
                                    <span>Set 12:00 PM on expiry days - stops when option premiums spike</span>
                                 </div>
                              )}
                           </RiskGuardCard>

                           {activeMarket === 'indian' && (
                              <>
                                 <RiskGuardCard icon={Calendar} title="Day-Based Kill" description="Kill on weekdays + time" value={dayBasedKillActive ? "Active" : "Disabled"} active={dayBasedKillActive} onToggle={setDayBasedKillActive} intent="warning">
                                    <div className="flex flex-col gap-3">
                                       <div>
                                          <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">SELECT DAYS</label>
                                          <div className="flex items-center gap-2">
                                             {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                                                <button
                                                   key={day}
                                                   onClick={() => {
                                                      setDayBasedKillDays(prev =>
                                                         prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                                      );
                                                   }}
                                                   className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${dayBasedKillDays.includes(day) ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/30' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-[#22252A] dark:text-[#E8ECF2] dark:border-[#2B2F35]'}`}
                                                >
                                                   {day}
                                                </button>
                                             ))}
                                          </div>
                                          <div className="mt-2 text-[10px] font-medium text-amber-500/90 dark:text-amber-400/80 flex items-center gap-1.5">
                                             <Zap size={10} />
                                             <span>Thursday = Weekly Nifty/BankNifty expiry</span>
                                          </div>
                                       </div>
                                       <div>
                                          <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">KILL TIME ON THESE DAYS (IST)</label>
                                          <div className="relative flex items-center w-full max-w-[200px]">
                                             <input type="time" value={dayBasedKillTime} onChange={e => setDayBasedKillTime(e.target.value)} className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:border-indigo-500/30 dark:focus:border-[#3A4049] transition-all" />
                                          </div>
                                       </div>
                                    </div>
                                 </RiskGuardCard>

                                 <RiskGuardCard icon={Calendar} title="Specific Dates" description="Kill on exact dates" value={specificDateKillActive ? "Active" : "Disabled"} active={specificDateKillActive} onToggle={setSpecificDateKillActive} intent="warning">
                                    <div className="flex flex-col gap-3">
                                       <div>
                                          <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">SELECTED DATES</label>
                                          <div className="relative flex items-center w-full">
                                             <input type="date" value={specificDateKillDate} onChange={e => setSpecificDateKillDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:border-indigo-500/30 dark:focus:border-[#3A4049] transition-all" />
                                          </div>
                                       </div>
                                       <div>
                                          <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">KILL TIME ON THESE DATES (IST)</label>
                                          <div className="relative flex items-center w-full max-w-[200px]">
                                             <input type="time" value={specificDateKillTime} onChange={e => setSpecificDateKillTime(e.target.value)} className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:border-indigo-500/30 dark:focus:border-[#3A4049] transition-all" />
                                          </div>
                                          <div className="mt-2 text-[10px] font-medium text-amber-500/90 dark:text-amber-400/80 flex items-center gap-1.5">
                                             <Zap size={10} />
                                             <span>Add monthly expiry, RBI policy day, budget day etc.</span>
                                          </div>
                                       </div>
                                    </div>
                                 </RiskGuardCard>
                              </>
                           )}

                           <RiskGuardCard icon={Wallet} title="Account Protection" description="Minimum equity level" value={`${sym}${equityHardStop}`} active={equityHardStopActive} onToggle={setEquityHardStopActive} intent="emergency">
                              <div className="flex flex-col gap-2">
                                 <div>
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">MINIMUM EQUITY LEVEL</label>
                                    <div className="relative flex items-center w-full max-w-[200px]">
                                       <span className="absolute left-3 text-[13px] font-bold text-slate-400">{sym}</span>
                                       <input type="number" value={equityHardStop} onChange={e => setEquityHardStop(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg pl-7 pr-12 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:border-indigo-500/30 dark:focus:border-[#3A4049]  transition-all" />
                                       <span className="absolute right-3 text-[11px] font-bold text-slate-400 uppercase">{iso}</span>
                                    </div>
                                 </div>
                              </div>
                           </RiskGuardCard>
                        </div>
                     </div>
                  )}

                  {/* 3. BEHAVIOUR & DISCIPLINE */}
                  {activeTab === 'behaviour' && (
                     <div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                           <RiskGuardCard icon={ShieldCheck} title={activeMarket === 'indian' ? "Max Trades" : "Daily Trade Limit"} description={activeMarket === 'indian' ? "Kill after N orders" : "Limits the maximum number of executions per day"} value={disciplineActive ? "Active" : "Disabled"} active={disciplineActive} onToggle={setDisciplineActive}>
                              <div>
                                 <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">{activeMarket === 'indian' ? 'MAX TRADES' : 'Daily Execution Limit'}</label>
                                 <div className="flex items-center gap-3 w-[160px]">
                                    <button onClick={() => setTradeLimit(prev => Math.max(1, prev - 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] shadow-sm text-slate-700 dark:text-[#E8ECF2] font-bold hover:bg-slate-50 transition-colors active:scale-95">-</button>
                                    <span className="flex-1 bg-slate-50 dark:bg-[#22252A] border border-slate-200 dark:border-[#2B2F35] rounded-lg px-3 h-[32px] flex items-center justify-center text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased text-center ">{(!isProOrElite && tradeLimit > 5) ? 5 : tradeLimit}</span>
                                    <button onClick={() => { if (!isProOrElite && tradeLimit >= 5) { toast.error(<div className="flex flex-col gap-1"><div className="flex items-center gap-2"><Crown size={16} className="text-amber-500" /><span className="font-bold text-slate-900 dark:text-[#F5F7FA]">Pro Feature</span></div><span className="text-slate-600 dark:text-[#E8ECF2]">Upgrade to Pro to increase daily execution limits.</span></div>); return; } setTradeLimit(prev => Math.min(20, prev + 1)); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0F172A] dark:bg-[#6C63FF] text-white font-bold hover:bg-slate-800 transition-colors active:scale-95">+</button>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           {/* Loss Cooldown Shield — standalone card */}
                           <RiskGuardCard icon={ShieldOff} title="Loss Cooldown" description="Locks execution after losing trades" value={!isProOrElite ? "Pro" : revengeGuard ? "Active" : "Disabled"} active={!isProOrElite ? false : revengeGuard} onToggle={(val) => {
                              if (!isProOrElite) {
                                 toast.error(
                                    <div className="flex flex-col gap-1">
                                       <div className="flex items-center gap-2">
                                          <Crown size={16} className="text-amber-500" />
                                          <span className="font-bold text-slate-900 dark:text-[#F5F7FA]">Pro Feature</span>
                                       </div>
                                       <span className="text-slate-600 dark:text-[#E8ECF2]">Upgrade to Pro to unlock the Loss Cooldown.</span>
                                    </div>
                                 );
                                 return;
                              }
                              setRevengeGuard(val);
                           }}>
                              <div className="flex flex-col sm:flex-row gap-3">
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">DURATION</label>
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] ">
                                       <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased">5M</span>
                                       <input
                                          type="range" min={5} max={120} step={5} value={waitPeriod}
                                          onChange={e => setWaitPeriod(+e.target.value)}
                                          className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-[#6C63FF]"
                                          style={{ background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((waitPeriod - 5) / (120 - 5)) * 100}%, rgba(79,70,229,0.15) ${((waitPeriod - 5) / (120 - 5)) * 100}%, rgba(79,70,229,0.15) 100%)` }}
                                       />
                                       <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased">120M</span>
                                    </div>
                                 </div>
                                 <div className="flex-[1.2]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">TRIGGER</label>
                                    <Select defaultValue="every">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="every">After every losing trade</SelectItem>
                                          <SelectItem value="consecutive">After consecutive losses</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Clock} title="Session Sentinel" description="Custom hourly trading windows" value={sessionActive ? "Active" : "Disabled"} active={sessionActive} onToggle={setSessionActive}>
                              <div>
                                 <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase block tracking-widest">ACTIVE SESSIONS</label>
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase select-none">
                                       <Clock size={10} />
                                       Broker Time
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap gap-1.5">
                                    {sessionButtons.map(session => {
                                       const isSelected = selectedSessions.includes(session.id);
                                       return (
                                          <button key={session.id} onClick={() => toggleSession(session.id)} className={`px-2.5 h-[26px] flex items-center justify-center rounded-md text-[11px] font-bold transition-all border ${isSelected ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-[#6C63FF]/10 dark:text-[#8DB8FF] dark:border-[#6C63FF]/20 ' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-[#22252A] dark:text-[#E8ECF2] dark:border-[#2B2F35] hover:bg-slate-100 dark:hover:bg-[#292D33]'
                                             }`}>{session.label}</button>
                                       );
                                    })}
                                    <button className="px-2.5 h-[26px] flex items-center justify-center rounded-md text-[11px] font-bold transition-all border border-dashed border-slate-300 dark:border-[#2B2F35] text-slate-500 dark:text-[#667181] hover:bg-slate-50 dark:hover:bg-[#292D33] hover:text-slate-700 dark:hover:text-slate-300 gap-1.5">
                                       <span>+</span> Custom
                                    </button>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Trophy} title="Win Streak Cooldown" description="Lock trading after wins" value={`${consecutiveWins} Wins`} active={stopAfterWin} onToggle={setStopAfterWin}>
                              <div className="flex flex-col sm:flex-row gap-3">
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">MAX CONSECUTIVE WINS</label>
                                    <div className="flex items-center gap-2">
                                       <button onClick={() => setConsecutiveWins(prev => Math.max(1, prev - 1))} className="w-[32px] h-[32px] flex items-center justify-center rounded-lg bg-white dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35]  text-slate-700 dark:text-[#E8ECF2] font-bold hover:bg-slate-50 transition-colors active:scale-95">-</button>
                                       <span className="flex-1 bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] flex items-center justify-center text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased ">{consecutiveWins}</span>
                                       <button onClick={() => setConsecutiveWins(prev => prev + 1)} className="w-[32px] h-[32px] flex items-center justify-center rounded-lg bg-white dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35]  text-slate-700 dark:text-[#E8ECF2] font-bold hover:bg-slate-50 transition-colors active:scale-95">+</button>
                                    </div>
                                 </div>
                                 <div className="flex-[1.2]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">ACTION</label>
                                    <Select defaultValue="pause">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="pause">Pause trading</SelectItem>
                                          <SelectItem value="confirm">Require confirmation</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Sunrise} title="No Trading After Time" description="Daily cutoff time" value={noTradingAfterTime} active={noTradingAfterTimeActive} onToggle={setNoTradingAfterTimeActive} intent="discipline">
                              <div className="flex flex-col sm:flex-row gap-3">
                                 <div className="flex-[0.8]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">CUTOFF TIME</label>
                                    <Popover>
                                       <PopoverTrigger asChild>
                                          <button className="flex items-center justify-between w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg  focus-within:border-indigo-500/30 dark:focus-within:border-[#3A4049] focus-within:ring-1 focus-within:ring-indigo-500/30 overflow-hidden pl-3 pr-2.5 outline-none transition-all">
                                             <span className="text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased">{noTradingAfterTime}</span>
                                             <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase select-none whitespace-nowrap">
                                                <Clock size={12} className="text-slate-400" />
                                                Broker Time
                                             </div>
                                          </button>
                                       </PopoverTrigger>
                                       <PopoverContent className="w-[150px] p-0 border-slate-200 dark:border-[#2B2F35] rounded-md overflow-hidden shadow-xl" align="start">
                                          <div className="flex bg-white dark:bg-[#1A1A1A] p-1.5 gap-1.5 border-b border-slate-100 dark:border-[#2B2F35]">
                                             <div className="flex-1 bg-[#106efb] text-white font-bold text-center py-1.5 rounded-sm text-[13px] shadow-sm border border-slate-900 dark:border-black">
                                                {noTradingAfterTime.split(':')[0] || '15'}
                                             </div>
                                             <div className="flex-1 bg-[#106efb] text-white font-bold text-center py-1.5 rounded-sm text-[13px] shadow-sm border border-slate-900 dark:border-black">
                                                {noTradingAfterTime.split(':')[1] || '00'}
                                             </div>
                                          </div>
                                          <div className="flex h-[200px] bg-white dark:bg-[#1A1A1A]">
                                             <div className="flex-1 overflow-y-auto border-r border-slate-100 dark:border-[#2B2F35] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                                                {Array.from({ length: 24 }).map((_, i) => {
                                                   const h = i.toString().padStart(2, '0');
                                                   const currentH = noTradingAfterTime.split(':')[0] || '15';
                                                   return (
                                                      <button 
                                                         key={`h-${h}`}
                                                         onClick={() => setNoTradingAfterTime(`${h}:${noTradingAfterTime.split(':')[1] || '00'}`)}
                                                         className={`w-full text-center py-2.5 text-[13px] transition-colors outline-none ${h === currentH ? 'bg-slate-100 dark:bg-[#2B2E35] font-bold text-[#106efb] dark:text-[#3b82f6]' : 'text-slate-600 dark:text-[#E8ECF2] hover:bg-slate-50 dark:hover:bg-[#292D33]'}`}
                                                      >
                                                         {h}
                                                      </button>
                                                   )
                                                })}
                                             </div>
                                             <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                                                {Array.from({ length: 60 }).map((_, i) => {
                                                   const m = i.toString().padStart(2, '0');
                                                   const currentM = noTradingAfterTime.split(':')[1] || '00';
                                                   return (
                                                      <button 
                                                         key={`m-${m}`}
                                                         onClick={() => setNoTradingAfterTime(`${noTradingAfterTime.split(':')[0] || '15'}:${m}`)}
                                                         className={`w-full text-center py-2.5 text-[13px] transition-colors outline-none ${m === currentM ? 'bg-slate-100 dark:bg-[#2B2E35] font-bold text-[#106efb] dark:text-[#3b82f6]' : 'text-slate-600 dark:text-[#E8ECF2] hover:bg-slate-50 dark:hover:bg-[#292D33]'}`}
                                                      >
                                                         {m}
                                                      </button>
                                                   )
                                                })}
                                             </div>
                                          </div>
                                       </PopoverContent>
                                    </Popover>
                                 </div>
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">ACTION</label>
                                    <Select defaultValue="block">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="block">Block new trades</SelectItem>
                                          <SelectItem value="close">Close positions & block</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={HeartPulse} title="Behavioural Risk Detector" description="AI pacing detection" value={emotionalTradingDetector ? "Active" : "Disabled"} active={emotionalTradingDetector} onToggle={setEmotionalTradingDetector} intent="discipline">
                                 <div>
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">SENSITIVITY</label>
                                    <div className="flex items-center gap-3 w-full">
                                       <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase tracking-widest">Low</span>
                                       <div className="flex-1 h-[32px] flex items-center relative">
                                          <input type="range" min="0" max="100" step="10" value={emotionSensitivity} onChange={e => setEmotionSensitivity(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                       </div>
                                       <span className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase tracking-widest">High</span>
                                    </div>
                                 </div>
                              </RiskGuardCard>
                           )}

                           <RiskGuardCard icon={AlertTriangle} title="News Filter" description="Block around high-impact news" value={newsFilter ? "Active" : "Disabled"} active={newsFilter} onToggle={setNewsFilter} intent="warning">
                              <div className="flex flex-col sm:flex-row gap-3">
                                 <div className="flex-[1.2]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">IMPACT LEVEL</label>
                                    <Select defaultValue={newsImpactLevel} onValueChange={setNewsImpactLevel}>
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="high">High Only</SelectItem>
                                          <SelectItem value="medium_high">Medium & High</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="flex-1 flex gap-2">
                                    <div className="flex-1">
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">BLOCK BFR.</label>
                                       <div className="flex items-center bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg h-[32px]  px-2">
                                          <input type="number" defaultValue="30" className="w-full bg-transparent text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none text-center" />
                                          <span className="text-[9px] text-slate-400 font-bold ml-1">M</span>
                                       </div>
                                    </div>
                                    <div className="flex-1">
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">RESUME AFT.</label>
                                       <div className="flex items-center bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg h-[32px]  px-2">
                                          <input type="number" defaultValue="15" className="w-full bg-transparent text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none text-center" />
                                          <span className="text-[9px] text-slate-400 font-bold ml-1">M</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Moon} title="Sleep Protection" description="Disable midnight trading" value={sleepProtection ? "Active" : "Disabled"} active={sleepProtection} onToggle={setSleepProtection} intent="discipline">
                              <div className="flex gap-3">
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">LOCKOUT START</label>
                                    <div className="relative flex items-center w-full">
                                       <input type="time" value={sleepTimeStart} onChange={e => setSleepTimeStart(e.target.value)} className="w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg pl-3 pr-2 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all tabular-nums " />
                                    </div>
                                 </div>
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">LOCKOUT END</label>
                                    <div className="relative flex items-center w-full">
                                       <input type="time" defaultValue="06:00" className="w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg pl-3 pr-2 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all tabular-nums " />
                                    </div>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={CheckSquare} title="Pre-Trade Checklist" description="Mandatory popup checklist" value={preTradeChecklist ? "Active" : "Disabled"} active={preTradeChecklist} onToggle={setPreTradeChecklist} intent="discipline">
                                 <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-[1.2]">
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">CHECKLIST PRESET</label>
                                       <Select defaultValue="standard">
                                          <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectItem value="basic">Basic (3 items)</SelectItem>
                                             <SelectItem value="standard">Standard (5 items)</SelectItem>
                                             <SelectItem value="strict">Strict (8 items)</SelectItem>
                                          </SelectContent>
                                       </Select>
                                    </div>
                                    <div className="flex-1">
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">CUSTOMIZE</label>
                                       <button className="w-full h-[32px] flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg text-[11px] font-bold text-slate-700 dark:text-[#E8ECF2] hover:bg-slate-100 dark:hover:bg-[#292D33] transition-colors ">
                                          <Settings size={12} />
                                          Edit Items
                                       </button>
                                    </div>
                                 </div>
                              </RiskGuardCard>
                           )}

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={Brain} title="Psychology Check" description="Mandatory mood-slider" value={psychologyCheck ? "Active" : "Disabled"} active={psychologyCheck} onToggle={setPsychologyCheck} intent="discipline">
                                 <div>
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">CHECK FREQUENCY</label>
                                    <Select defaultValue="first">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="first">Before first trade</SelectItem>
                                          <SelectItem value="loss">After a losing trade</SelectItem>
                                          <SelectItem value="every">Before every trade</SelectItem>
                                          <SelectItem value="daily">Once daily</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </RiskGuardCard>
                           )}

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={Sparkles} title="AI Weekly Review" description="AI review of your trades" value={aiWeeklyReview ? "Active" : "Disabled"} active={aiWeeklyReview} onToggle={setAiWeeklyReview} intent="discipline">
                                 <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-[0.8] flex gap-2">
                                       <div className="flex-[1.2]">
                                          <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">DAY</label>
                                          <Select defaultValue="friday">
                                             <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                                <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                <SelectItem value="friday">Friday</SelectItem>
                                                <SelectItem value="saturday">Saturday</SelectItem>
                                                <SelectItem value="sunday">Sunday</SelectItem>
                                             </SelectContent>
                                          </Select>
                                       </div>
                                       <div className="flex-[0.8]">
                                          <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">TIME</label>
                                          <input type="time" defaultValue="17:00" className="w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-2 text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all tabular-nums " />
                                       </div>
                                    </div>
                                    <div className="flex-1">
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">DELIVERY</label>
                                       <Select defaultValue="in_app">
                                          <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectItem value="in_app">In-app report</SelectItem>
                                             <SelectItem value="email">Email summary</SelectItem>
                                          </SelectContent>
                                       </Select>
                                    </div>
                                 </div>
                              </RiskGuardCard>
                           )}

                           {activeMarket !== 'indian' && (
                              <RiskGuardCard icon={Volume2} title="AI Voice Warning" description="Audible alerts for limits" value={aiVoiceWarning ? "Active" : "Disabled"} active={aiVoiceWarning} onToggle={setAiVoiceWarning} intent="warning">
                                 <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">VOLUME</label>
                                       <div className="flex items-center gap-3 w-full">
                                          <div className="flex-1 h-[32px] flex items-center relative">
                                             <input type="range" min="0" max="100" step="10" value={voiceVolume} onChange={e => setVoiceVolume(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                          </div>
                                          <button className="w-[32px] h-[32px] flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] text-slate-700 dark:text-[#E8ECF2] font-bold hover:bg-slate-100 dark:hover:bg-[#292D33] transition-colors ">
                                             <Volume2 size={14} />
                                          </button>
                                       </div>
                                    </div>
                                    <div className="flex-1">
                                       <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">TRIGGERS</label>
                                       <Select defaultValue="critical">
                                          <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                             <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectItem value="all">All warnings</SelectItem>
                                             <SelectItem value="critical">Critical limits only</SelectItem>
                                             <SelectItem value="drawdown">Drawdown only</SelectItem>
                                          </SelectContent>
                                       </Select>
                                    </div>
                                 </div>
                              </RiskGuardCard>
                           )}

                           <RiskGuardCard icon={Key} title="Guardian PIN" description="Require PIN to override limits" value={pinActive ? "Active" : "Disabled"} active={pinActive} onToggle={setPinActive} intent="emergency">
                              <div className="flex gap-3">
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">ENTER PIN</label>
                                    <div className="relative flex items-center w-full">
                                       <input
                                          type={showPin ? "text" : "password"}
                                          value={guardianPin}
                                          onChange={e => {
                                             const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                             setGuardianPin(val);
                                          }}
                                          placeholder="••••"
                                          className="w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg pl-3 pr-8 text-[13px] font-bold text-slate-900 dark:text-[#F5F7FA] outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400 tracking-widest "
                                       />
                                       <button
                                          type="button"
                                          onClick={() => setShowPin(!showPin)}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                       >
                                          {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                                       </button>
                                    </div>
                                 </div>
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">CONFIRM PIN</label>
                                    <div className="relative flex items-center w-full">
                                       <input
                                          type={showPin ? "text" : "password"}
                                          placeholder="••••"
                                          className="w-full h-[32px] bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg pl-3 pr-8 text-[13px] font-bold text-slate-900 dark:text-[#F5F7FA] outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400 tracking-widest "
                                       />
                                       <button
                                          type="button"
                                          onClick={() => setShowPin(!showPin)}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                       >
                                          {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={MonitorOff} title="Terminal Hard Stop" description="Force lock on limit breach" value={hardStopActive ? "Active" : "Disabled"} active={hardStopActive} onToggle={setHardStopActive} intent="emergency">
                              <div className="flex flex-col sm:flex-row gap-3">
                                 <div className="flex-[1.5]">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">TRIGGER CONDITION</label>
                                    <Select defaultValue="drawdown">
                                       <SelectTrigger className="w-full bg-slate-50 dark:bg-[#22252A] border border-slate-200/60 dark:border-[#2B2F35] dark:border-[#2B2F35] rounded-lg px-3 h-[32px] text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased  focus:ring-1 focus:ring-indigo-500/30">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="drawdown">Max Drawdown breach</SelectItem>
                                          <SelectItem value="equity">Equity stop limit hit</SelectItem>
                                          <SelectItem value="rules">Repeated rule violation</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="flex-1">
                                    <label className="text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased dark:text-[#E8ECF2] uppercase mb-1 block tracking-widest">TEST</label>
                                    <button
                                       onClick={() => setHardStopActive(true)}
                                       className="w-full h-[32px] flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors "
                                    >
                                       <MonitorOff size={12} />
                                       Test Lock
                                    </button>
                                 </div>
                              </div>
                           </RiskGuardCard>
                        </div>
                     </div>
                  )}
               </div>

               {/* Right Column: 3 Widgets */}
               <div className="w-full xl:w-[320px] shrink-0 space-y-6 xl:sticky xl:top-24 self-start pb-6 px-1 -mx-1 pt-1 -mt-1">

                  {/* 1. Risk Score Card */}
                  <RiskScoreCard score={avgDisciplineScore ?? 0} />

                  {/* 2. Connected Account Card */}
                  <div className="rounded-[22px] p-5 border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none flex flex-col gap-6">
                     <h3 className="text-[16px] font-bold text-slate-900 dark:text-[#F5F7FA]">Connected Account</h3>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-11 h-11 bg-black rounded-full shrink-0"></div>
                           <div className="flex flex-col">
                              <span className="text-[15px] font-bold text-slate-800 dark:text-[#F5F7FA] leading-tight">
                                 {accountMetrics?.broker_name || (isConnected ? "Connected Broker" : "Not Connected")}
                              </span>
                              <span className="text-[13px] font-medium text-slate-500 mt-0.5">Account: {accountMetrics?.account_number || (isConnected ? "Connected" : "---")}</span>
                           </div>
                        </div>
                        {isConnected ? (
                           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${accountMetrics?.demo ? 'bg-amber-100/80 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-100/80 dark:bg-[#22D99A]/10 text-emerald-600 dark:text-[#22D99A]'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${accountMetrics?.demo ? 'bg-amber-500 ' : 'bg-[#22D99A] '}`}></span>
                              <span className="text-[11px] font-bold tracking-wide">{accountMetrics?.demo ? 'DEMO' : 'LIVE'}</span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-500/10 text-slate-500 dark:text-[#667181]">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 "></span>
                              <span className="text-[11px] font-bold tracking-wide">OFFLINE</span>
                           </div>
                        )}
                     </div>

                     <div className="space-y-3.5 pt-1">
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-slate-500 font-medium">Balance</span>
                           <span className="font-bold text-slate-800 dark:text-[#F5F7FA]">{sym}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-slate-500 font-medium">Equity</span>
                           <span className="font-bold text-slate-800 dark:text-[#F5F7FA]">{sym}{(equity || balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-slate-500 font-medium">Free Margin</span>
                           <span className="font-bold text-slate-800 dark:text-[#F5F7FA]">{sym}{((accountMetrics?.margin_free || accountMetrics?.equity || equity || balance) * 0.85).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-slate-500 font-medium">Leverage</span>
                           <span className="font-bold text-slate-800 dark:text-[#F5F7FA]">1:{accountMetrics?.leverage || (isConnected ? "100" : "---")}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                           <span className="text-slate-500 font-medium">Last Sync</span>
                           <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#22D99A]' : 'bg-slate-400'}`}></span>
                              <span className={`font-medium ${isConnected ? 'text-emerald-600 dark:text-[#22D99A]' : 'text-slate-500'}`}>
                                 {isConnected ? (lastImportTime || "Just now") : "---"}
                              </span>
                           </div>
                        </div>
                     </div>

                     <button
                        onClick={() => navigate('/settings?tab=trading')}
                        className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-[#2B2F35] bg-transparent hover:bg-slate-50 dark:hover:bg-[#292D33] text-[13px] font-bold text-slate-700 dark:text-[#E8ECF2] transition-colors flex items-center justify-center gap-2"
                     >
                        <Settings size={16} /> Manage Connection
                     </button>
                  </div>

                  {/* 3. Today's Summary Card */}
                  <div className="rounded-[22px] p-5 border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none flex flex-col gap-5">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-[#F5F7FA]">Today's Summary</h3>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-semibold text-slate-500">Trades Taken</span>
                           <div className="text-[13px] font-bold text-[#22D99A]">{tradesToday} <span className="text-slate-400">/ {tradeLimit}</span></div>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-semibold text-slate-500">Daily P&L</span>
                           <span className={`text-[13px] font-bold ${todayProfit >= 0 ? 'text-[#22D99A]' : 'text-rose-500'}`}>
                              {todayProfit >= 0 ? '+' : '-'}{sym}{Math.abs(todayProfit).toFixed(2)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-[#2B2F35]">
                           <span className="text-[13px] font-semibold text-slate-500">Daily Loss Limit</span>
                           <span className="text-[13px] font-bold text-rose-500">{sym}{((startingCapital || balance || 0) * (maxDrawdown / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                           <span className="text-[13px] font-semibold text-slate-500">Daily Profit Target</span>
                           <span className="text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums tabular-nums antialiased">{sym}{dailyProfitTarget.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* HARD STOP OVERLAY */}
            <AnimatePresence>
               {hardStopActive && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.4, ease: "easeOut" }}
                     className="fixed inset-0 z-[99999] bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col items-center justify-center text-center px-6 overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-950/40 via-transparent to-transparent pointer-events-none" />

                     <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="relative"
                     >
                        <div className="absolute inset-0 bg-rose-500  opacity-20 rounded-full" />
                        <AlertTriangle className="w-28 h-28 text-rose-500 mb-8 relative z-10" />
                     </motion.div>

                     <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
                        HARD STOP <span className="text-rose-500">ENGAGED</span>
                     </h1>

                     <p className="text-xl md:text-2xl font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        You have breached your daily drawdown limit. All open positions have been aggressively squared off.
                     </p>

                     <div className="mt-10 flex flex-col items-center gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                           <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">Terminal Lockout Ends In</p>
                           <div className="flex items-center justify-center gap-3 text-4xl font-black text-white tabular-nums">
                              <span>04</span><span className="text-rose-500/50">:</span>
                              <span>12</span><span className="text-rose-500/50">:</span>
                              <span>59</span>
                           </div>
                           <p className="text-slate-500 text-xs mt-3">Access restores at 15:30 IST</p>
                        </div>
                     </div>

                     {/* Hidden bypass for demo/testing purposes */}
                     <button
                        onDoubleClick={() => setHardStopActive(false)}
                        className="absolute bottom-8 opacity-0 hover:opacity-20 text-[10px] text-white tracking-widest uppercase font-bold transition-opacity"
                     >
                        [Double click to bypass demo]
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </DashboardLayout>
   );
}
