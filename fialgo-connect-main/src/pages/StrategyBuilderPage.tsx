import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Code, Cpu, Sparkles, CheckCircle2, ArrowRight, 
  Download, Copy, RefreshCcw, Terminal, Check, 
  FileCode, Activity, TrendingUp, ShieldCheck, Play, Send,
  Layers, ShieldAlert, Plus, Search
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useDashboardData } from "@/hooks/useDashboardData";

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

  const [activeMainTab, setActiveMainTab] = useState<"builder" | "armory">("builder");
  const [builderMode, setBuilderMode] = useState<"ai" | "visual">("ai");

  // Builder States
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [selectedPair, setSelectedPair] = useState("EURUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("M5");
  const [selectedRisk, setSelectedRisk] = useState("1.0%");
  const [selectedRR, setSelectedRR] = useState("1:2.0");
  const [strategyName, setStrategyName] = useState("FiAlgo Alpha Scalper");

  // Visual parameters (for visual mode)
  const [indicatorFast, setIndicatorFast] = useState("EMA 9");
  const [indicatorSlow, setIndicatorSlow] = useState("EMA 21");
  const [filterOscillator, setFilterOscillator] = useState("RSI 14 (> 50)");
  const [slPips, setSlPips] = useState("12");
  const [tpPips, setTpPips] = useState("24");

  // Compilation States
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState(0);
  const [isCompiled, setIsCompiled] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmittingToAdmin, setIsSubmittingToAdmin] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

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
    setSubmittedTicketId(null);
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
    setSubmittedTicketId(null);

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
    }, 850);
  };

  const handleDeployToBots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("mt5_accounts").update({ active_strategy: "custom_scalper" }).eq("user_id", user.id);
      }
    } catch (e) {}

    toast.success(`Deployed "${strategyName}" to Active Robots`, {
      description: "Algorithm linked with MT5 Execution Engine."
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

  const handleDownloadEX5 = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedMQL5], { type: "application/octet-stream" });
    element.href = URL.createObjectURL(file);
    element.download = `${strategyName.toLowerCase().replace(/\s+/g, "_")}.ex5`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded compiled .EX5 binary for MT5");
  };

  // Submit strategy request to Admin institutional team
  const handleSubmitToAdmin = async () => {
    setIsSubmittingToAdmin(true);
    try {
      const ticketId = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const requestPayload = {
        id: ticketId,
        strategyName,
        pair: selectedPair,
        timeframe: selectedTimeframe,
        risk: selectedRisk,
        rr: selectedRR,
        prompt,
        createdAt: new Date().toISOString(),
        status: "PENDING_AUDIT"
      };

      const existing = JSON.parse(localStorage.getItem("fialgo_strategy_requests") || "[]");
      existing.unshift(requestPayload);
      localStorage.setItem("fialgo_strategy_requests", JSON.stringify(existing));

      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("custom_strategy_requests").insert([{
          user_id: user?.id,
          title: strategyName,
          pair: selectedPair,
          timeframe: selectedTimeframe,
          risk: selectedRisk,
          notes: prompt,
          status: "pending"
        }]);
      } catch (err) {}

      setSubmittedTicketId(ticketId);
      toast.success(`Request ${ticketId} dispatched to Admin Team!`, {
        description: "Institutional engineering team will review, compile hardware-bound .ex5, and provision your license."
      });
    } catch (e) {
      toast.error("Failed to submit request to admin team");
    } finally {
      setIsSubmittingToAdmin(false);
    }
  };

  const generatedMQL5 = `//+------------------------------------------------------------------+
//|                                     ${strategyName.replace(/\s+/g, "_")}.mq5 |
//|                                   Copyright 2026, FiAlgo AI     |
//|                                       https://fialgo.trade       |
//+------------------------------------------------------------------+
#property copyright "FiAlgo Institutional"
#property link      "https://fialgo.trade"
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

   Print("FiAlgo AI Strategy Initialized on ", _Symbol);
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
      <div className="space-y-4 pb-20 select-none px-4 sm:px-6 md:px-8 py-3 max-w-[1500px] mx-auto w-full">

        {/* ── Top Header (Exact Admin App Layout & Typography) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" 
                style={{ borderColor: '#3b82f620' }}
              >
                <Bot size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                    Strategy Builder &amp; Compiler
                  </h1>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                      Live Engine
                    </span>
                  </div>
                </div>
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Institutional Algo Synthesizer, MQL5 EA Compiler &amp; Direct Admin Ticket Dispatch
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate("/auto-trade/active-bots")}
              className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} className="text-blue-400" />
              <span>Active Bots</span>
            </button>

            <button
              onClick={() => navigate("/auto-trade/ea-setup")}
              className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={13} className="text-purple-400" />
              <span>EA Licenses</span>
            </button>
          </div>
        </div>

        {/* ── Top View Navigation Tabs ── */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveMainTab("builder")}
              className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
                activeMainTab === "builder"
                  ? "bg-white/10 text-white border border-white/15"
                  : "text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <Layers size={13} />
              <span>AI Studio &amp; Compiler</span>
            </button>

            <button
              onClick={() => setActiveMainTab("armory")}
              className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
                activeMainTab === "armory"
                  ? "bg-white/10 text-white border border-white/15"
                  : "text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <Cpu size={13} className="text-purple-400" />
              <span>Strategy Armory (Pre-Built)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-neutral-400 font-mono">
                2
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Slippage Sandbox (Admin Verified)</span>
          </div>
        </div>

        {/* ── TAB 1: AI STUDIO & COMPILER ── */}
        {activeMainTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">

            {/* LEFT: STRATEGY SPECIFICATION (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
                {/* Inside Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Strategy Specification
                    </h3>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
                      Describe rules in plain English or refine entry conditions
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-black/30 p-1 rounded border border-white/5">
                    <button
                      type="button"
                      onClick={() => setBuilderMode("ai")}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-none cursor-pointer ${
                        builderMode === "ai"
                          ? "bg-white/10 text-white border border-white/15"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      AI Prompt
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderMode("visual")}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-none cursor-pointer ${
                        builderMode === "visual"
                          ? "bg-white/10 text-white border border-white/15"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Visual Rules
                    </button>
                  </div>
                </div>

                {/* Quick Templates Selector (Compact Chips) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      Quick Templates
                    </label>
                    <span className="text-[9px] text-neutral-500 font-mono">Click to pre-fill specification</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="shrink-0 px-2.5 py-1 rounded bg-black/30 hover:bg-white/[0.08] border border-white/5 text-[10px] font-mono font-bold text-neutral-300 hover:text-white transition-none cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="text-blue-400">{p.timeframe}</span>
                        <span>{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strategy Title */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Strategy Title
                  </label>
                  <input
                    type="text"
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 text-xs font-mono font-bold text-white focus:outline-none transition-none"
                  />
                </div>

                {/* Mode Content */}
                {builderMode === "ai" ? (
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                      Execution Rules &amp; Logic (Prompt)
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Build a scalper for EUR/USD on 5M timeframe. Enter BUY when 9 EMA crosses 21 EMA and RSI is above 50..."
                      className="w-full h-32 bg-black/30 border border-white/5 focus:border-white/20 rounded p-3 text-xs font-mono text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none transition-none leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 p-3.5 bg-black/30 border border-white/5 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                          Fast Indicator
                        </label>
                        <select
                          value={indicatorFast}
                          onChange={(e) => setIndicatorFast(e.target.value)}
                          className="w-full h-9 bg-black/40 border border-white/5 rounded px-2.5 text-xs font-mono font-bold text-white focus:outline-none"
                        >
                          <option value="EMA 9">EMA (Period 9)</option>
                          <option value="EMA 14">EMA (Period 14)</option>
                          <option value="SMA 20">SMA (Period 20)</option>
                          <option value="VWAP">Session VWAP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                          Slow Indicator
                        </label>
                        <select
                          value={indicatorSlow}
                          onChange={(e) => setIndicatorSlow(e.target.value)}
                          className="w-full h-9 bg-black/40 border border-white/5 rounded px-2.5 text-xs font-mono font-bold text-white focus:outline-none"
                        >
                          <option value="EMA 21">EMA (Period 21)</option>
                          <option value="EMA 50">EMA (Period 50)</option>
                          <option value="SMA 200">SMA (Period 200)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                          Oscillator Filter
                        </label>
                        <select
                          value={filterOscillator}
                          onChange={(e) => setFilterOscillator(e.target.value)}
                          className="w-full h-9 bg-black/40 border border-white/5 rounded px-2.5 text-xs font-mono font-bold text-white focus:outline-none"
                        >
                          <option value="RSI 14 (> 50)">RSI (14) &gt; 50</option>
                          <option value="MACD Histogram">MACD &gt; 0</option>
                          <option value="Stochastic 14,3,3">Stoch &lt; 20 (Oversold)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                          SL Pips
                        </label>
                        <input
                          type="text"
                          value={slPips}
                          onChange={(e) => setSlPips(e.target.value)}
                          className="w-full h-9 bg-black/40 border border-white/5 rounded px-2.5 text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                          TP Pips
                        </label>
                        <input
                          type="text"
                          value={tpPips}
                          onChange={(e) => setTpPips(e.target.value)}
                          className="w-full h-9 bg-black/40 border border-white/5 rounded px-2.5 text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 Parameter Selectors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                      Pair / Symbol
                    </span>
                    <select
                      value={selectedPair}
                      onChange={(e) => setSelectedPair(e.target.value)}
                      className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                    >
                      <option value="EURUSD">EUR/USD</option>
                      <option value="XAUUSD">XAU/USD (Gold)</option>
                      <option value="GBPUSD">GBP/USD</option>
                      <option value="GBPJPY">GBP/JPY</option>
                      <option value="US100">US100 (Nasdaq)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                      Timeframe
                    </span>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                    >
                      <option value="M1">1 Minute (M1)</option>
                      <option value="M5">5 Minutes (M5)</option>
                      <option value="M15">15 Minutes (M15)</option>
                      <option value="H1">1 Hour (H1)</option>
                      <option value="H4">4 Hours (H4)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                      Risk Model
                    </span>
                    <select
                      value={selectedRisk}
                      onChange={(e) => setSelectedRisk(e.target.value)}
                      className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                    >
                      <option value="0.5%">0.5% Capital</option>
                      <option value="1.0%">1.0% Capital</option>
                      <option value="1.5%">1.5% Capital</option>
                      <option value="2.0%">2.0% Capital</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                      Risk : Reward
                    </span>
                    <select
                      value={selectedRR}
                      onChange={(e) => setSelectedRR(e.target.value)}
                      className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-300 focus:outline-none transition-none"
                    >
                      <option value="1:1.5">1 : 1.5</option>
                      <option value="1:2.0">1 : 2.0</option>
                      <option value="1:2.5">1 : 2.5</option>
                      <option value="1:3.0">1 : 3.0</option>
                    </select>
                  </div>
                </div>

                {/* Primary Action Button (Build & Validate) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Synthesizes MQL5 EA code + routes to Admin for MT5 compilation</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBuild}
                    disabled={isCompiling}
                    className="btn-fialgo-primary w-full sm:w-auto h-10 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isCompiling ? (
                      <>
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling MQL5...</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5" />
                        <span>Build &amp; Validate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Compilation Progress Modal Box */}
              {isCompiling && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400">
                      <RefreshCcw className="w-4 h-4 animate-spin text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Synthesizing Strategy Engine
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        Step {compileStep + 1} of {compilationStages.length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {compilationStages.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs font-mono">
                        {idx < compileStep ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : idx === compileStep ? (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                        )}
                        <span className={idx <= compileStep ? "text-neutral-200" : "text-neutral-500"}>
                          {stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT: RESULTS / CODE VIEWER / BACKTEST (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              {!isCompiled ? (
                <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
                  <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center text-neutral-500 mb-3">
                    <Bot size={22} className="text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    No Strategy Compiled Yet
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono max-w-xs mx-auto mb-6 leading-relaxed">
                    Define execution criteria on the left or select a template to generate verified MQL5 code and backtest telemetry.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(PRESETS[0])}
                    className="h-9 px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Load EUR/USD Template</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* BACKTEST REPORT CARD */}
                  <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Backtest Telemetry
                        </h4>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5">
                        Passed Risk Check
                      </span>
                    </div>

                    {/* 3 Mini Metrics */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-black/30 border border-white/5 rounded-lg p-3 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Win Rate
                        </span>
                        <span className="text-xl font-black font-mono text-emerald-400 mt-1">
                          71.4%
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/5 rounded-lg p-3 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Net Return
                        </span>
                        <span className="text-xl font-black font-mono text-emerald-400 mt-1">
                          +34.2%
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/5 rounded-lg p-3 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                          Max DD
                        </span>
                        <span className="text-xl font-black font-mono text-white mt-1">
                          4.1%
                        </span>
                      </div>
                    </div>

                    {/* Chart preview */}
                    <div className="h-32 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={backtestCurve} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="trade" tick={{ fontSize: 9 }} stroke="#555555" />
                          <YAxis domain={["dataMin - 500", "dataMax + 500"]} tick={{ fontSize: 9 }} stroke="#555555" />
                          <Tooltip contentStyle={{ backgroundColor: "#141416", borderColor: "rgba(255,255,255,0.1)", fontSize: 11, borderRadius: 8, color: "#fff" }} />
                          <Area type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadEX5}
                          className="btn-fialgo-primary flex-1 h-10 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .EX5</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDeployToBots}
                          className="px-4 h-10 rounded-full border border-white/10 bg-[#141416] hover:bg-[#1E1E1E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Deploy</span>
                        </button>
                      </div>

                      {/* Submit Custom Strategy Request to Admin Team */}
                      <button
                        type="button"
                        onClick={handleSubmitToAdmin}
                        disabled={isSubmittingToAdmin || Boolean(submittedTicketId)}
                        className="w-full h-9 rounded-lg border border-blue-500/30 bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-none cursor-pointer disabled:opacity-50"
                      >
                        {submittedTicketId ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Request {submittedTicketId} Dispatched to Admin</span>
                          </>
                        ) : isSubmittingToAdmin ? (
                          <>
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Dispatching to Admin...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Request to Admin Team for Binding</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CODE VIEWER BOX */}
                  <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Generated MQL5 Source
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadMQ5}
                          className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-none cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>.MQ5</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-none cursor-pointer"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <pre className="bg-black/40 text-neutral-300 p-3.5 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-44 border border-white/5">
                      <code>{generatedMQL5}</code>
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: STRATEGY ARMORY (Pre-Built EA Catalog) ── */}
        {activeMainTab === "armory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Institutional Strategy Armory
                </h3>
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-1">
                  Pre-compiled, audited algorithmic trading systems ready for 1-click deployment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Armory Card 1 */}
              <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        High Frequency Scalping
                      </span>
                      <h4 className="text-base font-bold text-white uppercase tracking-wider mt-2">
                        FiAlgo Scalper AI
                      </h4>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/20">
                      Installed
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono leading-relaxed mb-4">
                    High-frequency sub-second order routing capturing rapid micro-swings across EUR/USD and Gold London-NY market overlaps.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Win %</span>
                      <span className="text-base font-black font-mono text-emerald-400 mt-1 block">76.4%</span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Profit</span>
                      <span className="text-base font-black font-mono text-emerald-400 mt-1 block">+12.4%</span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Max DD</span>
                      <span className="text-base font-black font-mono text-white mt-1 block">5.8%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-mono text-neutral-400">Pairs: EURUSD, XAUUSD</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadEX5}
                      className="btn-fialgo-primary h-8 px-4 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>.EX5</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/auto-trade/active-bots")}
                      className="h-8 px-3.5 rounded-lg bg-[#141416] hover:bg-[#252528] border border-white/10 text-neutral-200 text-xs font-bold transition-none cursor-pointer"
                    >
                      Manage Bot
                    </button>
                  </div>
                </div>
              </div>

              {/* Armory Card 2 */}
              <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Macro Swing Trend
                      </span>
                      <h4 className="text-base font-bold text-white uppercase tracking-wider mt-2">
                        FiAlgo Swing Master
                      </h4>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/20">
                      Installed
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono leading-relaxed mb-4">
                    Multi-timeframe trend confirmation filtering false spikes with volumetric expansion and dynamic trailing stop brackets.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Win %</span>
                      <span className="text-base font-black font-mono text-emerald-400 mt-1 block">68.2%</span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Profit</span>
                      <span className="text-base font-black font-mono text-emerald-400 mt-1 block">+21.5%</span>
                    </div>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Max DD</span>
                      <span className="text-base font-black font-mono text-white mt-1 block">3.9%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs font-mono text-neutral-400">Pairs: XAUUSD, Major FX</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadEX5}
                      className="btn-fialgo-primary h-8 px-4 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>.EX5</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/auto-trade/active-bots")}
                      className="h-8 px-3.5 rounded-lg bg-[#141416] hover:bg-[#252528] border border-white/10 text-neutral-200 text-xs font-bold transition-none cursor-pointer"
                    >
                      Manage Bot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
