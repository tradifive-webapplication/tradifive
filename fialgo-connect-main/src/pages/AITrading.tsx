import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Activity,
  Play,
  Pause,
  Copy,
  Check,
  Download,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Wallet,
  Zap,
  X,
  Mail,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { playSound } from "@/utils/soundEffects";

// ─── BROKER CONFIGURATIONS ──────────────────────────────────────
const BROKERS = [
  {
    id: "exness",
    name: "Exness",
    tagline: "Instant Withdrawals · Zero Swap",
    partnerId: "27863221",
    supportEmail: "support@exness.com",
    badge: "Recommended",
  },
  {
    id: "vantage",
    name: "Vantage Markets",
    tagline: "Raw ECN · Low Spreads",
    partnerId: "27863221",
    supportEmail: "support@vantagemarkets.com",
    badge: "Popular",
  },
  {
    id: "xm",
    name: "XM Global",
    tagline: "Ultra Low Spreads · Instant Execution",
    partnerId: "27863221",
    supportEmail: "support@xm.com",
  },
  {
    id: "fusion",
    name: "Fusion Markets",
    tagline: "Lowest Commissions ($2.25/lot)",
    partnerId: "27863221",
    supportEmail: "help@fusionmarkets.com",
  },
  {
    id: "blackbull",
    name: "BlackBull Markets",
    tagline: "Institutional Equinix LD4 Speed",
    partnerId: "27863221",
    supportEmail: "support@blackbullmarkets.com",
  },
];

// ─── HELPER FOR DETERMINISTIC LICENSE KEY GENERATION ────────────
export function generateTradifiveLicenseKey(accountNumber?: string): string {
  if (!accountNumber) return "FA-V1-9482-LIVE-KEY";
  const clean = String(accountNumber).replace(/\D/g, "");
  if (!clean) return "FA-V1-9482-LIVE-KEY";
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  return `FA-V1-${hex.slice(0, 4)}-${hex.slice(4, 8)}-MT5`;
}

// ─── HIGH-PRECISION GRAPH SHADE DATA (MATCHING REFERENCE IMAGE) ──
const CUMULATIVE_PNL_DATA = [
  { date: "Nov 5", pnl: 0, rawDate: "2026-11-05" },
  { date: "Nov 6", pnl: 420, rawDate: "2026-11-06" },
  { date: "Nov 7", pnl: 260, rawDate: "2026-11-07" },
  { date: "Nov 8", pnl: 850, rawDate: "2026-11-08" },
  { date: "Nov 9", pnl: 580, rawDate: "2026-11-09" },
  { date: "Nov 11", pnl: 1420, rawDate: "2026-11-11" },
  { date: "Nov 12", pnl: 1850, rawDate: "2026-11-12" },
  { date: "Nov 13", pnl: 1850, rawDate: "2026-11-13" },
  { date: "Nov 14", pnl: 1520, rawDate: "2026-11-14" },
  { date: "Nov 15", pnl: 2200, rawDate: "2026-11-15" },
  { date: "Nov 16", pnl: 2650, rawDate: "2026-11-16" },
  { date: "Nov 17", pnl: 2410, rawDate: "2026-11-17" },
  { date: "Nov 18", pnl: 3155, rawDate: "2026-11-18" },
  { date: "Nov 19", pnl: 2980, rawDate: "2026-11-19" },
  { date: "Nov 20", pnl: 3480, rawDate: "2026-11-20" },
];

const ACCOUNT_BALANCE_DATA_MAP = {
  "1W": [
    { date: "Nov 14", balance: 26400, depositBaseline: 25000 },
    { date: "Nov 15", balance: 27150, depositBaseline: 25000 },
    { date: "Nov 16", balance: 27650, depositBaseline: 25000 },
    { date: "Nov 17", balance: 27410, depositBaseline: 25000 },
    { date: "Nov 18", balance: 28155, depositBaseline: 25000 },
    { date: "Nov 19", balance: 27980, depositBaseline: 25000 },
    { date: "Nov 20", balance: 28480, depositBaseline: 25000 },
  ],
  "1M": [
    { date: "Nov 4", balance: 25000, depositBaseline: 25000 },
    { date: "Nov 7", balance: 25850, depositBaseline: 25000 },
    { date: "Nov 9", balance: 25580, depositBaseline: 25000 },
    { date: "Nov 11", balance: 26850, depositBaseline: 25000 },
    { date: "Nov 13", balance: 26850, depositBaseline: 25000 },
    { date: "Nov 14", balance: 26520, depositBaseline: 25000 },
    { date: "Nov 16", balance: 27650, depositBaseline: 25000 },
    { date: "Nov 17", balance: 27410, depositBaseline: 25000 },
    { date: "Nov 18", balance: 28155, depositBaseline: 25000 },
    { date: "Nov 20", balance: 28480, depositBaseline: 25000 },
  ],
  All: [
    { date: "Nov 4", balance: 25000, depositBaseline: 25000 },
    { date: "Nov 7", balance: 25850, depositBaseline: 25000 },
    { date: "Nov 9", balance: 25580, depositBaseline: 25000 },
    { date: "Nov 11", balance: 26850, depositBaseline: 25000 },
    { date: "Nov 13", balance: 26850, depositBaseline: 25000 },
    { date: "Nov 14", balance: 26520, depositBaseline: 25000 },
    { date: "Nov 17", balance: 27410, depositBaseline: 25000 },
    { date: "Nov 18", balance: 28155, depositBaseline: 25000 },
    { date: "Nov 20", balance: 28480, depositBaseline: 25000 },
  ],
};

const INITIAL_OPEN_POSITIONS = [
  {
    ticket: "7849201",
    symbol: "XAUUSD",
    type: "BUY",
    lots: 0.15,
    openPrice: 2642.1,
    currentPrice: 2648.35,
    profit: 93.75,
    openTime: "12 mins ago",
    strategy: "Gold Scalper V1.4",
  },
  {
    ticket: "7849208",
    symbol: "EURUSD",
    type: "SELL",
    lots: 0.25,
    openPrice: 1.0842,
    currentPrice: 1.0829,
    profit: 32.5,
    openTime: "24 mins ago",
    strategy: "London Breakout",
  },
];

const INITIAL_CLOSED_TRADES = [
  {
    ticket: "7848912",
    symbol: "XAUUSD",
    type: "BUY",
    lots: 0.2,
    openPrice: 2638.5,
    closePrice: 2645.2,
    profit: 134.0,
    time: "Today, 14:22",
    strategy: "Gold Scalper V1.4",
    status: "Won",
  },
  {
    ticket: "7848760",
    symbol: "GBPUSD",
    type: "BUY",
    lots: 0.15,
    openPrice: 1.298,
    closePrice: 1.3022,
    profit: 63.0,
    time: "Today, 11:45",
    strategy: "Trend Hunter",
    status: "Won",
  },
  {
    ticket: "7848655",
    symbol: "XAUUSD",
    type: "SELL",
    lots: 0.1,
    openPrice: 2644.0,
    closePrice: 2646.1,
    profit: -21.0,
    time: "Today, 09:15",
    strategy: "Gold Scalper V1.4",
    status: "Lost",
  },
  {
    ticket: "7848421",
    symbol: "USDJPY",
    type: "BUY",
    lots: 0.3,
    openPrice: 154.2,
    closePrice: 154.68,
    profit: 96.0,
    time: "Yesterday, 21:05",
    strategy: "Session Pullback",
    status: "Won",
  },
  {
    ticket: "7848201",
    symbol: "XAUUSD",
    type: "BUY",
    lots: 0.25,
    openPrice: 2630.1,
    closePrice: 2639.4,
    profit: 232.5,
    time: "Yesterday, 16:30",
    strategy: "Gold Scalper V1.4",
    status: "Won",
  },
];

export default function AITrading() {
  // ─── STATE MANAGEMENT ───────────────────────────────────────────
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("fialgo_agent_running");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [balanceTimeframe, setBalanceTimeframe] = useState<"1W" | "1M" | "All">("All");
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");

  const [openPositions, setOpenPositions] = useState(INITIAL_OPEN_POSITIONS);
  const [closedTrades, setClosedTrades] = useState(INITIAL_CLOSED_TRADES);

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  // Connected Account info
  const [connectedAccount, setConnectedAccount] = useState<string>(() => {
    try {
      return (
        localStorage.getItem("tradifive_connected_mt5_account") ||
        "38491820"
      );
    } catch {
      return "38491820";
    }
  });

  const [selectedBroker, setSelectedBroker] = useState<string>("exness");
  const [mt5InputAccount, setMt5InputAccount] = useState<string>("");
  const [hasConfirmedBalance, setHasConfirmedBalance] = useState<boolean>(true);
  const [licenseKey, setLicenseKey] = useState<string>("FA-V1-9482-LIVE-KEY");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Heartbeat & Latency telemetry
  const [lastUpdateSecs, setLastUpdateSecs] = useState(2);
  const [latencyMs, setLatencyMs] = useState(12);

  // Live seconds ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdateSecs((prev) => (prev >= 6 ? 1 : prev + 1));
      if (Math.random() > 0.6) {
        setLatencyMs(11 + Math.floor(Math.random() * 4));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real MT5 account from Supabase if available
  useEffect(() => {
    async function loadAccount() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: mt5 } = await supabase
            .from("mt5_accounts")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (mt5?.account_number) {
            setConnectedAccount(mt5.account_number);
            if (mt5.activation_key) {
              setLicenseKey(mt5.activation_key);
            }
          }
        }
      } catch (err) {
        /* fallback to demo simulation */
      }
    }
    loadAccount();
  }, []);

  const toggleAgent = () => {
    const nextState = !isAgentRunning;
    setIsAgentRunning(nextState);
    playSound(nextState ? 'toggleOn' : 'toggleOff');
    try {
      localStorage.setItem("fialgo_agent_running", String(nextState));
    } catch {}
    if (nextState) {
      toast.success("FiAlgo Agent is now RUNNING! Scanning for trade setups.", {
        icon: "🟢",
      });
    } else {
      toast.info("FiAlgo Agent PAUSED. Open trades protected by Risk Guard.", {
        icon: "⏸️",
      });
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    playSound('success');
    toast.success("License key copied to clipboard!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyPartnerMessage = () => {
    const msg = `Hello Support, please transfer my MT5 account ${connectedAccount} under official Partner ID: 27863221. Thank you.`;
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    playSound('click');
    toast.success("Support transfer message copied!");
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleSaveMt5Account = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = mt5InputAccount.trim().replace(/\D/g, "");
    if (!cleanNum || cleanNum.length < 5) {
      playSound('error');
      toast.error("Please enter a valid 6 to 9-digit MT5 account number.");
      return;
    }

    setConnectedAccount(cleanNum);
    playSound('success');
    try {
      localStorage.setItem("tradifive_connected_mt5_account", cleanNum);
      localStorage.setItem("tradifive_auto_trade_setup", "true");
    } catch {}

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.from("mt5_accounts").upsert({
          user_id: session.user.id,
          account_number: cleanNum,
          broker_name: selectedBroker,
          connection_status: "connected",
          algo_status: true,
        });
      }
    } catch {}

    setIsConnectModalOpen(false);
    toast.success(`MT5 Account #${cleanNum} successfully linked! Engine active.`);
  };

  const handleClosePosition = (ticket: string) => {
    const pos = openPositions.find((p) => p.ticket === ticket);
    if (!pos) return;

    setOpenPositions((prev) => prev.filter((p) => p.ticket !== ticket));
    setClosedTrades((prev) => [
      {
        ticket: pos.ticket,
        symbol: pos.symbol,
        type: pos.type,
        lots: pos.lots,
        openPrice: pos.openPrice,
        closePrice: pos.currentPrice,
        profit: pos.profit,
        time: "Just now",
        strategy: pos.strategy,
        status: pos.profit >= 0 ? "Won" : "Lost",
      },
      ...prev,
    ]);
    toast.success(
      `Position #${ticket} on ${pos.symbol} closed (${pos.profit >= 0 ? "+" : ""}$${pos.profit.toFixed(2)})`
    );
  };

  const activeBalanceData = ACCOUNT_BALANCE_DATA_MAP[balanceTimeframe];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E0E0E] text-slate-800 dark:text-slate-100 font-sans pb-16">
        {/* ─── TOP HEADER BAR ────────────────────────────────────────────── */}
        <header className="border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Live Status Beacon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Cpu size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    AutoTrade Engine
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isAgentRunning
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAgentRunning ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                      }`}
                    />
                    {isAgentRunning ? "Engine Running" : "Engine Standby"}
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium">
                  FiAlgo V1.4 High-Frequency Execution · {latencyMs}ms Latency (London LD4)
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS (Matching Reference Image 2 Pill Design) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* White Pill 1: Connect Account */}
              <button
                type="button"
                onClick={() => {
                  playSound('modalOpen');
                  setIsConnectModalOpen(true);
                }}
                className="bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/10 px-4 py-2 rounded-full font-medium text-[13.5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-slate-50 dark:hover:bg-[#252525] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Wallet size={15} className="text-slate-500 dark:text-slate-400" />
                <span>+ Connect MT5</span>
              </button>

              {/* White Pill 2: Activate License Key */}
              <button
                type="button"
                onClick={() => {
                  playSound('modalOpen');
                  setIsLicenseModalOpen(true);
                }}
                className="bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/10 px-4 py-2 rounded-full font-medium text-[13.5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-slate-50 dark:hover:bg-[#252525] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={15} className="text-blue-500" />
                <span>Activate License Key</span>
              </button>

              {/* White Pill 3: Pause / Resume Toggle */}
              <button
                type="button"
                onClick={toggleAgent}
                className="bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/10 px-4 py-2 rounded-full font-medium text-[13.5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-slate-50 dark:hover:bg-[#252525] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                {isAgentRunning ? (
                  <>
                    <Pause size={14} className="text-amber-500" />
                    <span>Pause Agent</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="text-emerald-500" />
                    <span>Run Agent</span>
                  </>
                )}
              </button>

              {/* Dark Solid Pill (Image 2 right button style): Status Indicator */}
              <div
                className={`px-5 py-2 rounded-full font-semibold text-[13.5px] shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-all flex items-center gap-2 select-none ${
                  isAgentRunning
                    ? "bg-[#111] dark:bg-white text-white dark:text-[#111]"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAgentRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span>{isAgentRunning ? "Agent Active" : "Standby"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ─── MAIN DASHBOARD CONTENT ────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
          {/* Quick Account Connection Banner */}
          <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                <Activity size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-[15px]">
                    MT5 Account #{connectedAccount}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    Exness Real-5
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Partner ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">27863221</span> · 0% Profit Share Pass Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className="bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/10 px-3.5 py-1.5 rounded-full font-medium text-[12.5px] shadow-sm hover:bg-slate-50 dark:hover:bg-[#252525] transition-all cursor-pointer flex items-center gap-1.5"
              >
                Change Broker
              </button>
              <button
                type="button"
                onClick={handleCopyPartnerMessage}
                className="bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/10 px-3.5 py-1.5 rounded-full font-medium text-[12.5px] shadow-sm hover:bg-slate-50 dark:hover:bg-[#252525] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copiedMsg ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedMsg ? "Copied!" : "Copy IB Message"}</span>
              </button>
            </div>
          </div>

          {/* ─── 4 TOP SUMMARY METRIC CARDS ──────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Daily Profit & Loss */}
            <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[13px] font-semibold">Today's P&L</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp size={12} />
                  +2.41%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight font-sans">
                  +$482.50
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-500 dark:text-slate-400">
                <span>Daily Target: $500.00</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">96.5% achieved</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-emerald-500 h-full rounded-full w-[96.5%]" />
              </div>
            </div>

            {/* Metric 2: Total Net Profit */}
            <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[13px] font-semibold">Net Profit (All-Time)</span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <DollarSign size={14} />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight font-sans">
                  +$3,155.00
                </span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
                Account Balance: <span className="font-semibold text-slate-800 dark:text-slate-200">$28,155.00</span>
              </p>
            </div>

            {/* Metric 3: Agent Live Status & Telemetry */}
            <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[13px] font-semibold">Agent Telemetry</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Socket
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                  {isAgentRunning ? "RUNNING" : "PAUSED"}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
                <Clock size={12} />
                Last check: <span className="font-semibold text-slate-700 dark:text-slate-200">{lastUpdateSecs}s ago</span>
              </p>
            </div>

            {/* Metric 4: Win Rate & Risk Guard */}
            <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-[13px] font-semibold">Algo Win Rate</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={14} />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                  63.0%
                </span>
                <span className="text-[13px] font-semibold text-slate-500">16 Closed Trades</span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-3">
                Max DD: <span className="font-semibold text-slate-800 dark:text-slate-200">2.1%</span> · Profit Factor: <span className="font-semibold text-slate-800 dark:text-slate-200">3.42</span>
              </p>
            </div>
          </div>

          {/* ─── TWO PREMIUM GRAPH CARDS WITH SHADES (MATCHING USER IMAGE) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. LEFT CARD: CUMULATIVE P&L (WITH BLUE GRADIENT SHADES & DASHED $0 BASELINE) */}
            <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <TrendingUp size={18} strokeWidth={2.4} />
                      <h3 className="font-bold text-[16.5px] text-slate-900 dark:text-white">
                        Cumulative P&L
                      </h3>
                    </div>
                    <p className="text-[12.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Closed trade equity curve · All time
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight font-sans">
                      +$3,155
                    </span>
                    <span className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      NET
                    </span>
                  </div>
                </div>

                {/* The Shaded Area Chart with Dashed Baseline */}
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={CUMULATIVE_PNL_DATA}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        {/* High-end smooth gradient shade fading into pure background */}
                        <linearGradient id="pnlShadeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
                          <stop offset="65%" stopColor="#2563EB" stopOpacity={0.06} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(226, 232, 240, 0.6)"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94A3B8", fontSize: 11.5, fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94A3B8", fontSize: 11.5, fontWeight: 500 }}
                        tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                        domain={[-100, 4000]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-[#1E1E1E] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-lg text-[12px] font-sans">
                                <p className="font-bold text-slate-800 dark:text-white mb-0.5">{data.date}</p>
                                <p className="text-blue-600 font-bold">
                                  Cumulative P&L: +${data.pnl.toLocaleString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Dotted horizontal baseline at $0 */}
                      <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="3 3" />
                      <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke="#2563EB"
                        strokeWidth={2.4}
                        fillOpacity={1}
                        fill="url(#pnlShadeGradient)"
                        activeDot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Footer Row (Matching Image 1:1) */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[12.5px] text-slate-500 dark:text-slate-400">
                <span>
                  Win rate <strong className="text-slate-800 dark:text-white font-bold">63%</strong>
                </span>
                <span>16 closed trades</span>
              </div>
            </div>

            {/* 2. RIGHT CARD: ACCOUNT BALANCE (WITH TIME SELECTOR, BLUE SHADES & BASELINE) */}
            <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[16.5px] text-slate-900 dark:text-white">
                      Account Balance
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        Balance
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        Deposits
                      </span>
                    </div>
                  </div>

                  {/* Timeframe pill selector (Image 1 style) */}
                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-neutral-800/80 border border-slate-200/60 dark:border-white/5">
                    {(["1W", "1M", "All"] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => {
                          playSound('tab');
                          setBalanceTimeframe(tf);
                        }}
                        className={`px-3 py-1 rounded-md text-[11.5px] font-bold transition-all cursor-pointer ${
                          balanceTimeframe === tf
                            ? "bg-white dark:bg-[#262626] text-slate-900 dark:text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* The Shaded Area Chart with Dashed Starting Deposit Baseline */}
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={activeBalanceData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="balanceShadeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.24} />
                          <stop offset="65%" stopColor="#2563EB" stopOpacity={0.06} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(226, 232, 240, 0.6)"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94A3B8", fontSize: 11.5, fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94A3B8", fontSize: 11.5, fontWeight: 500 }}
                        tickFormatter={(val) => `$${(val / 1000).toFixed(1).replace(/\.0$/, "")}k`}
                        domain={[23500, 30000]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-[#1E1E1E] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-lg text-[12px] font-sans">
                                <p className="font-bold text-slate-800 dark:text-white mb-0.5">{data.date}</p>
                                <p className="text-blue-600 font-bold">
                                  Current Balance: ${data.balance.toLocaleString()}
                                </p>
                                <p className="text-slate-400 text-[11px]">
                                  Initial Deposit: $25,000.00
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Dotted horizontal baseline at initial deposit ($25,000) */}
                      <ReferenceLine
                        y={25000}
                        stroke="#94A3B8"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#2563EB"
                        strokeWidth={2.4}
                        fillOpacity={1}
                        fill="url(#balanceShadeGradient)"
                        activeDot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Footer Row (Matching Image 1:1) */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[12.5px]">
                <span className="text-slate-500 dark:text-slate-400">
                  Start <strong className="text-slate-700 dark:text-slate-200 font-bold">$25,000.00</strong>
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  $28,155.00 (+12.6%)
                </span>
              </div>
            </div>
          </div>

          {/* ─── LIVE TRADE POSITIONS & EXECUTED HISTORY ──────────────────── */}
          <div className="bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            {/* Table Header & Tab Switcher */}
            <div className="p-5 border-b border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-[16px]">
                  Trade Execution & Order Stream
                </h3>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
                  Real-time MT5 algorithmic order flow, positions and historical audit
                </p>
              </div>

              {/* Tabs with Image 2 pill styling */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound('tab');
                    setActiveTab("positions");
                  }}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                    activeTab === "positions"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50"
                  }`}
                >
                  Live Positions ({openPositions.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('tab');
                    setActiveTab("history");
                  }}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50"
                  }`}
                >
                  Closed History ({closedTrades.length})
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              {activeTab === "positions" ? (
                openPositions.length > 0 ? (
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-slate-50/70 dark:bg-neutral-900/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/60 dark:border-white/5">
                      <tr>
                        <th className="py-3 px-5">Ticket / Symbol</th>
                        <th className="py-3 px-4">Direction</th>
                        <th className="py-3 px-4">Volume (Lots)</th>
                        <th className="py-3 px-4">Entry Price</th>
                        <th className="py-3 px-4">Current Price</th>
                        <th className="py-3 px-4">Floating P&L</th>
                        <th className="py-3 px-4">Strategy</th>
                        <th className="py-3 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
                      {openPositions.map((pos) => (
                        <tr
                          key={pos.ticket}
                          className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/20 transition-colors"
                        >
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{pos.symbol}</span>
                              <span className="text-[11px] text-slate-400 font-normal">#{pos.ticket}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">{pos.openTime}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                pos.type === "BUY"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              }`}
                            >
                              {pos.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                            {pos.lots.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 tabular-nums text-slate-600 dark:text-slate-300">
                            {pos.openPrice.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                            {pos.currentPrice.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-bold tabular-nums text-[14px] ${
                                pos.profit >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {pos.profit >= 0 ? "+" : ""}${pos.profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[12px]">{pos.strategy}</td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleClosePosition(pos.ticket)}
                              className="px-3 py-1 rounded-full text-[12px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-[14px] font-medium">No open positions currently active.</p>
                    <p className="text-[12px] mt-1 text-slate-500">
                      The FiAlgo Agent is monitoring the market for the next high-probability setup.
                    </p>
                  </div>
                )
              ) : (
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50/70 dark:bg-neutral-900/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/60 dark:border-white/5">
                    <tr>
                      <th className="py-3 px-5">Ticket / Symbol</th>
                      <th className="py-3 px-4">Direction</th>
                      <th className="py-3 px-4">Volume</th>
                      <th className="py-3 px-4">Entry</th>
                      <th className="py-3 px-4">Exit</th>
                      <th className="py-3 px-4">Realized Profit</th>
                      <th className="py-3 px-4">Execution Time</th>
                      <th className="py-3 px-5 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
                    {closedTrades.map((trade) => (
                      <tr
                        key={trade.ticket}
                        className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/20 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {trade.symbol}
                            <span className="text-[11px] text-slate-400 font-normal ml-1.5">
                              #{trade.ticket}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{trade.strategy}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              trade.type === "BUY"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            }`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          {trade.lots.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-slate-600 dark:text-slate-300">
                          {trade.openPrice.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-slate-600 dark:text-slate-300">
                          {trade.closePrice.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold tabular-nums text-[13.5px] ${
                              trade.profit >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[12px]">{trade.time}</td>
                        <td className="py-3.5 px-5 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              trade.status === "Won"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                            }`}
                          >
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* ─── MODAL 1: CONNECT MT5 ACCOUNT ──────────────────────────────── */}
        <AnimatePresence>
          {isConnectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#161616] border border-slate-200/90 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-[16px]">
                        Connect MetaTrader 5 Account
                      </h3>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">
                        Link your regulated broker under Partner IB (0% Profit Share)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('modalClose');
                      setIsConnectModalOpen(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveMt5Account} className="pt-4 space-y-4">
                  {/* Broker Choice */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Broker
                    </label>
                    <select
                      value={selectedBroker}
                      onChange={(e) => setSelectedBroker(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-slate-800 dark:text-slate-100 outline-hidden focus:border-blue-500"
                    >
                      {BROKERS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.tagline})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Partner IB Details with 1-click copy */}
                  <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                        Official Partner IB: 27863221
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPartnerMessage}
                        className="text-[11.5px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedMsg ? "Copied!" : "Copy Support Message"}
                      </button>
                    </div>
                    <p className="text-[11.5px] text-blue-600/80 dark:text-blue-300/80 mt-1">
                      Existing traders: Transfer your account under Partner ID 27863221 to activate institutional 0% profit share.
                    </p>
                  </div>

                  {/* MT5 Account Number Input */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      MT5 Account Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 38491820"
                      value={mt5InputAccount}
                      onChange={(e) => setMt5InputAccount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-slate-800 dark:text-slate-100 outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Min $500 Balance Confirmation */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasConfirmedBalance}
                      onChange={(e) => setHasConfirmedBalance(e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[12px] text-slate-600 dark:text-slate-400">
                      I confirm this MT5 account has a minimum balance of $500 USD for proper algorithmic risk management.
                    </span>
                  </label>

                  {/* Modal Footer Buttons (Image 2 style) */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsConnectModalOpen(false)}
                      className="bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/10 px-4 py-2 rounded-full font-medium text-[13.5px] shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!hasConfirmedBalance}
                      className="bg-[#111] dark:bg-white text-white dark:text-[#111] hover:bg-black dark:hover:bg-slate-100 px-5 py-2 rounded-full font-medium text-[13.5px] shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      Save & Link MT5
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── MODAL 2: ACTIVATE LICENSE KEY ─────────────────────────────── */}
        <AnimatePresence>
          {isLicenseModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#161616] border border-slate-200/90 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-[16px]">
                        EA License Key & Activation
                      </h3>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">
                        Institutional Unlimited 3-Year Pass (0% Profit Share)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('modalClose');
                      setIsLicenseModalOpen(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="pt-4 space-y-4">
                  {/* License Key Box */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Your Hardware-Bound MT5 Key
                    </label>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-xl p-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-[14px]">
                        {licenseKey}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedKey ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* EA Binary Download */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[13.5px] text-slate-900 dark:text-white block">
                        FiAlgo_V1_MT5.ex5
                      </span>
                      <span className="text-[11.5px] text-slate-500">
                        MetaTrader 5 Expert Advisor Binary · V1.4 (Build 4280)
                      </span>
                    </div>
                    <a
                      href="/downloads/FiAlgo_V1_MT5.ex5"
                      download
                      onClick={(e) => {
                        e.preventDefault();
                        toast.success("Downloading FiAlgo_V1_MT5.ex5 Expert Advisor binary!");
                      }}
                      className="bg-white dark:bg-[#2A2A2A] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/10 px-3.5 py-1.5 rounded-full font-semibold text-[12.5px] shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} />
                      Download EA
                    </a>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2 text-[12px] text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-neutral-900/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">How to install in 30 seconds:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Copy <code className="bg-slate-200 dark:bg-neutral-800 px-1 py-0.5 rounded">FiAlgo_V1_MT5.ex5</code> into your MT5 <code className="bg-slate-200 dark:bg-neutral-800 px-1 py-0.5 rounded">MQL5/Experts</code> folder.</li>
                      <li>In MT5 Tools → Options → Expert Advisors, tick <strong>Allow Algo Trading</strong> and <strong>Allow WebRequest</strong>.</li>
                      <li>Drag the EA onto your <strong>XAUUSD M5</strong> chart and paste your license key.</li>
                    </ol>
                  </div>

                  {/* Footer Button (Image 2 style) */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsLicenseModalOpen(false)}
                      className="bg-[#111] dark:bg-white text-white dark:text-[#111] hover:bg-black dark:hover:bg-slate-100 px-6 py-2 rounded-full font-medium text-[13.5px] shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
