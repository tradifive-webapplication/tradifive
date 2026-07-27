import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Zap,
  ShieldAlert,
  Search,
  Sparkles,
  ChevronRight,
  User,
  ShieldCheck,
  AlertTriangle,
  Flame,
  MessageCircle,
  BarChart3,
  Clock,
  Info,
  Share2,
  ChevronDown,
  LayoutGrid,
  BarChart2,
  BrainCircuit,
  TrendingDown,
  Target,
  Brain,
  Trophy,
  Focus,
  Plus,
  QrCode,
  X,
  Download,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, YAxis, Tooltip, AreaChart, Area, XAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { usePlan } from '@/hooks/usePlan';
import { useMarket } from '@/contexts/MarketContext';
import { Tooltip as UITooltip, TooltipContent as UITooltipContent, TooltipProvider as UITooltipProvider, TooltipTrigger as UITooltipTrigger } from "@/components/ui/tooltip";
import { InfoCircle as IconlyInfoCircle, Activity as IconlyActivity, Setting as IconlySetting, Discovery as IconlyDiscovery, TicketStar as IconlyTicketStar, Calendar as IconlyCalendar, Message as IconlyMessage, Danger as IconlyDanger, Graph as IconlyGraph, ShieldDone as IconlyShieldDone, Document as IconlyDocument } from "react-iconly";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTrading } from "@/contexts/TradingContext";
import PerformanceChart from "@/components/charts/PerformanceChart";
import WinLossChart from "@/components/charts/WinLossChart";

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] border-2 border-white rounded-[22px] p-5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] premium-flat-card transition-all dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none ${className}`}
  >
    {children}
  </motion.div>
);

const SimpleSparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-[35px] w-[70px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill="transparent" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const CircularProgress = ({ percentage, value, label, title = "Total Exposure" }: { percentage: number, value: string, label: string, title?: string }) => {
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform rotate-[135deg]">
        <circle
          cx="96" cy="96" r={radius}
          stroke="currentColor" strokeWidth="12" fill="transparent"
          strokeDasharray={`${arcLength} ${circumference}`}
          className="text-slate-100 dark:text-white/5"
          strokeLinecap="round"
        />
        <motion.circle
          cx="96" cy="96" r={radius}
          stroke="#10B981" strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round" fill="transparent"
          style={{ filter: "drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
        <span className="text-[10px] font-bold text-slate-400 mb-1">{title}</span>
        <span className="text-[28px] font-bold text-emerald-500 tracking-tight">{value}</span>
        <span className="text-[10px] font-medium text-slate-400 mt-1">{label}</span>
      </div>
    </div>
  );
};

const DisciplineScoreGauge = ({ loading }: { loading?: boolean }) => {
  const { drawdownDollar, drawdownLimitDollar, tradesToday } = useDashboardData();
  const { isConnected } = useTrading();
  
  const [mockScore, setMockScore] = useState(85);

  useEffect(() => {
    if (isConnected) return;
    const interval = setInterval(() => {
      setMockScore(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(70, Math.min(100, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Calculate discipline score
  const score = useMemo(() => {
    if (!isConnected) return mockScore;

    let s = 100;
    // Calculate drawdown % (relative to limit if limit is 0 we use 100 as base)
    const drawdownPct = drawdownLimitDollar > 0 ? (drawdownDollar / drawdownLimitDollar) * 100 : 0;
    
    // Penalize high drawdown (e.g., > 20% of limit)
    if (drawdownPct > 20) s -= (drawdownPct - 20) * 0.5;
    
    // Penalize overtrading (e.g., > 10 trades starts deducting)
    if (tradesToday > 10) s -= (tradesToday - 10) * 3;
    
    // Ensure it doesn't drop below 0 or exceed 100
    return Math.max(0, Math.min(100, Math.round(s)));
  }, [isConnected, mockScore, drawdownDollar, drawdownLimitDollar, tradesToday]);

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.5; // Semi-circle
  const strokeDashoffset = arcLength - (score / 100) * arcLength;
  
  let statusColor = "text-emerald-500";
  let statusBg = "bg-emerald-500/10";
  let statusBorder = "border-emerald-500/20";
  let statusText = "Excellent";
  
  if (score < 50) {
    statusColor = "text-rose-500";
    statusBg = "bg-rose-500/10";
    statusBorder = "border-rose-500/20";
    statusText = "Poor";
  } else if (score < 80) {
    statusColor = "text-orange-500";
    statusBg = "bg-orange-500/10";
    statusBorder = "border-orange-500/20";
    statusText = "Needs Focus";
  }

  return (
    <GlassCard className="p-5 relative overflow-hidden flex flex-col items-center justify-between h-full min-h-[220px]">
      <div className="w-full flex justify-between items-start mb-2">
        <h2 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-[0.1em] uppercase flex items-center gap-2">
          <BrainCircuit size={14} className="text-emerald-500" />
          Discipline Score
        </h2>
        <div className={`px-3 py-1.5 rounded-md border ${statusBg} ${statusBorder} flex items-center gap-2`}>
           <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{statusText}</span>
        </div>
      </div>
      
      {loading ? (
         <Skeleton className="w-32 h-20 bg-slate-200 dark:bg-white/10 rounded-t-full animate-pulse mt-4" />
      ) : (
        <div className="relative flex flex-col items-center mt-2 w-full">
          <div className="relative w-full max-w-[200px] aspect-[2/1] overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 192 96">
              <path
                d="M 31 96 A 65 65 0 0 1 161 96"
                stroke="currentColor" strokeWidth="12" fill="transparent"
                className="text-slate-200 dark:text-slate-800"
                strokeLinecap="round"
              />
              <motion.path
                d="M 31 96 A 65 65 0 0 1 161 96"
                stroke={score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#F43F5E"}
                strokeWidth="12"
                strokeDasharray={204.2}
                initial={{ strokeDashoffset: 204.2 }}
                animate={{ strokeDashoffset: 204.2 - (score / 100) * 204.2 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round" fill="transparent"
                style={{ filter: `drop-shadow(0 0 8px ${score >= 80 ? "rgba(16, 185, 129, 0.4)" : score >= 50 ? "rgba(245, 158, 11, 0.4)" : "rgba(244, 63, 94, 0.4)"})` }}
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-1">
              <span className="text-[32px] font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                {score}
              </span>
            </div>
          </div>
          
          <div className="w-full mt-5 px-1">
            {/* High-tech Segmented Gauge */}
            <div className="flex gap-[3px] h-5 items-end w-full">
              {Array.from({ length: 40 }).map((_, i) => {
                const threshold = (i / 40) * 100;
                const isActive = score >= threshold;
                
                let segmentColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
                if (threshold >= 80) segmentColor = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]";
                else if (threshold >= 50) segmentColor = "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]";

                return (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-[1px] transition-all duration-300 ${
                      isActive ? segmentColor : 'bg-slate-200 dark:bg-slate-800/80'
                    }`}
                    style={{
                      height: isActive ? '100%' : '40%',
                      opacity: isActive ? 1 : 0.3
                    }}
                  />
                );
              })}
            </div>
            {/* Axis markers */}
            <div className="flex justify-between items-center mt-2 px-0.5">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Poor</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avg</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pro</span>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

const SessionIntensityGauge = ({ loading }: { loading?: boolean }) => {
  const [heatScore, setHeatScore] = useState(30);

  // Simulate live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setHeatScore(prev => {
        // Randomly fluctuate between -5 and +8
        const change = Math.floor(Math.random() * 14) - 5;
        let next = prev + change;

        // Random 5% chance of a high-frequency spike
        if (Math.random() > 0.95) next = 85;

        if (next < 0) next = 5;
        if (next > 100) next = 100;
        return next;
      });
    }, 2500); // Updates every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  let statusColor = "text-emerald-500";
  let statusBg = "bg-emerald-500/10";
  let statusBorder = "border-emerald-500/20";
  let statusText = "Optimal";
  
  if (heatScore >= 80) {
    statusColor = "text-rose-500";
    statusBg = "bg-rose-500/10";
    statusBorder = "border-rose-500/20";
    statusText = "Overtrading Risk";
  } else if (heatScore >= 60) {
    statusColor = "text-orange-500";
    statusBg = "bg-orange-500/10";
    statusBorder = "border-orange-500/20";
    statusText = "Elevated Activity";
  } else if (heatScore >= 30) {
    statusColor = "text-blue-500";
    statusBg = "bg-blue-500/10";
    statusBorder = "border-blue-500/20";
    statusText = "Active Flow";
  }

  return (
    <GlassCard className="p-5 relative overflow-hidden group">
      {heatScore >= 80 && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-1000"></div>
      )}
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-[0.1em] uppercase flex items-center gap-2">
            Session Intensity
            {heatScore >= 80 && <Flame size={12} className="text-rose-500 animate-pulse" />}
          </h2>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${heatScore >= 80 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            Live Execution Velocity
          </span>
        </div>
        
        <div className={`px-3 py-1.5 rounded-md border ${statusBg} ${statusBorder} flex items-center gap-2`}>
           <Focus size={12} className={statusColor} />
           <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{statusText}</span>
        </div>
      </div>

      {loading ? (
        <Skeleton className="w-full h-12 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
      ) : (
        <div className="relative z-10 mb-2">
          {/* Main Number Display */}
          <div className="flex items-end gap-1 mb-3">
             <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
               {heatScore}
             </span>
             <span className="text-sm font-bold text-slate-400 mb-1">%</span>
          </div>

          {/* High-tech Segmented Gauge */}
          <div className="flex gap-[3px] h-8 items-end">
            {Array.from({ length: 40 }).map((_, i) => {
              const threshold = (i / 40) * 100;
              const isActive = heatScore >= threshold;
              
              let segmentColor = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]";
              if (threshold > 80) segmentColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
              else if (threshold > 60) segmentColor = "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]";
              else if (threshold > 30) segmentColor = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]";

              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-[1px] transition-all duration-300 ${
                    isActive 
                      ? segmentColor 
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  style={{
                    height: isActive ? '100%' : '40%',
                    opacity: isActive ? 1 : 0.3
                  }}
                />
              );
            })}
          </div>
          
          {/* Axis markers */}
          <div className="flex justify-between items-center mt-2 px-1">
             <span className="text-[9px] font-bold text-slate-400">0%</span>
             <span className="text-[9px] font-bold text-slate-400">50%</span>
             <span className="text-[9px] font-bold text-slate-400">100%</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {heatScore >= 80 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-6 overflow-hidden z-10 relative"
          >
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 shadow-[0_4px_20px_rgba(244,63,94,0.1)] backdrop-blur-md flex gap-4 relative overflow-hidden items-start group hover:bg-rose-500/10 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-rose-500/30 transition-colors"></div>
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0 relative z-10 border border-rose-500/30">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div className="relative z-10 flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    Kimi AI
                    <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black shadow-sm">Warning</span>
                  </p>
                  <span className="text-[10px] font-bold text-rose-500/70 uppercase">Just now</span>
                </div>
                <p className="text-[12px] text-rose-800 dark:text-rose-200/80 font-medium leading-relaxed">
                  Execution velocity has spiked into high-frequency territory. Recommend a 5-minute cooldown away from charts before Revenge Guard triggers a mandatory lock.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

const DefenseProtocols = ({ loading }: { loading?: boolean }) => {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <IconlyShieldDone set="curved" primaryColor="currentColor" size={20} className="text-[#10b981]" />
          <h2 className="text-[13px] font-bold text-slate-800 dark:text-white tracking-[0.1em] uppercase">Terminal Defense</h2>
        </div>
        <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest bg-[#ecfdf5] dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-md border border-[#a7f3d0] dark:border-emerald-500/20">All Systems Armed</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-[#262626]">
              <div className="flex items-center gap-3 w-full animate-pulse">
                <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3 bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1A1C] border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 group cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <IconlyDanger set="curved" primaryColor="currentColor" size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white transition-colors">Risk Guard</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Auto-Flatten</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1A1C] border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 group cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <TrendingDown size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white transition-colors">Drawdown</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Hard Limit Active</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1A1C] border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 group cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <IconlyActivity set="curved" primaryColor="currentColor" size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white transition-colors">Slippage</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Max 2.0 Pips</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1A1C] border border-slate-100 dark:border-slate-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 group cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <Zap size={16} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white transition-colors">News Filter</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Block ┬▒15m</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

// --- Mock Data ---
const MOCK_SPARKLINE: any[] = [];

const ShareModal = ({ trade, onClose }: { trade: any, onClose: () => void }) => {
  if (!trade) return null;

  const netString = trade.net || trade.pnl || "+0.00";
  const isProfit = netString.startsWith('+');
  const themeColor = isProfit ? "#22C55E" : "#EF4444";
  const bgImage = isProfit ? "/Profit_2.jpeg" : "/loss 2 .jpeg";

  const netValue = parseFloat(netString.replace(/[^0-9.-]+/g, "")) || 0;
  const roiValue = isProfit ? `+${(netValue * 15.3).toFixed(2)}%` : `-${(Math.abs(netValue) * 15.3).toFixed(2)}%`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[420px] rounded-[32px] overflow-hidden bg-black text-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-6 z-30 p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={20} className="text-white/40" />
        </button>

        <div className="relative w-full aspect-[0.85/1] select-none flex flex-col bg-black">

          {/* Header Section */}
          <div className="px-8 pt-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-[22px] font-bold tracking-tight">TradiFive</span>
              </div>
              <div className="ml-2 px-3 py-1 bg-[#222222] rounded-full text-[12px] font-bold text-white/80">
                Demo
              </div>
            </div>
            <span className="text-[14px] font-medium text-white/40 tabular-nums">
              Shared on {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>

          {/* Asset & ROI Section */}
          <div className="px-8 pt-4 space-y-4">
            {/* Asset */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#3B82F6] rounded flex items-center justify-center text-[14px] font-black text-white">
                {(trade.asset || "A").charAt(0)}
              </div>
              <h1 className="text-[28px] font-bold tracking-tight text-white">{trade.asset || "Asset"}</h1>
            </div>

            {/* ROI */}
            <div className="space-y-1">
              <span className="text-[16px] font-medium text-white/40">Unrealised ROI</span>
              <div
                className="text-[72px] font-black leading-none tracking-tighter"
                style={{ color: themeColor }}
              >
                {roiValue}
              </div>
            </div>
          </div>

          {/* Prices Section */}
          <div className="px-8 py-8 space-y-4 relative z-10">
            <div className="space-y-1.5">
              <span className="text-[15px] font-medium text-white/40">Open Price</span>
              <div className="text-[26px] font-bold tabular-nums text-white">{trade.entry || "0.00"}</div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[15px] font-medium text-white/40">Current Price</span>
              <div className="text-[26px] font-bold tabular-nums text-white">{trade.exit || "0.00"}</div>
            </div>
          </div>

          {/* Background Image (Lower half) */}
          <div className="absolute inset-x-0 bottom-[140px] top-[40%] z-0 pointer-events-none">
            <img
              src={bgImage}
              alt="Background"
              className="w-full h-full object-cover opacity-80"
              style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%)' }}
            />
          </div>

          {/* Footer Section */}
          <div className="mt-auto px-8 py-8 bg-black/80 backdrop-blur-sm border-t border-white/5 flex items-end justify-between relative z-10">
            <div className="space-y-1.5">
              <div className="text-[18px] font-medium text-white">
                Referral Code: <span className="font-bold text-white tracking-widest">072SE5</span>
              </div>
              <p className="text-[14px] text-white/40 font-medium">
                Keep the returns coming! Trade on TradiFive App.
              </p>
            </div>

            <div className="w-[84px] h-[84px] bg-white rounded-xl p-1.5 flex items-center justify-center shadow-2xl">
              <QrCode size={72} className="text-black" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Minimalist Action Controls */}
        <div className="p-5 bg-black border-t border-white/5 flex items-center justify-center gap-8">
          <button className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center text-white/60">
            <Download size={22} />
          </button>
          <button
            className="w-12 h-12 rounded-full text-white transition-all shadow-xl flex items-center justify-center"
            style={{ backgroundColor: isProfit ? '#2563EB' : '#DC2626' }}
          >
            <Share2 size={22} />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center text-white/60">
            <MoreHorizontal size={22} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const LiveNewsFeed = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://corsproxy.io/?url=https%3A%2F%2Fnfs.faireconomy.media%2Fff_calendar_thisweek.json');
        const data = await res.json();

        // Filter high impact and upcoming events
        const highImpact = data
          .filter((item: any) => item.impact === 'High' || item.impact === 'Medium')
          .filter((item: any) => new Date(item.date).getTime() > Date.now() - 6 * 60 * 60 * 1000) // from last 6 hours onwards
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 4); // show top 4

        setNews(highImpact);
      } catch (err) {
        console.error('Failed to fetch news', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="flex flex-col p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-widest uppercase">Live Market News</h2>
          <div className="bg-rose-500/20 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
            LIVE
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 pt-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-[#262626] last:border-0">
              <Skeleton className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-0 pt-2">
          {news.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400 text-[12px] py-6">
              No major impact news upcoming this week.
            </div>
          ) : (
            news.map((item: any, idx: number) => {
              const eventDate = new Date(item.date);
              const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const isToday = eventDate.toDateString() === new Date().toDateString();

              const isHigh = item.impact === 'High';
              const iconClass = isHigh ? "text-rose-500 border-rose-500/50 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "text-amber-500 border-amber-500/50 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]";

              return (
                <div key={idx} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-[#262626] last:border-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-[1.5px] flex flex-col items-center justify-center ${iconClass}`}>
                    <span className="text-[10px] font-black">{item.country}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-1">{item.title}</p>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                      <span className={isToday ? (isHigh ? "text-rose-500" : "text-amber-500") : ""}>{isToday ? "Today" : dateStr}, {timeStr}</span>
                      {item.forecast && (
                        <>
                          <span>ΓÇó</span>
                          <span>FC: {item.forecast}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default function Dashboard() {
  const { activeMarket } = useMarket();
  const { isStarter: _isStarter } = usePlan();
  const isStarter = false; // Mock unlocked
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  const dynamicTooltipStyle = useMemo(() => {
    if (isDark) {
      return {
        backgroundColor: "#1A1A1C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
        fontSize: "12px",
        fontWeight: "600",
        color: "#fff",
      };
    }
    return {
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      fontSize: "12px",
      fontWeight: "600",
      color: "#0f172a",
    };
  }, [isDark]);

  const {
    todayProfit: rawTodayProfit,
    totalProfit: rawTotalProfit,
    tradesToday: rawTradesToday,
    winRate: rawWinRate,
    loading,
    recentTrades: rawRecentTrades,
    balance: rawBalance,
    equity: rawEquity,
    accountMetrics: rawAccountMetrics,
    isConnected,
    avgDisciplineScore: rawAvgDisciplineScore,
    dailyXpEarned: rawDailyXpEarned,
    riskConfig: rawRiskConfig,
    breachLogs
  } = useDashboardData();

  const isDemo = !isConnected;

  const todayProfit = isDemo ? 124.50 : (rawTodayProfit || 0);
  const totalProfit = isDemo ? 3240.75 : (rawTotalProfit || 0);
  const tradesToday = isDemo ? 3 : (rawTradesToday || 0);
  const winRate = isDemo ? 68 : (rawWinRate || 0);
  const balance = isDemo ? 103240.75 : (rawBalance || 0);
  const equity = isDemo ? 103240.75 : (rawEquity || 0);
  const avgDisciplineScore = isDemo ? 92 : (rawAvgDisciplineScore || 0);
  const dailyXpEarned = isDemo ? 150 : (rawDailyXpEarned || 0);

  const riskConfig = isDemo
    ? { max_open_trades: 5, max_daily_loss_percent: 5.0 }
    : (rawRiskConfig || { max_open_trades: 0, max_daily_loss_percent: 0 });

  const mockRecentTrades = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const profit = [120.00, -50.00, 310.50, 45.00, -110.00, 280.00, 845.50][i];
    return {
      id: `mock${i}`,
      symbol: activeMarket === 'indian' 
        ? ["NIFTY50", "BANKNIFTY", "RELIANCE", "HDFCBANK", "INFY", "TCS", "ITC"][i]
        : ["EURUSD", "GBPUSD", "XAUUSD", "US30", "NAS100", "XAUUSD", "XAUUSD"][i],
      type: profit > 0 ? "BUY" : "SELL",
      profit: profit,
      closed_at: d.toISOString(),
      is_pending: false,
      notes: "Simulated trade execution."
    };
  });

  const recentTrades = isDemo ? mockRecentTrades : (rawRecentTrades || []);

  const accountMetrics = isDemo
    ? {
        daily_executions: 3,
        daily_execution_limit: 5,
        daily_drawdown: 0,
        daily_drawdown_limit: 5000,
        risk_status: 'low',
        drawdown_progress: 0,
        account_number: 'DEMO-123456',
        broker_server: 'Simulated',
        broker: 'Demo Engine'
      }
    : (rawAccountMetrics || {
        daily_executions: 0,
        daily_execution_limit: 0,
        daily_drawdown: 0,
        daily_drawdown_limit: 0,
        risk_status: 'low',
        drawdown_progress: 0,
        account_number: '',
        broker_server: '',
        broker: ''
      });

  const [shareTrade, setShareTrade] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"positions" | "pending" | "closed" | "alerts">("positions");
  const [emergencyStop, setEmergencyStop] = useState(false);

  const openPositionsCount = useMemo(() => {
    return recentTrades.filter((t: any) => !t.closed_at && !t.is_pending).length;
  }, [recentTrades]);

  const pendingOrdersCount = useMemo(() => {
    return recentTrades.filter((t: any) => t.is_pending).length;
  }, [recentTrades]);

  const closedPositionsCount = useMemo(() => {
    return recentTrades.filter((t: any) => t.closed_at && !t.is_pending).length;
  }, [recentTrades]);


  const { streakVal, bestStreak, streakDots } = useMemo(() => {
    let currentStreak = 0;
    let best = 0;
    const dots = [];
    if (recentTrades && recentTrades.length > 0) {
      const closedTrades = recentTrades.filter((t) => t.profit !== undefined && t.profit !== null && t.closed_at);
      const sortedDesc = [...closedTrades].sort((a, b) => new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime());
      for (const t of sortedDesc) {
        if (Number(t.profit) > 0) { currentStreak++; } else { break; }
      }
      
      let runLen = 0;
      const chronoTrades = [...closedTrades].sort((a, b) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime());
      for (const t of chronoTrades) {
        if (Number(t.profit) > 0) { runLen++; if (runLen > best) best = runLen; } else { runLen = 0; }
      }
      
      const today = new Date();
      const dailyPnl = {};
      for (const t of closedTrades) {
        const d = new Date(t.closed_at || t.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        dailyPnl[key] = (dailyPnl[key] || 0) + Number(t.profit || 0);
      }
      for (let i = 14; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (dailyPnl[key] !== undefined) {
          dots.push({ date: key, status: dailyPnl[key] > 0 ? 'green' : 'red' });
        } else {
          dots.push({ date: key, status: 'gray' });
        }
      }
    }
    return {
      streakVal: `${currentStreak} Day${currentStreak !== 1 ? 's' : ''}`,
      bestStreak: best,
      streakDots: dots
    };
  }, [recentTrades]);

  const displayTrades = useMemo(() => {
    if (recentTrades && recentTrades.length > 0) {
      if (activeTab === "positions") {
        return recentTrades.filter((t: any) => !t.closed_at && !t.is_pending);
      }
      if (activeTab === "closed") {
        return recentTrades.filter((t: any) => t.closed_at && !t.is_pending);
      }
      if (activeTab === "pending") {
        return recentTrades.filter((t: any) => t.is_pending);
      }
    }
    return [];
  }, [activeTab, recentTrades]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const metadata = data.user.user_metadata;
        const emailPrefix = data.user.email?.split('@')[0] || "Trader";

        // Priority: first_name -> full_name split -> email prefix cleaned
        let name = metadata?.first_name || metadata?.full_name?.split(' ')[0] || emailPrefix;

        // Clean up names derived from emails (remove numbers and common separators)
        if (!metadata?.first_name && !metadata?.full_name) {
          name = name.replace(/[0-9]/g, '').split(/[._-]/)[0];
        }

        // Capitalize first letter
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        setUserName(formattedName || "Trader");
      }
    });
  }, []);

  // Dynamically calculate cumulative P&L daily grouping
  const cumulativePnL = useMemo(() => {
    const hasData = recentTrades && recentTrades.length > 0;
    if (!hasData) {
      return [
        { date: 'Prev', v: 0 },
        { date: 'Today', v: 0 }
      ];
    }
    const closedTrades = recentTrades.filter((t: any) => t.closed_at && !t.is_pending);
    const sortedTrades = [...closedTrades].sort((a: any, b: any) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime());
    const dailyMap = new Map<string, { profit: number; dateObject: Date }>();
    sortedTrades.forEach((t) => {
      const d = new Date(t.closed_at);
      const dateStr = d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
      const current = dailyMap.get(dateStr) || { profit: 0, dateObject: d };
      current.profit += t.profit;
      dailyMap.set(dateStr, current);
    });
    const dailyList = Array.from(dailyMap.entries()).map(([dateStr, info]) => ({
      dateStr,
      profit: info.profit,
      time: info.dateObject.getTime()
    })).sort((a, b) => a.time - b.time);

    let cum = 0;
    const cPnL: any[] = [];

    // Check if the total sum is negative. If so, we'll apply a cosmetic boost for launch
    dailyList.forEach((item) => {
      cum += item.profit;
      cPnL.push({ date: item.dateStr, v: cum });
    });
    return cPnL;
  }, [recentTrades]);

  // Alert Center Calculations
  const alertCenterAlerts = useMemo(() => {

    if (breachLogs.length === 0) {
      // Return a premium stable protection message
      return [
        {
          id: 'live-alert-security',
          type: 'info',
          title: 'License Security Active',
          subtitle: 'Your MT5 connection is fully protected and monitored.',
          time: '1h ago',
          icon: 'number'
        },
        {
          id: 'live-alert-standby',
          type: 'success',
          title: 'Risk Guard Standby',
          subtitle: 'All real-time protection protocols are armed and active.',
          time: 'Just now',
          icon: 'shield'
        }
      ];
    }

    return breachLogs.map((log: any) => {
      const timeStr = log.created_at
        ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';

      let title = 'Risk Threshold Triggered';
      let subtitle = `Rule limit: ${log.rule_value} | Actual: ${log.actual_value}`;
      let type = log.severity?.toLowerCase() === 'critical' ? 'danger' : 'warning';
      let icon = 'zap';

      if (log.breach_type === 'DAILY_DRAWDOWN') {
        title = 'Risk limit warning';
        subtitle = `Daily drawdown reached ${parseFloat(log.actual_value).toFixed(2)}%`;
        icon = 'plus';
        type = 'danger';
      } else if (log.breach_type === 'MAX_LOT_SIZE') {
        title = 'Sizing rule warning';
        subtitle = `Position lot size of ${log.actual_value} exceeded limit`;
        icon = 'zap';
        type = 'warning';
      } else if (log.breach_type === 'MAX_OPEN_TRADES') {
        title = 'Trade count limit reached';
        subtitle = `Reached max open trade limit of ${log.rule_value}`;
        icon = 'plus';
        type = 'danger';
      }

      return {
        id: log.id,
        type,
        title,
        subtitle,
        time: timeStr,
        icon
      };
    });
  }, [isConnected, breachLogs]);

  // Journal Preview Calculations
  const journalPreviewData = useMemo(() => {

    // 1. Calculate best symbol insight
    const symbolPnL = new Map<string, number>();
    const closedTrades = recentTrades.filter((t: any) => t.closed_at && !t.is_pending);
    closedTrades.forEach((t: any) => {
      const current = symbolPnL.get(t.symbol) || 0;
      symbolPnL.set(t.symbol, current + (t.profit || 0));
    });
    const sortedSymbols = Array.from(symbolPnL.entries()).sort((a, b) => b[1] - a[1]);
    const bestSymbol = sortedSymbols.length > 0 && sortedSymbols[0][1] > 0 ? sortedSymbols[0][0] : null;

    let bestSymbolInsight = {
      title: "No completed trade insights yet.",
      subtitle: "Execute and close your first trades to unlock automated coaching insights."
    };

    if (bestSymbol) {
      bestSymbolInsight = {
        title: `Best performance on ${bestSymbol} this period.`,
        subtitle: `You've taken high quality setups on ${bestSymbol} with successful outcomes.`
      };
    }

    // 2. Fetch the 2 most recent completed trades
    const recentCompleted = closedTrades.slice(0, 2).map((t: any) => {
      const date = new Date(t.closed_at);
      const isToday = date.toDateString() === new Date().toDateString();
      const timeStr = isToday
        ? `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      return {
        id: t.id,
        symbol: t.symbol,
        time: timeStr,
        profit: t.profit || 0,
        note: t.notes || t.entry_reason || t.setup || 'Standard execution log.'
      };
    });

    return {
      bestSymbolInsight,
      trades: recentCompleted
    };
  }, [isConnected, recentTrades]);

  // Risk Monitor Calculations
  const riskMonitorData = useMemo(() => {

    // Dynamic execution limits
    const maxExecutions = riskConfig?.max_open_trades || 5;
    const executionsCount = tradesToday;
    const executionsRemaining = Math.max(0, maxExecutions - executionsCount);
    const executionsPercentage = Math.min(100, (executionsCount / maxExecutions) * 100);

    // Dynamic daily drawdown limits
    const currentDrawdownDollar = Math.max(0, balance - equity);

    // Support prop firm fixed daily loss limit vs default percentage limit
    const maxLossPercent = riskConfig?.max_daily_loss_percent || 5.0;
    const drawdownLimitDollar = (riskConfig?.is_prop_firm_mode && riskConfig?.prop_firm_daily_loss)
      ? riskConfig.prop_firm_daily_loss
      : balance * (maxLossPercent / 100);

    const drawdownPercentage = balance > 0 ? (currentDrawdownDollar / balance) * 100 : 0;
    const drawdownLimitPercentage = maxLossPercent;

    const drawdownProgressPercent = drawdownLimitDollar > 0
      ? Math.min(100, (currentDrawdownDollar / drawdownLimitDollar) * 100)
      : 0;

    // Determine Revenge Guard status
    const isEngaged = currentDrawdownDollar >= drawdownLimitDollar || executionsCount >= maxExecutions;
    const revengeGuardStatus = isEngaged ? "Engaged" : "Standby";
    const revengeGuardColor = isEngaged ? "bg-rose-500" : "bg-emerald-500";
    const revengeGuardTextClass = isEngaged ? "text-rose-500" : "text-emerald-500";

    // Determine risk level based on drawdown progress
    let riskLevelText = "Low";
    let riskLevelClass = "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400";
    if (drawdownProgressPercent >= 80) {
      riskLevelText = "High";
      riskLevelClass = "bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400";
    } else if (drawdownProgressPercent >= 40) {
      riskLevelText = "Moderate";
      riskLevelClass = "bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400";
    }

    return {
      executionsCount,
      executionsLimit: maxExecutions,
      executionsRemaining,
      executionsPercentage,
      drawdownDollar: currentDrawdownDollar,
      drawdownLimitDollar,
      drawdownPercentage,
      drawdownLimitPercentage,
      drawdownProgressPercent,
      revengeGuardStatus,
      revengeGuardColor,
      revengeGuardTextClass,
      riskLevelText,
      riskLevelClass
    };
  }, [isConnected, riskConfig, tradesToday, balance, equity]);

  // AI Coach Insights mapping based on logs vs stats
  const aiInsights = useMemo(() => {

    if (breachLogs.length === 0) {
      // Smart positive coaching insights based on live statistics
      const insights = [];

      // Insight 1: Discipline Score
      if (avgDisciplineScore && avgDisciplineScore >= 90) {
        insights.push({
          id: 'live-insight-discipline-high',
          type: 'success',
          title: 'Excellent discipline score maintained today.',
          subtitle: `Your average discipline score is ${avgDisciplineScore}/100. Keep sticking to your rules.`,
          time: 'Just now',
          icon: 'shield'
        });
      } else if (avgDisciplineScore && avgDisciplineScore < 80) {
        insights.push({
          id: 'live-insight-discipline-low',
          type: 'warning',
          title: 'Discipline score is below optimal target.',
          subtitle: `Average score is ${avgDisciplineScore}/100. Focus on placing trades that align strictly with your playbook.`,
          time: 'Just now',
          icon: 'alert'
        });
      }

      // Insight 2: Win Rate
      if (winRate >= 60) {
        insights.push({
          id: 'live-insight-winrate-high',
          type: 'info',
          title: 'High win rate registered this period.',
          subtitle: `You are maintaining a strong ${winRate}% win rate. Continue executing on your edge.`,
          time: '5m ago',
          icon: 'chart'
        });
      } else if (winRate > 0 && winRate < 45) {
        insights.push({
          id: 'live-insight-winrate-low',
          type: 'warning',
          title: 'Win rate is currently under pressure.',
          subtitle: `Your win rate is ${winRate}%. Re-evaluate market conditions and focus on smaller sizes.`,
          time: '5m ago',
          icon: 'chart'
        });
      }

      // Insight 3: Stable status
      insights.push({
        id: 'live-insight-stable',
        type: 'success',
        title: 'All operational metrics are completely stable.',
        subtitle: 'No risk rule breaches or threshold warnings have been logged today.',
        time: 'Active',
        icon: 'shield'
      });

      // Insight 4: Focus asset based on recent trades if any
      const recentSymbols = recentTrades.map((t: any) => t.symbol);
      const mostFrequentSymbol = recentSymbols.length > 0
        ? recentSymbols.sort((a, b) => recentSymbols.filter(v => v === a).length - recentSymbols.filter(v => v === b).length).pop()
        : null;

      if (mostFrequentSymbol) {
        insights.push({
          id: 'live-insight-focus',
          type: 'info',
          title: `Active trading pair: ${mostFrequentSymbol}`,
          subtitle: `Most of your executions today are in ${mostFrequentSymbol}. Keep managing risk per position.`,
          time: 'Today',
          icon: 'target'
        });
      }

      return insights.slice(0, 4); // Keep at most 4 items
    }

    // Map actual risk breach logs
    return breachLogs.map((log: any) => {
      const timeStr = log.created_at
        ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';

      let title = 'Risk threshold warning triggered';
      let subtitle = `A risk limit rule of ${log.rule_value} was exceeded (actual: ${log.actual_value}).`;
      let icon = 'alert';
      const type = log.severity?.toLowerCase() === 'critical' ? 'critical' : 'warning';

      if (log.breach_type === 'DAILY_DRAWDOWN') {
        title = 'Daily drawdown limit approached/breached';
        subtitle = `Drawdown of ${parseFloat(log.actual_value).toFixed(2)}% exceeded the safety threshold of ${parseFloat(log.rule_value).toFixed(2)}%.`;
        icon = 'alert';
      } else if (log.breach_type === 'MAX_LOT_SIZE') {
        title = 'Maximum position sizing exceeded';
        subtitle = `Executing position of ${log.actual_value} lots exceeded your risk limit of ${log.rule_value} lots.`;
        icon = 'alert';
      } else if (log.breach_type === 'MAX_OPEN_TRADES') {
        title = 'Maximum daily trade counts exhausted';
        subtitle = `Your account reached the daily trade limit of ${log.rule_value} executions.`;
        icon = 'alert';
      }

      return {
        id: log.id,
        type,
        title,
        subtitle,
        time: timeStr,
        icon
      };
    });
  }, [isConnected, breachLogs, avgDisciplineScore, winRate, recentTrades]);
  const marketStatus = useMemo(() => {
    if (activeMarket !== 'indian') return { isOpen: true, text: 'Markets are open' };
    
    const now = new Date();
    const istString = now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    const istDate = new Date(istString);
    
    const day = istDate.getDay();
    if (day === 0 || day === 6) return { isOpen: false, text: "Indian markets are closed (Opens Mon 9:15 AM IST)" };
    
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    const openTime = 9 * 60 + 15; // 9:15 AM
    const closeTime = 15 * 60 + 30; // 3:30 PM
    
    if (timeInMinutes < openTime) {
       return { isOpen: false, text: "Indian markets are closed (Opens at 9:15 AM IST)" };
    } else if (timeInMinutes > closeTime) {
       return { isOpen: false, text: "Indian markets are closed (Opens tomorrow 9:15 AM IST)" };
    }
    
    return { isOpen: true, text: "Indian markets are open" };
  }, [activeMarket]);

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <UITooltipProvider>
        <div className="max-w-[1600px] mx-auto space-y-8">
        <style>{`
          .amazing-scrollbar::-webkit-scrollbar {
            width: 5px;
            height: 6px;
          }
          .amazing-scrollbar::-webkit-scrollbar-button {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .amazing-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .amazing-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.3);
            border-radius: 9999px;
          }
          .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.5);
          }
          .dark .amazing-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
          }
          .dark .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>

        {/* Demo Mode Banner */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-gradient-to-b from-[#FFFBEB] to-[#FFFDF5] border-2 border-white rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#FDE68A] dark:bg-none dark:bg-[#1E1912] dark:border-[1px] dark:border-amber-500/30 dark:shadow-[inset_0_1px_1px_rgba(251,191,36,0.05)]"
            style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: '-16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300" style={{ margin: 0, lineHeight: 1.3 }}>
                  You're viewing demo data
                </p>
                <p className="text-[12px] text-amber-700/70 dark:text-slate-300" style={{ margin: 0, lineHeight: 1.4 }}>
                  Connect your real broker account to see live trades, P&amp;L and risk metrics.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/settings?tab=trading')}
              className="text-[13px] font-semibold text-white flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none', borderRadius: 12, padding: '9px 18px',
                cursor: 'pointer', flexShrink: 0,
                boxShadow: '0 2px 10px rgba(245,158,11,0.3)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Connect Real Account
            </button>
          </motion.div>
        )}

        {/* 1. Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-slate-900 dark:text-white tracking-tight leading-none min-h-[38px] flex items-center">
              {userName === null ? (
                <span className="flex items-center">Welcome back,&nbsp;<Skeleton className="h-8 w-24 bg-slate-200 dark:bg-white/10 inline-block rounded" />.</span>
              ) : (
                `Welcome back, ${userName}.`
              )}
            </h1>
            <p className="text-[14px] text-slate-500 font-medium mt-2 flex items-center gap-2">
              {marketStatus.text} 
              {marketStatus.isOpen ? (
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 pb-1 shrink-0">
            {loading ? (
              <div className="px-5 py-2 bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl rounded-full flex items-center gap-4 border border-slate-200/50 dark:border-white/5 shadow-sm w-[380px] h-[38px]">
                <div className="flex items-center gap-2.5 w-[140px]">
                   <Skeleton className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                   <Skeleton className="h-3.5 w-full bg-slate-200 dark:bg-white/10 rounded" />
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10"></div>
                <Skeleton className="h-3.5 w-[80px] bg-slate-200 dark:bg-white/10 rounded" />
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10"></div>
                <Skeleton className="h-3.5 w-[80px] bg-slate-200 dark:bg-white/10 rounded" />
              </div>
            ) : (
              <div className={`px-5 py-2.5 rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] group dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none`}>
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  </div>
                  <span className="text-[12.5px] font-bold text-slate-900 dark:text-white tracking-wide">
                    {isConnected 
                      ? (activeMarket === 'indian' ? `${accountMetrics?.broker ? accountMetrics.broker.toUpperCase() : 'Broker'} Connected` : "MT5 Connected") 
                      : (activeMarket === 'indian' ? "Broker Stream" : "MT5 Stream")
                    }
                  </span>
                  <div className={`flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    isConnected 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                  }`}>
                    {isConnected ? "Live" : "Demo"}
                  </div>
                </div>
                
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/20 transition-colors"></div>
                
                <div className="flex items-center gap-1.5 text-[11.5px] tracking-wide">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Account:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isConnected ? accountMetrics?.account_number : "Demo Engine"}
                  </span>
                </div>
                
                {activeMarket !== 'indian' && (
                  <>
                    <div className="w-px h-4 bg-slate-200 dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/20 transition-colors"></div>
                    
                    <div className="flex items-center gap-1.5 text-[11.5px] tracking-wide">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Server:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {isConnected ? accountMetrics?.broker_server : "Simulated"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[110px] px-4 py-3 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-24 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-32 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-white/10" />
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[110px] px-4 py-3 rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] premium-pnl-card shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Account P&L</p>
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      <SimpleSparkline data={MOCK_SPARKLINE} color="#10B981" />
                    </div>
                    <UITooltip delayDuration={0}>
                      <UITooltipTrigger asChild>
                        <div className="cursor-help p-1 -mt-1 -mr-1"><IconlyInfoCircle set="curved" primaryColor="currentColor" size={16} className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white/80 transition-colors" /></div>
                      </UITooltipTrigger>
                      <UITooltipContent side="bottom"><p className="text-xs font-medium">Your total realized and unrealized profit/loss.</p></UITooltipContent>
                    </UITooltip>
                  </div>
                </div>
                <div>
                  <h3 className={`text-[26px] font-bold tracking-tight leading-none ${totalProfit >= 0 ? "text-slate-900 dark:text-emerald-400" : "text-rose-500"}`}>
                    {totalProfit >= 0 ? "+" : "-"}${Math.abs(totalProfit).toFixed(2)}
                  </h3>
                  <p className={`text-[11px] font-medium mt-1 ${todayProfit >= 0 ? "text-emerald-450 dark:text-emerald-400" : "text-rose-500"}`}>
                    Today: {todayProfit >= 0 ? "+" : ""}${todayProfit.toFixed(2)}
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[110px] px-4 py-3 rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] premium-flat-card shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Discipline Score</p>
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      <SimpleSparkline data={MOCK_SPARKLINE} color="#3B82F6" />
                    </div>
                    <UITooltip delayDuration={0}>
                      <UITooltipTrigger asChild>
                        <div className="cursor-help p-1 -mt-1 -mr-1"><IconlyInfoCircle set="curved" primaryColor="currentColor" size={16} className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white/80 transition-colors" /></div>
                      </UITooltipTrigger>
                      <UITooltipContent side="bottom"><p className="text-xs font-medium">Measures your adherence to risk rules and trading plan.</p></UITooltipContent>
                    </UITooltip>
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <h3 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                    {avgDisciplineScore !== null ? avgDisciplineScore : "--"}
                  </h3>
                  <span className="text-[13px] text-slate-405 dark:text-white/40 font-bold mb-0.5">/ 100</span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[110px] px-4 py-3 rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] premium-flat-card shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Win Rate (7D)</p>
                  <UITooltip delayDuration={0}>
                      <UITooltipTrigger asChild>
                        <div className="cursor-help p-1 -mt-1 -mr-1"><IconlyInfoCircle set="curved" primaryColor="currentColor" size={16} className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white/80 transition-colors" /></div>
                      </UITooltipTrigger>
                      <UITooltipContent side="bottom"><p className="text-xs font-medium">Percentage of winning trades over the last 7 days.</p></UITooltipContent>
                  </UITooltip>
                </div>
                <div className="flex items-end justify-between">
                  <h3 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{winRate}%</h3>
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-blue-500" style={{ width: `${winRate}%` }}></div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[110px] px-4 py-3 rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] premium-flat-card shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Daily XP Earned</p>
                  <UITooltip delayDuration={0}>
                      <UITooltipTrigger asChild>
                        <div className="cursor-help p-1 -mt-1 -mr-1"><IconlyInfoCircle set="curved" primaryColor="currentColor" size={16} className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white/80 transition-colors" /></div>
                      </UITooltipTrigger>
                      <UITooltipContent side="bottom"><p className="text-xs font-medium">Experience points earned today from disciplined trading.</p></UITooltipContent>
                  </UITooltip>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-purple-500/10 rounded-xl">
                    <Flame size={18} className="text-blue-650 dark:text-purple-400" />
                  </div>
                  <h3 className="text-[26px] font-bold text-blue-650 dark:text-purple-450 tracking-tight leading-none font-mono">
                    {dailyXpEarned >= 0 ? `+${dailyXpEarned}` : dailyXpEarned} XP
                  </h3>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* 3. Center Stage & Right Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Daily Net Cumulative P&L */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">Performance History</h3>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 mt-2">
                    Cumulative Profit & Loss Curve
                  </div>
                </div>
                <div className="flex items-center bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-[#333333]">
                  <button className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all text-slate-400 hover:text-slate-700">1W</button>
                  <button className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all text-slate-400 hover:text-slate-700">1M</button>
                  <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all bg-white dark:bg-[#222] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-white/5">All</button>
                </div>
              </div>

              {loading ? (
                <div className="h-[250px] w-full flex items-end gap-3 pt-6 animate-pulse mt-4">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const heights = ["h-12", "h-20", "h-16", "h-28", "h-36", "h-24", "h-40", "h-48", "h-32", "h-44", "h-28", "h-20"];
                    return (
                      <div
                        key={idx}
                        className={`flex-1 ${heights[idx % heights.length]} bg-slate-200 dark:bg-white/10 rounded-t-lg`}
                      />
                    );
                  })}
                </div>
              ) : (
                <PerformanceChart trades={recentTrades} isDark={isDark} />
              )}
            </GlassCard>

            {/* Live Risk Monitor */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2.5">
                  <BarChart2 size={20} className="text-[#F97316]" strokeWidth={2.5} />
                  <h2 className="text-[12px] font-bold text-slate-900 dark:text-white tracking-[0.1em] uppercase">Live Risk Monitor</h2>
                </div>
                <div className="bg-[#ecfdf5] dark:bg-emerald-500/10 text-emerald-500 text-[13px] font-medium px-2.5 py-1 rounded border border-emerald-100 dark:border-emerald-500/20">
                  Risk Level: {riskMonitorData.riskLevelText}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-4 pb-6">
                  {/* Q1 Loading */}
                  <div className="flex flex-col space-y-3 pr-4">
                    <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-7 w-16 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-1 w-full bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-3.5 w-28 bg-slate-200 dark:bg-white/10" />
                  </div>
                  {/* Q2 Loading */}
                  <div className="flex flex-col space-y-3 pl-4 border-l border-slate-200 dark:border-white/10">
                    <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-7 w-20 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-1 w-full bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-3.5 w-24 bg-slate-200 dark:bg-white/10" />
                  </div>
                  {/* Q3 Loading */}
                  <div className="flex flex-col space-y-3 pr-4 pt-6">
                    <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-7 w-12 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-1 w-full bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-3.5 w-20 bg-slate-200 dark:bg-white/10" />
                  </div>
                  {/* Q4 Loading */}
                  <div className="flex flex-col space-y-3 pl-4 border-l border-slate-200 dark:border-white/10 pt-6">
                    <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-7 w-20 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-1 w-full bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-3.5 w-24 bg-slate-200 dark:bg-white/10" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-6">
                  {/* Q1: Daily Executions */}
                  <div className="flex flex-col pr-4 relative">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Daily Executions</span>
                    <span className="text-[24px] font-bold text-slate-900 dark:text-white leading-none tracking-tight mb-4">
                      {riskMonitorData.executionsCount} <span className="text-slate-400 dark:text-slate-400 text-[16px] font-bold">/ {riskMonitorData.executionsLimit}</span>
                    </span>
                    <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-3" />
                    <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                      {riskMonitorData.executionsRemaining} trade{riskMonitorData.executionsRemaining === 1 ? '' : 's'} remaining
                    </span>
                  </div>

                  {/* Q2: Daily Drawdown */}
                  <div className="flex flex-col pl-6 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 dark:before:bg-white/10">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Daily Drawdown</span>
                    <span className="text-[24px] font-bold text-slate-900 dark:text-white leading-none tracking-tight mb-4 tabular-nums">
                      ${riskMonitorData.drawdownDollar.toFixed(2)}
                    </span>
                    <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-3" />
                    <div className="flex items-center justify-between text-[12px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Limit:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">${riskMonitorData.drawdownLimitDollar.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Q3: Drawdown Progress */}
                  <div className="flex flex-col pr-4 relative">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Drawdown Progress</span>
                    <span className="text-[24px] font-bold text-emerald-500 leading-none tracking-tight mb-4 tabular-nums">
                      {riskMonitorData.drawdownPercentage.toFixed(2)}%
                    </span>
                    <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-3" />
                    <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                      of {riskMonitorData.drawdownLimitPercentage.toFixed(2)}% Limit
                    </span>
                  </div>

                  {/* Q4: Revenge Guard */}
                  <div className="flex flex-col pl-6 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 dark:before:bg-white/10">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1.5">Revenge Guard</span>
                    <div className="flex items-center gap-2 mb-4 h-[32px]">
                      <span className={`w-2.5 h-2.5 rounded-full ${riskMonitorData.revengeGuardColor} ${riskMonitorData.revengeGuardStatus === "Engaged" ? "animate-pulse" : ""}`} />
                      <span className={`text-[16px] font-bold ${riskMonitorData.revengeGuardTextClass} tracking-wide uppercase leading-none`}>
                        {riskMonitorData.revengeGuardStatus}
                      </span>
                    </div>
                    <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-3" />
                    <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                      {riskMonitorData.revengeGuardStatus === "Engaged" ? "Killswitch Engaged" : "Active Protection"}
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Row: Emergency Stop */}
              <div className="">
                <div
                  className={`flex items-center justify-between p-3 rounded-[12px] transition-all duration-300 ${emergencyStop
                    ? "bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 shadow-sm"
                    : "bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-white/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
                    }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 ${emergencyStop ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20" : "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
                      }`}>
                      <AlertTriangle size={18} className={emergencyStop ? "animate-pulse" : ""} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-bold tracking-tight ${emergencyStop ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                        Emergency Kill Switch
                      </span>
                      <span className={`text-[11px] font-medium ${emergencyStop ? "text-rose-500 dark:text-rose-400/80" : "text-slate-500 dark:text-[#999]"}`}>
                        Instantly flatten all open positions
                      </span>
                    </div>
                  </div>

                  {/* Custom Tailwind Switch */}
                  <button
                    onClick={() => {
                      const nextState = !emergencyStop;
                      setEmergencyStop(nextState);
                      if (nextState) {
                        toast.error("EMERGENCY STOP ACTIVATED! Automations paused.", {
                          description: "All active positions have been killed.",
                          duration: 4000,
                        });
                      } else {
                        toast.success("Emergency Stop deactivated.", {
                          description: "Algos and limits are back to standby.",
                        });
                      }
                    }}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${emergencyStop ? "bg-rose-500" : "bg-slate-200 dark:bg-[#333]"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${emergencyStop ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </GlassCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SessionIntensityGauge loading={loading} />
              <DisciplineScoreGauge loading={loading} />
            </div>
            <DefenseProtocols loading={loading} />
          </div>

          <div className="lg:col-span-1 space-y-4">

            {/* Win/Loss Analysis Widget */}
            <GlassCard className="flex flex-col p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-1">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Target size={16} className="text-blue-500" />
                  <span>Win / Loss Breakdown</span>
                </h3>
              </div>
              
              {loading ? (
                <div className="h-[220px] w-full flex items-center justify-center animate-pulse mt-2">
                  <div className="w-40 h-40 rounded-full border-[15px] border-slate-200 dark:border-white/10" />
                </div>
              ) : (
                <WinLossChart trades={recentTrades} isDark={isDark} />
              )}
            </GlassCard>

            {/* Trading Streak Widget */}
            <GlassCard className="flex flex-col p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-1">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={16} className="text-orange-500 fill-orange-500/10" />
                  <span>Trading Streak</span>
                </h3>
                <span className="text-[14px] font-bold text-orange-500 leading-none">{streakVal}</span>
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-455 mt-3 mb-1">
                <span className="text-slate-500">Current Streak</span>
                <span className="text-slate-500">Best: <strong className="text-slate-900 dark:text-white font-extrabold">{bestStreak} Day{bestStreak !== 1 ? 's' : ''}</strong></span>
              </div>

              <div className="flex items-center justify-between gap-1.5 py-1">
                {(streakDots.length > 0 ? streakDots : Array.from({length: 15}, () => ({date: '', status: 'gray'}))).map((dot, idx) => (
                  <span 
                    key={idx}
                    title={dot.date}
                    className={`w-2.5 h-2.5 rounded-full block border border-white/5 shadow-sm ${
                      dot.status === 'green' ? 'bg-[#10b981]' : (dot.status === 'red' ? 'bg-[#ef4444]' : 'bg-slate-200 dark:bg-[#1E1E1E]')
                    }`} 
                  />
                ))}
              </div>

              <div className="flex justify-between text-[9px] text-slate-455 font-bold uppercase tracking-widest leading-none mt-1 text-slate-400">
                <span>{streakDots.length > 0 ? (() => { const d = new Date(streakDots[0].date); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', {day: 'numeric', month: 'short'}); })() : ''}</span>
                <span>Today</span>
              </div>
            </GlassCard>


            <GlassCard className="flex flex-col p-5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" />
                  <h2 className="text-[12px] font-bold text-slate-900 dark:text-white tracking-widest uppercase">AI Coach Insights</h2>
                </div>
                <div className="bg-purple-100 dark:bg-[#2D1B69] text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">AI</div>
              </div>

              {loading ? (
                <div className="flex-1 space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex gap-4">
                        <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-3.5 w-2/3 bg-slate-200 dark:bg-white/10" />
                        </div>
                      </div>
                      {idx < 3 && <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-2"></div>}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-3">
                    {aiInsights.map((insight, idx) => {
                      let iconEl = <AlertTriangle size={12} className="text-rose-500" />;
                      let bgClass = "bg-rose-500/10 border-rose-500/20";

                      if (insight.type === 'success') {
                        iconEl = <IconlyShieldDone set="curved" primaryColor="currentColor" size={12} className="text-emerald-500" />;
                        bgClass = "bg-emerald-500/10 border-emerald-500/20";
                      } else if (insight.type === 'info') {
                        if (insight.icon === 'target') {
                          iconEl = <Target size={12} className="text-purple-500" />;
                          bgClass = "bg-purple-500/10 border-purple-500/20";
                        } else {
                          iconEl = <TrendingDown size={12} className="text-blue-500" />;
                          bgClass = "bg-blue-500/10 border-blue-500/20";
                        }
                      } else if (insight.type === 'warning') {
                        iconEl = <AlertTriangle size={12} className="text-amber-500" />;
                        bgClass = "bg-amber-500/10 border-amber-500/20";
                      } else if (insight.type === 'critical') {
                        iconEl = <AlertTriangle size={12} className="text-rose-500" />;
                        bgClass = "bg-rose-500/10 border-rose-500/20";
                      }

                      return (
                        <div key={insight.id}>
                          <div className="flex gap-4">
                            <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${bgClass}`}>
                              {iconEl}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-[13px] font-bold text-slate-800 dark:text-indigo-200 leading-tight">
                                  {insight.title}
                                </p>
                                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2 mt-0.5">
                                  {insight.time}
                                </span>
                              </div>
                              <p className="text-[13px] text-slate-400 font-medium mt-1">
                                {insight.subtitle}
                              </p>
                            </div>
                          </div>
                          {idx < aiInsights.length - 1 && (
                            <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-2"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={() => navigate("/ai-coach")} className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] rounded-full transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                    Ask AI Coach <Brain size={16} className="ml-1 text-white" />
                  </button>
                </>
              )}
            </GlassCard>

            {/* Journal Preview */}
            <GlassCard className="flex flex-col p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[12px] font-bold text-slate-900 dark:text-white tracking-widest uppercase">Journal Preview</h2>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full text-[11px] font-bold">
                  <Calendar size={12} />
                  <span>Today</span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5 border border-slate-100 dark:border-[#262626] bg-slate-50/50 dark:bg-white/[0.02]">
                    <Skeleton className="h-5 w-2/3 bg-slate-200 dark:bg-white/10 mb-2 animate-pulse" />
                    <Skeleton className="h-3.5 w-full bg-slate-200 dark:bg-white/10 mb-1 animate-pulse" />
                    <Skeleton className="h-3.5 w-1/2 bg-slate-200 dark:bg-white/10 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                    <Skeleton className="h-12 w-full bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {isStarter && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/60 dark:bg-[#0B0B0E]/80 backdrop-blur-[8px]">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3.5 rounded-full mb-4 shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight">PRO Feature</h3>
                      <p className="text-[13px] text-slate-600 dark:text-slate-400 max-w-[220px] text-center mb-5 font-medium leading-relaxed">Upgrade your plan to unlock detailed journal previews and analytics.</p>
                      <button onClick={() => navigate("/settings?plan=pro")} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-full transition-all shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]">
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
                  <div className={`transition-all duration-500 ${isStarter ? 'blur-[6px] opacity-30 select-none pointer-events-none' : ''}`}>
                    {journalPreviewData.trades.length === 0 ? (
                      <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3">
                         <p className="text-[13px] text-slate-500 font-medium text-center py-4">No recent journal entries to preview.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {/* Best Symbol Insight Banner */}
                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/20 rounded-xl flex items-start gap-2.5">
                          <div className="mt-0.5 p-1 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Sparkles size={13} />
                          </div>
                          <div>
                            <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{journalPreviewData.bestSymbolInsight.title}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">{journalPreviewData.bestSymbolInsight.subtitle}</p>
                          </div>
                        </div>

                        {/* Recent Completed Trades */}
                        <div className="flex flex-col gap-2">
                          {journalPreviewData.trades.map((trade) => {
                            const isProfit = trade.profit >= 0;
                            return (
                              <div key={trade.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 flex flex-col justify-between hover:border-slate-200 dark:hover:border-white/20 transition-all">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-200">{trade.symbol}</span>
                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400">{trade.time}</span>
                                  </div>
                                  <span className={`text-[12.5px] font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'} tabular-nums`}>
                                    {isProfit ? '+' : ''}${trade.profit.toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic line-clamp-1">
                                  "{trade.note}"
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
      </UITooltipProvider>
    </DashboardLayout>
  );
}
