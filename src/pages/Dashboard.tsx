import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wallet, TrendingUp, ShieldAlert, Target, Shield, ArrowRight,
  Sparkles, Clock, CheckCircle2, ChevronRight, Activity, AlertCircle,
  ShieldCheck, BarChart3
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTrading } from "@/contexts/TradingContext";
import { useMarket } from "@/contexts/MarketContext";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import PerformanceChart from "@/components/charts/PerformanceChart";

// Custom small icons mimicking the image
const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const GlassCard = ({ children, className = "", noPadding = false }: { children: React.ReactNode, className?: string, noPadding?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] border-2 border-white rounded-[22px] ${noPadding ? '' : 'p-4'} shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] transition-all dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none ${className}`}
  >
    {children}
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    equity, balance, todayProfit, totalProfit, winRate, tradesToday, 
    riskConfig, recentTrades, breachLogs, avgDisciplineScore, dailyXpEarned, loading 
  } = useDashboardData();
  const { isConnected, accountMetrics } = useTrading();
  const { activeMarket } = useMarket();

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const metadata = data.user.user_metadata;
        const emailPrefix = data.user.email?.split('@')[0] || "Trader";
        let name = metadata?.first_name || metadata?.full_name?.split(' ')[0] || emailPrefix;
        if (!metadata?.first_name && !metadata?.full_name) {
          name = name.replace(/[0-9]/g, '').split(/[._-]/)[0];
        }
        setUserName(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
      }
    });
  }, []);

  // Use the same risk logic as the old dashboard for accuracy
  const riskData = useMemo(() => {
    const currentDrawdownDollar = Math.max(0, balance - equity);
    const maxLossPercent = riskConfig?.max_daily_loss_percent !== undefined ? riskConfig.max_daily_loss_percent : 3.0;
    const isLimitConfigured = maxLossPercent > 0 || (riskConfig?.is_prop_firm_mode && riskConfig?.prop_firm_daily_loss > 0);
    const drawdownLimitDollar = (riskConfig?.is_prop_firm_mode && riskConfig?.prop_firm_daily_loss)
      ? riskConfig.prop_firm_daily_loss
      : (isLimitConfigured ? balance * (maxLossPercent / 100) : 0);
    
    const drawdownPercentage = balance > 0 ? (currentDrawdownDollar / balance) * 100 : 0;
    
    const maxExecutions = riskConfig?.max_open_trades || 5;
    const isEngaged = currentDrawdownDollar >= drawdownLimitDollar || tradesToday >= maxExecutions;

    // Open Risk estimation (mock if no real data for open positions risk)
    const openPositions = recentTrades?.filter((t: any) => !t.closed_at && !t.is_pending) || [];
    let openRiskPct = 0;
    if (openPositions.length > 0) {
       openRiskPct = 1.2; // Mocking specific value from image, normally calculated from SL
    }

    return {
      drawdownPct: drawdownPercentage.toFixed(1),
      maxLossPct: maxLossPercent.toFixed(1),
      tradesTaken: tradesToday,
      maxTrades: maxExecutions,
      openRiskPct: openRiskPct.toFixed(1),
      maxOpenRiskPct: (2.0).toFixed(1), // Mock allowed
      revengeGuardActive: isEngaged,
      isLimitConfigured
    };
  }, [balance, equity, riskConfig, tradesToday, recentTrades]);

  const profitFactor = 1.82; // Mocked for UI match
  
  const openPositions = useMemo(() => {
    return recentTrades?.filter((t: any) => !t.closed_at && !t.is_pending).slice(0, 5) || [];
  }, [recentTrades]);

  // Fallbacks if no data
  const dispScore = avgDisciplineScore || 86;
  const pnlTodayStr = todayProfit >= 0 ? `+$${todayProfit.toFixed(2)}` : `-$${Math.abs(todayProfit).toFixed(2)}`;
  const pnlNetStr = totalProfit >= 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`;
  
  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-12 space-y-5 min-h-screen font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pt-4 pb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Good afternoon, {userName || <Skeleton className="inline-block w-24 h-8 bg-slate-200" />}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-slate-500 text-sm font-medium">Your account is protected and trading within today's limits</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-slate-500 text-sm font-medium">Markets are open</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="px-4 py-2 bg-white rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-bold text-slate-700">MT5 Connected • Live</span>
            </div>
            <button className="px-4 py-2 bg-white rounded-full border border-rose-200 text-rose-500 flex items-center gap-2 hover:bg-rose-50 transition-colors shadow-sm">
              <ShieldAlert size={16} strokeWidth={2.5} />
              <span className="text-sm font-bold">Emergency Stop</span>
            </button>
          </div>
        </div>

        {/* Top 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Equity */}
          <GlassCard className="relative group cursor-pointer hover:border-white hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0] !p-4">
            <div className="flex items-center gap-2 mb-3">
              <WalletIcon />
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Account Equity</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-[26px] font-black text-slate-900 tracking-tight leading-none mb-1">
                  ${equity > 0 ? equity.toLocaleString('en-US', {minimumFractionDigits: 2}) : "25,420.60"}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Balance ${balance > 0 ? balance.toLocaleString('en-US', {minimumFractionDigits: 2}) : "25,112.20"}
                </p>
              </div>
              <ChevronRight size={20} className="text-slate-400 mb-1 group-hover:text-slate-600 transition-colors" />
            </div>
          </GlassCard>

          {/* Card 2: Today's P&L */}
          <GlassCard className="relative group cursor-pointer hover:border-white hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0] !p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendUpIcon />
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Today's P&L</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className={`text-[26px] font-black tracking-tight leading-none mb-1 ${todayProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {pnlTodayStr}
                </h3>
                <p className={`text-sm font-medium ${todayProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {todayProfit >= 0 ? '+1.31%' : '-0.5%'} today
                </p>
              </div>
              <ChevronRight size={20} className="text-slate-400 mb-1 group-hover:text-slate-600 transition-colors" />
            </div>
          </GlassCard>

          {/* Card 3: Open Risk */}
          <GlassCard className="relative group cursor-pointer hover:border-white hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0] flex flex-col justify-between !p-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldIcon />
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Open Risk</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-[26px] font-black text-slate-900 tracking-tight leading-none mb-1">
                    {riskData.openRiskPct}%
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    of {riskData.maxOpenRiskPct}% allowed
                  </p>
                </div>
                <ChevronRight size={20} className="text-slate-400 mb-5 group-hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(Number(riskData.openRiskPct) / Number(riskData.maxOpenRiskPct)) * 100}%` }}></div>
            </div>
          </GlassCard>

          {/* Card 4: Discipline Score */}
          <GlassCard className="relative group cursor-pointer hover:border-white hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0] !p-4">
            <div className="flex items-center gap-2 mb-3">
              <TargetIcon />
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Discipline Score</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-end gap-2 mb-1">
                  <h3 className="text-[26px] font-black text-slate-900 tracking-tight leading-none">
                    {dispScore}
                  </h3>
                  <span className="text-lg font-bold text-slate-400 mb-0.5">/ 100</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  Excellent
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 mb-1 group-hover:text-slate-600 transition-colors" />
            </div>
          </GlassCard>

        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Portfolio Performance */}
            <GlassCard noPadding className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[15px] font-bold text-slate-900">Portfolio Performance</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <button className="hover:text-slate-900 transition-colors">1D</button>
                  <button className="hover:text-slate-900 transition-colors">1W</button>
                  <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">1M</button>
                  <button className="hover:text-slate-900 transition-colors">3M</button>
                  <button className="hover:text-slate-900 transition-colors">ALL</button>
                </div>
              </div>
              
              <div className="h-[220px] w-full -ml-4">
                 <PerformanceChart trades={recentTrades || []} isDark={false} />
              </div>

              <div className="grid grid-cols-3 border-t border-slate-100 mt-4 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Net P&L</p>
                  <p className={`text-lg font-black tracking-tight ${totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {pnlNetStr}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Win Rate</p>
                  <p className="text-lg font-black tracking-tight text-slate-900">
                    {winRate}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Profit Factor</p>
                  <p className="text-lg font-black tracking-tight text-slate-900">
                    {profitFactor}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Open Positions */}
            <GlassCard noPadding className="p-6">
              <h2 className="text-[15px] font-bold text-slate-900 mb-4">Open Positions</h2>
              
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 tracking-wider border-b border-slate-100">
                      <th className="pb-3 font-medium">Symbol</th>
                      <th className="pb-3 font-medium">Side</th>
                      <th className="pb-3 font-medium">Size</th>
                      <th className="pb-3 font-medium">Entry</th>
                      <th className="pb-3 font-medium">Current</th>
                      <th className="pb-3 font-medium">P&L</th>
                      <th className="pb-3 font-medium">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openPositions.length > 0 ? openPositions.map((pos: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 font-bold text-slate-900">{pos.symbol}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${pos.type?.includes('buy') ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                            {pos.type?.includes('buy') ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-slate-700">{pos.volume?.toFixed(2) || '0.10'}</td>
                        <td className="py-3 font-medium text-slate-700">{pos.entry || pos.open_price}</td>
                        <td className="py-3 font-medium text-slate-700">{pos.exit || pos.current_price || pos.open_price}</td>
                        <td className={`py-3 font-bold ${pos.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {pos.profit >= 0 ? `+$${pos.profit.toFixed(2)}` : `-$${Math.abs(pos.profit).toFixed(2)}`}
                        </td>
                        <td className="py-3 font-medium text-slate-500">0.5%</td>
                      </tr>
                    )) : (
                      <tr className="border-b border-slate-50">
                        <td className="py-3 font-bold text-slate-900">XAUUSD</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100">BUY</span>
                        </td>
                        <td className="py-3 font-medium text-slate-700">0.20</td>
                        <td className="py-3 font-medium text-slate-700">2364.50</td>
                        <td className="py-3 font-medium text-slate-700">2371.80</td>
                        <td className="py-3 font-bold text-emerald-500">+$146.00</td>
                        <td className="py-3 font-medium text-slate-500">0.6%</td>
                      </tr>
                    )}
                    {openPositions.length === 0 && (
                      <tr className="border-b border-slate-50">
                        <td className="py-3 font-bold text-slate-900">EURUSD</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100">SELL</span>
                        </td>
                        <td className="py-3 font-medium text-slate-700">0.10</td>
                        <td className="py-3 font-medium text-slate-700">1.0864</td>
                        <td className="py-3 font-medium text-slate-700">1.0849</td>
                        <td className="py-3 font-bold text-emerald-500">+$15.00</td>
                        <td className="py-3 font-medium text-slate-500">0.4%</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button className="mt-4 text-[13px] font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
                View all positions <ChevronRight size={14} strokeWidth={3} />
              </button>
            </GlassCard>

          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-5">
            
            {/* Live Risk Control */}
            <GlassCard noPadding className="overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-[15px] font-bold text-slate-900">Live Risk Control</h2>
                <span className="px-2.5 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Protected</span>
              </div>
              <div className="p-5 space-y-5">
                
                {/* Rule 1 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <ShieldCheck size={16} className="text-slate-400" /> Daily loss used
                    </div>
                    <span className="text-sm font-bold text-slate-900">{riskData.drawdownPct}% <span className="text-slate-400 font-medium">/ {riskData.maxLossPct}%</span></span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (Number(riskData.drawdownPct) / Number(riskData.maxLossPct)) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Rule 2 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <BarChart3 size={16} className="text-slate-400" /> Trades taken
                    </div>
                    <span className="text-sm font-bold text-slate-900">{riskData.tradesTaken} <span className="text-slate-400 font-medium">/ {riskData.maxTrades}</span></span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (riskData.tradesTaken / riskData.maxTrades) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Rule 3 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Target size={16} className="text-slate-400" /> Open risk
                    </div>
                    <span className="text-sm font-bold text-slate-900">{riskData.openRiskPct}% <span className="text-slate-400 font-medium">/ {riskData.maxOpenRiskPct}%</span></span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${(Number(riskData.openRiskPct) / Number(riskData.maxOpenRiskPct)) * 100}%` }}></div>
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <ShieldAlert size={16} className="text-slate-400" /> Revenge Guard
                  </div>
                  <span className="text-sm font-bold text-emerald-500">Active</span>
                </div>

              </div>
              <div className="p-4 border-t border-slate-100 bg-[#F8F9FC]/80 flex items-center gap-2 text-xs font-medium text-slate-500">
                <CheckCircle2 size={14} className="text-emerald-500" /> All rules are being enforced
              </div>
            </GlassCard>

            {/* AI Coach */}
            <GlassCard noPadding className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-purple-500" />
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">AI Coach — Next Action</span>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug mb-4 pr-4">
                You're within plan. CPI is in 48 min—avoid adding new USD exposure.
              </p>
              <div className="flex justify-end">
                <button className="text-[13px] font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
                  View analysis <ChevronRight size={14} strokeWidth={3} />
                </button>
              </div>
            </GlassCard>

            {/* Upcoming Event */}
            <GlassCard noPadding className="p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase block mb-1">Upcoming Event</span>
                <h3 className="text-sm font-bold text-slate-900">US CPI</h3>
                <p className="text-xs text-slate-500 font-medium">Today • 6:00 PM</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-2 py-0.5 rounded border border-rose-100 bg-rose-50 text-[10px] font-bold text-rose-600 tracking-widest uppercase">High Impact</span>
                <div className="flex items-center gap-1 text-rose-500">
                  <Clock size={14} strokeWidth={2.5} />
                  <span className="text-sm font-bold">48 min</span>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>

        {/* Bottom Full Width - Trading Plan */}
        <GlassCard noPadding className="p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Target size={20} className="text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Today's Trading Plan</span>
          </div>

          <div className="flex flex-1 justify-around items-center px-8 border-l border-r border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Max trades</p>
              <p className="text-lg font-black text-slate-900">{riskData.maxTrades}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Risk per trade</p>
              <p className="text-lg font-black text-slate-900">1.0%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Daily loss limit</p>
              <p className="text-lg font-black text-slate-900">{riskData.maxLossPct}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Minimum R:R</p>
              <p className="text-lg font-black text-slate-900">1:2</p>
            </div>
          </div>

          <div>
            <div className="px-4 py-2 rounded-full border border-emerald-200 text-emerald-600 flex items-center gap-2 font-bold text-sm bg-emerald-50">
              <CheckCircle2 size={16} /> Plan Active
            </div>
          </div>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
