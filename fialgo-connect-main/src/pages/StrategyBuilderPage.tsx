import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Code, Cpu, Sparkles, CheckCircle2, ArrowRight, 
  Download, Copy, RefreshCcw, Terminal, Check, 
  FileCode, Activity, TrendingUp, ShieldCheck, Play, Send,
  Layers, ShieldAlert, Plus, Search, DollarSign, Clock,
  FileText, ExternalLink, BarChart3, Key, CheckCheck, QrCode
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useDashboardData } from "@/hooks/useDashboardData";

interface CustomBuildDeliverable {
  id: string;
  title: string;
  type: "INDICATOR" | "ALGO_EA" | "COMBO_SUITE";
  price: string;
  pair: string;
  timeframe: string;
  mt5Account: string;
  status: "SUBMITTED" | "PAYMENT_CONFIRMED" | "IN_DEVELOPMENT" | "QA_BACKTEST" | "DELIVERED";
  submittedDate: string;
  deliveredDate?: string;
  winRate?: string;
  profitFactor?: string;
  ex5Filename?: string;
  mq5Filename?: string;
  engineer?: string;
}

export default function StrategyBuilderPage() {
  const navigate = useNavigate();
  const { isConnected } = useDashboardData();

  const [activeMainTab, setActiveMainTab] = useState<"request" | "deliverables" | "ai_studio">("request");

  // Build Request Form States
  const [selectedBuildType, setSelectedBuildType] = useState<"INDICATOR" | "ALGO_EA" | "COMBO_SUITE">("ALGO_EA");
  const [strategyTitle, setStrategyTitle] = useState("");
  const [selectedPair, setSelectedPair] = useState("XAUUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("M5");
  const [executionLogic, setExecutionLogic] = useState("");
  const [stopLossPips, setStopLossPips] = useState("15");
  const [takeProfitPips, setTakeProfitPips] = useState("30");
  const [riskPercent, setRiskPercent] = useState("1.0%");
  const [mt5AccountNumber, setMt5AccountNumber] = useState("849201");
  const [clientNotes, setClientNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Deliverables list (seeded with real institutional deliverable for instant test)
  const [deliverables, setDeliverables] = useState<CustomBuildDeliverable[]>([
    {
      id: "DEV-84921",
      title: "Gold London Liquidity Breakout EA",
      type: "ALGO_EA",
      price: "₹40,000",
      pair: "XAUUSD (Gold)",
      timeframe: "M5 / M15",
      mt5Account: "#849201",
      status: "DELIVERED",
      submittedDate: "Nov 10, 2026",
      deliveredDate: "Nov 14, 2026",
      winRate: "78.4%",
      profitFactor: "2.14 PF",
      ex5Filename: "Gold_Breakout_Pro_v1.ex5",
      mq5Filename: "Gold_Breakout_Pro_v1.mq5",
      engineer: "FiAlgo Quant Engineering Team"
    },
    {
      id: "DEV-62019",
      title: "Fair Value Gap & OrderBlock Scanner",
      type: "INDICATOR",
      price: "₹20,000",
      pair: "Multi-Asset (Forex & Indices)",
      timeframe: "M1 to H4",
      mt5Account: "#849201",
      status: "DELIVERED",
      submittedDate: "Nov 02, 2026",
      deliveredDate: "Nov 05, 2026",
      winRate: "Verified Signals",
      profitFactor: "Non-Repainting",
      ex5Filename: "FVG_OrderBlock_Scanner.ex5",
      mq5Filename: "FVG_OrderBlock_Scanner.mq5",
      engineer: "FiAlgo Quant Engineering Team"
    }
  ]);

  const pricingMap = {
    INDICATOR: {
      priceNum: 20000,
      priceFormatted: "₹20,000",
      label: "Custom Technical Indicator",
      desc: "Custom oscillators, Price Action scanners, MTF Fair Value Gap, buffer signal arrows",
      turnaround: "2–3 Business Days"
    },
    ALGO_EA: {
      priceNum: 40000,
      priceFormatted: "₹40,000",
      label: "Full Automated Algo (EA)",
      desc: "Hardware-bound MT5 .ex5 bot, auto order execution, dynamic risk management & trailing stops",
      turnaround: "4–6 Business Days"
    },
    COMBO_SUITE: {
      priceNum: 55000,
      priceFormatted: "₹55,000",
      label: "Institutional Suite (Indicator + Algo)",
      desc: "Custom indicator signal matrix integrated directly into a dedicated automated MT5 EA",
      turnaround: "5–7 Business Days"
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strategyTitle.trim()) {
      toast.error("Please enter a title for your Indicator or Algo");
      return;
    }
    if (!executionLogic.trim()) {
      toast.error("Please provide the execution rules, entry criteria, or indicator logic");
      return;
    }

    setIsSubmitting(true);
    const newId = `DEV-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const newDeliverable: CustomBuildDeliverable = {
        id: newId,
        title: strategyTitle,
        type: selectedBuildType,
        price: pricingMap[selectedBuildType].priceFormatted,
        pair: selectedPair,
        timeframe: selectedTimeframe,
        mt5Account: mt5AccountNumber ? `#${mt5AccountNumber}` : "#Pending",
        status: "SUBMITTED",
        submittedDate: "Just now",
        engineer: "Assigning Senior Quant Dev..."
      };

      setDeliverables(prev => [newDeliverable, ...prev]);
      setSubmittedTicket(newId);

      // Store in localStorage for persistence
      const saved = JSON.parse(localStorage.getItem("fialgo_custom_build_orders") || "[]");
      saved.unshift(newDeliverable);
      localStorage.setItem("fialgo_custom_build_orders", JSON.stringify(saved));

      toast.success(`Request ${newId} Submitted!`, {
        description: `Your custom ${pricingMap[selectedBuildType].label} brief has been routed to institutional engineering.`
      });

      // Switch to deliverables tab
      setTimeout(() => {
        setActiveMainTab("deliverables");
      }, 1200);

    } catch (err) {
      toast.error("Failed to submit custom development request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFile = (filename: string) => {
    const dummyBlob = new Blob([`// FiAlgo Institutional Custom Build: ${filename}\n// Protected Binary`], { type: "text/plain" });
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloaded ${filename} successfully!`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-20 select-none px-4 sm:px-6 md:px-8 py-3 max-w-[1500px] mx-auto w-full">

        {/* ── Top Header (Admin App Exact Style) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" 
                style={{ borderColor: "#3b82f620" }}
              >
                <Cpu size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                    Custom Indicator &amp; Algo Development Studio
                  </h1>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                      Institutional Service
                    </span>
                  </div>
                </div>
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Custom Indicator (₹20,000) &amp; Automated Algo EA (₹40,000) Engineering Desk
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate("/auto-trade/backtest")}
              className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BarChart3 size={13} className="text-emerald-400" />
              <span>Backtest Engine</span>
            </button>

            <button
              onClick={() => navigate("/auto-trade/active-bots")}
              className="h-9 px-2.5 sm:px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} className="text-blue-400" />
              <span>Active Bots</span>
            </button>
          </div>
        </div>

        {/* ── Sub-bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-neutral-400">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Institutional SLA: <strong className="text-emerald-400 font-semibold">100% Hardware Bound (.EX5)</strong></span>
            </span>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-400">Tick Backtest Audited</span>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-400">Zero-Repaint Signals</span>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-400">1-Year Optimization Warranty</span>
          </div>
        </div>

        {/* ── Top View Navigation Tabs ── */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveMainTab("request")}
              className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
                activeMainTab === "request"
                  ? "bg-white/10 text-white border border-white/15"
                  : "text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <Plus size={13} />
              <span>Request Custom Build</span>
            </button>

            <button
              onClick={() => setActiveMainTab("deliverables")}
              className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-none flex items-center gap-2 cursor-pointer ${
                activeMainTab === "deliverables"
                  ? "bg-white/10 text-white border border-white/15"
                  : "text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <Layers size={13} className="text-emerald-400" />
              <span>My Builds &amp; Deliverables</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-emerald-400 font-mono font-bold">
                {deliverables.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Hardware Lock (Client MT5 Account Protected)</span>
          </div>
        </div>

        {/* ── TAB 1: REQUEST CUSTOM DEVELOPMENT WIZARD ── */}
        {activeMainTab === "request" && (
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">

            {/* LEFT: REQUIREMENTS FORM (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
                <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      1. Select Build Architecture &amp; Pricing
                    </h3>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
                      Fixed institutional pricing with guaranteed turnaround
                    </p>
                  </div>
                </div>

                {/* Pricing Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: Custom Indicator */}
                  <div
                    onClick={() => setSelectedBuildType("INDICATOR")}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-none flex flex-col justify-between ${
                      selectedBuildType === "INDICATOR"
                        ? "bg-blue-600/10 border-blue-500/50 shadow-xs"
                        : "bg-black/30 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">
                          Indicator
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400">2-3 Days</span>
                      </div>
                      <p className="text-lg font-black font-mono text-white">₹20,000</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1 leading-relaxed">
                        Custom oscillator, MTF alerts, buffer signal arrows
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedBuildType === "INDICATOR" ? "bg-blue-400" : "border border-white/20"}`} />
                      <span className="text-[9px] font-bold uppercase text-neutral-300">
                        {selectedBuildType === "INDICATOR" ? "Selected" : "Select"}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Full Automated Algo EA */}
                  <div
                    onClick={() => setSelectedBuildType("ALGO_EA")}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-none flex flex-col justify-between ${
                      selectedBuildType === "ALGO_EA"
                        ? "bg-purple-600/10 border-purple-500/50 shadow-xs"
                        : "bg-black/30 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400">
                          Algo Bot (EA)
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400">4-6 Days</span>
                      </div>
                      <p className="text-lg font-black font-mono text-white">₹40,000</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1 leading-relaxed">
                        Full MT5 automated execution bot, dynamic lot sizing &amp; SL/TP
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedBuildType === "ALGO_EA" ? "bg-purple-400" : "border border-white/20"}`} />
                      <span className="text-[9px] font-bold uppercase text-neutral-300">
                        {selectedBuildType === "ALGO_EA" ? "Selected" : "Select"}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Complete Suite */}
                  <div
                    onClick={() => setSelectedBuildType("COMBO_SUITE")}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-none flex flex-col justify-between ${
                      selectedBuildType === "COMBO_SUITE"
                        ? "bg-emerald-600/10 border-emerald-500/50 shadow-xs"
                        : "bg-black/30 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                          Combo Suite
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400">5-7 Days</span>
                      </div>
                      <p className="text-lg font-black font-mono text-white">₹55,000</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1 leading-relaxed">
                        Indicator + Auto Execution EA integrated suite (Save ₹5,000)
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedBuildType === "COMBO_SUITE" ? "bg-emerald-400" : "border border-white/20"}`} />
                      <span className="text-[9px] font-bold uppercase text-neutral-300">
                        {selectedBuildType === "COMBO_SUITE" ? "Selected" : "Select"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strategy Title */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                    Project / Strategy Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gold Liquidity Sweep Scalper or FVG Trend Following EA"
                    value={strategyTitle}
                    onChange={(e) => setStrategyTitle(e.target.value)}
                    className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-3 text-xs font-mono font-bold text-white focus:outline-none transition-none"
                  />
                </div>

                {/* Pair & Timeframe */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                      Target Trading Pair / Instrument *
                    </label>
                    <select
                      value={selectedPair}
                      onChange={(e) => setSelectedPair(e.target.value)}
                      className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                    >
                      <option value="XAUUSD">XAUUSD (Gold)</option>
                      <option value="EURUSD">EURUSD</option>
                      <option value="GBPUSD">GBPUSD</option>
                      <option value="GBPJPY">GBPJPY</option>
                      <option value="US100">US100 (Nasdaq)</option>
                      <option value="US30">US30 (Dow Jones)</option>
                      <option value="BTCUSD">BTCUSD</option>
                      <option value="MULTI_PAIR">Multi-Pair (All Major FX)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
                      Target Timeframe *
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full h-9 bg-black/30 border border-white/5 focus:border-white/20 rounded px-2.5 text-xs font-semibold text-neutral-200 focus:outline-none transition-none"
                    >
                      <option value="M1">1 Minute (M1 Scalping)</option>
                      <option value="M5">5 Minutes (M5 Scalping)</option>
                      <option value="M15">15 Minutes (M15 Intraday)</option>
                      <option value="H1">1 Hour (H1 Trend)</option>
                      <option value="H4">4 Hours (H4 Swing)</option>
                      <option value="MULTI_TF">Multi-Timeframe Confirmation</option>
                    </select>
                  </div>
                </div>

                {/* Execution Logic Brief */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      Detailed Execution Rules &amp; Entry/Exit Logic *
                    </label>
                    <span className="text-[9px] text-neutral-500 font-mono">Plain English or Formulas</span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={executionLogic}
                    onChange={(e) => setExecutionLogic(e.target.value)}
                    placeholder="Describe your entry & exit conditions in detail. Example:
- Entry BUY when 9 EMA crosses above 21 EMA and RSI(14) is above 50.
- Stop Loss: 15 pips from entry or below previous swing low.
- Take Profit: 30 pips with trailing stop activated after +15 pips."
                    className="w-full bg-black/30 border border-white/5 focus:border-white/20 rounded p-3 text-xs font-mono text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none transition-none leading-relaxed"
                  />
                </div>

                {/* Risk Parameters & MT5 Account Lock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                      Stop Loss (Pips)
                    </label>
                    <input
                      type="text"
                      value={stopLossPips}
                      onChange={(e) => setStopLossPips(e.target.value)}
                      className="w-full h-8 bg-black/30 border border-white/5 rounded px-2 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                      Take Profit (Pips)
                    </label>
                    <input
                      type="text"
                      value={takeProfitPips}
                      onChange={(e) => setTakeProfitPips(e.target.value)}
                      className="w-full h-8 bg-black/30 border border-white/5 rounded px-2 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                      Risk Per Trade
                    </label>
                    <input
                      type="text"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(e.target.value)}
                      className="w-full h-8 bg-black/30 border border-white/5 rounded px-2 text-xs font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                      Lock to MT5 #
                    </label>
                    <input
                      type="text"
                      value={mt5AccountNumber}
                      onChange={(e) => setMt5AccountNumber(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full h-8 bg-black/30 border border-white/5 rounded px-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Includes 1-Year Bug Fixes, Optimization &amp; Compiled .EX5</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-fialgo-primary w-full sm:w-auto h-10 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching Order...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Request ({pricingMap[selectedBuildType].priceFormatted})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: INVOICE & SERVICE OVERVIEW (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Order Invoice Summary */}
              <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Service Order Summary
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    INSTITUTIONAL DESK
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Selected Build:</span>
                    <span className="text-white font-bold">{pricingMap[selectedBuildType].label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Asset &amp; Timeframe:</span>
                    <span className="text-white font-bold">{selectedPair} ({selectedTimeframe})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Delivery SLA:</span>
                    <span className="text-emerald-400 font-bold">{pricingMap[selectedBuildType].turnaround}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Hardware License Lock:</span>
                    <span className="text-blue-400 font-bold">MT5 #{mt5AccountNumber || "Unassigned"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Total Development Fee
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {pricingMap[selectedBuildType].priceFormatted}
                  </span>
                </div>

                {/* Delivery Guarantee Notes */}
                <div className="p-3 bg-black/30 border border-white/5 rounded-lg space-y-2 text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>FiAlgo Engineering SLA</span>
                  </div>
                  <p className="leading-relaxed">
                    1. Direct delivery into your <strong>My Builds &amp; Deliverables</strong> dashboard with 1-click .EX5 binary download.
                  </p>
                  <p className="leading-relaxed">
                    2. Compiled with hardware account lock so your proprietary trading logic remains protected.
                  </p>
                  <p className="leading-relaxed">
                    3. Rigorously audited against 99.9% real tick historical simulation data before handover.
                  </p>
                </div>
              </div>

              {/* Instant Link to Backtest Engine */}
              <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Need to simulate historical ticks?
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    Test drawdown and win rate on the Backtest Engine
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/auto-trade/backtest")}
                  className="h-8 px-3 rounded-lg bg-black/40 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer transition-none"
                >
                  <span>Launch ↗</span>
                </button>
              </div>
            </div>

          </form>
        )}

        {/* ── TAB 2: MY CUSTOM BUILDS & DELIVERABLES (Delivered Algos & Indicators) ── */}
        {activeMainTab === "deliverables" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  My Custom Builds &amp; Completed Deliverables
                </h3>
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">
                  Download compiled MT5 .EX5 binaries, review backtests, and link to active bot fleet
                </p>
              </div>

              <button
                onClick={() => setActiveMainTab("request")}
                className="h-8 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-none"
              >
                <Plus size={13} />
                <span>Request New Build</span>
              </button>
            </div>

            {/* List of Deliverables */}
            <div className="space-y-3">
              {deliverables.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none space-y-4"
                >
                  {/* Top Bar of Deliverable Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400">
                        {item.type === "INDICATOR" ? <Activity size={16} /> : <Cpu size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            {item.title}
                          </h4>
                          <span className="text-[9px] font-mono font-bold text-neutral-400 bg-black/40 px-1.5 py-0.5 rounded">
                            {item.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {item.type === "INDICATOR" ? "Custom Technical Indicator" : "Automated Execution Algo (EA)"} · {item.pair} · {item.timeframe}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-400">
                        Fee: <span className="text-white font-bold">{item.price}</span>
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        item.status === "DELIVERED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {item.status === "DELIVERED" ? "DELIVERED & VERIFIED" : "IN PROGRESS"}
                      </span>
                    </div>
                  </div>

                  {/* Mid Stats & Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-black/30 border border-white/5 rounded p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">
                        Hardware MT5 Binding
                      </span>
                      <span className="text-emerald-400 font-bold mt-1 block">
                        {item.mt5Account} (Locked)
                      </span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">
                        Win Rate / Accuracy
                      </span>
                      <span className="text-white font-bold mt-1 block">
                        {item.winRate || "Pending QA"}
                      </span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">
                        Profit Factor / Edge
                      </span>
                      <span className="text-blue-400 font-bold mt-1 block">
                        {item.profitFactor || "Simulating Ticks..."}
                      </span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">
                        Handover Date
                      </span>
                      <span className="text-neutral-300 font-bold mt-1 block">
                        {item.deliveredDate || "Estimated in 3 Days"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                      <CheckCheck size={13} className="text-emerald-400" />
                      <span>Compiled for MetaTrader 5 Build 4260+</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "DELIVERED" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(item.ex5Filename || `${item.id}.ex5`)}
                            className="btn-fialgo-primary h-8 px-4 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download size={13} />
                            <span>Download .EX5</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadFile(item.mq5Filename || `${item.id}.mq5`)}
                            className="h-8 px-3 rounded-lg bg-black/30 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-neutral-300 transition-none cursor-pointer flex items-center gap-1"
                          >
                            <FileCode size={13} />
                            <span>.MQ5</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate("/auto-trade/backtest")}
                            className="h-8 px-3 rounded-lg bg-black/30 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-blue-400 transition-none cursor-pointer flex items-center gap-1"
                          >
                            <BarChart3 size={13} />
                            <span>Backtest ↗</span>
                          </button>

                          {item.type !== "INDICATOR" && (
                            <button
                              type="button"
                              onClick={() => navigate("/auto-trade/active-bots")}
                              className="h-8 px-3 rounded-lg bg-black/30 hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-emerald-400 transition-none cursor-pointer flex items-center gap-1"
                            >
                              <Play size={11} className="fill-current" />
                              <span>Deploy Bot</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                          <Clock size={13} />
                          <span>Engineering in progress by Quant Desk...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
