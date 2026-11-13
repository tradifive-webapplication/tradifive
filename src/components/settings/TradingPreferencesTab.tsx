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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-500" />
            Trading & Risk Preferences
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#949ba4] mt-1">
            Configure automated risk guardrails, default order presets, regional currency, and audio triggers.
          </p>
        </div>
        <Button
          onClick={handleSavePreferences}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full px-6 shadow-sm active:scale-95"
        >
          {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save Preferences'}
        </Button>
      </div>

      {/* SECTION 1: RISK GUARD & CIRCUIT BREAKER */}
      <section className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[28px] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Capital Risk Guard</h3>
              <p className="text-xs text-slate-500 dark:text-[#949ba4]">Hard circuit breakers that prevent overtrading and account blowups.</p>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Active Protection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Daily Max Loss Limit */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
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
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Trading stops once reached.</p>
          </div>

          {/* Max Risk Per Trade */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
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
                className="w-full pl-3 pr-8 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculates maximum lot size.</p>
          </div>

          {/* Max Open Positions */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Max Open Trades
            </label>
            <select
              value={maxOpenPositions}
              onChange={e => setMaxOpenPositions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1">1 Trade (Strict Focus)</option>
              <option value="2">2 Trades</option>
              <option value="3">3 Trades (Recommended)</option>
              <option value="5">5 Trades</option>
              <option value="10">10 Trades (Multi-asset)</option>
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Prevents position stacking.</p>
          </div>
        </div>

        {/* Guardrail Toggles */}
        <div className="space-y-3 pt-2">
          {/* Hard Drawdown Lock */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5">
            <div className="space-y-0.5 pr-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Hard Drawdown Lock (Discipline Circuit Breaker)
              </span>
              <p className="text-xs text-slate-500 dark:text-[#949ba4]">
                When your daily loss limit is hit, lock terminal execution until next market open at 09:15 AM IST.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHardDrawdownLock(!hardDrawdownLock)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hardDrawdownLock ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${hardDrawdownLock ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Auto Breakeven */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5">
            <div className="space-y-0.5 pr-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Automated Breakeven Trigger
              </span>
              <p className="text-xs text-slate-500 dark:text-[#949ba4]">
                Automatically moves your Stop Loss to entry price when trade profit hits {breakevenTriggerRatio} R:R.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={breakevenTriggerRatio}
                onChange={e => setBreakevenTriggerRatio(e.target.value)}
                disabled={!autoBreakeven}
                className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-black border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white disabled:opacity-40"
              >
                <option value="1:1">1:1 R:R</option>
                <option value="1:1.5">1:1.5 R:R</option>
                <option value="1:2">1:2 R:R</option>
              </select>
              <button
                type="button"
                onClick={() => setAutoBreakeven(!autoBreakeven)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${autoBreakeven ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${autoBreakeven ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ORDER EXECUTION PRESETS */}
      <section className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[28px] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Execution Defaults</h3>
            <p className="text-xs text-slate-500 dark:text-[#949ba4]">Prefill parameters when opening fast trade tickets or copying signals.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default Order Type */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultOrderType('market')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${defaultOrderType === 'market' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-black/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setDefaultOrderType('limit')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${defaultOrderType === 'limit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-black/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
              >
                Limit Order
              </button>
            </div>
          </div>

          {/* Default Take Profit */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Target (R:R)</label>
            <select
              value={defaultTakeProfitRatio}
              onChange={e => setDefaultTakeProfitRatio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1:1.5">1:1.5 (Quick Scalp)</option>
              <option value="1:2">1:2 (Institutional Standard)</option>
              <option value="1:3">1:3 (Trend Following)</option>
              <option value="1:4">1:4 (Swing Runner)</option>
            </select>
          </div>

          {/* Default Stop Loss */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Stop Loss</label>
            <div className="flex gap-2">
              <select
                value={defaultStopLossMode}
                onChange={e => setDefaultStopLossMode(e.target.value)}
                className="w-1/2 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="pips">Pips / Points</option>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed Currency</option>
              </select>
              <input
                type="number"
                value={defaultStopLossValue}
                onChange={e => setDefaultStopLossValue(e.target.value)}
                className="w-1/2 px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Slippage */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Max Slippage Tolerance</label>
            <select
              value={slippagePips}
              onChange={e => setSlippagePips(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1">1 Pip / Pt (Strict)</option>
              <option value="2">2 Pips / Pts (Standard)</option>
              <option value="5">5 Pips / Pts (High Volatility)</option>
            </select>
          </div>
        </div>

        {/* One Click Trading Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5">
          <div className="space-y-0.5 pr-4">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              One-Click Scalp Execution
            </span>
            <p className="text-xs text-slate-500 dark:text-[#949ba4]">
              Executes trades instantly upon clicking Buy/Sell without opening a secondary confirmation modal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOneClickTrading(!oneClickTrading)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${oneClickTrading ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${oneClickTrading ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* SECTION 3: MARKET & CURRENCY */}
      <section className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[28px] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Market & Currency Localization</h3>
            <p className="text-xs text-slate-500 dark:text-[#949ba4]">Choose your default asset universe and number formatting.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Primary Market Universe</label>
            <select
              value={primaryMarket}
              onChange={e => setPrimaryMarket(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="indian">Indian Equities, F&O & Commodities (NSE / BSE)</option>
              <option value="global">Global Forex, Indices & Crypto (MT5 / Vantage)</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Display Currency</label>
            <select
              value={displayCurrency}
              onChange={e => setDisplayCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Number Formatting</label>
            <select
              value={numberFormat}
              onChange={e => setNumberFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="inr_lakhs">Indian System (₹ 1,50,000 / Lakhs & Crores)</option>
              <option value="intl_millions">International System ($ 150,000 / Millions)</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Default Chart Timeframe</label>
            <select
              value={defaultTimeframe}
              onChange={e => setDefaultTimeframe(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
      <section className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[28px] p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Terminal Audio Signals</h3>
            <p className="text-xs text-slate-500 dark:text-[#949ba4]">High-fidelity sound cues for instant execution confirmation.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Order Fill Chime</span>
              <span className="text-xs text-slate-500">Plays when an order is matched and executed by your broker.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => playTestChime('fill')} className="text-xs h-8">
                Test Sound
              </Button>
              <button
                type="button"
                onClick={() => setSoundOrderFill(!soundOrderFill)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${soundOrderFill ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${soundOrderFill ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Take Profit Target Victory Bell</span>
              <span className="text-xs text-slate-500">Pleasant victory chime when your trade hits TP target.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => playTestChime('tp')} className="text-xs h-8">
                Test Sound
              </Button>
              <button
                type="button"
                onClick={() => setSoundTakeProfit(!soundTakeProfit)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${soundTakeProfit ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${soundTakeProfit ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#161618] border border-slate-200/60 dark:border-white/5">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Stop Loss Alert Sound</span>
              <span className="text-xs text-slate-500">Noticeable audio alert when a stop loss is triggered.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => playTestChime('sl')} className="text-xs h-8">
                Test Sound
              </Button>
              <button
                type="button"
                onClick={() => setSoundStopLoss(!soundStopLoss)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${soundStopLoss ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${soundStopLoss ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Save Bar */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSavePreferences}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          {loading ? 'Saving Changes...' : saved ? '✓ Saved Successfully' : 'Save Trading Preferences'}
        </Button>
      </div>
    </div>
  );
}
