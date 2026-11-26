import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Sliders, DollarSign, Percent, Lock, Volume2, 
  VolumeX, Clock, Globe, ArrowRight, CheckCircle2, AlertTriangle, 
  Sparkles, RefreshCw, Layers, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function TradingPreferencesTab() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Risk Management
  const [dailyLossLimit, setDailyLossLimit] = useState(() => localStorage.getItem('tf_risk_daily_loss') || '5000');
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState(() => localStorage.getItem('tf_risk_per_trade') || '1.5');
  const [maxOpenPositions, setMaxOpenPositions] = useState(() => localStorage.getItem('tf_risk_max_positions') || '3');
  const [hardDrawdownLock, setHardDrawdownLock] = useState(() => localStorage.getItem('tf_risk_hard_lock') === 'true');
  const [autoBreakeven, setAutoBreakeven] = useState(() => localStorage.getItem('tf_risk_auto_be') === 'true');
  const [breakevenTriggerRatio, setBreakevenTriggerRatio] = useState(() => localStorage.getItem('tf_risk_be_ratio') || '1:1.5');

  // Execution Presets
  const [defaultOrderType, setDefaultOrderType] = useState(() => localStorage.getItem('tf_pref_order_type') || 'market');
  const [defaultStopLossMode, setDefaultStopLossMode] = useState(() => localStorage.getItem('tf_pref_sl_mode') || 'pips');
  const [defaultStopLossValue, setDefaultStopLossValue] = useState(() => localStorage.getItem('tf_pref_sl_value') || '25');
  const [defaultTakeProfitRatio, setDefaultTakeProfitRatio] = useState(() => localStorage.getItem('tf_pref_tp_ratio') || '1:2');
  const [oneClickTrading, setOneClickTrading] = useState(() => localStorage.getItem('tf_pref_one_click') === 'true');
  const [slippagePips, setSlippagePips] = useState(() => localStorage.getItem('tf_pref_slippage') || '2');

  // Market & Regional
  const [primaryMarket, setPrimaryMarket] = useState(() => localStorage.getItem('tf_pref_primary_market') || 'indian');
  const [displayCurrency, setDisplayCurrency] = useState(() => localStorage.getItem('tf_pref_currency') || 'INR');
  const [numberFormat, setNumberFormat] = useState(() => localStorage.getItem('tf_pref_num_format') || 'inr_lakhs');
  const [defaultTimeframe, setDefaultTimeframe] = useState(() => localStorage.getItem('tf_pref_timeframe') || '5m');

  // Audio & Haptics
  const [soundOrderFill, setSoundOrderFill] = useState(() => localStorage.getItem('tf_pref_snd_fill') !== 'false');
  const [soundStopLoss, setSoundStopLoss] = useState(() => localStorage.getItem('tf_pref_snd_sl') !== 'false');
  const [soundTakeProfit, setSoundTakeProfit] = useState(() => localStorage.getItem('tf_pref_snd_tp') !== 'false');

  // Load from Supabase user_risk_configs if exists
  useEffect(() => {
    async function loadRiskConfig() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('user_risk_configs').select('*').eq('user_id', user.id).maybeSingle();
        if (data) {
          if (data.daily_loss_limit) setDailyLossLimit(String(data.daily_loss_limit));
          if (data.max_risk_per_trade) setMaxRiskPerTrade(String(data.max_risk_per_trade));
          if (data.max_open_positions) setMaxOpenPositions(String(data.max_open_positions));
          if (data.hard_lock !== undefined) setHardDrawdownLock(Boolean(data.hard_lock));
          if (data.auto_breakeven !== undefined) setAutoBreakeven(Boolean(data.auto_breakeven));
        }
      } catch (err) {
        console.warn('Could not load user_risk_configs:', err);
      }
    }
    loadRiskConfig();
  }, []);

  const playTestChime = (type: 'fill' | 'tp' | 'sl') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'fill') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
        toast.success("Order Fill chime previewed");
      } else if (type === 'tp') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
        toast.success("Take Profit victory chime previewed");
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
        toast.info("Stop Loss alert sound previewed");
      }
    } catch (_) {
      toast.info("Audio preview generated");
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // 1. Save to localStorage
      localStorage.setItem('tf_risk_daily_loss', dailyLossLimit);
      localStorage.setItem('tf_risk_per_trade', maxRiskPerTrade);
      localStorage.setItem('tf_risk_max_positions', maxOpenPositions);
      localStorage.setItem('tf_risk_hard_lock', String(hardDrawdownLock));
      localStorage.setItem('tf_risk_auto_be', String(autoBreakeven));
      localStorage.setItem('tf_risk_be_ratio', breakevenTriggerRatio);

      localStorage.setItem('tf_pref_order_type', defaultOrderType);
      localStorage.setItem('tf_pref_sl_mode', defaultStopLossMode);
      localStorage.setItem('tf_pref_sl_value', defaultStopLossValue);
      localStorage.setItem('tf_pref_tp_ratio', defaultTakeProfitRatio);
      localStorage.setItem('tf_pref_one_click', String(oneClickTrading));
      localStorage.setItem('tf_pref_slippage', slippagePips);

      localStorage.setItem('tf_pref_primary_market', primaryMarket);
      localStorage.setItem('tf_pref_currency', displayCurrency);
      localStorage.setItem('tf_pref_num_format', numberFormat);
      localStorage.setItem('tf_pref_timeframe', defaultTimeframe);

      localStorage.setItem('tf_pref_snd_fill', String(soundOrderFill));
      localStorage.setItem('tf_pref_snd_sl', String(soundStopLoss));
      localStorage.setItem('tf_pref_snd_tp', String(soundTakeProfit));

      // 2. Sync to Supabase user_risk_configs
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_risk_configs').upsert({
          user_id: user.id,
          daily_loss_limit: parseFloat(dailyLossLimit) || 5000,
          max_risk_per_trade: parseFloat(maxRiskPerTrade) || 1.5,
          max_open_positions: parseInt(maxOpenPositions, 10) || 3,
          hard_lock: hardDrawdownLock,
          auto_breakeven: autoBreakeven,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        // Also update preferred_market on profiles if possible
        await supabase.from('profiles').update({
          preferred_market: primaryMarket
        }).eq('id', user.id);
      }

      // 3. Dispatch global event
      window.dispatchEvent(new Event('tradifive_risk_config_updated'));
      window.dispatchEvent(new Event('tradifive_market_changed'));

      setSaved(true);
      toast.success("Trading & risk preferences saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Save risk config error:", err);
      toast.error(err.message || "Failed to sync preferences to cloud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans max-w-[840px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.06] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] text-slate-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </span>
            Trading & Risk Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Configure automated risk guardrails, default order presets, regional currency, and audio triggers.
          </p>
        </div>
        <Button
          onClick={handleSavePreferences}
          disabled={loading}
          className="h-9 px-5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-slate-900 font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save Preferences'}
        </Button>
      </div>

      {/* SECTION 1: RISK GUARD & CIRCUIT BREAKER */}
      <section className="bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] rounded-[22px] p-5 sm:p-6 space-y-5 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white">Capital Risk Guard</h3>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Hard circuit breakers that prevent overtrading and account blowups.</p>
            </div>
          </div>
          <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
            Active Protection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Daily Max Loss Limit */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Max Daily Loss Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {displayCurrency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                value={dailyLossLimit}
                onChange={e => setDailyLossLimit(e.target.value)}
                placeholder="5000"
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500">Trading stops once reached.</p>
          </div>

          {/* Max Risk Per Trade */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Max Risk Per Trade (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={maxRiskPerTrade}
                onChange={e => setMaxRiskPerTrade(e.target.value)}
                placeholder="1.5"
                className="w-full pl-3 pr-8 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500">Calculates maximum lot size.</p>
          </div>

          {/* Max Open Positions */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Max Open Trades
            </label>
            <select
              value={maxOpenPositions}
              onChange={e => setMaxOpenPositions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              <option value="1">1 Trade (Strict Focus)</option>
              <option value="2">2 Trades</option>
              <option value="3">3 Trades (Recommended)</option>
              <option value="5">5 Trades</option>
              <option value="10">10 Trades (Multi-asset)</option>
            </select>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500">Prevents position stacking.</p>
          </div>
        </div>

        {/* Guardrail Toggles */}
        <div className="space-y-3 pt-1">
          {/* Hard Drawdown Lock */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07]">
            <div className="space-y-0.5 pr-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Hard Drawdown Lock (Discipline Circuit Breaker)
              </span>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                When your daily loss limit is hit, lock terminal execution until next market open at 09:15 AM IST.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHardDrawdownLock(!hardDrawdownLock)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${hardDrawdownLock ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${hardDrawdownLock ? 'translate-x-5 bg-white dark:bg-slate-900' : 'translate-x-0 bg-white'}`} />
            </button>
          </div>

          {/* Auto Breakeven */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07]">
            <div className="space-y-0.5 pr-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Automated Breakeven Trigger
              </span>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Automatically moves your Stop Loss to entry price when trade profit hits {breakevenTriggerRatio} R:R.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={breakevenTriggerRatio}
                onChange={e => setBreakevenTriggerRatio(e.target.value)}
                disabled={!autoBreakeven}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-white disabled:opacity-40"
              >
                <option value="1:1">1:1 R:R</option>
                <option value="1:1.5">1:1.5 R:R</option>
                <option value="1:2">1:2 R:R</option>
              </select>
              <button
                type="button"
                onClick={() => setAutoBreakeven(!autoBreakeven)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${autoBreakeven ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${autoBreakeven ? 'translate-x-5 bg-white dark:bg-slate-900' : 'translate-x-0 bg-white'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ORDER EXECUTION PRESETS */}
      <section className="bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] rounded-[22px] p-5 sm:p-6 space-y-5 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-neutral-200 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white">Order Execution Defaults</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Prefill parameters when opening fast trade tickets or copying signals.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Default Order Type */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultOrderType('market')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${defaultOrderType === 'market' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs' : 'bg-white dark:bg-[#232329] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]'}`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setDefaultOrderType('limit')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${defaultOrderType === 'limit' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs' : 'bg-white dark:bg-[#232329] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]'}`}
              >
                Limit Order
              </button>
            </div>
          </div>

          {/* Default Take Profit */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Target (R:R)</label>
            <select
              value={defaultTakeProfitRatio}
              onChange={e => setDefaultTakeProfitRatio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              <option value="1:1.5">1:1.5 (Quick Scalp)</option>
              <option value="1:2">1:2 (Institutional Standard)</option>
              <option value="1:3">1:3 (Trend Following)</option>
              <option value="1:4">1:4 (Swing Runner)</option>
            </select>
          </div>

          {/* Default Stop Loss */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Stop Loss</label>
            <div className="flex gap-2">
              <select
                value={defaultStopLossMode}
                onChange={e => setDefaultStopLossMode(e.target.value)}
                className="w-1/2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
              >
                <option value="pips">Pips / Points</option>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed Currency</option>
              </select>
              <input
                type="number"
                value={defaultStopLossValue}
                onChange={e => setDefaultStopLossValue(e.target.value)}
                className="w-1/2 px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Slippage */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Max Slippage Tolerance</label>
            <select
              value={slippagePips}
              onChange={e => setSlippagePips(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              <option value="1">1 Pip / Pt (Strict)</option>
              <option value="2">2 Pips / Pts (Standard)</option>
              <option value="5">5 Pips / Pts (High Volatility)</option>
            </select>
          </div>
        </div>

        {/* One Click Trading Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07]">
          <div className="space-y-0.5 pr-4">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              One-Click Scalp Execution
            </span>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Executes trades instantly upon clicking Buy/Sell without opening a secondary confirmation modal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOneClickTrading(!oneClickTrading)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${oneClickTrading ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${oneClickTrading ? 'translate-x-5 bg-white dark:bg-slate-900' : 'translate-x-0 bg-white'}`} />
          </button>
        </div>
      </section>

      {/* SECTION 3: MARKET & CURRENCY */}
      <section className="bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] rounded-[22px] p-5 sm:p-6 space-y-5 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white">Market & Currency Localization</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Choose your default asset universe and number formatting.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Primary Market Universe</label>
            <select
              value={primaryMarket}
              onChange={e => setPrimaryMarket(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              <option value="indian">Indian Equities, F&O & Commodities (NSE / BSE)</option>
              <option value="global">Global Forex, Indices & Crypto (MT5 / Vantage)</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Display Currency</label>
            <select
              value={displayCurrency}
              onChange={e => setDisplayCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Number Formatting</label>
            <select
              value={numberFormat}
              onChange={e => setNumberFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              <option value="inr_lakhs">Indian System (₹ 1,50,000 / Lakhs & Crores)</option>
              <option value="intl_millions">International System ($ 150,000 / Millions)</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07] space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Chart Timeframe</label>
            <select
              value={defaultTimeframe}
              onChange={e => setDefaultTimeframe(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
            >
              <option value="1m">1 Minute (Scalping)</option>
              <option value="5m">5 Minutes (Intraday Momentum)</option>
              <option value="15m">15 Minutes (Standard Day Trading)</option>
              <option value="1h">1 Hour (Swing Trading)</option>
              <option value="1D">1 Day (Positional Analysis)</option>
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 4: AUDIO FEEDBACK */}
      <section className="bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] rounded-[22px] p-5 sm:p-6 space-y-5 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-neutral-200 shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white">Terminal Audio Signals</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">High-fidelity sound cues for instant execution confirmation.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07]">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Order Fill Chime</span>
              <span className="text-xs text-slate-500 dark:text-neutral-400">Plays when an order is matched and executed by your broker.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => playTestChime('fill')} className="text-xs h-8 rounded-full">
                Test Sound
              </Button>
              <button
                type="button"
                onClick={() => setSoundOrderFill(!soundOrderFill)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${soundOrderFill ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${soundOrderFill ? 'translate-x-5 bg-white dark:bg-slate-900' : 'translate-x-0 bg-white'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07]">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Take Profit Target Victory Bell</span>
              <span className="text-xs text-slate-500 dark:text-neutral-400">Pleasant victory chime when your trade hits TP target.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => playTestChime('tp')} className="text-xs h-8 rounded-full">
                Test Sound
              </Button>
              <button
                type="button"
                onClick={() => setSoundTakeProfit(!soundTakeProfit)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${soundTakeProfit ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${soundTakeProfit ? 'translate-x-5 bg-white dark:bg-slate-900' : 'translate-x-0 bg-white'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA]/80 dark:bg-white/[0.03] border border-slate-200/75 dark:border-white/[0.07]">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Stop Loss Alert Sound</span>
              <span className="text-xs text-slate-500 dark:text-neutral-400">Noticeable audio alert when a stop loss is triggered.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => playTestChime('sl')} className="text-xs h-8 rounded-full">
                Test Sound
              </Button>
              <button
                type="button"
                onClick={() => setSoundStopLoss(!soundStopLoss)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${soundStopLoss ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${soundStopLoss ? 'translate-x-5 bg-white dark:bg-slate-900' : 'translate-x-0 bg-white'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Save Bar */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSavePreferences}
          disabled={loading}
          className="h-10 px-7 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-slate-900 font-semibold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          {loading ? 'Saving Changes...' : saved ? '✓ Saved Successfully' : 'Save Trading Preferences'}
        </Button>
      </div>
    </div>
  );
}
