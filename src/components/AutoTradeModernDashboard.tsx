import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  TrendingUp, TrendingDown, Wallet, Zap, ShieldCheck, Activity, 
  ArrowUpRight, ArrowDownLeft, Play, Pause, RefreshCw, Copy, Check, 
  Upload, X, CheckCircle2, AlertCircle, Clock, ExternalLink, QrCode, 
  Image as ImageIcon, Trash2, Eye, Cpu, Radio, ChevronRight, DollarSign,
  Layers, Sliders, ArrowRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export interface SettlementRecord {
  id: string;
  date: string;
  todayProfit: number;
  remittanceAmount: number;
  currency: string;
  network: string;
  address: string;
  txid: string;
  proofUrl: string;
  proofFileName?: string;
  status: "verified" | "pending";
  timestamp: string;
}

export interface OpenTradeItem {
  ticket: string;
  symbol: string;
  type: "BUY" | "SELL";
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl: number | string;
  tp: number | string;
  floatingPnl: number;
  openTime: string;
}

export interface ClosedTradeItem {
  ticket: string;
  symbol: string;
  type: "BUY" | "SELL";
  lots: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  closeTime: string;
  duration: string;
}

interface Props {
  onBack?: () => void;
  algo?: { name: string; risk: string; deposit: number };
  mt5Account?: string;
}

export default function AutoTradeModernDashboard({ onBack, algo, mt5Account }: Props) {
  // ── Account & Live Connection State ──
  const cleanAccount = useMemo(() => {
    return (mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "414460525").replace(/\D/g, "");
  }, [mt5Account]);

  const [brokerServer, setBrokerServer] = useState<string>("Exness-MT5Trial6");
  const [isBotRunning, setIsBotRunning] = useState<boolean>(true);
  const [latencyPing, setLatencyPing] = useState<number>(1.8);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  // Currency
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const currencySymbol = currency === "INR" ? "₹" : "$";
  const fxRate = currency === "INR" ? 83.2 : 1; // 1 USD = ~83.2 INR

  // ── Financial KPIs (User specified: Balance, Net Profit, Today's Profit, Deposit, Withdrawal) ──
  const [depositAmount, setDepositAmount] = useState<number>(() => {
    try {
      const storedPay = localStorage.getItem("tradifive_payment_request");
      if (storedPay) {
        const p = JSON.parse(storedPay);
        if (p.deposit_amount && Number(p.deposit_amount) > 0) return Number(p.deposit_amount);
      }
      const storedProof = localStorage.getItem("tradifive_ib_proof_request");
      if (storedProof) {
        const p = JSON.parse(storedProof);
        if (p.initial_deposit && Number(p.initial_deposit) > 0) return Number(p.initial_deposit);
      }
    } catch (e) {}
    return 100000;
  });

  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(30400);
  const [accountBalance, setAccountBalance] = useState<number>(112450);
  const [accountEquity, setAccountEquity] = useState<number>(114200);
  const [accountMargin, setAccountMargin] = useState<number>(6200);
  const [marginLevel, setMarginLevel] = useState<number>(1841.9);

  // Today's Profit & Net Profit
  const [todayProfit, setTodayProfit] = useState<number>(12450);
  const [dailyTargetAmount, setDailyTargetAmount] = useState<number>(8000);
  const [netProfitAllTime, setNetProfitAllTime] = useState<number>(42850);

  // Target Hit Detection (Trigger daily settlement)
  const isTargetHit = useMemo(() => {
    return todayProfit >= dailyTargetAmount && todayProfit > 0;
  }, [todayProfit, dailyTargetAmount]);

  // ── Profit Split Calculations (Client vs Mine/Tradifive 50/50) ──
  const clientSplitPercent = 50;
  const adminSplitPercent = 50;
  const clientShareToday = useMemo(() => {
    return Math.max(0, todayProfit * (clientSplitPercent / 100));
  }, [todayProfit]);

  const adminShareToday = useMemo(() => {
    return Math.max(0, todayProfit * (adminSplitPercent / 100));
  }, [todayProfit]);

  // Amount in USDT (Crypto)
  const adminShareTodayUsdt = useMemo(() => {
    // If currency is INR, convert to USD/USDT
    if (currency === "INR") {
      return (adminShareToday / 83.2).toFixed(2);
    }
    return adminShareToday.toFixed(2);
  }, [adminShareToday, currency]);

  // ── Crypto Remittance & Proof Upload Modal State ──
  const [showSettlementModal, setShowSettlementModal] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwork] = useState<"USDT-TRC20" | "USDT-BEP20" | "USDT-ERC20" | "SOL" | "BTC">("USDT-TRC20");
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // Form inputs for settlement proof
  const [txidInput, setTxidInput] = useState<string>("");
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>("");
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox preview for proof image
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

  // Crypto Receiving Addresses Configured for Admin/Tradifive
  const cryptoWallets = {
    "USDT-TRC20": {
      name: "USDT (TRC-20)",
      chain: "Tron Network",
      address: "TYuH5N8qX7mKjLwP9vB3zR1sQa4eCtFd2M",
      fee: "~1.0 USDT (Fast)",
      badge: "RECOMMENDED",
    },
    "USDT-BEP20": {
      name: "USDT (BEP-20)",
      chain: "BNB Smart Chain (BSC)",
      address: "0x71C8A394B73e3518175d7945dBe3570F16e25B93",
      fee: "~$0.25 Gas",
      badge: "LOW FEE",
    },
    "USDT-ERC20": {
      name: "USDT (ERC-20)",
      chain: "Ethereum Mainnet",
      address: "0x71C8A394B73e3518175d7945dBe3570F16e25B93",
      fee: "~$3.50 Gas",
      badge: "ETHEREUM",
    },
    "SOL": {
      name: "Solana (SOL)",
      chain: "Solana Mainnet",
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      fee: "< $0.01",
      badge: "INSTANT",
    },
    "BTC": {
      name: "Bitcoin (BTC)",
      chain: "Bitcoin Native SegWit",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      fee: "~$1.80",
      badge: "BITCOIN",
    },
  };

  // ── Settlements History ──
  const [settlementHistory, setSettlementHistory] = useState<SettlementRecord[]>(() => {
    try {
      const saved = localStorage.getItem("tradifive_daily_settlements");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "SET-8491",
        date: "Yesterday",
        todayProfit: 9800,
        remittanceAmount: 58.89,
        currency: "USDT",
        network: "USDT (TRC-20)",
        address: "TYuH5N8qX7mKjLwP9vB3zR1sQa4eCtFd2M",
        txid: "0x8fa92b...e389c",
        proofUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=400&q=80",
        proofFileName: "usdt_transfer_binance.png",
        status: "verified",
        timestamp: "Yesterday, 21:40",
      },
      {
        id: "SET-8480",
        date: "Oct 19, 2026",
        todayProfit: 14200,
        remittanceAmount: 85.33,
        currency: "USDT",
        network: "USDT (TRC-20)",
        address: "TYuH5N8qX7mKjLwP9vB3zR1sQa4eCtFd2M",
        txid: "0x3bc184...7190f",
        proofUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=400&q=80",
        proofFileName: "trust_wallet_receipt.png",
        status: "verified",
        timestamp: "Oct 19, 22:15",
      },
    ];
  });

  // ── Chart Timeframe & Data ──
  const [chartTimeframe, setChartTimeframe] = useState<"Today" | "7D" | "30D" | "All">("7D");

  const chartData = useMemo(() => {
    if (chartTimeframe === "Today") {
      return [
        { time: "09:00", netProfit: 0, balance: 100000, dailyGain: 0 },
        { time: "11:00", netProfit: 2150, balance: 102150, dailyGain: 2.15 },
        { time: "13:00", netProfit: 4800, balance: 104800, dailyGain: 4.8 },
        { time: "15:00", netProfit: 6200, balance: 106200, dailyGain: 6.2 },
        { time: "17:00", netProfit: 8900, balance: 108900, dailyGain: 8.9 },
        { time: "19:00", netProfit: 10700, balance: 110700, dailyGain: 10.7 },
        { time: "Now", netProfit: 12450, balance: 112450, dailyGain: 12.45 },
      ];
    }
    if (chartTimeframe === "7D") {
      return [
        { time: "Mon", netProfit: 8200, balance: 108200, dailyGain: 8.2 },
        { time: "Tue", netProfit: 15400, balance: 115400, dailyGain: 7.2 },
        { time: "Wed", netProfit: 21900, balance: 121900, dailyGain: 6.5 },
        { time: "Thu", netProfit: 27100, balance: 127100, dailyGain: 5.2 },
        { time: "Fri", netProfit: 33500, balance: 133500, dailyGain: 6.4 },
        { time: "Sat", netProfit: 38200, balance: 138200, dailyGain: 4.7 },
        { time: "Today", netProfit: 42850, balance: 142850, dailyGain: 4.65 },
      ];
    }
    if (chartTimeframe === "30D") {
      return [
        { time: "Week 1", netProfit: 11200, balance: 111200, dailyGain: 11.2 },
        { time: "Week 2", netProfit: 22800, balance: 122800, dailyGain: 11.6 },
        { time: "Week 3", netProfit: 34100, balance: 134100, dailyGain: 11.3 },
        { time: "Week 4", netProfit: 42850, balance: 142850, dailyGain: 8.75 },
      ];
    }
    // All time
    return [
      { time: "Start", netProfit: 0, balance: 100000, dailyGain: 0 },
      { time: "Month 1", netProfit: 18400, balance: 118400, dailyGain: 18.4 },
      { time: "Month 2", netProfit: 31200, balance: 131200, dailyGain: 12.8 },
      { time: "Current", netProfit: 42850, balance: 142850, dailyGain: 11.65 },
    ];
  }, [chartTimeframe]);

  // ── Live Active Positions (XAUUSD Gold Specialist) ──
  const [openPositions, setOpenPositions] = useState<OpenTradeItem[]>([
    {
      ticket: "#8392102",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.02,
      openPrice: 2684.20,
      currentPrice: 2687.90,
      sl: 2674.00,
      tp: 2696.50,
      floatingPnl: 1120.00,
      openTime: "18:42:10",
    },
    {
      ticket: "#8392106",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.02,
      openPrice: 2685.10,
      currentPrice: 2687.90,
      sl: 2674.00,
      tp: 2696.50,
      floatingPnl: 630.00,
      openTime: "18:55:04",
    },
  ]);

  // ── Recent Closed History ──
  const [closedTrades, setClosedTrades] = useState<ClosedTradeItem[]>([
    {
      ticket: "#8392078",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.04,
      openPrice: 2678.50,
      closePrice: 2684.20,
      pnl: 3420.00,
      closeTime: "17:35:12",
      duration: "42 min",
    },
    {
      ticket: "#8392062",
      symbol: "XAUUSD",
      type: "SELL",
      lots: 0.02,
      openPrice: 2682.10,
      closePrice: 2677.30,
      pnl: 2880.00,
      closeTime: "15:20:44",
      duration: "28 min",
    },
    {
      ticket: "#8392044",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.03,
      openPrice: 2671.00,
      closePrice: 2676.80,
      pnl: 4400.00,
      closeTime: "12:14:02",
      duration: "1h 14m",
    },
  ]);

  // Handle Image Upload & Conversion to Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file size should be less than 8MB.");
      return;
    }

    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProofImageBase64(reader.result as string);
      toast.success("Payment proof screenshot loaded!");
    };
    reader.readAsDataURL(file);
  };

  // Submit Settlement Record
  const handleSubmitSettlement = () => {
    if (!proofImageBase64) {
      toast.error("Please attach a screenshot of your crypto transfer as proof.");
      return;
    }

    setIsSubmittingProof(true);

    setTimeout(() => {
      const activeWallet = cryptoWallets[selectedNetwork];
      const newRecord: SettlementRecord = {
        id: `SET-${Math.floor(1000 + Math.random() * 9000)}`,
        date: "Today",
        todayProfit: todayProfit,
        remittanceAmount: Number(adminShareTodayUsdt),
        currency: "USDT",
        network: activeWallet.name,
        address: activeWallet.address,
        txid: txidInput.trim() || `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        proofUrl: proofImageBase64,
        proofFileName: proofFileName || "crypto_settlement_proof.png",
        status: "pending",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const updated = [newRecord, ...settlementHistory];
      setSettlementHistory(updated);
      try {
        localStorage.setItem("tradifive_daily_settlements", JSON.stringify(updated));
      } catch (e) {}

      setIsSubmittingProof(false);
      setShowSettlementModal(false);
      setProofImageBase64(null);
      setProofFileName("");
      setTxidInput("");

      toast.success(
        `Proof of $${adminShareTodayUsdt} USDT settlement submitted! Under review. License remains 100% active.`,
        { duration: 5000 }
      );
    }, 1200);
  };

  // Copy address helper
  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    toast.success("Wallet address copied to clipboard!");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Manual Refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLatencyPing(Number((1.4 + Math.random() * 0.8).toFixed(1)));
      setLastSyncTime("Just now");
      setIsRefreshing(false);
      toast.success("MT5 terminal telemetry updated.");
    }, 800);
  };

  // Toggle Bot EA
  const handleToggleBot = () => {
    const next = !isBotRunning;
    setIsBotRunning(next);
    try {
      localStorage.setItem("tradifive_bot_status", next ? "active" : "paused");
    } catch (e) {}
    if (next) {
      toast.success("FiAlgo EA Bot resumed. Active market execution enabled.");
    } else {
      toast.warning("FiAlgo EA Bot paused. No new basket orders will open.");
    }
  };

  return (
    <div className="w-full text-slate-100 pb-16 font-sans">
      {/* ── TOP HEADER: Terminal Heartbeat & EA Control ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f1115] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6 text-sky-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isBotRunning ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isBotRunning ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">FiAlgo Auto Trade Dashboard</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400">
                Gold Specialist
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
              <span>Account: <b className="text-white">#{cleanAccount}</b></span>
              <span>•</span>
              <span>Server: <b className="text-slate-300">{brokerServer}</b></span>
              <span>•</span>
              <span>Asset: <b className="text-amber-300">XAUUSD (M1)</b></span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Activity size={12} /> {latencyPing}ms Latency
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency(prev => prev === "INR" ? "USD" : "INR")}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
            title="Toggle Currency Display (INR / USD)"
          >
            <DollarSign size={13} className="text-emerald-400" />
            <span>{currency}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-sky-400" : ""} />
          </button>

          {/* Master EA Run / Pause Switch */}
          <button
            onClick={handleToggleBot}
            style={{
              background: isBotRunning 
                ? "linear-gradient(135deg, #064e3b 0%, #022c22 100%)" 
                : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              boxShadow: isBotRunning
                ? "inset 0 1px 0 rgba(52, 211, 153, 0.3), 0 0 12px rgba(16, 185, 129, 0.25)"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
            className="px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {isBotRunning ? (
              <>
                <Play size={13} className="fill-emerald-400 text-emerald-400" />
                <span>EA Running</span>
              </>
            ) : (
              <>
                <Pause size={13} className="fill-amber-400 text-amber-400" />
                <span className="text-amber-400">EA Paused</span>
              </>
            )}
          </button>

          {/* Trigger Settlement Button */}
          <button
            onClick={() => setShowSettlementModal(true)}
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)",
            }}
            className="px-4 py-2 rounded-xl text-[#60a5fa] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:bg-slate-800"
          >
            <QrCode size={14} />
            <span>Pay Profit Split</span>
            {isTargetHit && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ── DAILY TARGET HIT CELEBRATION / REMITTANCE ALERT ── */}
      {isTargetHit && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0d1f18] to-slate-900 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <Zap size={22} className="fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Target Achieved 🎯
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Daily Goal: {currencySymbol}{dailyTargetAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-200 mt-1 font-medium">
                FiAlgo generated <b className="text-emerald-400">{currencySymbol}{todayProfit.toLocaleString()}</b> net profit today! In accordance with the 50/50 Performance Partner tier, please remit the platform share (<b className="text-white">${adminShareTodayUsdt} USDT</b>) to keep your MT5 license active.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettlementModal(true)}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
              boxShadow: "0 0 18px rgba(16, 185, 129, 0.4)",
            }}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Remit ${adminShareTodayUsdt} USDT & Upload Proof</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* ── CORE 5 METRIC CARDS (User Request: Balance, Net Profit, Today's Profit, Deposit, Withdrawal) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        {/* 1. BALANCE */}
        <div className="p-4 rounded-2xl bg-[#0f1115] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Account Balance</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Wallet size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {currencySymbol}{accountBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Equity: <b className="text-slate-200">{currencySymbol}{accountEquity.toLocaleString()}</b></span>
              <span className="text-emerald-400 font-mono text-[10px]">Lvl: {marginLevel.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* 2. NET PROFIT */}
        <div className="p-4 rounded-2xl bg-[#0f1115] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              +{currencySymbol}{netProfitAllTime.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">+{(netProfitAllTime / depositAmount * 100).toFixed(1)}% All-Time</span>
              <span className="text-[10px] text-slate-500">86.4% Win Rate</span>
            </div>
          </div>
        </div>

        {/* 3. TODAY'S PROFIT */}
        <div className="p-4 rounded-2xl bg-[#0f1115] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Today's Profit</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>+{currencySymbol}{todayProfit.toLocaleString()}</span>
              {isTargetHit && <span className="text-xs text-emerald-400 font-bold">🎯</span>}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Goal: {currencySymbol}{dailyTargetAmount.toLocaleString()}</span>
              <span className="text-emerald-400 font-bold">{(todayProfit / dailyTargetAmount * 100).toFixed(0)}% Hit</span>
            </div>
          </div>
        </div>

        {/* 4. TOTAL DEPOSIT */}
        <div className="p-4 rounded-2xl bg-[#0f1115] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Deposits</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ArrowDownLeft size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {currencySymbol}{depositAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Funded MT5 Capital</span>
              <span className="text-[10px] text-indigo-400">Exness IB</span>
            </div>
          </div>
        </div>

        {/* 5. TOTAL WITHDRAWAL */}
        <div className="p-4 rounded-2xl bg-[#0f1115] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Withdrawals</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ArrowUpRight size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {currencySymbol}{withdrawalAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>All Payouts Cleared</span>
              <span className="text-emerald-400 font-mono text-[10px]">✓ Zero Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: Net Profit Growth Chart + 50/50 Profit Split Card ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* LEFT COLUMN: NET PROFIT GROWTH CHART (7 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0f1115] border border-white/5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Net Profit & Equity Curve</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Cumulative P&L
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time performance trajectory from FiAlgo execution engine
              </p>
            </div>

            {/* Timeframe Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 shrink-0 self-start sm:self-auto">
              {(["Today", "7D", "30D", "All"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    chartTimeframe === tf 
                      ? "bg-gradient-to-r from-emerald-500/20 to-sky-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Recharts Graph */}
          <div className="w-full h-[260px] my-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-slate-900/95 border border-white/10 shadow-xl backdrop-blur-md">
                          <div className="text-[11px] text-slate-400">{data.time}</div>
                          <div className="text-base font-bold text-emerald-400 mt-0.5">
                            +{currencySymbol}{Number(data.netProfit).toLocaleString()} Net Profit
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-between gap-4">
                            <span>Balance: {currencySymbol}{Number(data.balance).toLocaleString()}</span>
                            <span className="text-emerald-400 font-semibold">+{data.dailyGain}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#profitGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Under Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/5 text-xs text-slate-400">
            <div>
              <span className="block text-[10px] uppercase text-slate-500">Profit Factor</span>
              <b className="text-white font-mono text-sm">2.84</b>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500">Sharpe Ratio</span>
              <b className="text-white font-mono text-sm">2.15</b>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500">Max Drawdown</span>
              <b className="text-emerald-400 font-mono text-sm">-3.8%</b>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500">Avg Win Trade</span>
              <b className="text-white font-mono text-sm">+{currencySymbol}412.00</b>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 50/50 PROFIT SPLIT (CLIENT & MINE) (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0f1115] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white">Profit Split (50 / 50)</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400">
                Partner Model
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Today's trading profits are split equally between client and platform. Keep 50% in your MT5 broker account; remit 50% daily via Crypto.
            </p>

            {/* Split Visual Meter */}
            <div className="space-y-3">
              {/* Client Card */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Client Share (50%)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Retained in MT5</span>
                </div>
                <div className="text-xl font-bold text-white tracking-tight">
                  +{currencySymbol}{clientShareToday.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Credited directly to your MT5 account equity.
                </div>
              </div>

              {/* Admin / Tradifive Card */}
              <div className="p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <QrCode size={13} /> Platform Share (50%)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Remit via Crypto</span>
                </div>
                <div className="text-xl font-bold text-white tracking-tight flex items-baseline gap-2">
                  <span>${adminShareTodayUsdt} USDT</span>
                  <span className="text-xs font-normal text-slate-400">({currencySymbol}{adminShareToday.toLocaleString()})</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Daily remittance required to keep EA key active.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Pay Button */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <button
              onClick={() => setShowSettlementModal(true)}
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)",
              }}
              className="w-full py-2.5 rounded-xl text-[#60a5fa] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-slate-800"
            >
              <Upload size={14} />
              <span>Remit 50% via Crypto & Upload Proof</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: Live Open Basket Positions & Recent Trade History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* LIVE OPEN POSITIONS (XAUUSD BASKET) (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0f1115] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Live Open Basket (Gold)</h2>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {openPositions.length} Active Positions
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              Floating: +{currencySymbol}{openPositions.reduce((acc, p) => acc + p.floatingPnl, 0).toLocaleString()}
            </span>
          </div>

          {openPositions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No open positions. FiAlgo is scanning for next high-probability basket entry.
            </div>
          ) : (
            <div className="space-y-2.5">
              {openPositions.map((pos) => (
                <div 
                  key={pos.ticket}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {pos.type}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{pos.symbol}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{pos.lots} Lots</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Open: {pos.openPrice} → Now: {pos.currentPrice}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400 font-mono text-sm">
                      +{currencySymbol}{pos.floatingPnl.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      SL: {pos.sl} • TP: {pos.tp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT CLOSED TRADES (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0f1115] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Recent Execution History</h2>
              <span className="text-[10px] font-mono text-slate-400">Closed Trades</span>
            </div>
            <span className="text-xs text-slate-400">
              Session Total: <b className="text-emerald-400">+{currencySymbol}{closedTrades.reduce((acc, t) => acc + t.pnl, 0).toLocaleString()}</b>
            </span>
          </div>

          <div className="space-y-2.5">
            {closedTrades.map((t) => (
              <div 
                key={t.ticket}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {t.type}
                  </span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{t.symbol}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{t.lots} Lots</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {t.openPrice} → {t.closePrice} ({t.duration})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400 font-mono text-sm">
                    +{currencySymbol}{t.pnl.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {t.closeTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DAILY CRYPTO SETTLEMENTS LEDGER (User Request: Withdrawal crypto + proof upload log) ── */}
      <div className="p-5 rounded-2xl bg-[#0f1115] border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Daily Crypto Profit Settlements</h2>
              <span className="text-[10px] font-mono text-slate-400">50% Platform Remittance Ledger</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified records of daily profit share sent via Crypto with uploaded transaction proofs.
            </p>
          </div>
          <button
            onClick={() => setShowSettlementModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-sky-400 flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <Upload size={13} />
            <span>Submit New Settlement</span>
          </button>
        </div>

        {settlementHistory.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No settlements yet. Once your daily target is achieved, submit your 50% crypto transfer proof here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2.5 font-bold">Settlement ID</th>
                  <th className="pb-2.5 font-bold">Date</th>
                  <th className="pb-2.5 font-bold">Today's Profit</th>
                  <th className="pb-2.5 font-bold">50% Remittance</th>
                  <th className="pb-2.5 font-bold">Network</th>
                  <th className="pb-2.5 font-bold">Proof Screenshot</th>
                  <th className="pb-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {settlementHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 text-slate-300 font-semibold">{rec.id}</td>
                    <td className="py-3 text-slate-400">{rec.date} ({rec.timestamp})</td>
                    <td className="py-3 text-emerald-400 font-bold">+{currencySymbol}{rec.todayProfit.toLocaleString()}</td>
                    <td className="py-3 text-white font-bold">${rec.remittanceAmount.toFixed(2)} USDT</td>
                    <td className="py-3 text-slate-300">{rec.network}</td>
                    <td className="py-3">
                      {rec.proofUrl ? (
                        <button
                          onClick={() => setPreviewLightboxUrl(rec.proofUrl)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-[11px]"
                        >
                          <Eye size={12} className="text-sky-400" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-600">No Image</span>
                      )}
                    </td>
                    <td className="py-3">
                      {rec.status === "verified" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 size={11} /> Verified & Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          <Clock size={11} /> Pending Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: CRYPTO WITHDRAWAL / 50% REMITTANCE & PROOF UPLOAD ── */}
      <AnimatePresence>
        {showSettlementModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettlementModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#0f1115] border border-white/10 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Daily 50% Profit Share Settlement</h3>
                    <p className="text-xs text-slate-400">Remit via Crypto to keep FiAlgo license active</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettlementModal(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Amount Due Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-transparent border border-emerald-500/20 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Today's Net Profit:</span>
                  <span className="text-xs font-bold text-emerald-400">+{currencySymbol}{todayProfit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <span className="text-xs font-bold text-white">50% Platform Remittance Due:</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      ${adminShareTodayUsdt} USDT
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ({currencySymbol}{adminShareToday.toLocaleString()} INR equivalent)
                    </div>
                  </div>
                </div>
              </div>

              {/* Crypto Network Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Crypto Network:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(cryptoWallets) as Array<keyof typeof cryptoWallets>).map((net) => {
                    const info = cryptoWallets[net];
                    const isSelected = selectedNetwork === net;
                    return (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setSelectedNetwork(net)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-500/15 border-sky-500 text-white"
                            : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        <div className="text-xs font-bold">{info.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{info.chain}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deposit Wallet Address & QR Code */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">
                    Send to Admin {cryptoWallets[selectedNetwork].name} Address:
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {cryptoWallets[selectedNetwork].badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-white/10 font-mono text-xs text-sky-300 break-all">
                  <span className="flex-1">{cryptoWallets[selectedNetwork].address}</span>
                  <button
                    onClick={() => handleCopyAddress(cryptoWallets[selectedNetwork].address)}
                    className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 transition-all shrink-0 cursor-pointer"
                    title="Copy Address"
                  >
                    {copiedAddress ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                  <span>Network: <b className="text-slate-400">{cryptoWallets[selectedNetwork].chain}</b></span>
                  <span>Fee: <b className="text-slate-400">{cryptoWallets[selectedNetwork].fee}</b></span>
                </div>
              </div>

              {/* Proof Image Upload (User Request: "there upload proof image") */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Upload Payment Transfer Screenshot Proof:
                </label>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {!proofImageBase64 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-sky-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03]"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center mb-2.5">
                      <Upload size={20} />
                    </div>
                    <div className="text-xs font-bold text-white">Click or Drag & Drop screenshot</div>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP receipt from your exchange or wallet</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={proofImageBase64} 
                        alt="Proof Preview" 
                        className="w-14 h-14 object-cover rounded-xl border border-white/10" 
                      />
                      <div>
                        <div className="text-xs font-bold text-white max-w-[200px] truncate">{proofFileName || "proof_screenshot.png"}</div>
                        <span className="text-[10px] text-emerald-400 font-medium">✓ Image Attached</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProofImageBase64(null);
                        setProofFileName("");
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Transaction Hash / TXID */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Transaction Hash / TXID (Optional):
                </label>
                <input
                  type="text"
                  placeholder="Paste blockchain transaction hash or receipt ID"
                  value={txidInput}
                  onChange={(e) => setTxidInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingProof || !proofImageBase64}
                  onClick={handleSubmitSettlement}
                  style={{
                    background: proofImageBase64 
                      ? "linear-gradient(135deg, #10b981 0%, #047857 100%)" 
                      : "rgba(255, 255, 255, 0.05)",
                    boxShadow: proofImageBase64 ? "0 0 18px rgba(16, 185, 129, 0.35)" : "none",
                  }}
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingProof ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Submit Proof & Verify</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LIGHTBOX FOR VIEWING PROOF IMAGES ── */}
      <AnimatePresence>
        {previewLightboxUrl && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewLightboxUrl(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl max-h-[85vh] z-10"
            >
              <button
                onClick={() => setPreviewLightboxUrl(null)}
                className="absolute -top-10 right-0 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X size={18} />
              </button>
              <img
                src={previewLightboxUrl}
                alt="Payment Settlement Proof"
                className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
