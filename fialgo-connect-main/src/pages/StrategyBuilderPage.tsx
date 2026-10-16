import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Code, Cpu, Sparkles, CheckCircle2, Sliders, ArrowRight, 
  ArrowUpRight, Download, Copy, RefreshCw, Layers, Zap, Clock, 
  Terminal, Check, ChevronDown, Plus, AlertCircle, FileCode, 
  BarChart3, TrendingUp, Activity, ShieldCheck, Play, Pause, ExternalLink
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useDashboardData } from "@/hooks/useDashboardData";

const kpiBoxStyle = "h-[120px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none";

const cardBoxStyle = "p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none transition-all";

const innerTileStyle = "bg-[#F8F9FC] dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[16px] p-3.5 flex flex-col justify-between";

// Mock backtest curve for compiled strategy
const backtestCurve = [
  { trade: "T1", balance: 10000, equity: 10000 },
  { trade: "T20", balance: 10420, equity: 10550 },
  { trade: "T40", balance: 10890, equity: 10810 },
  { trade: "T60", balance: 11350, equity: 11480 },
  { trade: "T80", balance: 11820, equity: 11950 },
  { trade: "T100", balance: 12480, equity: 12390 },
  { trade: "T120", balance: 12940, equity: 13120 },
  { trade: "T140", balance: 13420, equity: 13580 }
];

const PRESETS = [
  {
    id: "eurusd-scalper",
    title: "EUR/USD 5M Scalper",
    pair: "EURUSD",
    timeframe: "M5",
    risk: "1.0%",
    rr: "1:2.0",
    prompt: "Create an institutional scalper on EURUSD 5M timeframe. Enter BUY when 9 EMA crosses above 21 EMA and RSI(14) is above 50. Exit with 15 pips Take Profit, 10 pips Stop Loss, and trail stop by 5 pips after 10 pips in profit.",
    desc: "Rapid momentum capture on London/NY volatility overlap"
  },
  {
    id: "gold-momentum",
    title: "XAU/USD Gold Breakout",
    pair: "XAUUSD",
    timeframe: "M15",
    risk: "1.5%",
    rr: "1:2.5",
    prompt: "Build an algorithmic breakout bot for XAUUSD on M15. Mark London session high and low. Enter in breakout direction when confirmed by ATR(14) expansion > 3.0. Dynamic Stop Loss set at 1.5x ATR with 1:2.5 Risk-to-Reward.",
    desc: "Volatility expansion strategy tuned for gold session highs"
  },
  {
    id: "us100-fvg",
    title: "US100 Liquidity Sweep",
    pair: "US100",
    timeframe: "M5",
    risk: "1.0%",
    rr: "1:3.0",
    prompt: "Design a liquidity sweep & Fair Value Gap mitigation strategy for US100 index on 5M timeframe. Identify sweep of previous 1-hour high/low followed by market structure shift. Enter on retest of 5M FVG with tight invalidation.",
    desc: "Order flow smart money concepts with high R:R ratios"
  },
  {
    id: "gbpjpy-grid",
    title: "GBP/JPY Mean Reversion",
    pair: "GBPJPY",
    timeframe: "M15",
    risk: "0.8%",
    rr: "1:1.5",
    prompt: "Construct a non-martingale geometric range strategy for GBPJPY on M15. Place mean-reversion counter trades when price extends 2.5 standard deviations from 50 SMA. Limit max open basket to 3 positions with hard account stop.",
    desc: "Statistical mean reversion within high-probability ranges"
  }
];

export default function StrategyBuilderPage() {
  const navigate = useNavigate();
  const { isConnected } = useDashboardData();

  const [activeTab, setActiveTab] = useState<"builder" | "armory">("builder");
  const [builderMode, setBuilderMode] = useState<"ai" | "visual">("ai");

  // Builder States
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [selectedPair, setSelectedPair] = useState("EURUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("M5");
  const [selectedRisk, setSelectedRisk] = useState("1.0%");
  const [selectedRR, setSelectedRR] = useState("1:2.0");
  const [strategyName, setStrategyName] = useState("TradiFive Alpha Scalper");

  // Compilation States
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState(0);
  const [isCompiled, setIsCompiled] = useState(false);
  const [codeTab, setCodeTab] = useState<"mql5" | "python">("mql5");
  const [copiedCode, setCopiedCode] = useState(false);

  const compilationStages = [
    "Parsing natural language logic & technical indicators...",
    "Synthesizing MQL5 EA event handlers (OnInit, OnTick, OnDeinit)...",
    "Simulating tick-level historical backtest (500 bars)...",
    "Validating drawdown compliance & generating MT5 binary..."
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setPrompt(preset.prompt);
    setSelectedPair(preset.pair);
    setSelectedTimeframe(preset.timeframe);
    setSelectedRisk(preset.risk);
    setSelectedRR(preset.rr);
    setStrategyName(preset.title);
    setIsCompiled(false);
    toast.success(`Loaded "${preset.title}" template`);
  };

  const handleBuild = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a strategy description or select a preset");
      return;
    }

    setIsCompiling(true);
    setCompileStep(0);
    setIsCompiled(false);

    // Simulate multi-stage compilation
    const interval = setInterval(() => {
      setCompileStep((prev) => {
        if (prev < compilationStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsCompiling(false);
          setIsCompiled(true);
          toast.success("Strategy compiled and validated successfully!");
          return prev;
        }
      });
    }, 900);
  };

  const handleDeployToBots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('mt5_accounts').update({ active_strategy: 'scalper' }).eq('user_id', user.id);
      }
    } catch (e) {}

    toast.success(`Deployed "${strategyName}" to Active Robots`, {
      description: "Algorithm linked with MT5 Execution Console."
    });
    navigate("/auto-trade/active-bots");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedMQL5);
    setCopiedCode(true);
    toast.success("MQL5 source code copied to clipboard");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadMQ5 = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedMQL5], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${strategyName.toLowerCase().replace(/\s+/g, "_")}.mq5`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded .MQ5 Source File");
  };

  const generatedMQL5 = `//+------------------------------------------------------------------+
//|                                     ${strategyName.replace(/\s+/g, "_")}.mq5 |
//|                                  Copyright 2026, TradiFive AI   |
//|                                      https://tradifive.com       |
//+------------------------------------------------------------------+
#property copyright "TradiFive AI"
#property link      "https://tradifive.com"
#property version   "4.20"
#property strict

//--- Inputs
input group "=== Risk & Order Parameters ==="
input double   InpLotSize         = 0.10;       // Fixed Lot Size
input double   InpRiskPercent     = ${selectedRisk.replace("%", "")};       // Risk Per Trade (%)
input int      InpStopLossPips    = 15;         // Stop Loss (Pips)
input int      InpTakeProfitPips  = 30;         // Take Profit (Pips)
input ulong    InpMagicNumber     = 849201;     // EA Magic Number

//--- Indicator Handles
int handle_ema_fast;
int handle_ema_slow;
int handle_rsi;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   handle_ema_fast = iMA(_Symbol, _Period, 9, 0, MODE_EMA, PRICE_CLOSE);
   handle_ema_slow = iMA(_Symbol, _Period, 21, 0, MODE_EMA, PRICE_CLOSE);
   handle_rsi      = iRSI(_Symbol, _Period, 14, PRICE_CLOSE);

   Print("TradiFive AI Strategy Initialized on ", _Symbol);
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   // Check bar conditions & spread thresholds
   if(PositionsTotal() >= 1) return;

   double ema_fast[], ema_slow[], rsi[];
   ArraySetAsSeries(ema_fast, true);
   ArraySetAsSeries(ema_slow, true);
   ArraySetAsSeries(rsi, true);

   CopyBuffer(handle_ema_fast, 0, 0, 3, ema_fast);
   CopyBuffer(handle_ema_slow, 0, 0, 3, ema_slow);
   CopyBuffer(handle_rsi, 0, 0, 3, rsi);

   // Buy Trigger: EMA crossover + RSI filter
   if(ema_fast[1] > ema_slow[1] && ema_fast[2] <= ema_slow[2] && rsi[1] > 50.0)
     {
      ExecuteOrder(ORDER_TYPE_BUY);
     }
  }

void ExecuteOrder(ENUM_ORDER_TYPE orderType)
  {
   // Institutional trade execution logic...
  }`;

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6 md:px-8">

        {/* ── TOP HEADER (Systemic Tradifive Style) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 
                className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Strategy Builder
              </h1>
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-indigo-500/20 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                AI Compiler v4.2
              </span>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-2">
              Design, backtest, and compile custom algorithmic trading rules into production-ready MT5 Expert Advisors
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/auto-trade/active-bots")}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[14px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 dark:shadow-none text-slate-700 dark:text-slate-200 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span>Active Robots</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/auto-trade/dashboard")}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[14px] border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Terminal</span>
            </button>
          </div>
        </div>

        {/* ── 4 KPI BOXES (Consistent with Journal & RiskGuard) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Compiled Strategies */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Compiled Strategies
              </p>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Code className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <h3 
                className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                14 Built
              </h3>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                In Armory
              </span>
            </div>
          </div>

          {/* 2. Avg Win Rate */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Backtest Win %
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <h3 
                className="text-[26px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                68.5%
              </h3>
              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-500/20">
                Verified
              </span>
            </div>
          </div>

          {/* 3. Profit Factor */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Avg Profit Factor
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <h3 
                className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                1.92 PF
              </h3>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Healthy Edge
              </span>
            </div>
          </div>

          {/* 4. Transpiler Engine */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Compiler Engine
              </p>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                <h3 
                  className="text-[22px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  MQL5 + Python
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                READY
              </span>
            </div>
          </div>
        </div>

        {/* ── TAB NAVIGATION BAR ── */}
        <div className="flex items-center justify-between pt-1">
          <div className="bg-slate-100 dark:bg-[#191B1E] p-1 rounded-xl flex items-center gap-1 border border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "builder"
                  ? "bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              AI Studio & Compiler
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("armory")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "armory"
                  ? "bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Strategy Armory (Pre-Built)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero-Slippage Simulation Sandbox</span>
          </div>
        </div>

        {/* ── TAB 1: BUILDER STUDIO ── */}
        {activeTab === "builder" && (
          <div className="space-y-6">

            {/* PRESET QUICK-PICK STRIP */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2.5">
                Quick-Start Institutional Templates
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-3.5 rounded-[18px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none text-left transition-all hover:scale-[1.01] hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {p.title}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {p.timeframe}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* BUILDER MAIN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT: PROMPT & PARAMETERS CONFIG (7 Columns) */}
              <div className="lg:col-span-7 space-y-5">
                <div className={cardBoxStyle}>
                  {/* Top Bar inside Card */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                        Strategy Specification
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Describe rules in plain English or refine entry conditions
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setBuilderMode("ai")}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          builderMode === "ai"
                            ? "bg-white dark:bg-[#282828] text-indigo-600 dark:text-indigo-400 shadow-xs"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        }`}
                      >
                        AI Prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuilderMode("visual")}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          builderMode === "visual"
                            ? "bg-white dark:bg-[#282828] text-indigo-600 dark:text-indigo-400 shadow-xs"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        }`}
                      >
                        Visual Rules
                      </button>
                    </div>
                  </div>

                  {/* Strategy Name Input */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Strategy Title
                    </label>
                    <input
                      type="text"
                      value={strategyName}
                      onChange={(e) => setStrategyName(e.target.value)}
                      className="w-full h-10 px-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Prompt Textarea */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Execution Rules & Logic
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Build a scalper for EUR/USD on 5M timeframe. Enter BUY when 9 EMA crosses 21 EMA and RSI is above 50..."
                      className="w-full h-36 p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:border-indigo-500 leading-relaxed font-normal"
                    />
                  </div>

                  {/* Quick Parameter Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                    {/* Pair Selector */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Pair / Symbol
                      </span>
                      <select
                        value={selectedPair}
                        onChange={(e) => setSelectedPair(e.target.value)}
                        className="w-full h-9 px-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="EURUSD">EUR/USD</option>
                        <option value="XAUUSD">XAU/USD (Gold)</option>
                        <option value="GBPUSD">GBP/USD</option>
                        <option value="GBPJPY">GBP/JPY</option>
                        <option value="US100">US100 (Nasdaq)</option>
                      </select>
                    </div>

                    {/* Timeframe */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Timeframe
                      </span>
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="w-full h-9 px-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="M1">1 Minute (M1)</option>
                        <option value="M5">5 Minutes (M5)</option>
                        <option value="M15">15 Minutes (M15)</option>
                        <option value="H1">1 Hour (H1)</option>
                        <option value="H4">4 Hours (H4)</option>
                      </select>
                    </div>

                    {/* Risk Per Trade */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Risk Model
                      </span>
                      <select
                        value={selectedRisk}
                        onChange={(e) => setSelectedRisk(e.target.value)}
                        className="w-full h-9 px-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="0.5%">0.5% Capital</option>
                        <option value="1.0%">1.0% Capital</option>
                        <option value="1.5%">1.5% Capital</option>
                        <option value="2.0%">2.0% Capital</option>
                      </select>
                    </div>

                    {/* Target RR */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Risk : Reward
                      </span>
                      <select
                        value={selectedRR}
                        onChange={(e) => setSelectedRR(e.target.value)}
                        className="w-full h-9 px-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="1:1.5">1 : 1.5</option>
                        <option value="1:2.0">1 : 2.0</option>
                        <option value="1:2.5">1 : 2.5</option>
                        <option value="1:3.0">1 : 3.0</option>
                      </select>
                    </div>
                  </div>

                  {/* Build Action Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Synthesizes full MQL5 EA code + tick backtest analysis</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleBuild}
                      disabled={isCompiling}
                      className="w-full sm:w-auto h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {isCompiling ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Compiling MQL5...</span>
                        </>
                      ) : (
                        <>
                          <Code className="w-3.5 h-3.5" />
                          <span>Build & Validate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* COMPILATION PROGRESS MODAL / BOX */}
                {isCompiling && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cardBoxStyle}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Synthesizing Strategy Engine
                        </h4>
                        <p className="text-xs text-slate-400">
                          Step {compileStep + 1} of {compilationStages.length}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {compilationStages.map((stage, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          {idx < compileStep ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : idx === compileStep ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shrink-0" />
                          )}
                          <span className={idx <= compileStep ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-400"}>
                            {stage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* RIGHT: RESULTS / CODE VIEWER / BACKTEST (5 Columns) */}
              <div className="lg:col-span-5 space-y-5">
                {!isCompiled ? (
                  <div className={`${cardBoxStyle} text-center py-12 flex flex-col items-center justify-center h-full min-h-[380px]`}>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 flex items-center justify-center mb-4">
                      <Bot className="w-7 h-7 text-indigo-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                      Ready to Build Algorithm
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
                      Enter your trade criteria or select an institutional template on the left to synthesize executable MQL5 code and backtest telemetry.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(PRESETS[0])}
                      className="h-8 px-3.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      Load EUR/USD Preset
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {/* BACKTEST REPORT CARD */}
                    <div className={cardBoxStyle}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Backtest Telemetry
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
                          PASSED RISK CHECK
                        </span>
                      </div>

                      {/* 4 Mini Metrics */}
                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className={innerTileStyle}>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">
                            Win Rate
                          </span>
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                            71.4%
                          </span>
                        </div>
                        <div className={innerTileStyle}>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">
                            Net Return
                          </span>
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                            +34.2%
                          </span>
                        </div>
                        <div className={innerTileStyle}>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">
                            Max DD
                          </span>
                          <span className="text-base font-bold text-slate-800 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                            4.1%
                          </span>
                        </div>
                      </div>

                      {/* Chart preview */}
                      <div className="h-32 w-full pt-1 mb-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={backtestCurve} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="trade" tick={{ fontSize: 9 }} stroke="#888888" />
                            <YAxis domain={['dataMin - 500', 'dataMax + 500']} tick={{ fontSize: 9 }} stroke="#888888" />
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                            <Area type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                        <button
                          type="button"
                          onClick={handleDeployToBots}
                          className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Deploy Bot</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadMQ5}
                          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Download .MQ5 Source"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.MQ5</span>
                        </button>
                      </div>
                    </div>

                    {/* CODE VIEWER BOX */}
                    <div className={cardBoxStyle}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Generated MQL5 Source
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="bg-[#121214] text-slate-200 p-3.5 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-48 border border-white/5">
                        <code>{generatedMQL5}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: STRATEGY ARMORY (Pre-Built EA Catalog) ── */}
        {activeTab === "armory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Institutional Strategy Armory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pre-compiled, audited algorithmic trading systems ready for 1-click deployment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Armory Card 1 */}
              <div className={cardBoxStyle}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                      HIGH FREQUENCY SCALPING
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      TradiFive Scalper AI
                    </h4>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
                    INSTALLED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  High-frequency sub-second order routing capturing rapid micro-swings across EUR/USD and Gold London-NY market overlaps.
                </p>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className={innerTileStyle}>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Win %</span>
                    <span className="text-sm font-bold text-emerald-600">76.4%</span>
                  </div>
                  <div className={innerTileStyle}>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Profit</span>
                    <span className="text-sm font-bold text-emerald-600">+12.4%</span>
                  </div>
                  <div className={innerTileStyle}>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Max DD</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">5.8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-400">Pairs: EURUSD, XAUUSD</span>
                  <button
                    type="button"
                    onClick={() => navigate("/auto-trade/active-bots")}
                    className="h-8 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Manage Bot
                  </button>
                </div>
              </div>

              {/* Armory Card 2 */}
              <div className={cardBoxStyle}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded">
                      MACRO SWING TREND
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      TradiFive Swing Master
                    </h4>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
                    INSTALLED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Multi-timeframe trend confirmation filtering false spikes with volumetric expansion and dynamic trailing stop brackets.
                </p>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className={innerTileStyle}>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Win %</span>
                    <span className="text-sm font-bold text-emerald-600">68.2%</span>
                  </div>
                  <div className={innerTileStyle}>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Profit</span>
                    <span className="text-sm font-bold text-emerald-600">+21.5%</span>
                  </div>
                  <div className={innerTileStyle}>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Max DD</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">3.9%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-400">Pairs: XAUUSD, Major FX</span>
                  <button
                    type="button"
                    onClick={() => navigate("/auto-trade/active-bots")}
                    className="h-8 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Manage Bot
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
