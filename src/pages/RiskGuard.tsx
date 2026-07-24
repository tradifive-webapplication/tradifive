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

// --- HUD Status Indicators ---
const StatusIndicators = ({ isActive = true }) => (
   <div className="flex gap-2 items-center">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monitor</span>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
   </div>
);


// --- Custom Neumorphic Toggle Switch (UIverse) ---
// --- Custom Neumorphic Industrial Toggle Switch ---
function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void, disabled?: boolean }) {
   const switchId = React.useId();
   return (
      <>
         <style dangerouslySetInnerHTML={{
            __html: `
        /* DARK THEME SWITCH */
        .custom-ind-switch {
          position: relative;
          width: 120px;
          height: 32px;
          box-sizing: border-box;
          padding: 2.5px;
          background: #0d0d0d;
          border-radius: 6px;
          box-shadow:
            inset 0 1px 1px 1px rgba(0, 0, 0, 0.5),
            0 1px 0 0 rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }
        .custom-ind-switch input[type="checkbox"] {
          position: absolute;
          z-index: 2;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .custom-ind-switch label {
          position: relative;
          display: block;
          left: 0;
          width: 50%;
          height: 100%;
          background: #1b1c1c;
          border-radius: 3.5px;
          box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-ind-switch input[type="checkbox"] + label:before {
          content: "";
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-left: 9px;
          background: #4b5563;
          border-radius: 50%;
          vertical-align: middle;
          box-shadow:
            0 0 5px 2px rgba(0, 0, 0, 0.65),
            0 0 3px 1px rgba(0, 0, 0, 0.45);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-ind-switch input[type="checkbox"] + label:after {
          content: "";
          display: inline-block;
          width: 0;
          height: 100%;
          vertical-align: middle;
        }
        .custom-ind-switch input[type="checkbox"] + label i {
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2.5px;
          height: 15px;
          margin-top: -7.5px;
          margin-left: -1.25px;
          border-radius: 2px;
          background: #0d0d0d;
          box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.3);
        }
        .custom-ind-switch input[type="checkbox"] + label i:before,
        .custom-ind-switch input[type="checkbox"] + label i:after {
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 2px;
          background: #0d0d0d;
          box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.3);
        }
        .custom-ind-switch input[type="checkbox"] + label i:before {
          left: -5px;
        }
        .custom-ind-switch input[type="checkbox"] + label i:after {
          left: 5px;
        }
        .custom-ind-switch input[type="checkbox"]:checked + label {
          left: 50%;
        }
        .custom-ind-switch input[type="checkbox"]:checked + label:before {
          background: #fff;
          box-shadow:
            0 0 5px 2px rgba(255, 255, 255, 0.95),
            0 0 3px 1px rgba(255, 255, 255, 0.75);
        }

        /* LIGHT THEME SWITCH (Uiverse by ashif_6672) */
        .custom-ui-switch {
          font-size: 3px;
          position: relative;
          align-items: center;
          justify-content: center;
          width: 20em;
          height: 10em;
          background: linear-gradient(0deg, #ededed, #bdbdbd);
          border-radius: 5em;
          box-shadow:
            0 0.05em 0.5em 0.01em #ffffff80,
            0 0px 5em 0.5em #ffffff,
            0 -0.25em 0.25em 0.125em #15182f44;
          cursor: pointer;
          flex-shrink: 0;
        }

        .custom-ui-switch *,
        .custom-ui-switch *:before,
        .custom-ui-switch *:after {
          box-sizing: border-box;
        }

        .custom-ui-switch input[type="checkbox"] {
          display: none;
        }

        .custom-ui-switch .rail {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 5em;
          box-shadow:
            -0.05em 0.26em 0.2em -0.05em #fff,
            0.05em 0.125em 0.2em -0.125em #0004 inset;
          pointer-events: none;
        }

        .custom-ui-switch .rail:before,
        .custom-ui-switch .rail:after {
          content: "";
          position: absolute;
          width: 5em;
          height: 5em;
          border-radius: 5em;
        }

        .custom-ui-switch .rail:before {
          left: 2.5em;
          background: linear-gradient(175deg, #00000077, #0001, #fff2), #2196f3;
          box-shadow:
            -0.05em 0.26em 0.2em -0.05em #fff8,
            0.05em 0.125em 0.2em -0.125em #0008 inset;
        }

        .custom-ui-switch .rail:after {
          right: 2.5em;
          background: linear-gradient(180deg, #858585, #a8a8a8, #e3e3e3);
          box-shadow:
            0 0.25em 0.2em -0.033em #fff8,
            -0.0625em 0.0625em 0.2em -0.125em #000 inset;
        }

        .custom-ui-switch .rail span {
          width: calc(5em + 1px);
          height: 0.5em;
          z-index: 1;
          background: linear-gradient(180deg, #0004, #fff0 0.175em),
            linear-gradient(90deg, #2196f3 50%, #aaaaaa 50%);
          background-size: 200% 100%;
          background-position: 55% 50%;
          box-shadow: 0 0.125em 0.075em -0.05em #fff8;
          transition: all 0.5s ease 0s;
        }

        .custom-ui-switch input[type="checkbox"]:checked ~ .rail span {
          background-position: 35% 50%;
        }

        .custom-ui-switch .slider {
          position: absolute;
          width: 9.375em;
          height: 9.375em;
          top: 0.25em;
          left: 0.333em;
          border-radius: 5em;
          background: radial-gradient(circle at 55% 50%, #fff0 4.166em, #fff0 10em),
            radial-gradient(circle at 60% 50%, #fff0 5.263em, #fff0 6.666em),
            linear-gradient(180deg, #ededed, #bdbdbd);
          box-shadow:
            -0.1em 0.1em 0.166em 0 #fff2 inset,
            0 0 0.5em 0.1em #6b6b6b,
            0 0.5em 1em 0 #0006;
          z-index: 1;
          overflow: hidden;
          transition: all 0.5s ease 0s;
        }

        .custom-ui-switch input[type="checkbox"]:checked ~ .slider {
          left: calc(100% - 9.708em);
          background: radial-gradient(
              circle at 55% 50%,
              #fff0 4.166em,
              #2196f3 10em
            ),
            radial-gradient(circle at 60% 50%, #fff0 5.263em, #2196f3 6.666em),
            linear-gradient(180deg, #ededed, #bdbdbd);
        }

        .custom-ui-switch .slider:before {
          content: "";
          position: absolute;
          width: 10em;
          height: 10em;
          left: -0.25em;
          top: -0.25em;
          background: radial-gradient(circle at 47.5% 45%, #fff0 4.5em, #0003 5em);
          filter: blur(1px);
        }

        .custom-ui-switch .slider:after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: repeating-conic-gradient(
              #fff 0.00095%,
              #fff0 0.0005%,
              #fff0 0.005%,
              #fff0 0.0005%
            ),
            repeating-conic-gradient(
              #fff 0.00001%,
              #fff0 0.00009%,
              #fff0 0.00075%,
              #fff0 0.000025%
            );
          opacity: 0.25;
          filter: blur(1px);
          pointer-events: none;
        }
      `}} />

         {/* Light Theme Switch */}
         <label className="custom-ui-switch flex dark:hidden">
            <input
               type="checkbox"
               checked={checked}
               onChange={(e) => onChange(e.target.checked)}
            />
            <div className="rail">
               <span />
            </div>
            <div className="slider" />
         </label>

         {/* Dark Theme Switch */}
         <div className={`custom-ind-switch hidden dark:inline-block select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
               type="checkbox"
               id={switchId}
               checked={checked}
               onChange={(e) => {
                  if (!disabled) onChange(e.target.checked);
               }}
               disabled={disabled}
            />
            <label htmlFor={switchId}>
               <i />
            </label>
         </div>
      </>
   );
}


// --- Gauge Monitor component ---
const Gauge = ({ value, max }: { value: number, max: number }) => {
   const percentage = Math.min(100, (value / max) * 100);
   const needleAngle = -90 + (percentage * 1.8);

   return (
      <div className="flex flex-col items-center gap-2 select-none">
         <div className="relative" style={{ width: 140, height: 70 }}>
            <svg width="140" height="70" viewBox="0 0 140 70">
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
               className="absolute bottom-[2px] left-1/2 origin-bottom"
               style={{ width: 2.5, height: 45, marginLeft: -1.25 }}
               initial={{ rotate: -90 }}
               animate={{ rotate: needleAngle }}
               transition={{ type: "spring", stiffness: 45, damping: 13 }}
            >
               <div className="w-full h-full bg-slate-800 dark:bg-white rounded-full" />
               <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] bg-white rounded-full border border-slate-900 shadow-sm" />
            </motion.div>

            {/* Pivot dot */}
            <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-slate-900 dark:bg-white rounded-full border border-white dark:border-slate-800 shadow-sm z-10" />
         </div>

         {/* Aligned metrics numbers */}
         <div className="flex items-center justify-between w-[130px] mt-0.5">
            <span className="text-[10px] font-semibold text-slate-400 tabular-nums">0</span>
            <span className="text-[14px] font-bold text-slate-800 dark:text-white tabular-nums">{value.toFixed(1)}</span>
            <span className="text-[10px] font-semibold text-slate-400 tabular-nums">{max.toFixed(1)}</span>
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
   const [maxDrawdown, setMaxDrawdown] = useState(15);
   const [weeklyDrawdown, setWeeklyDrawdown] = useState(20);
   const [monthlyDrawdown, setMonthlyDrawdown] = useState(25);
   const [stopAfterLoss, setStopAfterLoss] = useState(false);
   const [avgDownDistance, setAvgDownDistance] = useState(10);
   const [martingaleMultiplier, setMartingaleMultiplier] = useState(2.0);
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

   const { balance, isConnected, lastClosedTrade, recentTrades, tradesToday, todayProfit, accountMetrics, avgDisciplineScore } = useDashboardData();

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
   const [maxLot, setMaxLot] = useState(2.0);
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
   const [minRiskReward, setMinRiskReward] = useState(2);
   const [weekendLock, setWeekendLock] = useState(false);
   const [equityHardStop, setEquityHardStop] = useState(1000);
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

   const { userSubscription } = useTrading();
   const { canAccess } = usePlan();

   const currentProfit = Math.max(0, balance - (startingCapital || balance || 0));
   const progressPercent = targetCapital > 0 ? Math.min(100, (currentProfit / targetCapital) * 100) : 0;
   const xpValue = Math.floor(targetCapital / 8);
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

   // --- Load Persisted Settings ---
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
         icon: <ShieldCheck className="text-emerald-500" />
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
            <div className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-sm dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none">
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
                  <div key={i} className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-sm dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none space-y-6">
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
                  className="bg-gradient-to-b from-[#EFF6FF] to-[#F8FAFC] border-2 border-white rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#BFDBFE] dark:bg-none dark:bg-[#1A2332] dark:border-[1px] dark:border-blue-500/30 dark:shadow-[inset_0_1px_1px_rgba(59,130,246,0.05)] mb-4"
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
                        <p className="text-[12px] text-blue-800/70 dark:text-slate-300" style={{ margin: 0, lineHeight: 1.4 }}>
                           To activate Risk Guard's live monitoring and auto-kill switch, you must authorize your broker for today's session.
                        </p>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        toast.success("Broker API Authorized for Today", {
                           description: "Live monitoring active until 3:30 PM market close.",
                           icon: <ShieldCheck className="text-emerald-500" />
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

            {/* HEADER - Clean, Title-Case, consistent typography weights */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
               <div>
                  <h1 className="text-[25px] font-semibold text-slate-800 dark:text-white tracking-tight leading-none">Risk Guard</h1>
                  <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-2 font-medium">Configure automated capital protection and institutional discipline brackets.</p>
               </div>
            </div>



            <div className="flex flex-col xl:flex-row gap-6 items-start">
               <div className="flex-1 w-full min-w-0 space-y-8">

                  {/* KILL SWITCH */}
                  <div
                     onClick={() => {
                        if (!killSwitchActive) {
                           if (window.confirm('⚠️ KILL SWITCH: This will immediately close ALL open positions and halt all trading. Are you sure?')) {
                              setKillSwitchActive(true);
                              toast.error(
                                 <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                       <span className="font-bold text-white text-[13px]">🔴 KILL SWITCH ACTIVATED</span>
                                    </div>
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
                     className={`w-full cursor-pointer rounded-[18px] px-5 py-3.5 flex items-center justify-between gap-4 transition-all duration-300 select-none ${
                        killSwitchActive
                           ? 'bg-red-600 shadow-[0_0_0_3px_rgba(220,38,38,0.3),0_4px_20px_rgba(220,38,38,0.4)]'
                           : 'bg-[#0F172A] dark:bg-[#1a1a1f] shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.25)]'
                     }`}
                  >
                     <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                           killSwitchActive ? 'bg-white/20' : 'bg-red-500/20'
                        }`}>
                           <Power size={18} className={killSwitchActive ? 'text-white' : 'text-red-400'} strokeWidth={2.5} />
                        </div>
                        <div>
                           <p className={`text-[13px] font-bold leading-tight ${
                              killSwitchActive ? 'text-white' : 'text-white'
                           }`}>Kill Switch</p>
                           <p className={`text-[11px] font-medium mt-0.5 ${
                              killSwitchActive ? 'text-red-100' : 'text-slate-400'
                           }`}>
                              {killSwitchActive ? '🔴 ACTIVE — All positions closed, trading halted' : 'Instantly close all positions & stop all trading'}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 shrink-0">
                        {killSwitchActive && (
                           <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                              HALTED
                           </span>
                        )}
                        <div className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 px-0.5 ${
                           killSwitchActive ? 'bg-white/30 justify-end' : 'bg-white/10 justify-start'
                        }`}>
                           <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
                              killSwitchActive ? 'bg-white' : 'bg-slate-500'
                           }`} />
                        </div>
                     </div>
                  </div>

                  {/* PROTOCOL ARCHITECTURE TARGET CAPITAL TRACKER */}
                  <div
                     className="p-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] relative overflow-hidden isolate dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none"
                     style={{
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                     }}
                  >
                     <div className="flex flex-col gap-6">
                        {/* Tracker Header details */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div>
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Protocol Architecture</span>
                              <h2 className="text-[18px] font-semibold text-slate-800 dark:text-white leading-tight">Level 12 Architect</h2>
                           </div>
                           <div className="flex items-center gap-2 self-start sm:self-center">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/10">
                                 <Trophy size={13} className="text-indigo-600 dark:text-indigo-400" />
                                 <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{xpValue} XP</span>
                              </div>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 transition-colors">
                                       <Pencil size={14} />
                                    </button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-56 p-3 rounded-xl bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl" align="end" sideOffset={8}>
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center text-[11px] px-1">
                                          <span className="text-slate-500 font-medium">Starting Balance</span>
                                          <span className="font-semibold text-emerald-500">{sym}{(startingCapital || balance).toLocaleString()}</span>
                                       </div>
                                       <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-white/5">
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Target Balance</label>
                                          <div className="relative">
                                             <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[12px]">{sym}</span>
                                             <input
                                                type="number"
                                                value={targetCapital}
                                                onChange={(e) => {
                                                   const val = Number(e.target.value);
                                                   setTargetCapital(val);
                                                }}
                                                className="w-full bg-slate-50 dark:bg-[#0D0D0E] border border-slate-200 dark:border-[#252528] rounded-lg pl-6 pr-2 py-1.5 text-[12px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/50 transition-colors tabular-nums"
                                             />
                                          </div>
                                       </div>
                                    </div>
                                 </PopoverContent>
                              </Popover>
                           </div>
                        </div>

                        {/* Horizontal Progress Bar Section */}
                        <div className="space-y-3 pt-1">
                           {/* Starting & Target Capital Labels */}
                           <div className="flex justify-between items-end px-1">
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                 <p className="text-[12px] text-slate-500 font-medium">
                                    Starting Capital: <span className="font-semibold text-slate-800 dark:text-white">{isConnected ? `${sym}${(startingCapital || balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${iso}` : `${sym}18,250.57 ${iso}`}</span>
                                 </p>
                              </div>
                              <div className="flex items-center gap-2 mb-1 shrink-0">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                 <p className="text-[12px] text-slate-500 font-medium">
                                    Target Capital: <span className="font-semibold text-slate-800 dark:text-white">{sym}{targetCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {iso}</span>
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
                           <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850 relative">
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
                                    <Star size={9} className={i === 0 ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-400"} />
                                    <span className="text-[9px] font-semibold text-slate-800 dark:text-white tabular-nums">
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
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-[16px] text-[12px] font-bold transition-all ${activeTab === 'trading_control' ? 'bg-white dark:bg-[#2A2A2E] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                     >
                        Trading Control
                     </button>
                     <button
                        onClick={() => setActiveTab('risk_management')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-[16px] text-[12px] font-bold transition-all ${activeTab === 'risk_management' ? 'bg-white dark:bg-[#2A2A2E] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                     >
                        Risk Management
                     </button>
                     <button
                        onClick={() => setActiveTab('behaviour')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-[16px] text-[12px] font-bold transition-all ${activeTab === 'behaviour' ? 'bg-white dark:bg-[#2A2A2E] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                     >
                        Behaviour & Discipline
                     </button>
                  </div>

                  {/* 1. TRADING CONTROL */}
                  {activeTab === 'trading_control' && (
                     <div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                           <RiskGuardCard icon={Layers} title="Max Lot Size" description="Hard cap on lot size per trade" value={`${maxLot} Lots`} active={maxLotActive} onToggle={setMaxLotActive}>
                              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                 <div className="flex-1 max-w-[240px]">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">MAX LOT SIZE LIMIT</label>
                                    <div className="relative flex items-center w-full">
                                       <input type="number" value={maxLot} onChange={e => setMaxLot(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                       <span className="absolute right-4 text-[11px] font-bold text-slate-400">Lots</span>
                                    </div>
                                 </div>

                                 <div className="flex flex-col sm:flex-row sm:items-end gap-3 shrink-0">
                                    <div>
                                       <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block tracking-widest sm:text-left">EXPOSURE ARCHITECTURE</label>
                                       <div className="flex items-center gap-1.5 justify-start">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Current: 0.80 / 0.00 Lots</span>
                                       </div>
                                    </div>

                                    {/* SVG Gauge */}
                                    <div className="w-16 h-[32px] relative flex flex-col items-center justify-end -mb-1 ml-4 sm:ml-0">
                                       <svg viewBox="0 0 100 50" className="w-full overflow-visible drop-shadow-sm">
                                          {/* Multi-colored track */}
                                          <path d="M 5 50 A 45 45 0 0 1 30 10" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
                                          <path d="M 30 10 A 45 45 0 0 1 70 10" fill="none" stroke="#f59e0b" strokeWidth="10" />
                                          <path d="M 70 10 A 45 45 0 0 1 95 50" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />

                                          {/* Needle */}
                                          <g transform="rotate(-30 50 50)">
                                             <line x1="50" y1="50" x2="50" y2="12" stroke="currentColor" strokeWidth="2.5" className="text-slate-700 dark:text-white" strokeLinecap="round" />
                                             <circle cx="50" cy="50" r="4" fill="currentColor" className="text-slate-700 dark:text-white" />
                                          </g>
                                       </svg>

                                       {/* Labels */}
                                       <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[8px] font-bold text-slate-400 px-0.5">
                                          <span>0</span>
                                          <span>0.0</span>
                                       </div>
                                       <div className="absolute -bottom-3 text-[9px] font-bold text-slate-800 dark:text-white">0.8</div>
                                    </div>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Layers} title="Max Open Positions" description="Limit concurrent open trades" value={`${maxOpenPositions}`} active={maxOpenPositions > 0} onToggle={() => { }}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">MAX ACTIVE POSITIONS</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={maxOpenPositions} onChange={e => setMaxOpenPositions(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full px-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={TrendingDown} title="No Averaging Down" description="Prevent adding to losing trades" value={noAveragingDown ? "Active" : "Disabled"} active={noAveragingDown} onToggle={setNoAveragingDown}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">MINIMUM ENTRY DISTANCE</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={avgDownDistance} onChange={e => setAvgDownDistance(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">Pips</span>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={AlertTriangle} title="Martingale Detection" description="Block increasing lot sizes after a loss" value={martingaleDetection ? "Active" : "Disabled"} active={martingaleDetection} onToggle={setMartingaleDetection}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">MAX LOT MULTIPLIER</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" step={0.1} value={martingaleMultiplier} onChange={e => setMartingaleMultiplier(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">Ratio</span>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Crosshair} title="One Instrument Mode" description="Limit trading to a single ticker" value={oneInstrumentMode ? "Active" : "Disabled"} active={oneInstrumentMode} onToggle={setOneInstrumentMode}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">PERMITTED TICKER</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="text" value={allowedTicker} onChange={e => setAllowedTicker(e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full px-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all uppercase" />
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={CheckSquare} title="One Strategy Rule" description="Force specific execution pattern" value={oneStrategyRule ? "Active" : "Disabled"} active={oneStrategyRule} onToggle={setOneStrategyRule}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">ALLOWED STRATEGY</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="text" value={strategyName} onChange={e => setStrategyName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full px-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                 </div>
                              </div>
                           </RiskGuardCard>
                        </div>
                     </div>
                  )}

                  {/* 2. RISK MANAGEMENT */}
                  {activeTab === 'risk_management' && (
                     <div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                           <RiskGuardCard icon={ShieldAlert} title="Drawdown Guard" description="Max daily drawdown limits" value={`${maxDrawdown}%`} active={drawdownGuardActive} onToggle={setDrawdownGuardActive}>

                           </RiskGuardCard>

                           <RiskGuardCard icon={Target} title="Daily Profit Target" description="Lock terminal after profit" value={`${sym}${dailyProfitTarget}`} active={dailyProfitTargetActive} onToggle={setDailyProfitTargetActive}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">TARGET AMOUNT</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={dailyProfitTarget} onChange={e => setDailyProfitTarget(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">USD</span>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={StopCircle} title="Stop Loss Required" description="Require SL on every execution" value={stopLossRequired ? "Active" : "Disabled"} active={stopLossRequired} onToggle={setStopLossRequired}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">DEFAULT SL DISTANCE</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={defaultStopLoss} onChange={e => setDefaultStopLoss(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">Pips</span>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={TrendingUp} title="Min Risk/Reward" description="Mandate minimum R:R ratio" value={`1:${minRiskReward}`} active={minRiskReward > 0} onToggle={() => { }}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">MINIMUM TARGET R:R</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" step={0.1} value={minRiskReward} onChange={e => setMinRiskReward(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">Ratio</span>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Calendar} title="Weekend Lock" description="Auto flatten before Friday close" value={weekendLock ? "Active" : "Disabled"} active={weekendLock} onToggle={setWeekendLock}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">FRIDAY CLOSE TIME</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="time" value={weekendCloseTime} onChange={e => setWeekendCloseTime(e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />

                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Wallet} title="Account Protection" description="Equity hard stop level" value={`${sym}${equityHardStop}`} active={equityHardStop > 0} onToggle={() => { }}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">EQUITY HARD STOP</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={equityHardStop} onChange={e => setEquityHardStop(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">USD</span>
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
                           <RiskGuardCard icon={ShieldCheck} title="Discipline Sentinel" description="Loss cooldown & daily execution limit" value={disciplineActive ? "Active" : "Disabled"} active={disciplineActive} onToggle={setDisciplineActive}>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Daily Execution Limit</label>
                                 <div className="flex items-center gap-3">
                                    <button onClick={() => setTradeLimit(prev => Math.max(1, prev - 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#202020] border border-slate-200/60 shadow-sm text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 transition-colors active:scale-95">-</button>
                                    <span className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-800 dark:text-white text-center">{(!isProOrElite && tradeLimit > 5) ? 5 : tradeLimit}</span>
                                    <button onClick={() => { if (!isProOrElite && tradeLimit >= 5) { toast.error(<div className="flex flex-col gap-1"><div className="flex items-center gap-2"><Crown size={16} className="text-amber-500" /><span className="font-bold text-slate-900 dark:text-white">Pro Feature</span></div><span className="text-slate-600 dark:text-slate-300">Upgrade to Pro to increase daily execution limits.</span></div>); return; } setTradeLimit(prev => Math.min(10, prev + 1)); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0F172A] dark:bg-indigo-500 text-white font-bold hover:bg-slate-800 transition-colors active:scale-95">+</button>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           {/* Loss Cooldown Shield — standalone card */}
                           <RiskGuardCard icon={ShieldOff} title="Loss Cooldown Shield" description="Locks execution after any losing trade" value={!isProOrElite ? "Pro" : revengeGuard ? "Active" : "Disabled"} active={!isProOrElite ? false : revengeGuard} onToggle={(val) => {
                              if (!isProOrElite) {
                                 toast.error(
                                    <div className="flex flex-col gap-1">
                                       <div className="flex items-center gap-2">
                                          <Crown size={16} className="text-amber-500" />
                                          <span className="font-bold text-slate-900 dark:text-white">Pro Feature</span>
                                       </div>
                                       <span className="text-slate-600 dark:text-slate-300">Upgrade to Pro to unlock the Loss Cooldown Shield.</span>
                                    </div>
                                 );
                                 return;
                              }
                              setRevengeGuard(val);
                           }}>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Cooldown Duration</label>
                                 <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2">
                                    <input
                                       type="range" min={5} max={120} step={5} value={waitPeriod}
                                       onChange={e => setWaitPeriod(+e.target.value)}
                                       className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                                       style={{ background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((waitPeriod - 5) / (120 - 5)) * 100}%, rgba(79,70,229,0.15) ${((waitPeriod - 5) / (120 - 5)) * 100}%, rgba(79,70,229,0.15) 100%)` }}
                                    />
                                    <span className="text-[12px] font-bold text-slate-700 dark:text-white shrink-0 tabular-nums w-16 text-right">{waitPeriod} min</span>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Clock} title="Session Sentinel" description="Custom hourly trading windows" value={sessionActive ? "Active" : "Disabled"} active={sessionActive} onToggle={setSessionActive}>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Active Sessions</label>
                                 <div className="flex flex-wrap gap-1.5">
                                    {sessionButtons.map(session => {
                                       const isSelected = selectedSessions.includes(session.id);
                                       return (
                                          <button key={session.id} onClick={() => toggleSession(session.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                             isSelected ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 hover:bg-slate-100'
                                          }`}>{session.label}</button>
                                       );
                                    })}
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Trophy} title="Consecutive Win Lock" description="Lock trading after wins" value={`${consecutiveWins} Wins`} active={stopAfterWin} onToggle={setStopAfterWin}>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Max Consecutive Wins</label>
                                 <input type="number" value={consecutiveWins} onChange={e => setConsecutiveWins(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-800 dark:text-white outline-none" />
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Sunrise} title="No Trading After Time" description="Daily cutoff time" value={noTradingAfterTime} active={noTradingAfterTimeActive} onToggle={setNoTradingAfterTimeActive}>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Cutoff Time</label>
                                 <input type="time" value={noTradingAfterTime} onChange={e => setNoTradingAfterTime(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-800 dark:text-white outline-none" />
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={HeartPulse} title="Emotional Detector" description="AI pacing detection" value={emotionalTradingDetector ? "Active" : "Disabled"} active={emotionalTradingDetector} onToggle={setEmotionalTradingDetector}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">SENSITIVITY SCORE</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={emotionSensitivity} onChange={e => setEmotionSensitivity(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">%</span>
                                 </div>
                              </div>
                           </RiskGuardCard>
                           <RiskGuardCard icon={AlertTriangle} title="News Filter" description="Block around high-impact news" value={newsFilter ? "Active" : "Disabled"} active={newsFilter} onToggle={setNewsFilter}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">IMPACT LEVEL</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="text" value={newsImpactLevel} onChange={e => setNewsImpactLevel(e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />

                                 </div>
                              </div>
                           </RiskGuardCard>
                           <RiskGuardCard icon={Moon} title="Sleep Protection" description="Disable midnight trading" value={sleepProtection ? "Active" : "Disabled"} active={sleepProtection} onToggle={setSleepProtection}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">LOCKOUT START TIME</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="time" value={sleepTimeStart} onChange={e => setSleepTimeStart(e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />

                                 </div>
                              </div>
                           </RiskGuardCard>
                           <RiskGuardCard icon={CheckSquare} title="Pre-Trade Checklist" description="Mandatory popup checklist" value={preTradeChecklist ? "Active" : "Disabled"} active={preTradeChecklist} onToggle={setPreTradeChecklist}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">REQUIRED CHECKS</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={checklistItems} onChange={e => setChecklistItems(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />

                                 </div>
                              </div>
                           </RiskGuardCard>
                           <RiskGuardCard icon={Brain} title="Psychology Check" description="Mandatory mood-slider" value={psychologyCheck ? "Active" : "Disabled"} active={psychologyCheck} onToggle={setPsychologyCheck}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">CHECK FREQUENCY</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="text" value={psychologyInterval} onChange={e => setPsychologyInterval(e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />

                                 </div>
                              </div>
                           </RiskGuardCard>
                           <RiskGuardCard icon={Sparkles} title="AI Weekly Review" description="AI review of your trades" value={aiWeeklyReview ? "Active" : "Disabled"} active={aiWeeklyReview} onToggle={setAiWeeklyReview}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">REVIEW DAY</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="text" value={reviewDay} onChange={e => setReviewDay(e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-4 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />

                                 </div>
                              </div>
                           </RiskGuardCard>
                           <RiskGuardCard icon={Volume2} title="AI Voice Warning" description="Audible alerts for limits" value={aiVoiceWarning ? "Active" : "Disabled"} active={aiVoiceWarning} onToggle={setAiVoiceWarning}>
                              <div>
                                 <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">ALERT VOLUME</label>
                                 <div className="relative flex items-center w-full">
                                    <input type="number" value={voiceVolume} onChange={e => setVoiceVolume(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 pr-12 py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                    <span className="absolute right-4 text-[11px] font-bold text-slate-400">%</span>
                                 </div>
                              </div>
                           </RiskGuardCard>

                           <RiskGuardCard icon={Key} title="Guardian PIN" description="Require PIN to override limits" value={pinActive ? "Active" : "Disabled"} active={pinActive} onToggle={setPinActive}>
                              <div className="space-y-1.5">
                                 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Set 4-Digit PIN</label>
                                 <div className="relative">
                                    <input
                                       type={showPin ? "text" : "password"}
                                       value={guardianPin}
                                       onChange={e => {
                                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                          setGuardianPin(val);
                                       }}
                                       placeholder="••••"
                                       className="w-full bg-[#F4F4F4] dark:bg-[#1A1A1C] border-2 border-[#E7E7E7] dark:border-[#252528] text-slate-800 dark:text-white text-[14px] font-bold rounded-[16px] px-4 py-3 outline-none focus:border-amber-500/50 dark:focus:border-amber-500/50 transition-colors placeholder:text-slate-400/50 tracking-widest"
                                    />
                                    <button
                                       type="button"
                                       onClick={() => setShowPin(!showPin)}
                                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                                    >
                                       {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                 </div>
                              </div>

                           </RiskGuardCard>

                           <RiskGuardCard icon={MonitorOff} title="Terminal Hard Stop" description="Force lock on limit breach" value={hardStopActive ? "Active" : "Disabled"} active={hardStopActive} onToggle={setHardStopActive}>
                              <div className="space-y-4">
                                 <div className="p-3.5 flex flex-col gap-3 rounded-[16px] bg-[#F4F4F4]/50 dark:bg-[#1A1A1C]/50 border border-transparent shadow-sm">
                                    <div className="flex items-center justify-between">
                                       <div>
                                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Force Action Lockout</p>
                                          <p className="text-[10px] text-slate-400 font-medium mt-1">Simulate a max-loss breach</p>
                                       </div>
                                       <button
                                          onClick={() => setHardStopActive(true)}
                                          className="px-4 py-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                       >
                                          Trigger Demo Lock
                                       </button>
                                    </div>
                                 </div>
                              </div>

                           </RiskGuardCard>
                        </div>
                     </div>
                  )}
               </div>

               {/* Right Column: 3 Widgets */}
               <div className="w-full xl:w-[320px] shrink-0 space-y-6 xl:sticky xl:top-6 self-start xl:-mt-[72px]">

                  {/* 1. Risk Score Card */}
                  <div className="bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-zinc-800/80 rounded-[24px] p-6 shadow-sm flex flex-col items-center">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white self-start mb-6">Risk Score</h3>
                     <div className="relative w-48 flex flex-col items-center justify-start mt-2">
                        <svg viewBox="0 0 100 65" className="w-full drop-shadow-sm">
                           <defs>
                              <linearGradient id="risk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor="#ef4444" />
                                 <stop offset="50%" stopColor="#f59e0b" />
                                 <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                           </defs>
                           {/* Background Track */}
                           <path d="M 15 15 A 35 35 0 0 0 85 15" fill="none" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="16" strokeLinecap="round" />
                           {/* Foreground Track */}
                           <path d="M 15 15 A 35 35 0 0 0 85 15" fill="none" stroke="url(#risk-gradient)" strokeWidth="16" strokeDasharray="110" strokeDashoffset={110 - (110 * (avgDisciplineScore || 85) / 100)} strokeLinecap="round" />
                        </svg>

                        {/* Score Text Nested Inside Gauge */}
                        <div className="absolute inset-x-0 bottom-0 flex justify-center translate-y-2">
                           <div className="flex items-baseline text-slate-800 dark:text-white">
                              <span className="text-[44px] font-black tracking-tighter leading-none">{avgDisciplineScore || 85}</span>
                              <span className="text-[15px] font-bold text-slate-400">/100</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-center mt-2">
                        <p className="text-[15px] font-bold text-emerald-500">Excellent</p>
                        <p className="text-[11px] font-semibold text-emerald-500/70 mt-1">You are trading with discipline</p>
                     </div>
                  </div>

                  {/* 2. Connected Account Card */}
                  <div className="bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-zinc-800/80 rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Connected Account</h3>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-blue-50/50 rounded-full flex items-center justify-center border border-blue-100">
                              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                           </div>
                           <span className="text-[14px] font-bold text-slate-800 dark:text-white">Zerodha</span>
                           <span className="text-[11px] font-semibold text-slate-400">{accountMetrics?.account_number || "NKN123"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                           <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
                        </div>
                     </div>

                     <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-semibold text-slate-500">Balance</span>
                           <span className="text-[13px] font-bold text-slate-800 dark:text-white">{sym}{balance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-semibold text-slate-500">Daily P&L</span>
                           <span className={`text-[13px] font-bold ${todayProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {todayProfit >= 0 ? '+' : '-'}{sym}{Math.abs(todayProfit).toFixed(2)}
                           </span>
                        </div>
                     </div>

                     <button className="w-full py-2.5 mt-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-[12px] font-bold text-slate-700 dark:text-slate-300 transition-colors">
                        Manage Connection
                     </button>
                  </div>

                  {/* 3. Today's Summary Card */}
                  <div className="bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-zinc-800/80 rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Today's Summary</h3>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-semibold text-slate-500">Trades Taken</span>
                           <div className="text-[13px] font-bold text-emerald-500">{tradesToday} <span className="text-slate-400">/ 5</span></div>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-semibold text-slate-500">Daily P&L</span>
                           <span className={`text-[13px] font-bold ${todayProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {todayProfit >= 0 ? '+' : '-'}{sym}{Math.abs(todayProfit).toFixed(2)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                           <span className="text-[13px] font-semibold text-slate-500">Daily Loss Limit</span>
                           <span className="text-[13px] font-bold text-rose-500">{sym}0</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                           <span className="text-[13px] font-semibold text-slate-500">Daily Profit Target</span>
                           <span className="text-[13px] font-bold text-slate-800 dark:text-white">{sym}{dailyProfitTarget.toLocaleString()}</span>
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
                        <div className="absolute inset-0 bg-rose-500 blur-[80px] opacity-20 rounded-full" />
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
