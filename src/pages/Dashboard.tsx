import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert, ChevronRight, Activity, AlertCircle,
  ShieldCheck, BarChart3, ExternalLink, Clock, CheckCircle2,
  Sparkles, Shield, Target, Trophy, Zap, Star, Gift,
  BookOpen, Brain, Award, TrendingUp, Flame
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMarket } from "@/contexts/MarketContext";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import PerformanceChart from "@/components/charts/PerformanceChart";
import { getGamificationState } from "@/utils/gamification";

// ── Reusable GlassCard ──────────────────────────────────────────────────────
const GlassCard = ({ children, className = "", noPadding = false }: { children: React.ReactNode; className?: string; noPadding?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={`bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] border-2 border-white rounded-[22px] ${noPadding ? '' : 'p-5'} shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] transition-all dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none ${className}`}
  >
    {children}
  </motion.div>
);

// ── Small Icon Components ───────────────────────────────────────────────────
const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

// ── Main Component ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  let {
    equity, balance, todayProfit, totalProfit, winRate, tradesToday,
    riskConfig, recentTrades, avgDisciplineScore, isConnected,
    profitFactor, openRiskPct, accountMetrics, dailyXpEarned, breachLogs
  } = useDashboardData();

  // ── Mock data for demo mode ───────────────────────────────────────────────
  if (!isConnected) {
    equity = 25420.60;
    balance = 25000.00;
    todayProfit = 131.50;
    totalProfit = 420.60;
    winRate = 68;
    tradesToday = 5;
    profitFactor = 1.82;
    openRiskPct = 1.2;
    avgDisciplineScore = 85;
    dailyXpEarned = 120;
    riskConfig = { max_daily_loss_percent: 5, max_open_trades: 10, is_prop_firm_mode: false, max_open_risk: 2.0 };
    recentTrades = [
      { id: "1", symbol: "XAUUSD", type: "buy", volume: 0.10, open_price: 2024.50, current_price: 2026.80, profit: 23.00, closed_at: null, sl: 2020.0 },
      { id: "2", symbol: "EURUSD", type: "sell", volume: 1.00, open_price: 1.0850, current_price: 1.0840, profit: 10.00, closed_at: null, sl: 1.0870 },
      { id: "3", symbol: "GBPUSD", type: "buy", volume: 0.50, profit: 45.00, closed_at: new Date(Date.now() - 3600000).toISOString(), discipline_score: 88 },
      { id: "4", symbol: "USDJPY", type: "sell", volume: 0.50, profit: -12.50, closed_at: new Date(Date.now() - 7200000).toISOString(), discipline_score: 72 },
      { id: "5", symbol: "BTCUSD", type: "buy", volume: 0.05, profit: 120.00, closed_at: new Date(Date.now() - 10800000).toISOString(), discipline_score: 95 },
      { id: "6", symbol: "NZDUSD", type: "sell", volume: 0.30, profit: 35.00, closed_at: new Date(Date.now() - 14400000).toISOString(), discipline_score: 80 },
      { id: "7", symbol: "AUDUSD", type: "buy", volume: 0.20, profit: -8.00, closed_at: new Date(Date.now() - 18000000).toISOString(), discipline_score: 65 },
    ];
  }

  const { activeMarket } = useMarket();
  const [userName, setUserName] = useState<string | null>(null);
  const [gamification, setGamification] = useState(getGamificationState());

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

    // Listen for XP updates
    const handleXPUpdate = () => setGamification(getGamificationState());
    window.addEventListener("tradifive_xp_update", handleXPUpdate);
    return () => window.removeEventListener("tradifive_xp_update", handleXPUpdate);
  }, []);

  // ── Computed values ───────────────────────────────────────────────────────
  const riskData = useMemo(() => {
    const currentDrawdownDollar = Math.max(0, balance - equity);
    const maxLossPercent = riskConfig?.max_daily_loss_percent ?? 0;
    const isLimitConfigured = maxLossPercent > 0 || (riskConfig?.is_prop_firm_mode && riskConfig?.prop_firm_daily_loss > 0);
    const drawdownPercentage = balance > 0 ? (currentDrawdownDollar / balance) * 100 : 0;
    const maxExecutions = riskConfig?.max_open_trades || 5;

    return {
      drawdownPct: drawdownPercentage.toFixed(1),
      maxLossPct: maxLossPercent.toFixed(1),
      tradesTaken: tradesToday,
      maxTrades: maxExecutions,
      openRiskPct: openRiskPct !== null ? Number(openRiskPct).toFixed(1) : null,
      maxOpenRiskPct: (riskConfig?.max_open_risk || 2.0).toFixed(1),
      isLimitConfigured,
    };
  }, [balance, equity, riskConfig, tradesToday, openRiskPct]);

  const openPositions = useMemo(() => {
    return recentTrades?.filter((t: any) => !t.closed_at && !t.is_pending) || [];
  }, [recentTrades]);

  const pnlTodayStr = todayProfit === 0 ? '$0.00' : (todayProfit > 0 ? `+$${todayProfit.toFixed(2)}` : `-$${Math.abs(todayProfit).toFixed(2)}`);
  const pnlNetStr = totalProfit === 0 ? '$0.00' : (totalProfit > 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // AI Coach insight
  const coachInsight = useMemo(() => {
    if (!isConnected || recentTrades.length < 3)
      return "Connect your account and complete a few trades to receive personalised coaching.";
    if (Number(riskData.drawdownPct) > Number(riskData.maxLossPct) * 0.8)
      return `Warning: You've used ${riskData.drawdownPct}% of your ${riskData.maxLossPct}% daily limit. Consider pausing.`;
    if (winRate < 40 && tradesToday > 0)
      return "Your win rate is trending low today. Step back and review your setup criteria.";
    return "You're trading within plan. Keep following your strategy and managing risk.";
  }, [isConnected, recentTrades, riskData, winRate, tradesToday]);

  // XP progress
  const xpProgress = gamification.xp_required > 0 ? Math.min((gamification.xp / gamification.xp_required) * 100, 100) : 0;

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-12 space-y-5 min-h-screen font-sans">

        {/* ── Demo Mode Banner ──────────────────────────────────────────── */}
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

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pt-4 pb-1">
          <div>
            <h1 className="text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight">
              {greeting}, {userName || <Skeleton className="inline-block w-20 h-7 bg-slate-200" />}
            </h1>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-500 dark:text-slate-400 text-[13px] font-medium">Markets open</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 mt-3 md:mt-0">
            <div className="px-3.5 py-1.5 bg-white dark:bg-[#1E1E1E] rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-2 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                {isConnected && accountMetrics ? `${accountMetrics.broker} • Live` : 'Not Connected'}
              </span>
            </div>
            <button
              className="px-3.5 py-1.5 bg-white dark:bg-[#1E1E1E] rounded-full border border-rose-200 dark:border-rose-500/30 text-rose-500 flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shadow-sm disabled:opacity-40"
              disabled={!isConnected}
            >
              <ShieldAlert size={14} strokeWidth={2.5} />
              <span className="text-[13px] font-bold">Emergency Stop</span>
            </button>
          </div>
        </div>

        {/* ── Top KPI Strip ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Equity */}
          <GlassCard className="!p-4 group cursor-pointer hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0]">
            <div className="flex items-center gap-1.5 mb-2">
              <WalletIcon />
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Equity</span>
            </div>
            <h3 className="text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight leading-none mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              ${equity > 0 ? equity.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Balance ${balance > 0 ? balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </p>
          </GlassCard>

          {/* Today's P&L */}
          <GlassCard className="!p-4 group cursor-pointer hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0]">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendUpIcon />
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Today's P&L</span>
            </div>
            <h3 className={`text-[22px] font-semibold tracking-tight leading-none mb-0.5 ${todayProfit === 0 ? 'text-slate-900 dark:text-white' : (todayProfit > 0 ? 'text-emerald-500' : 'text-rose-500')}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              {pnlTodayStr}
            </h3>
            <p className={`text-xs font-medium ${todayProfit === 0 ? 'text-slate-500' : (todayProfit > 0 ? 'text-emerald-500' : 'text-rose-500')}`}>
              {balance > 0 ? `${todayProfit > 0 ? '+' : ''}${((todayProfit / balance) * 100).toFixed(2)}%` : '0.00%'} today
            </p>
          </GlassCard>

          {/* Win Rate */}
          <GlassCard className="!p-4 group cursor-pointer hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0]">
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={16} className="text-slate-400" />
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Win Rate</span>
            </div>
            <h3 className="text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight leading-none mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              {winRate}%
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {tradesToday} trade{tradesToday !== 1 ? 's' : ''} today
            </p>
          </GlassCard>

          {/* Discipline Score */}
          <GlassCard className="!p-4 group cursor-pointer hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15),0_0_0_2px_#E2E8F0]">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield size={16} className="text-slate-400" />
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Discipline</span>
            </div>
            <div className="flex items-end gap-1.5">
              <h3 className="text-[22px] font-semibold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                {avgDisciplineScore !== null ? avgDisciplineScore : '—'}
              </h3>
              {avgDisciplineScore !== null && <span className="text-sm font-bold text-slate-400 mb-0.5">/ 100</span>}
            </div>
            {avgDisciplineScore !== null ? (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${avgDisciplineScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-500/30' : (avgDisciplineScore >= 50 ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-500/30' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:border-rose-500/30')}`}>
                {avgDisciplineScore >= 80 ? 'Excellent' : (avgDisciplineScore >= 50 ? 'Average' : 'Needs Work')}
              </span>
            ) : (
              <p className="text-xs text-slate-500 font-medium mt-0.5">Not enough data</p>
            )}
          </GlassCard>
        </div>

        {/* ── Main Content Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left Column (span 2) ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Equity Curve */}
            <GlassCard noPadding className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Portfolio Performance</h2>
                <Link to="/journal" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700 transition-colors">
                  Open Journal <ExternalLink size={12} strokeWidth={2.5} />
                </Link>
              </div>

              {recentTrades && recentTrades.length > 0 ? (
                <>
                  <div className="h-[180px] w-full rounded-lg">
                    <PerformanceChart trades={recentTrades || []} isDark={false} />
                  </div>
                  <div className="grid grid-cols-3 border-t border-slate-100 dark:border-white/5 mt-4 pt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Net P&L</p>
                      <p className={`text-base font-extrabold tracking-tight ${totalProfit === 0 ? 'text-slate-900 dark:text-white' : (totalProfit > 0 ? 'text-emerald-500' : 'text-rose-500')}`}>
                        {pnlNetStr}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Win Rate</p>
                      <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">{winRate}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Profit Factor</p>
                      <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">{profitFactor !== null ? profitFactor : '—'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center px-4 py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/5">
                  <Activity size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No trading data yet</h3>
                  <p className="text-xs text-slate-500 max-w-[220px] mb-3">Connect an account or import trades to view performance.</p>
                  <Link to="/journal" className="px-4 py-1.5 bg-white dark:bg-[#2A2A2A] text-blue-600 font-bold text-xs rounded-full border border-blue-100 dark:border-blue-500/30 hover:bg-blue-50 transition-colors">
                    Open Journal
                  </Link>
                </div>
              )}
            </GlassCard>

            {/* Open Positions */}
            <GlassCard noPadding className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Open Positions</h2>
                {openPositions.length > 0 && (
                  <span className="text-xs font-bold text-slate-400">{openPositions.length} active</span>
                )}
              </div>

              {openPositions.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-white/5">
                        <th className="pb-2.5 font-medium">Symbol</th>
                        <th className="pb-2.5 font-medium">Side</th>
                        <th className="pb-2.5 font-medium">Size</th>
                        <th className="pb-2.5 font-medium">Entry</th>
                        <th className="pb-2.5 font-medium text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openPositions.map((pos: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-50 dark:border-white/5 last:border-0">
                          <td className="py-2.5 font-bold text-slate-900 dark:text-white">{pos.symbol}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pos.type?.includes('buy') ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-500/30' : 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/30 dark:border-orange-500/30'}`}>
                              {pos.type?.includes('buy') ? 'BUY' : 'SELL'}
                            </span>
                          </td>
                          <td className="py-2.5 font-medium text-slate-600 dark:text-slate-400">{pos.volume?.toFixed(2)}</td>
                          <td className="py-2.5 font-medium text-slate-600 dark:text-slate-400">{pos.open_price}</td>
                          <td className={`py-2.5 font-bold text-right ${pos.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {pos.profit >= 0 ? `+$${pos.profit.toFixed(2)}` : `-$${Math.abs(pos.profit).toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/5">
                  <Shield size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No open positions right now.</p>
                </div>
              )}
            </GlassCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Journal', icon: BookOpen, path: '/journal', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                { label: 'Risk Guard', icon: ShieldCheck, path: '/risk-guard', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                { label: 'AI Coach', icon: Brain, path: '/ai-coach', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
                { label: 'Competitions', icon: Trophy, path: '/competitions/dashboard', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#1E1E1E] rounded-[16px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                    <action.icon size={18} className={action.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white">{action.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right Column (span 1) ────────────────────────────────── */}
          <div className="space-y-5">

            {/* Risk Guard Summary */}
            <GlassCard noPadding className="overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Risk Guard</h2>
                <Link to="/risk-guard" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700 transition-colors">
                  Open <ExternalLink size={11} strokeWidth={2.5} />
                </Link>
              </div>
              <div className="p-4 space-y-4">
                {/* Daily Loss */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-slate-400" /> Daily loss
                    </span>
                    {riskData.isLimitConfigured ? (
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{riskData.drawdownPct}% <span className="text-slate-400 font-medium">/ {riskData.maxLossPct}%</span></span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">—</span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: riskData.isLimitConfigured ? `${Math.min(100, (Number(riskData.drawdownPct) / Number(riskData.maxLossPct)) * 100)}%` : '0%' }} />
                  </div>
                </div>

                {/* Trades Taken */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <BarChart3 size={13} className="text-slate-400" /> Trades taken
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{riskData.tradesTaken} <span className="text-slate-400 font-medium">/ {riskData.maxTrades}</span></span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (riskData.tradesTaken / riskData.maxTrades) * 100)}%` }} />
                  </div>
                </div>

                {/* Open Risk */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Target size={13} className="text-slate-400" /> Open risk
                    </span>
                    {riskData.openRiskPct !== null ? (
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{riskData.openRiskPct}% <span className="text-slate-400 font-medium">/ {riskData.maxOpenRiskPct}%</span></span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">—</span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: riskData.openRiskPct !== null ? `${Math.min(100, (Number(riskData.openRiskPct) / Number(riskData.maxOpenRiskPct)) * 100)}%` : '0%' }} />
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs font-medium ${riskData.isLimitConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                {riskData.isLimitConfigured ? (
                  <><CheckCircle2 size={13} className="text-emerald-500" /> All rules enforced</>
                ) : (
                  <><AlertCircle size={13} /> Limits not fully configured</>
                )}
              </div>
            </GlassCard>

            {/* Rewards & Level */}
            <GlassCard noPadding className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Rewards</h2>
                <Link to="/rewards" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700 transition-colors">
                  View <ExternalLink size={11} strokeWidth={2.5} />
                </Link>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <Star size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-slate-900 dark:text-white">Level {gamification.level}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-500/30">
                      {gamification.xp} XP
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{gamification.streak} day streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-blue-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">+{dailyXpEarned} XP today</span>
                </div>
              </div>
            </GlassCard>

            {/* Active Competition */}
            <GlassCard noPadding className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Competition</h2>
                <Link to="/competitions/dashboard" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700 transition-colors">
                  Browse <ExternalLink size={11} strokeWidth={2.5} />
                </Link>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Trophy size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">Monthly Trading Challenge</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Compete for cash prizes & rewards</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
              </div>
            </GlassCard>

            {/* AI Coach Insight */}
            <GlassCard noPadding className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={14} className="text-purple-500" />
                <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Coach</span>
              </div>
              <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug mb-3">
                {coachInsight}
              </p>
              <Link to="/ai-coach" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700 transition-colors">
                Chat with AI Coach <ChevronRight size={12} strokeWidth={3} />
              </Link>
            </GlassCard>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
