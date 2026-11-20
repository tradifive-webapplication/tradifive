import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Cpu, CheckCircle2, Download, RefreshCcw, 
  FileCode, Activity, Play, Send, Layers, Plus, Zap
} from "lucide-react";
import { toast } from "sonner";

interface CustomBuildDeliverable {
  id: string;
  title: string;
  type: "INDICATOR" | "ALGO_EA" | "COMBO_SUITE";
  price: string;
  pair: string;
  timeframe: string;
  status: "SUBMITTED" | "IN_DEVELOPMENT" | "DELIVERED";
  submittedDate: string;
  deliveredDate?: string;
  ex5Filename?: string;
  mq5Filename?: string;
}

export default function StrategyBuilderPage() {
  const navigate = useNavigate();

  const [activeMainTab, setActiveMainTab] = useState<"request" | "deliverables">("request");

  // Build Request Form States
  const [selectedBuildType, setSelectedBuildType] = useState<"INDICATOR" | "ALGO_EA" | "COMBO_SUITE">("ALGO_EA");
  const [strategyTitle, setStrategyTitle] = useState("");
  const [selectedPair, setSelectedPair] = useState("XAUUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("M5");
  const [executionLogic, setExecutionLogic] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deliverables list (loaded strictly from real user submissions)
  const [deliverables, setDeliverables] = useState<CustomBuildDeliverable[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("fialgo_custom_build_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pricingMap = {
    INDICATOR: {
      priceFormatted: "₹20,000",
      label: "Custom Technical Indicator",
      desc: "Custom oscillators, Price Action scanners, MTF alerts & buffer signal arrows",
      turnaround: "2–3 Business Days"
    },
    ALGO_EA: {
      priceFormatted: "₹40,000",
      label: "Full Automated Algo (EA)",
      desc: "Full automated MT5 execution bot with custom entry/exit logic & risk management",
      turnaround: "4–6 Business Days"
    },
    COMBO_SUITE: {
      priceFormatted: "₹55,000",
      label: "Combo Suite (Indicator + EA)",
      desc: "Custom indicator signal generator integrated directly into an automated MT5 EA",
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
        status: "SUBMITTED",
        submittedDate: "Just now"
      };

      setDeliverables(prev => [newDeliverable, ...prev]);

      const saved = JSON.parse(localStorage.getItem("fialgo_custom_build_orders") || "[]");
      saved.unshift(newDeliverable);
      localStorage.setItem("fialgo_custom_build_orders", JSON.stringify(saved));

      toast.success(`Request ${newId} Submitted!`, {
        description: `Your custom ${pricingMap[selectedBuildType].label} request has been submitted.`
      });

      setTimeout(() => {
        setActiveMainTab("deliverables");
      }, 1000);

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

        {/* ── Top Header (Consistent with Dashboard & Journal) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0" 
            >
              <Cpu size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Custom Indicator &amp; Algo Development Studio
                </h1>
              </div>
              <p className="text-slate-400 dark:text-neutral-500 text-[10px] font-bold uppercase tracking-[0.12em] mt-0.5">
                Custom Indicator (₹20,000) &amp; Automated Algo EA (₹40,000)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/auto-trade/active-bots")}
              className="h-9 px-3.5 bg-white dark:bg-[#1E1E1E] hover:bg-slate-50 dark:hover:bg-white/[0.05] border border-slate-200/70 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Active Bots</span>
            </button>
          </div>
        </div>

        {/* ── Top Navigation Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveMainTab("request")}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === "request"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-[#17171A] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-white/5"
            }`}
          >
            <Plus size={13} className={activeMainTab === "request" ? "text-blue-400" : ""} />
            <span>Request Custom Build</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("deliverables")}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === "deliverables"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-[#17171A] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-white/5"
            }`}
          >
            <Layers size={13} className={activeMainTab === "deliverables" ? "text-emerald-400" : ""} />
            <span>My Builds &amp; Deliverables</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              activeMainTab === "deliverables" ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-900" : "bg-slate-100 dark:bg-black/40 text-emerald-600 dark:text-emerald-400"
            }`}>
              {deliverables.length}
            </span>
          </button>
        </div>

        {/* ── 4 Metric Cards Grid (Consistent with Dashboard & Journal Cards) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {deliverables.length}
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.12em] mt-1">
              ACTIVE BUILDS
            </div>
          </div>

          <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              ₹20,000
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.12em] mt-1">
              INDICATOR BASE FEE
            </div>
          </div>

          <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              ₹40,000
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.12em] mt-1">
              ALGO EA BASE FEE
            </div>
          </div>

          <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-4 sm:p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              2-5 Days
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.12em] mt-1">
              ENGINEERING SLA
            </div>
          </div>
        </div>

        {/* ── TAB 1: REQUEST CUSTOM DEVELOPMENT (Streamlined & Clean) ── */}
        {activeMainTab === "request" && (
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">

            {/* LEFT: REQUIREMENTS FORM (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-5 sm:p-6 space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
                <div className="pb-3 border-b border-slate-200/70 dark:border-white/5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Select Build Type
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.12em] mt-0.5">
                    Choose what you want our engineering team to develop
                  </p>
                </div>

                {/* Pricing Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: Custom Indicator */}
                  <div
                    onClick={() => setSelectedBuildType("INDICATOR")}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      selectedBuildType === "INDICATOR"
                        ? "bg-blue-50/70 dark:bg-blue-600/10 border-blue-400 dark:border-blue-500/50 shadow-xs"
                        : "bg-slate-50/70 dark:bg-black/30 border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          Indicator
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-400">2-3 Days</span>
                      </div>
                      <p className="text-lg font-black font-mono text-slate-900 dark:text-white">₹20,000</p>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono mt-1 leading-relaxed">
                        Custom oscillator, alerts, buffer signals
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/70 dark:border-white/5 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedBuildType === "INDICATOR" ? "bg-blue-600 dark:bg-blue-400" : "border border-slate-300 dark:border-white/20"}`} />
                      <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-neutral-300">
                        {selectedBuildType === "INDICATOR" ? "Selected" : "Select"}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Full Automated Algo EA */}
                  <div
                    onClick={() => setSelectedBuildType("ALGO_EA")}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      selectedBuildType === "ALGO_EA"
                        ? "bg-purple-50/70 dark:bg-purple-600/10 border-purple-400 dark:border-purple-500/50 shadow-xs"
                        : "bg-slate-50/70 dark:bg-black/30 border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                          Algo Bot (EA)
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-400">4-6 Days</span>
                      </div>
                      <p className="text-lg font-black font-mono text-slate-900 dark:text-white">₹40,000</p>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono mt-1 leading-relaxed">
                        Full automated MT5 bot with custom entry/exit rules
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/70 dark:border-white/5 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedBuildType === "ALGO_EA" ? "bg-purple-600 dark:bg-purple-400" : "border border-slate-300 dark:border-white/20"}`} />
                      <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-neutral-300">
                        {selectedBuildType === "ALGO_EA" ? "Selected" : "Select"}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Complete Suite */}
                  <div
                    onClick={() => setSelectedBuildType("COMBO_SUITE")}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      selectedBuildType === "COMBO_SUITE"
                        ? "bg-emerald-50/70 dark:bg-emerald-600/10 border-emerald-400 dark:border-emerald-500/50 shadow-xs"
                        : "bg-slate-50/70 dark:bg-black/30 border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          Combo Suite
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-400">5-7 Days</span>
                      </div>
                      <p className="text-lg font-black font-mono text-slate-900 dark:text-white">₹55,000</p>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono mt-1 leading-relaxed">
                        Indicator + Auto Execution EA integrated suite
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/70 dark:border-white/5 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedBuildType === "COMBO_SUITE" ? "bg-emerald-600 dark:bg-emerald-400" : "border border-slate-300 dark:border-white/20"}`} />
                      <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-neutral-300">
                        {selectedBuildType === "COMBO_SUITE" ? "Selected" : "Select"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strategy Title */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                    Project / Strategy Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gold Liquidity Sweep Scalper or FVG Trend Following EA"
                    value={strategyTitle}
                    onChange={(e) => setStrategyTitle(e.target.value)}
                    className="w-full h-9 bg-white dark:bg-black/30 border border-slate-200/70 dark:border-white/10 focus:border-slate-400 dark:focus:border-white/20 rounded-xl px-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none shadow-xs transition-colors"
                  />
                </div>

                {/* Pair & Timeframe */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                      Target Trading Pair / Instrument *
                    </label>
                    <select
                      value={selectedPair}
                      onChange={(e) => setSelectedPair(e.target.value)}
                      className="w-full h-9 bg-white dark:bg-black/30 border border-slate-200/70 dark:border-white/10 focus:border-slate-400 dark:focus:border-white/20 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 focus:outline-none shadow-xs transition-colors"
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
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                      Target Timeframe *
                    </label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full h-9 bg-white dark:bg-black/30 border border-slate-200/70 dark:border-white/10 focus:border-slate-400 dark:focus:border-white/20 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 focus:outline-none shadow-xs transition-colors"
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
                    <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                      Detailed Execution Rules &amp; Indicator Logic *
                    </label>
                    <span className="text-[9px] text-slate-400 dark:text-neutral-500 font-mono">Plain English</span>
                  </div>
                  <textarea
                    required
                    rows={6}
                    value={executionLogic}
                    onChange={(e) => setExecutionLogic(e.target.value)}
                    placeholder="Describe your rules, indicators, entry/exit conditions, stop loss and take profit targets in detail.

Example:
- Enter BUY when 9 EMA crosses above 21 EMA and RSI(14) is above 50.
- Stop Loss: 15 pips from entry or below previous swing low.
- Take Profit: 30 pips with trailing stop activated after +15 pips."
                    className="w-full bg-white dark:bg-black/30 border border-slate-200/70 dark:border-white/10 focus:border-slate-400 dark:focus:border-white/20 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-600 resize-none focus:outline-none shadow-xs transition-colors leading-relaxed"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2 border-t border-slate-200/70 dark:border-white/5 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-fialgo-primary w-full sm:w-auto h-10 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Request...</span>
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

            {/* RIGHT: ORDER SUMMARY (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] p-5 sm:p-6 space-y-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-white/5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Service Order Summary
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                    DIRECT DEV
                  </span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-neutral-400">Selected Build:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{pricingMap[selectedBuildType].label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-neutral-400">Asset &amp; Timeframe:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedPair} ({selectedTimeframe})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-neutral-400">Delivery SLA:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pricingMap[selectedBuildType].turnaround}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                    Total Development Fee
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {pricingMap[selectedBuildType].priceFormatted}
                  </span>
                </div>

                {/* Clean Handover Note */}
                <div className="p-3 bg-slate-50 dark:bg-black/30 border border-slate-200/70 dark:border-white/5 rounded-xl space-y-1.5 text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Deliverables Included</span>
                  </div>
                  <p className="leading-relaxed">
                    Once compiled, your files will appear directly under <strong>My Builds &amp; Deliverables</strong> with 1-click download of the <strong>.EX5 binary</strong> and <strong>.MQ5 source</strong>.
                  </p>
                </div>
              </div>
            </div>

          </form>
        )}

        {/* ── TAB 2: MY CUSTOM BUILDS & DELIVERABLES (Admin App Table Style) ── */}
        {activeMainTab === "deliverables" && (
          <div className="space-y-4 pt-1">
            <div className="bg-white dark:bg-[#17171A] border border-slate-200/70 dark:border-white/[0.07] rounded-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:shadow-none overflow-hidden">
              {/* Header Bar matching Image 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-black/10">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    CUSTOM BUILDS &amp; DELIVERABLES ({deliverables.length})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                      100% Compiled MT5 Binaries ready for deployment
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab("request")}
                    className="h-7 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                  >
                    <Plus size={11} />
                    <span>New Build</span>
                  </button>
                </div>
              </div>

              {/* Content when items exist vs empty state */}
              {deliverables.length === 0 ? (
                <div className="p-12 text-center font-mono">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-neutral-400 mx-auto mb-3">
                    <Layers size={18} />
                  </div>
                  <div className="text-xs text-slate-900 dark:text-white font-bold uppercase tracking-wider mb-1">
                    No Custom Builds On Record
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 max-w-sm mx-auto mb-4">
                    You have not submitted any custom indicators or MT5 algo EA requests yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab("request")}
                    className="btn-fialgo-primary h-8 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer rounded-xl"
                  >
                    <Plus size={12} />
                    <span>Request Custom Build</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Table on sm+ screens */}
                  <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/70 dark:border-white/5 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest bg-slate-50 dark:bg-black/20">
                          <th className="p-3.5">BUILD &amp; TITLE</th>
                          <th className="p-3.5">TYPE</th>
                          <th className="p-3.5">INSTRUMENT &amp; TF</th>
                          <th className="p-3.5">FEE</th>
                          <th className="p-3.5">STATUS</th>
                          <th className="p-3.5">DELIVERED</th>
                          <th className="p-3.5 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-xs">
                        {deliverables.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">{item.title}</div>
                              <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono mt-0.5">{item.id}</div>
                            </td>
                            <td className="p-3.5">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                item.type === "INDICATOR"
                                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                                  : item.type === "ALGO_EA"
                                  ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                                  : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                              }`}>
                                {item.type === "INDICATOR" ? "Indicator" : item.type === "ALGO_EA" ? "Algo Bot" : "Combo Suite"}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-neutral-300">
                              {item.pair} · <span className="text-slate-400 dark:text-neutral-400">{item.timeframe}</span>
                            </td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {item.price}
                            </td>
                            <td className="p-3.5">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                item.status === "DELIVERED"
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500 dark:text-neutral-400 text-[11px]">
                              {item.deliveredDate || "In progress"}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {item.status === "DELIVERED" ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadFile(item.ex5Filename || `${item.id}.ex5`)}
                                      className="btn-fialgo-primary h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Download size={11} />
                                      <span>.EX5</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadFile(item.mq5Filename || `${item.id}.mq5`)}
                                      className="h-7 px-2 rounded-lg bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200/70 dark:border-white/10 text-[10px] font-mono font-bold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <FileCode size={11} />
                                      <span>.MQ5</span>
                                    </button>
                                    {item.type !== "INDICATOR" && (
                                      <button
                                        type="button"
                                        onClick={() => navigate("/auto-trade/active-bots")}
                                        className="h-7 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
                                      >
                                        <Play size={9} className="fill-current" />
                                        <span>Deploy</span>
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[11px] text-amber-600 dark:text-amber-400">Engineering in progress...</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card list */}
                  <div className="divide-y divide-slate-100 dark:divide-white/5 sm:hidden p-3 space-y-3">
                    {deliverables.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.status === "DELIVERED" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                          <span>{item.pair}</span>
                          <span>·</span>
                          <span>{item.timeframe}</span>
                          <span>·</span>
                          <span className="text-slate-900 dark:text-white font-bold">{item.price}</span>
                        </div>
                        {item.status === "DELIVERED" && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(item.ex5Filename || `${item.id}.ex5`)}
                              className="btn-fialgo-primary h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                            >
                              <Download size={11} />
                              <span>.EX5</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(item.mq5Filename || `${item.id}.mq5`)}
                              className="h-7 px-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200/70 dark:border-white/10 text-[10px] font-mono font-bold text-slate-700 dark:text-neutral-300"
                            >
                              .MQ5
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
