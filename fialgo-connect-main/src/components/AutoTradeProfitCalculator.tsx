import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp, Zap, ShieldCheck } from "lucide-react";

export default function AutoTradeProfitCalculator() {
  const navigate = useNavigate();

  // State in INR: Deposit 1 Lakh to 10 Lakh (Default ₹1,00,000)
  const [deposit, setDeposit] = useState<number>(100000);
  // Daily target rate: 2% to 5% (Default 2.0%)
  const [dailyRate, setDailyRate] = useState<number>(2.0);

  // Standard market trading days in a month (22 days)
  const tradingDays = 22;

  // Format INR Currency (e.g. ₹1,00,000)
  const formatINR = (val: number) => {
    return "₹" + Math.round(val).toLocaleString("en-IN");
  };

  // Simple, transparent math calculation:
  // Daily Profit = Deposit * (Rate / 100)
  // Monthly Profit = Daily Profit * 22 Trading Days
  // Total Ending Balance = Deposit + Monthly Profit
  const { dailyProfit, monthlyProfit, endingBalance, roiPercent } = useMemo(() => {
    const rateDecimal = dailyRate / 100;
    const daily = deposit * rateDecimal;
    const monthly = daily * tradingDays;
    const end = deposit + monthly;
    const roi = (monthly / deposit) * 100;

    return {
      dailyProfit: daily,
      monthlyProfit: monthly,
      endingBalance: end,
      roiPercent: roi,
    };
  }, [deposit, dailyRate]);

  // Investment presets: 1 Lakh to 10 Lakh
  const depositPresets = [
    { label: "₹1L", val: 100000 },
    { label: "₹2L", val: 200000 },
    { label: "₹3L", val: 300000 },
    { label: "₹5L", val: 500000 },
    { label: "₹7.5L", val: 750000 },
    { label: "₹10L", val: 1000000 },
  ];

  // Daily target rate presets: 2% to 5%
  const ratePresets = [2.0, 2.5, 3.0, 4.0, 5.0];

  return (
    <div id="profit-simulator" className="w-full max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-5 md:mb-7">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
          <Zap className="w-3 h-3 text-blue-400" />
          Interactive Profit Simulator
        </div>
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(26px, 3vw, 40px)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          See how much you will{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            earn every month
          </span>
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.5)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
          Select your deposit capital and daily target (2% – 5%) to see your estimated monthly profit.
        </p>
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          background: "#171717",
          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
          borderRadius: 20,
          border: "none",
        }}
        className="text-white p-3.5 sm:p-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Card 1: Controls (Deposit & Daily Target) */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              background: "#141414",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
              borderRadius: 16,
              border: "none",
            }}
            className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Step 1: Choose Your Capital
                </span>
                <span className="text-[11px] font-medium text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/5">
                  100% In Your Control
                </span>
              </div>

              {/* Control 1: Capital Deposit */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">
                    Deposit Capital
                  </label>
                  <span
                    className="text-2xl font-semibold text-white tracking-normal tabular-nums"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {formatINR(deposit)}
                  </span>
                </div>

                {/* Smooth Slider */}
                <div className="relative py-2">
                  <input
                    type="range"
                    min={100000}
                    max={1000000}
                    step={25000}
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((deposit - 100000) / (1000000 - 100000)) * 100}%, rgba(255,255,255,0.08) ${((deposit - 100000) / (1000000 - 100000)) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    }}
                  />
                </div>

                {/* Clean Presets Row */}
                <div className="grid grid-cols-6 gap-1.5 mt-2.5">
                  {depositPresets.map((item) => {
                    const isSelected = deposit === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setDeposit(item.val)}
                        style={{
                          background: isSelected ? "rgba(59, 130, 246, 0.16)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                          color: isSelected ? "#93c5fd" : "rgba(255, 255, 255, 0.65)",
                        }}
                        className="py-1.5 text-xs font-medium rounded-lg transition-all text-center tabular-nums hover:text-white"
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Control 2: Daily Profit Target */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">
                    Daily Profit Target
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-semibold text-white tracking-normal tabular-nums"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {dailyRate.toFixed(1)}% / day
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ~{formatINR(dailyProfit)} / day
                    </span>
                  </div>
                </div>

                {/* Smooth Slider */}
                <div className="relative py-2">
                  <input
                    type="range"
                    min={2.0}
                    max={5.0}
                    step={0.25}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((dailyRate - 2.0) / (5.0 - 2.0)) * 100}%, rgba(255,255,255,0.08) ${((dailyRate - 2.0) / (5.0 - 2.0)) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    }}
                  />
                </div>

                {/* Clean Rate Presets */}
                <div className="grid grid-cols-5 gap-1.5 mt-2.5">
                  {ratePresets.map((val) => {
                    const isSelected = dailyRate === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDailyRate(val)}
                        style={{
                          background: isSelected ? "rgba(59, 130, 246, 0.16)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                          color: isSelected ? "#93c5fd" : "rgba(255, 255, 255, 0.65)",
                        }}
                        className="py-1.5 text-xs font-medium rounded-lg transition-all text-center tabular-nums hover:text-white"
                      >
                        {val.toFixed(1)}%
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reassurance note at bottom of left card */}
            <div className="pt-3.5 border-t border-white/[0.06] flex items-center gap-2 text-xs text-slate-400 font-normal">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Algorithm trades automatically on MT5 to hit your daily profit goal.</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Card 2: Simple & Clear Profit Result */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div
            style={{
              background: "#141414",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05)",
              borderRadius: 16,
              border: "none",
            }}
            className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between"
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Step 2: Estimated Returns
                </span>
                <span
                  className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 tabular-nums"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> +{roiPercent.toFixed(0)}% ROI
                </span>
              </div>

              {/* Monthly Profit Display */}
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Projected Monthly Profit
                </span>
                <h3
                  className="text-3xl sm:text-[34px] font-semibold text-emerald-400 tracking-normal leading-tight tabular-nums"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  +{formatINR(monthlyProfit)}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-normal">
                  Estimated pure profit earned in 30 days ({tradingDays} market trading days).
                </p>
              </div>

              {/* Clear Account Breakdown */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.025)",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.05)",
                  borderRadius: 12,
                }}
                className="p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-normal text-slate-400">Your Initial Deposit:</span>
                  <span
                    className="font-medium text-white tabular-nums"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {formatINR(deposit)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-normal text-slate-400">+ Monthly Algo Profit:</span>
                  <span
                    className="font-medium text-emerald-400 tabular-nums"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    +{formatINR(monthlyProfit)}
                  </span>
                </div>

                {/* Highlight Row: Total Ending Balance */}
                <div className="pt-2.5 border-t border-white/[0.06] flex justify-between items-center text-white">
                  <span className="font-medium">Total In Your MT5 Account:</span>
                  <span
                    className="text-base font-semibold text-emerald-400 tabular-nums"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {formatINR(endingBalance)}
                  </span>
                </div>
              </div>

              {/* Main Action Button (Clean FAQ Card style with blue styling) */}
              <button
                type="button"
                onClick={() => navigate("/auto-trade/setup")}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  color: "#60a5fa",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 18px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #253347 0%, #131c33 100%)";
                  e.currentTarget.style.color = "#93c5fd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
                  e.currentTarget.style.color = "#60a5fa";
                }}
              >
                <span>Start Auto Trading with Tradifive</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Reassurance Bullet Points */}
            <div className="pt-3.5 border-t border-white/[0.06] space-y-1.5 text-[11px] text-slate-400 font-normal">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Funds stay in your own broker account • Withdraw anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% hands-free execution on MetaTrader 5 (MT5)</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
