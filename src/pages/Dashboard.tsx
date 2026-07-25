import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wallet, TrendingUp, ShieldAlert, Target, Shield, ArrowRight,
  Sparkles, Clock, CheckCircle2, ChevronRight, Activity, AlertCircle,
  ShieldCheck, BarChart3, ExternalLink
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
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
    riskConfig, recentTrades, avgDisciplineScore, isConnected, 
    profitFactor, openRiskPct, accountMetrics
  } = useDashboardData();
  const { activeMarket } = useMarket();

  const [userName, setUserName] = useState<string | null>(null);
  const [eventTimer, setEventTimer] = useState("Loading...");

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

    // Dynamic Countdown Timer Logic for Upcoming Event (Targeting 6:00 PM local time today)
    const target = new Date();
    target.setHours(18, 0, 0, 0);
    if (target.getTime() < Date.now()) {
      target.setDate(target.getDate() + 1);
    }
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target.getTime() - now;
      if (diff < 0) {
        setEventTimer("Started");
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        if (h > 0) setEventTimer(`${h}h ${m}m`);
        else setEventTimer(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const riskData = useMemo(() => {
    const currentDrawdownDollar = Math.max(0, balance - equity);
    const maxLossPercent = riskConfig?.max_daily_loss_percent !== undefined ? riskConfig.max_daily_loss_percent : 0;
    const isLimitConfigured = maxLossPercent > 0 || (riskConfig?.is_prop_firm_mode && riskConfig?.prop_firm_daily_loss > 0);
    const drawdownLimitDollar = (riskConfig?.is_prop_firm_mode && riskConfig?.prop_firm_daily_loss)
      ? riskConfig.prop_firm_daily_loss
      : (isLimitConfigured ? balance * (maxLossPercent / 100) : 0);
    
    const drawdownPercentage = balance > 0 ? (currentDrawdownDollar / balance) * 100 : 0;
    
    const maxExecutions = riskConfig?.max_open_trades || 5;
    const isEngaged = currentDrawdownDollar >= drawdownLimitDollar || tradesToday >= maxExecutions;

    return {
      drawdownPct: drawdownPercentage.toFixed(1),
      maxLossPct: maxLossPercent.toFixed(1),
      tradesTaken: tradesToday,
      maxTrades: maxExecutions,
      openRiskPct: openRiskPct !== null ? openRiskPct.toFixed(1) : null,
      maxOpenRiskPct: (2.0).toFixed(1), // Mock allowed fallback, could use riskConfig.max_open_risk if available
      revengeGuardActive: isEngaged,
      isLimitConfigured
    };
  }, [balance, equity, riskConfig, tradesToday, openRiskPct]);
  
  const openPositions = useMemo(() => {
    return recentTrades?.filter((t: any) => !t.closed_at && !t.is_pending) || [];
  }, [recentTrades]);

  // Fallbacks
  const pnlTodayStr = todayProfit === 0 ? `$0.00` : (todayProfit > 0 ? `+$${todayProfit.toFixed(2)}` : `-$${Math.abs(todayProfit).toFixed(2)}`);
  const pnlNetStr = totalProfit === 0 ? `$0.00` : (totalProfit > 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`);
  
  // AI Coach Insights Logic
  const getCoachInsight = () => {
    if (!isConnected || recentTrades.length < 3) {
      return "Connect your account and complete a few trades to receive personalised coaching.";
    }
    if (Number(riskData.drawdownPct) > Number(riskData.maxLossPct) * 0.8) {
      return `Warning: You have used ${riskData.drawdownPct}% of your ${riskData.maxLossPct}% daily limit. Consider pausing.`;
    }
    if (winRate < 40 && tradesToday > 0) {
      return "Your win rate is trending low today. Step back and review your setup criteria.";
    }
    return "You're trading within plan. Upcoming US CPI data could inject volatility—ensure stops are placed.";
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-12 space-y-5 min-h-screen font-sans">
        
        {/* Demo Mode Banner (Matched exactly to Journal) */}
        {!isConnected && activeMarket !== 'indian' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-gradient-to-b from-[#FFFBEB] to-[#FFFDF5] border-2 border-white rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#FDE68A] dark:bg-none dark:bg-[#1E1912] dark:border-[1px] dark:border-amber-500/30 dark:shadow-[inset_0_1px_1px_rgba(251,191,36,0.05)] mt-4"
            style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
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
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <span className="text-sm font-bold text-slate-700">
                {isConnected && accountMetrics ? `${accountMetrics.broker} • Live` : 'Not Connected'}
              </span>
            </div>
            <button className="px-4 py-2 bg-white rounded-full border border-rose-200 text-rose-500 flex items-center gap-2 hover:bg-rose-50 transition-colors shadow-sm disabled:opacity-50" disabled={!isConnected}>
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
                  ${equity > 0 ? equity.toLocaleString('en-US', {minimumFractionDigits: 2}) : "0.00"}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Balance ${balance > 0 ? balance.toLocaleString('en-US', {minimumFractionDigits: 2}) : "0.00"}
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
                <h3 className={`text-[26px] font-black tracking-tight leading-none mb-1 ${todayProfit === 0 ? 'text-slate-900' : (todayProfit > 0 ? 'text-emerald-500' : 'text-rose-500')}`}>
                  {pnlTodayStr}
                </h3>
                <p className={`text-sm font-medium ${todayProfit === 0 ? 'text-slate-500' : (todayProfit > 0 ? 'text-emerald-500' : 'text-rose-500')}`}>
                  {balance > 0 ? `${todayProfit > 0 ? '+' : ''}${((todayProfit / balance) * 100).toFixed(2)}%` : '0.00%'} today
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
                  {riskData.openRiskPct === null ? (
                    <>
                      <h3 className="text-[26px] font-black text-slate-900 tracking-tight leading-none mb-1">
                        —
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Not enough data
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-[26px] font-black text-slate-900 tracking-tight leading-none mb-1">
                        {riskData.openRiskPct}%
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        of {riskData.maxOpenRiskPct}% allowed
                      </p>
                    </>
                  )}
                </div>
                <ChevronRight size={20} className="text-slate-400 mb-5 group-hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${riskData.openRiskPct !== null ? (Number(riskData.openRiskPct) / Number(riskData.maxOpenRiskPct)) * 100 : 0}%` }}></div>
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
                    {avgDisciplineScore !== null ? avgDisciplineScore : "—"}
                  </h3>
                  {avgDisciplineScore !== null && <span className="text-lg font-bold text-slate-400 mb-0.5">/ 100</span>}
                </div>
                {avgDisciplineScore !== null ? (
                  <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${avgDisciplineScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (avgDisciplineScore >= 50 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100')}`}>
                    {avgDisciplineScore >= 80 ? 'Excellent' : (avgDisciplineScore >= 50 ? 'Average' : 'Poor')}
                  </div>
                ) : (
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                    Not enough data
                  </div>
                )}
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
                <div className="flex items-center gap-3">
                  {recentTrades && recentTrades.length > 0 && (
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 mr-2">
                      <button className="hover:text-slate-900 transition-colors">1D</button>
                      <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">1W</button>
                      <button className="hover:text-slate-900 transition-colors">1M</button>
                      <button className="hover:text-slate-900 transition-colors">3M</button>
                      <button className="hover:text-slate-900 transition-colors">ALL</button>
                    </div>
                  )}
                  <Link to="/journal" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
                    Open Journal <ExternalLink size={12} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
              
              {recentTrades && recentTrades.length > 0 ? (
                <>
                  <div className="h-[200px] w-full -ml-4">
                     <PerformanceChart trades={recentTrades || []} isDark={false} />
                  </div>

                  <div className="grid grid-cols-3 border-t border-slate-100 mt-4 pt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Net P&L</p>
                      <p className={`text-lg font-black tracking-tight ${totalProfit === 0 ? 'text-slate-900' : (totalProfit > 0 ? 'text-emerald-500' : 'text-rose-500')}`}>
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
                        {profitFactor !== null ? profitFactor : '—'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-center px-4 py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Activity size={32} className="text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 mb-1">No trading data yet</h3>
                  <p className="text-xs text-slate-500 max-w-[250px] mb-4">
                    Connect an account or import trades to view performance.
                  </p>
                  <Link to="/journal" className="px-4 py-2 bg-white text-blue-600 font-bold text-xs rounded-full border border-blue-100 hover:bg-blue-50 transition-colors">
                    Open Journal
                  </Link>
                </div>
              )}
            </GlassCard>

            {/* Open Positions */}
            <GlassCard noPadding className="p-6">
              <h2 className="text-[15px] font-bold text-slate-900 mb-4">Open Positions</h2>
              
              {openPositions.length > 0 ? (
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
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openPositions.map((pos: any, idx: number) => (
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
                          <td className="py-3 text-right">
                             {riskData.isLimitConfigured ? (
                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
                                 <ShieldCheck size={10} /> Protected
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase">
                                 Unprotected
                               </span>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center px-4 py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Shield size={32} className="text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 mb-1">No open positions</h3>
                  <p className="text-xs text-slate-500">
                    Your active positions will appear here.
                  </p>
                </div>
              )}
            </GlassCard>

          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-5">
            
            {/* Risk Guard Status */}
            <GlassCard noPadding className="overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-[15px] font-bold text-slate-900">Risk Guard Status</h2>
                <Link to="/risk-guard" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
                  Open Risk Guard <ExternalLink size={12} strokeWidth={2.5} />
                </Link>
              </div>
              <div className="p-5 space-y-5">
                
                {/* Rule 1 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <ShieldCheck size={16} className="text-slate-400" /> Daily loss used
                    </div>
                    {riskData.isLimitConfigured ? (
                      <span className="text-sm font-bold text-slate-900">{riskData.drawdownPct}% <span className="text-slate-400 font-medium">/ {riskData.maxLossPct}%</span></span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Not configured</span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: riskData.isLimitConfigured ? `${Math.min(100, (Number(riskData.drawdownPct) / Number(riskData.maxLossPct)) * 100)}%` : '0%' }}></div>
                  </div>
                </div>

                {/* Rule 2 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <BarChart3 size={16} className="text-slate-400" /> Trades taken
                    </div>
                    {riskConfig?.max_open_trades ? (
                       <span className="text-sm font-bold text-slate-900">{riskData.tradesTaken} <span className="text-slate-400 font-medium">/ {riskData.maxTrades}</span></span>
                    ) : (
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Not configured</span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: riskConfig?.max_open_trades ? `${Math.min(100, (riskData.tradesTaken / riskData.maxTrades) * 100)}%` : '0%' }}></div>
                  </div>
                </div>

                {/* Rule 3 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Target size={16} className="text-slate-400" /> Open risk
                    </div>
                    {riskData.openRiskPct !== null ? (
                      <span className="text-sm font-bold text-slate-900">{riskData.openRiskPct}% <span className="text-slate-400 font-medium">/ {riskData.maxOpenRiskPct}%</span></span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Not configured</span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: riskData.openRiskPct !== null ? `${(Number(riskData.openRiskPct) / Number(riskData.maxOpenRiskPct)) * 100}%` : '0%' }}></div>
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <ShieldAlert size={16} className="text-slate-400" /> Revenge Guard
                  </div>
                  <span className={`text-sm font-bold ${riskData.revengeGuardActive ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {riskData.revengeGuardActive ? 'Triggered' : 'Active'}
                  </span>
                </div>

              </div>
              <div className={`p-4 border-t border-slate-100 rounded-b-[20px] flex items-center gap-2 text-xs font-medium ${riskData.isLimitConfigured ? 'bg-[#F8F9FC]/80 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {riskData.isLimitConfigured ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" /> All rules are being enforced
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Protection limits are not fully configured
                  </>
                )}
              </div>
            </GlassCard>

            {/* AI Coach */}
            <GlassCard noPadding className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-purple-500" />
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">AI Coach — Next Action</span>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug mb-4 pr-4">
                {getCoachInsight()}
              </p>
              <div className="flex justify-end">
                <Link to="/tradifive-ai-public" className="text-[13px] font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
                  View analysis <ChevronRight size={14} strokeWidth={3} />
                </Link>
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
                  <span className="text-sm font-bold">{eventTimer}</span>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
