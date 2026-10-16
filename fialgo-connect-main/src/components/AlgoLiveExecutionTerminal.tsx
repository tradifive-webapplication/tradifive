import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  Zap,
  Maximize2
} from "lucide-react";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

const SETUPS = [
  {
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    timeframe: "M5",
    type: "BUY" as const,
    lots: "1.50 Lots",
    entryPrice: 2642.10,
    tpPrice: 2645.40,
    slPrice: 2639.60,
    minY: 2638.50,
    maxY: 2646.50,
    pipDecimals: 2,
    pnlPerPip: 140, // multiplier
    historyCandles: [
      { open: 2639.2, high: 2640.4, low: 2638.8, close: 2640.1 },
      { open: 2640.1, high: 2641.5, low: 2639.6, close: 2641.2 },
      { open: 2641.2, high: 2641.8, low: 2640.0, close: 2640.4 },
      { open: 2640.4, high: 2641.9, low: 2640.2, close: 2641.6 },
      { open: 2641.6, high: 2642.5, low: 2641.1, close: 2642.1 },
    ],
    liveSteps: [
      { price: 2642.10, pnl: 0, desc: "Algo Signal: M5 Breakout Triggered" },
      { price: 2642.60, pnl: 700, desc: "Price Expanding Upward" },
      { price: 2641.80, pnl: -420, desc: "Micro Pullback (Risk Guard Active)" },
      { price: 2643.20, pnl: 1540, desc: "Bullish Candle Spike" },
      { price: 2644.40, pnl: 3220, desc: "Trailing Stop Activated" },
      { price: 2645.40, pnl: 4620, desc: "🎯 Take Profit Hit (+₹4,620)" },
    ],
  },
  {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    timeframe: "M5",
    type: "SELL" as const,
    lots: "2.00 Lots",
    entryPrice: 1.08450,
    tpPrice: 1.08320,
    slPrice: 1.08580,
    minY: 1.08280,
    maxY: 1.08620,
    pipDecimals: 5,
    pnlPerPip: 20000,
    historyCandles: [
      { open: 1.08560, high: 1.08590, low: 1.08520, close: 1.08540 },
      { open: 1.08540, high: 1.08570, low: 1.08490, close: 1.08500 },
      { open: 1.08500, high: 1.08530, low: 1.08460, close: 1.08480 },
      { open: 1.08480, high: 1.08510, low: 1.08440, close: 1.08460 },
      { open: 1.08460, high: 1.08490, low: 1.08420, close: 1.08450 },
    ],
    liveSteps: [
      { price: 1.08450, pnl: 0, desc: "Algo Signal: Support Breakdown" },
      { price: 1.08410, pnl: 800, desc: "Bearish Momentum (In Profit)" },
      { price: 1.08370, pnl: 1600, desc: "Price Dropping Directly to TP" },
      { price: 1.08390, pnl: 1200, desc: "Minor Support Retest" },
      { price: 1.08320, pnl: 2600, desc: "🎯 Take Profit Target Hit (+₹2,600)" },
    ],
  },
  {
    symbol: "BTCUSD",
    name: "Bitcoin / Tether",
    timeframe: "M15",
    type: "BUY" as const,
    lots: "0.40 Lots",
    entryPrice: 64120.0,
    tpPrice: 64450.0,
    slPrice: 63890.0,
    minY: 63800.0,
    maxY: 64550.0,
    pipDecimals: 1,
    pnlPerPip: 11,
    historyCandles: [
      { open: 63920, high: 64050, low: 63880, close: 64010 },
      { open: 64010, high: 64140, low: 63980, close: 64080 },
      { open: 64080, high: 64180, low: 64020, close: 64110 },
      { open: 64110, high: 64160, low: 64050, close: 64090 },
      { open: 64090, high: 64210, low: 64070, close: 64120 },
    ],
    liveSteps: [
      { price: 64120.0, pnl: 0, desc: "Algo Signal: Volume Surge Detected" },
      { price: 64220.0, pnl: 1100, desc: "Green Candle Pump" },
      { price: 64340.0, pnl: 2420, desc: "Aggressive Buy Orders Flowing" },
      { price: 64450.0, pnl: 3630, desc: "🎯 Take Profit Target Hit (+₹3,630)" },
    ],
  },
];

export default function AlgoLiveExecutionTerminal() {
  const navigate = useNavigate();

  const [setupIndex, setSetupIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalProfitToday, setTotalProfitToday] = useState(9670);
  const [isTpHit, setIsTpHit] = useState(false);

  const currentSetup = SETUPS[setupIndex % SETUPS.length];
  const currentStep = currentSetup.liveSteps[Math.min(stepIndex, currentSetup.liveSteps.length - 1)];

  // Live price simulation ticker (updates every 1000ms)
  useEffect(() => {
    setIsTpHit(false);
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= currentSetup.liveSteps.length - 1) {
          // Final step: TP hit celebration
          setIsTpHit(true);
          const finalProfit = currentSetup.liveSteps[currentSetup.liveSteps.length - 1].pnl;
          setTotalProfitToday((p) => p + finalProfit);

          // Brief pause on target hit, then advance to next setup
          setTimeout(() => {
            setSetupIndex((s) => (s + 1) % SETUPS.length);
            setStepIndex(0);
            setIsTpHit(false);
          }, 1200);

          return prev;
        }
        return prev + 1;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [setupIndex, currentSetup]);

  // Format INR Currency
  const formatINR = (val: number) => {
    const prefix = val >= 0 ? "+₹" : "-₹";
    return prefix + Math.abs(Math.round(val)).toLocaleString("en-IN");
  };

  // SVG Chart Dimensions
  const chartWidth = 520;
  const chartHeight = 210;
  const paddingRight = 65;
  const paddingLeft = 10;
  const paddingTop = 22;
  const paddingBottom = 22;

  const drawableWidth = chartWidth - paddingLeft - paddingRight;
  const drawableHeight = chartHeight - paddingTop - paddingBottom;

  // Coordinate mapper: Price to SVG Y
  const priceToY = (price: number) => {
    const range = currentSetup.maxY - currentSetup.minY;
    const ratio = (price - currentSetup.minY) / range;
    return paddingTop + drawableHeight * (1 - ratio);
  };

  // All candles including current live candle
  const liveCandle: Candle = {
    open: currentSetup.entryPrice,
    high: Math.max(currentSetup.entryPrice, currentStep.price),
    low: Math.min(currentSetup.entryPrice, currentStep.price),
    close: currentStep.price,
  };

  const allCandles = [...currentSetup.historyCandles, liveCandle];
  const candleSpacing = drawableWidth / (allCandles.length + 0.5);

  const entryY = priceToY(currentSetup.entryPrice);
  const tpY = priceToY(currentSetup.tpPrice);
  const slY = priceToY(currentSetup.slPrice);
  const currentY = priceToY(currentStep.price);

  const liveCandleX = paddingLeft + (allCandles.length - 1) * candleSpacing + candleSpacing / 2;
  const entryCandleX = paddingLeft + (allCandles.length - 2) * candleSpacing + candleSpacing / 2;

  return (
    <div
      style={{
        background: "#171717",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
        borderRadius: 20,
        border: "none",
      }}
      className="p-4 sm:p-5 relative overflow-hidden font-sans"
    >
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* ── Top Bar: Trading Pair, Timeframe & Algo Status ── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-['Outfit',sans-serif]">
              {currentSetup.symbol}
              <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/5">
                {currentSetup.timeframe}
              </span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            • {currentSetup.name}
          </span>
        </div>

        {/* Algo Tag */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
            <Cpu className="w-3 h-3 text-blue-400" />
            ALGO DEPLOYED (MT5)
          </span>
          <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
            Auto-Pilot
          </span>
        </div>
      </div>

      {/* ── Live Metric Strip (Price & Floating PnL) ── */}
      <div className="flex items-center justify-between py-2.5 px-1 relative z-10">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Market Price
            </span>
            <span
              className="text-base sm:text-lg font-extrabold text-white tabular-nums tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {currentStep.price.toFixed(currentSetup.pipDecimals)}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-white/10" />

          {/* Active Order Pill */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-0.5 ${
                currentSetup.type === "BUY"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-red-500/30"
              }`}
            >
              {currentSetup.type === "BUY" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {currentSetup.type} {currentSetup.lots}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              @ {currentSetup.entryPrice.toFixed(currentSetup.pipDecimals)}
            </span>
          </div>
        </div>

        {/* Floating Profit/Loss Badge (Updates Every Second) */}
        <div className="text-right">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
            Algo Floating P&L
          </span>
          <motion.div
            key={currentStep.pnl}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className={`text-lg sm:text-xl font-black tabular-nums transition-colors ${
              currentStep.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {formatINR(currentStep.pnl)}
          </motion.div>
        </div>
      </div>

      {/* ── THE LIVE CANDLESTICK TRADING CHART ── */}
      <div className="relative rounded-xl bg-[#090a0d] border border-white/[0.06] p-1.5 overflow-hidden shadow-inner my-1">
        {/* Subtle Chart Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_25px] pointer-events-none" />

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Price Axis Lines on Right */}
          <line
            x1={chartWidth - paddingRight}
            y1={paddingTop}
            x2={chartWidth - paddingRight}
            y2={chartHeight - paddingBottom}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          {/* 1. Take Profit (TP) Line: Dotted Emerald */}
          <line
            x1={paddingLeft}
            y1={tpY}
            x2={chartWidth - paddingRight}
            y2={tpY}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            strokeOpacity={0.8}
          />
          {/* TP Tag on Right Axis */}
          <g transform={`translate(${chartWidth - paddingRight + 4}, ${tpY - 8})`}>
            <rect fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth={1} width={58} height={16} rx={3} />
            <text x={4} y={11} fill="#10b981" fontSize={8.5} fontWeight="bold" fontFamily="'Inter', sans-serif">
              TP {currentSetup.tpPrice.toFixed(currentSetup.pipDecimals)}
            </text>
          </g>

          {/* 2. Stop Loss (SL) Line: Dotted Red */}
          <line
            x1={paddingLeft}
            y1={slY}
            x2={chartWidth - paddingRight}
            y2={slY}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            strokeOpacity={0.8}
          />
          {/* SL Tag on Right Axis */}
          <g transform={`translate(${chartWidth - paddingRight + 4}, ${slY - 8})`}>
            <rect fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={1} width={58} height={16} rx={3} />
            <text x={4} y={11} fill="#ef4444" fontSize={8.5} fontWeight="bold" fontFamily="'Inter', sans-serif">
              SL {currentSetup.slPrice.toFixed(currentSetup.pipDecimals)}
            </text>
          </g>

          {/* 3. Algo Entry Price Line: Thin Blue Solid Line */}
          <line
            x1={entryCandleX}
            y1={entryY}
            x2={chartWidth - paddingRight}
            y2={entryY}
            stroke="#3b82f6"
            strokeDasharray="2 2"
            strokeWidth={1}
            strokeOpacity={0.6}
          />

          {/* ── Candlesticks Rendering ── */}
          {allCandles.map((c, i) => {
            const isLive = i === allCandles.length - 1;
            const candleX = paddingLeft + i * candleSpacing + candleSpacing / 2;
            const isBullish = c.close >= c.open;
            const color = isBullish ? "#10b981" : "#ef4444";

            const candleHighY = priceToY(c.high);
            const candleLowY = priceToY(c.low);
            const candleOpenY = priceToY(c.open);
            const candleCloseY = priceToY(c.close);

            const bodyTop = Math.min(candleOpenY, candleCloseY);
            const bodyHeight = Math.max(3, Math.abs(candleOpenY - candleCloseY));
            const bodyWidth = 14;

            return (
              <g key={i}>
                {/* Candle Wick (High to Low) */}
                <line
                  x1={candleX}
                  y1={candleHighY}
                  x2={candleX}
                  y2={candleLowY}
                  stroke={color}
                  strokeWidth={1.5}
                />
                {/* Candle Body */}
                <rect
                  x={candleX - bodyWidth / 2}
                  y={bodyTop}
                  width={bodyWidth}
                  height={bodyHeight}
                  fill={color}
                  rx={1.5}
                  opacity={isLive ? 1 : 0.85}
                />
              </g>
            );
          })}

          {/* ── Algo Entry Execution Badge On Chart ── */}
          <g transform={`translate(${entryCandleX - 42}, ${entryY + (currentSetup.type === "BUY" ? 18 : -26)})`}>
            <rect
              fill="#1e293b"
              stroke="#3b82f6"
              strokeWidth={1}
              width={84}
              height={18}
              rx={4}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
            />
            <text x={6} y={12} fill="#60a5fa" fontSize={8} fontWeight="bold" fontFamily="'Inter', sans-serif">
              ⚡ ALGO {currentSetup.type}
            </text>
          </g>

          {/* ── Live Price Horizontal Tracker Line ── */}
          <line
            x1={liveCandleX}
            y1={currentY}
            x2={chartWidth - paddingRight}
            y2={currentY}
            stroke={currentStep.pnl >= 0 ? "#10b981" : "#ef4444"}
            strokeWidth={1.5}
            strokeOpacity={0.9}
          />

          {/* Glowing Live Price Marker Dot on Candle */}
          <circle
            cx={liveCandleX}
            cy={currentY}
            r={4}
            fill={currentStep.pnl >= 0 ? "#10b981" : "#ef4444"}
          />
          <circle
            cx={liveCandleX}
            cy={currentY}
            r={8}
            fill={currentStep.pnl >= 0 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}
            className="animate-ping"
          />

          {/* Live Price Tag on Right Axis */}
          <g transform={`translate(${chartWidth - paddingRight + 2}, ${currentY - 9})`}>
            <rect
              fill={currentStep.pnl >= 0 ? "#10b981" : "#ef4444"}
              width={60}
              height={18}
              rx={3}
            />
            <text
              x={4}
              y={12}
              fill="#ffffff"
              fontSize={9}
              fontWeight="bold"
              fontFamily="'Inter', sans-serif"
            >
              {currentStep.price.toFixed(currentSetup.pipDecimals)}
            </text>
          </g>

          {/* Floating Live Profit Pill Beside Candle */}
          <g transform={`translate(${liveCandleX + 10}, ${currentY - 11})`}>
            <rect
              fill={currentStep.pnl >= 0 ? "#10b981" : "#ef4444"}
              width={56}
              height={20}
              rx={5}
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
            />
            <text
              x={6}
              y={14}
              fill="#ffffff"
              fontSize={9.5}
              fontWeight="bold"
              fontFamily="'Inter', sans-serif"
            >
              {formatINR(currentStep.pnl)}
            </text>
          </g>
        </svg>

        {/* Celebration Banner when Take Profit Hits */}
        <AnimatePresence>
          {isTpHit && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-30"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-base font-extrabold text-white">
                TARGET REACHED! {formatINR(currentSetup.liveSteps[currentSetup.liveSteps.length - 1].pnl)}
              </h4>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">
                Tradifive Bot automatically locked profit on MT5. Scanning next signal...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Status Description Strip ── */}
      <div className="flex items-center justify-between text-[11px] py-1.5 px-1 relative z-10">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>{currentStep.desc}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold">
          Trailing Stop Protection ON
        </span>
      </div>

      {/* ── Bottom Session Net Profit Strip & Deploy Button ── */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between relative z-10 mt-2">
        <div>
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-300 block">
            Today's Automated Net Profit
          </span>
          <span
            className="text-base sm:text-lg font-extrabold text-emerald-400 tabular-nums"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {formatINR(totalProfitToday)} (+2.84%)
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/auto-trade/setup")}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <span>Deploy EA on MT5</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
