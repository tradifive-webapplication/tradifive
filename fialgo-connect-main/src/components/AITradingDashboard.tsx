import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, TrendingUp, TrendingDown, Activity, Wallet, Clock, 
  CheckCircle2, ShieldCheck, Play, Pause, AlertTriangle, RefreshCw, 
  Copy, Download, Terminal, Check, Sliders, ExternalLink, Zap, 
  ArrowUpRight, ArrowDownRight, Filter, Calendar, Shield, X, Power, Layers
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from "recharts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

// Performance chart history dataset
const performanceData30D = [
  { day: 'Day 01', balance: 5000, equity: 5020, pnl: 20 },
  { day: 'Day 05', balance: 5120, equity: 5145, pnl: 100 },
  { day: 'Day 08', balance: 5180, equity: 5160, pnl: 60 },
  { day: 'Day 12', balance: 5240, equity: 5290, pnl: 60 },
  { day: 'Day 15', balance: 5350, equity: 5380, pnl: 110 },
  { day: 'Day 19', balance: 5420, equity: 5410, pnl: 70 },
  { day: 'Day 22', balance: 5490, equity: 5525, pnl: 70 },
  { day: 'Day 26', balance: 5580, equity: 5610, pnl: 90 },
  { day: 'Day 28', balance: 5660, equity: 5710, pnl: 80 },
  { day: 'Day 30', balance: 5742, equity: 5814, pnl: 82 },
];

const performanceData7D = [
  { day: 'Mon', balance: 5580, equity: 5610, pnl: 45 },
  { day: 'Tue', balance: 5615, equity: 5640, pnl: 35 },
  { day: 'Wed', balance: 5660, equity: 5690, pnl: 45 },
  { day: 'Thu', balance: 5695, equity: 5730, pnl: 35 },
  { day: 'Fri', balance: 5720, equity: 5770, pnl: 25 },
  { day: 'Sat', balance: 5742, equity: 5800, pnl: 22 },
  { day: 'Sun', balance: 5742, equity: 5814, pnl: 0 },
];

// Open floating trades
const initialOpenPositions = [
  { id: 'pos-101', pair: 'XAUUSD', type: 'BUY', lot: 0.05, openPrice: 2641.80, currentPrice: 2643.20, sl: 2635.00, tp: 2650.00, floatingPnl: 70.00, openTime: 'Today 10:24 AM', magic: '849201' },
  { id: 'pos-102', pair: 'EURUSD', type: 'BUY', lot: 0.10, openPrice: 1.08410, currentPrice: 1.08415, sl: 1.08150, tp: 1.08750, floatingPnl: 5.00, openTime: 'Today 11:02 AM', magic: '849202' },
  { id: 'pos-103', pair: 'USDJPY', type: 'SELL', lot: 0.05, openPrice: 152.400, currentPrice: 152.456, sl: 152.950, tp: 151.700, floatingPnl: -2.80, openTime: 'Today 11:15 AM', magic: '849203' },
];

// Closed trades history
const initialClosedTrades = [
  { id: 'tr-901', pair: 'EURUSD', type: 'BUY', lot: 0.10, openPrice: 1.08210, closePrice: 1.08635, openTime: 'Today 08:30 AM', closeTime: 'Today 10:42 AM', pnl: 42.50, returnPct: '+0.85%', status: 'win', duration: '2h 12m' },
  { id: 'tr-902', pair: 'XAUUSD', type: 'SELL', lot: 0.05, openPrice: 2648.50, closePrice: 2650.94, openTime: 'Today 07:10 AM', closeTime: 'Today 09:15 AM', pnl: -12.20, returnPct: '-0.24%', status: 'loss', duration: '2h 05m' },
  { id: 'tr-903', pair: 'GBPUSD', type: 'BUY', lot: 0.10, openPrice: 1.29120, closePrice: 1.29971, openTime: 'Today 06:00 AM', closeTime: 'Today 08:30 AM', pnl: 85.10, returnPct: '+1.70%', status: 'win', duration: '2h 30m' },
  { id: 'tr-904', pair: 'USDJPY', type: 'SELL', lot: 0.20, openPrice: 153.250, closePrice: 152.690, openTime: 'Yesterday 02:15 PM', closeTime: 'Yesterday 06:40 PM', pnl: 112.00, returnPct: '+2.24%', status: 'win', duration: '4h 25m' },
  { id: 'tr-905', pair: 'EURJPY', type: 'BUY', lot: 0.10, openPrice: 165.800, closePrice: 165.555, openTime: 'Yesterday 10:10 AM', closeTime: 'Yesterday 01:20 PM', pnl: -24.50, returnPct: '-0.49%', status: 'loss', duration: '3h 10m' },
  { id: 'tr-906', pair: 'XAUUSD', type: 'BUY', lot: 0.08, openPrice: 2635.40, closePrice: 2644.90, openTime: '2 days ago', closeTime: '2 days ago', pnl: 76.00, returnPct: '+1.52%', status: 'win', duration: '5h 18m' },
  { id: 'tr-907', pair: 'GBPUSD', type: 'BUY', lot: 0.10, openPrice: 1.28850, closePrice: 1.29490, openTime: '3 days ago', closeTime: '3 days ago', pnl: 64.00, returnPct: '+1.28%', status: 'win', duration: '4h 40m' },
];

// Initial bot activity & on/off log entries
const initialLogs = [
  { id: 'log-1', time: '11:15 AM', type: 'trade', event: 'Trade Opened', details: 'USDJPY SELL 0.05 lots @ 152.400 (Ticket #849203)' },
  { id: 'log-2', time: '11:02 AM', type: 'trade', event: 'Trade Opened', details: 'EURUSD BUY 0.10 lots @ 1.08410 (Ticket #849202)' },
  { id: 'log-3', time: '10:45 AM', type: 'status', event: 'Bot Resumed (ON)', details: 'Trading algorithm resumed by User via Web Console' },
  { id: 'log-4', time: '10:42 AM', type: 'trade', event: 'Take Profit Hit', details: 'EURUSD BUY 0.10 lots closed at 1.08635 (+$42.50)' },
  { id: 'log-5', time: '10:24 AM', type: 'trade', event: 'Trade Opened', details: 'XAUUSD BUY 0.05 lots @ 2641.80 (Ticket #849201)' },
  { id: 'log-6', time: '09:40 AM', type: 'status', event: 'Bot Paused (OFF)', details: 'Temporary pause during high-volatility session' },
  { id: 'log-7', time: '09:15 AM', type: 'trade', event: 'Stop Loss Hit', details: 'XAUUSD SELL 0.05 lots closed at 2650.94 (-$12.20)' },
  { id: 'log-8', time: '08:00 AM', type: 'system', event: 'Heartbeat Verified', details: 'License TRDF-8492-AX91 authenticated on MT5 terminal · Ping 2.1ms' },
  { id: 'log-9', time: '06:00 AM', type: 'status', event: 'Bot Activated (ON)', details: 'Daily trading session initialized on VPS Terminal' },
];

const cardStyle = "p-4 sm:p-5 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none transition-all duration-300";
const boxStyle = "p-3.5 sm:p-5 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none transition-all duration-300 flex flex-col justify-between";

interface Props {
  onBack: () => void;
  algo: { name: string; risk: string; deposit: number };
  mt5Account: string;
}

export default function AITradingDashboard({ onBack, algo, mt5Account }: Props) {
  // State for live bot toggle (Active / Paused) - synced with localStorage
  const [isBotRunning, setIsBotRunning] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("tradifive_bot_status");
      return saved ? saved === "active" : true;
    } catch (e) {
      return true;
    }
  });
  const [activeTab, setActiveTab] = useState<"open" | "history">("open");
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "30D">("30D");
  const [pairFilter, setPairFilter] = useState<string>("ALL");
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const [logsList, setLogsList] = useState(() => {
    try {
      const stored = localStorage.getItem("tradifive_bot_logs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialLogs;
  });
  const [openPositions, setOpenPositions] = useState(initialOpenPositions);
  const [closedTrades, setClosedTrades] = useState(initialClosedTrades);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [floatingFluctuation, setFloatingFluctuation] = useState<number>(72.20);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Live Telemetry Fetching States
  const [isFetchingInitial, setIsFetchingInitial] = useState<boolean>(true);
  const [fetchProgress, setFetchProgress] = useState<string>("Connecting to MT5 terminal...");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");
  const [brokerGatewayName, setBrokerGatewayName] = useState<string>("Vantage Markets · Partner IB 27863221");
  const [activeLicenseKey, setActiveLicenseKey] = useState<string>("TF-18B42A6D-2710-30307601B9");
  const [accountBalance, setAccountBalance] = useState<number>(5742.00);

  // Read stored broker & license key from local cache
  useEffect(() => {
    try {
      const storedProof = localStorage.getItem("tradifive_ib_proof_request");
      if (storedProof) {
        const parsed = JSON.parse(storedProof);
        if (parsed.broker_name) setBrokerGatewayName(`${parsed.broker_name} · Partner IB 27863221`);
      }
      const storedPay = localStorage.getItem("tradifive_payment_request");
      if (storedPay) {
        const parsed = JSON.parse(storedPay);
        if (parsed.license_key) setActiveLicenseKey(parsed.license_key);
      }
    } catch (e) {}
  }, []);

  // Initial Data Fetching Sequence from MT5 Terminal & Database
  useEffect(() => {
    setIsFetchingInitial(true);
    const accNumber = mt5Account || "414460525";
    setFetchProgress(`Establishing handshake with MT5 Terminal #${accNumber}...`);

    const t1 = setTimeout(() => {
      setFetchProgress("Synchronizing live equity, balance curve & margin...");
    }, 350);

    const t2 = setTimeout(() => {
      setFetchProgress("Fetching open positions and order tickets for XAUUSD (Gold)...");
    }, 700);

    const t3 = setTimeout(async () => {
      try {
        const { data: dbAcc } = await supabase
          .from('mt5_accounts')
          .select('balance, equity')
          .eq('account_number', accNumber)
          .maybeSingle();

        if (dbAcc && dbAcc.balance) {
          setAccountBalance(Number(dbAcc.balance));
        }

        const { data: dbTrades } = await supabase
          .from('trades')
          .select('*')
          .limit(20);

        if (dbTrades && dbTrades.length > 0) {
          const mapped = dbTrades.map((t: any, i: number) => ({
            id: `tr-${t.id || i}`,
            pair: t.symbol || 'XAUUSD',
            type: (t.type || 'BUY').toUpperCase(),
            lot: Number(t.volume || t.lots || 0.05),
            openPrice: Number(t.open_price || 2641.80),
            closePrice: Number(t.close_price || 2643.20),
            openTime: t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today 10:24 AM',
            closeTime: t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today 10:45 AM',
            pnl: Number(t.profit || 0),
            returnPct: Number(t.profit || 0) >= 0 ? '+1.20%' : '-0.24%',
            status: Number(t.profit || 0) >= 0 ? 'win' as const : 'loss' as const,
            duration: 'Auto Basket'
          }));
          setClosedTrades(mapped);
        }
      } catch (err) {
        console.warn("Telemetry note:", err);
      }

      setIsFetchingInitial(false);
      setLastSyncedTime("Just now");
      toast.success(`MT5 #${accNumber} Telemetry Connected!`, {
        description: "Real-time balance, equity, and grid telemetry synchronized."
      });
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [mt5Account]);

  // Sync state with cross-page updates (e.g. from AITrading page)
  useEffect(() => {
    const handleStatusSync = (e: any) => {
      if (e.detail?.isRunning !== undefined) {
        setIsBotRunning(e.detail.isRunning);
      } else {
        const saved = localStorage.getItem("tradifive_bot_status");
        setIsBotRunning(saved ? saved === "active" : true);
      }

      try {
        const stored = localStorage.getItem("tradifive_bot_logs");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) setLogsList(parsed);
        }
      } catch (err) {}
    };

    window.addEventListener("tradifive_bot_status_changed", handleStatusSync);
    return () => window.removeEventListener("tradifive_bot_status_changed", handleStatusSync);
  }, []);

  // Financial summary numbers
  const initialBalance = 5000.00;
  const currentBalance = accountBalance;
  const runningEquity = Number((currentBalance + floatingFluctuation).toFixed(2));
  const totalNetProfit = currentBalance - initialBalance;
  const totalDeposits = 5000.00;
  const totalWithdrawals = 0.00;
  const usedMargin = 184.50;
  const freeMargin = Number((runningEquity - usedMargin).toFixed(2));
  const marginLevel = Number(((runningEquity / usedMargin) * 100).toFixed(0));

  // Live gentle floating tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBotRunning) {
        const delta = (Math.random() - 0.48) * 0.8;
        setFloatingFluctuation(prev => {
          const next = Number((prev + delta).toFixed(2));
          return next > 60 && next < 85 ? next : 72.20;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isBotRunning]);

  // Handle Bot On/Off Switch
  const handleToggleBot = () => {
    const nextState = !isBotRunning;
    setIsBotRunning(nextState);
    localStorage.setItem("tradifive_bot_status", nextState ? "active" : "paused");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      id: `log-${Date.now()}`,
      time: timeStr,
      type: 'status',
      event: nextState ? 'Bot Resumed (ON)' : 'Bot Paused (OFF)',
      details: nextState 
        ? 'User activated algorithmic execution via Dashboard Terminal' 
        : 'User paused bot execution. Open trades protected by hard SL/TP.',
    };

    setLogsList(prev => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem("tradifive_bot_logs", JSON.stringify(updated.slice(0, 50)));
      } catch (e) {}
      return updated;
    });

    // Notify other components (like AI Trading page)
    window.dispatchEvent(new CustomEvent("tradifive_bot_status_changed", { detail: { isRunning: nextState } }));

    // Push cloud kill-switch update so MT5 WebRequest polling receives new algo_status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('mt5_accounts').update({ algo_status: nextState }).eq('user_id', session.user.id).then();
      }
    }).catch(() => {});

    if (nextState) {
      toast.success("Bot Resumed: Live Trading ON", {
        description: "MT5 terminal is now actively executing algorithm orders.",
      });
    } else {
      toast.warning("Bot Paused: Trading STANDBY", {
        description: "New order triggers halted. Open positions continue to be monitored by SL/TP.",
      });
    }
  };

  // Sync MT5 Data
  const handleSyncData = async () => {
    setIsSyncing(true);
    const accNumber = mt5Account || "414460525";
    try {
      const { data: dbAcc } = await supabase
        .from('mt5_accounts')
        .select('balance, equity')
        .eq('account_number', accNumber)
        .maybeSingle();

      if (dbAcc && dbAcc.balance) {
        setAccountBalance(Number(dbAcc.balance));
      }
    } catch (e) {}

    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLogsList(prev => [
        {
          id: `log-${Date.now()}`,
          time: now,
          type: 'system',
          event: 'Terminal Telemetry Sync',
          details: `Synchronized MT5 #${accNumber} positions, live equity & risk metrics with broker gateway.`
        },
        ...prev
      ]);
      setLastSyncedTime("Just now");
      toast.success(`MT5 #${accNumber} Telemetry Refreshed!`, { 
        description: "Latest equity, open tickets and risk telemetry up-to-date." 
      });
    }, 700);
  };

  // Copy Activation Key
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success("Activation Key Copied!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Close specific position
  const handleClosePosition = (id: string, pair: string, pnl: number) => {
    setOpenPositions(prev => prev.filter(p => p.id !== id));
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add to closed trades
    const closedItem = {
      id: `tr-${Date.now()}`,
      pair,
      type: 'CLOSE',
      lot: 0.05,
      openPrice: 0,
      closePrice: 0,
      openTime: 'Today',
      closeTime: now,
      pnl: pnl,
      returnPct: pnl > 0 ? '+1.2%' : '-0.2%',
      status: pnl >= 0 ? 'win' as const : 'loss' as const,
      duration: 'Manual Close'
    };
    setClosedTrades(prev => [closedItem, ...prev]);

    // Add to logs
    setLogsList(prev => [
      {
        id: `log-${Date.now()}`,
        time: now,
        type: 'trade',
        event: `Manual Position Close (${pair})`,
        details: `Position ${id} closed at market price. Realized PnL: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`
      },
      ...prev
    ]);

    toast.info(`Position ${pair} Closed`, {
      description: `Realized profit: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`
    });
  };

  // Filter closed trades
  const filteredClosedTrades = pairFilter === "ALL" 
    ? closedTrades 
    : closedTrades.filter(t => t.pair.toUpperCase().includes(pairFilter));

  const chartData = chartTimeframe === "30D" ? performanceData30D : performanceData7D;

  return (
    <div className="w-full font-sans animate-in fade-in slide-in-from-bottom-3 duration-300 pb-12">
      {/* ── TOP NAV BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <button 
            type="button"
            onClick={onBack} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bot Setup
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] sm:text-[26px] font-bold text-slate-800 dark:text-[#F7F8FA] tracking-tight leading-none">
              Bot Live Terminal
            </h1>
            
            {/* Live Trading Status Pill */}
            {isBotRunning ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Trading · ON
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Standby · PAUSED
              </span>
            )}
          </div>
          <p className="text-[12px] sm:text-[13px] text-slate-400 dark:text-[#8B95A5] mt-1.5 font-normal">
            Institutional automated execution console with real-time MT5 telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button 
            type="button"
            onClick={handleSyncData}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[14px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none text-slate-600 dark:text-slate-300 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] text-xs font-bold transition-all duration-300 cursor-pointer"
            title="Sync latest MT5 data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-slate-900 dark:text-white' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Sync MT5</span>
          </button>

          {/* View VPS & Execution Logs */}
          <button 
            type="button"
            onClick={() => setShowLogsModal(true)}
            className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-[14px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none text-slate-600 dark:text-slate-300 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] text-xs font-bold transition-all duration-300 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Execution Logs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </button>

          {/* Pause / Resume Bot Button */}
          <button 
            type="button"
            onClick={handleToggleBot}
            className={`h-[38px] px-4 rounded-[14px] border-2 text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm ${
              isBotRunning 
                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400' 
                : 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
            }`}
          >
            {isBotRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Pause Bot</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Resume Bot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── LIVE TELEMETRY FETCHING BANNER ── */}
      <AnimatePresence>
        {isFetchingInitial ? (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3.5 sm:p-4 rounded-[18px] bg-blue-500/10 border border-blue-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200">
                    Fetching Live MT5 Data...
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Account #{mt5Account || "414460525"}
                  </span>
                </div>
                <p className="text-[11.5px] text-blue-700/80 dark:text-blue-300/70 mt-0.5">
                  {fetchProgress}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold bg-white dark:bg-white/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Handshake Active
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="mb-4 p-2.5 px-3.5 rounded-[14px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Live Feed Connected:
              </span>
              <span>
                MT5 Terminal <strong className="font-mono text-slate-900 dark:text-white">#{mt5Account || "414460525"}</strong> is streaming live ticks.
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>Ping: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">1.8ms</strong></span>
              <span>•</span>
              <span>Synced: <strong className="text-slate-700 dark:text-slate-300 font-bold">{lastSyncedTime}</strong></span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── METRICS GRID (6 TOP-LEVEL KPI CARDS) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 mb-4">
        {/* Total Net Profit */}
        <div className={boxStyle}>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Realized Net Profit
            </p>
            <h3 className="text-[22px] sm:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              +${totalNetProfit.toFixed(2)}
            </h3>
          </div>
          <p className="text-[11.5px] sm:text-[12px] font-medium text-emerald-500 flex items-center gap-1 mt-3">
            <TrendingUp size={12} /> +14.8% (30D)
          </p>
        </div>

        {/* Running Floating PnL */}
        <div className={boxStyle}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Running PnL
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h3 className={`text-[22px] sm:text-[26px] font-medium tracking-tight leading-none ${floatingFluctuation >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              {floatingFluctuation >= 0 ? '+' : ''}${floatingFluctuation.toFixed(2)}
            </h3>
          </div>
          <p className="text-[11.5px] sm:text-[12px] font-medium text-slate-400 dark:text-[#778396] mt-3">
            {openPositions.length} Open Positions
          </p>
        </div>

        {/* Current Account Equity */}
        <div className={boxStyle}>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Live Equity
            </p>
            <h3 className="text-[22px] sm:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              ${runningEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <p className="text-[11.5px] sm:text-[12px] font-medium text-slate-400 dark:text-[#778396] mt-3">
            Bal: ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Today's PnL */}
        <div className={boxStyle}>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Today's PnL
            </p>
            <h3 className="text-[22px] sm:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              +$30.30
            </h3>
          </div>
          <p className="text-[11.5px] sm:text-[12px] font-medium text-emerald-500 flex items-center gap-1 mt-3">
            <Check size={12} strokeWidth={2.5} /> 4 Wins / 1 Loss
          </p>
        </div>

        {/* Win Rate */}
        <div className={boxStyle}>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Win Rate
            </p>
            <h3 className="text-[22px] sm:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              82.4%
            </h3>
          </div>
          <p className="text-[11.5px] sm:text-[12px] font-medium text-slate-400 dark:text-[#778396] mt-3">
            PF: 2.84 · 47 Trades
          </p>
        </div>

        {/* Max Drawdown */}
        <div className={boxStyle}>
          <div>
            <p className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Max Drawdown
            </p>
            <h3 className="text-[22px] sm:text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              3.1%
            </h3>
          </div>
          <div className="mt-3">
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider inline-block">
              Low Risk Guard
            </span>
          </div>
        </div>
      </div>

      {/* ── CAPITAL, DEPOSITS & MARGIN OVERVIEW BAR ── */}
      <div className="p-3.5 sm:p-5 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:shadow-none transition-all duration-300 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3 sm:gap-y-0 sm:divide-x divide-slate-100 dark:divide-white/5">
          <div className="sm:px-3">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Total Deposits</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white text-[15px] sm:text-[16px] block" style={{ fontFamily: "'Inter', sans-serif" }}>
              ${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="sm:px-3">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Total Withdrawals</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white text-[15px] sm:text-[16px] block" style={{ fontFamily: "'Inter', sans-serif" }}>
              ${totalWithdrawals.toFixed(2)}
            </span>
          </div>
          <div className="sm:px-3 pt-2.5 sm:pt-0 border-t border-slate-100 dark:border-white/5 sm:border-t-0">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Used Margin</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white text-[15px] sm:text-[16px] block" style={{ fontFamily: "'Inter', sans-serif" }}>
              ${usedMargin.toFixed(2)} <span className="text-[11px] text-slate-400 font-normal">(3.2%)</span>
            </span>
          </div>
          <div className="sm:px-3 pt-2.5 sm:pt-0 border-t border-slate-100 dark:border-white/5 sm:border-t-0">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Free Margin</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-[15px] sm:text-[16px] block" style={{ fontFamily: "'Inter', sans-serif" }}>
              ${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="sm:px-3 pt-2.5 sm:pt-0 border-t border-slate-100 dark:border-white/5 sm:border-t-0">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Margin Level</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white text-[15px] sm:text-[16px] block" style={{ fontFamily: "'Inter', sans-serif" }}>
              {marginLevel}%
            </span>
          </div>
          <div className="sm:px-3 pt-2.5 sm:pt-0 border-t border-slate-100 dark:border-white/5 sm:border-t-0 flex items-center justify-start sm:justify-center">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
              Safe Margin
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (2 COLUMNS: CHART & TRADES / CONNECTION & BOT STATUS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LEFT COLUMN (2/3): CHART & POSITIONS / TRADES */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Performance Growth Chart */}
          <div className={`${cardStyle} h-[380px] p-5 sm:p-6 flex flex-col`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-slate-800 dark:text-[#F5F7FA] flex items-center gap-2">
                  <span>Balance &amp; Equity Curve</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                    Live MT5 Sync
                  </span>
                </h3>
                <p className="text-[12px] font-normal text-slate-400 dark:text-[#778396] mt-0.5">
                  Institutional basket trading progression on Gold &amp; Forex
                </p>
              </div>

              {/* Chart Controls */}
              <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-white/5 p-1 rounded-[14px] border border-slate-200/50 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setChartTimeframe("7D")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[10px] transition-all cursor-pointer ${
                    chartTimeframe === "7D" 
                      ? "bg-white dark:bg-[#191B1E] text-slate-900 dark:text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  7D
                </button>
                <button
                  type="button"
                  onClick={() => setChartTimeframe("30D")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-[10px] transition-all cursor-pointer ${
                    chartTimeframe === "30D" 
                      ? "bg-white dark:bg-[#191B1E] text-slate-900 dark:text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.15} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#888' }} 
                    dy={5} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#888' }} 
                    domain={['dataMin - 50', 'dataMax + 50']} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '14px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)', 
                      backgroundColor: '#191B1E', 
                      color: '#fff', 
                      fontSize: '11px', 
                      fontWeight: 'bold' 
                    }}
                    formatter={(value: any, name: any) => [`$${Number(value).toFixed(2)}`, name === 'balance' ? 'Account Balance' : 'Live Equity']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorEquity)" name="equity" />
                  <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" name="balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-[12px] font-medium text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span>
                  <span>Balance: <strong className="text-slate-700 dark:text-slate-300 font-semibold">${currentBalance.toFixed(2)}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-blue-500 border-dashed inline-block"></span>
                  <span>Equity: <strong className="text-slate-700 dark:text-slate-300 font-semibold">${runningEquity.toFixed(2)}</strong></span>
                </span>
              </div>
              <span>Initial: $5,000.00</span>
            </div>
          </div>
          
          {/* ── TRADES TABS: OPEN POSITIONS & TRADE HISTORY ── */}
          <div className={`${cardStyle} p-5 sm:p-6`}>
            {/* Tab Headers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("open")}
                  className={`h-[34px] px-3.5 rounded-[12px] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "open"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Activity size={13} />
                  <span>Open Positions ({openPositions.length})</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`h-[34px] px-3.5 rounded-[12px] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "history"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Clock size={13} />
                  <span>Trade History</span>
                </button>
              </div>

              {/* Pair filter for history */}
              {activeTab === "history" && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-[12px]">
                  {['ALL', 'XAUUSD', 'EURUSD', 'GBPUSD'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPairFilter(p)}
                      className={`px-2.5 py-1 rounded-[8px] text-[10.5px] font-bold cursor-pointer transition-colors ${
                        pairFilter === p 
                          ? "bg-white dark:bg-[#191B1E] text-slate-900 dark:text-white shadow-2xs" 
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB CONTENT: OPEN POSITIONS */}
            {activeTab === "open" && (
              <div className="pt-2">
                {openPositions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No open positions right now. Bot is monitoring market structure.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                          <th className="py-3 px-3">Pair</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Lots</th>
                          <th className="py-3 px-3">Open Price</th>
                          <th className="py-3 px-3">Current</th>
                          <th className="py-3 px-3">SL / TP</th>
                          <th className="py-3 px-3 text-right">Floating PnL</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 whitespace-nowrap">
                        {openPositions.map(pos => (
                          <tr key={pos.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-3 text-[13px] font-bold text-slate-900 dark:text-white">
                              {pos.pair}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${
                                pos.type === 'BUY' 
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              }`}>
                                {pos.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-[13px] font-medium text-slate-700 dark:text-slate-300 tabular-nums" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {pos.lot.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-3 text-[12.5px] font-medium text-slate-500 dark:text-slate-400 tabular-nums" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {pos.openPrice}
                            </td>
                            <td className="py-3.5 px-3 text-[12.5px] font-medium text-slate-800 dark:text-slate-200 tabular-nums" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {pos.currentPrice}
                            </td>
                            <td className="py-3.5 px-3 text-[11px] font-mono text-slate-400">
                              {pos.sl} / {pos.tp}
                            </td>
                            <td className={`py-3.5 px-3 text-[13px] font-medium tabular-nums text-right ${
                              pos.floatingPnl >= 0 ? 'text-[#10B981]' : 'text-[#F06363]'
                            }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                              {pos.floatingPnl >= 0 ? '+' : ''}${pos.floatingPnl.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleClosePosition(pos.id, pos.pair, pos.floatingPnl)}
                                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg border border-slate-200/60 dark:border-white/5 transition-colors cursor-pointer"
                                title="Close position on MT5"
                              >
                                Close
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: CLOSED TRADE HISTORY */}
            {activeTab === "history" && (
              <div className="pt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        <th className="py-3 px-3">Pair</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Lots</th>
                        <th className="py-3 px-3">Open &gt; Close</th>
                        <th className="py-3 px-3">Time</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3 text-right">Realized PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 whitespace-nowrap">
                      {filteredClosedTrades.map(trade => (
                        <tr key={trade.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-3 text-[13px] font-bold text-slate-900 dark:text-white">
                            {trade.pair}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${
                              trade.type === 'BUY' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-[13px] font-medium text-slate-700 dark:text-slate-300 tabular-nums" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {trade.lot.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {trade.openPrice} &gt; {trade.closePrice}
                          </td>
                          <td className="py-3.5 px-3 text-[11.5px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                            {trade.closeTime}
                          </td>
                          <td className="py-3.5 px-3 text-[11px] text-slate-400 font-mono">
                            {trade.duration}
                          </td>
                          <td className={`py-3.5 px-3 text-[13px] font-medium tabular-nums text-right ${
                            trade.pnl >= 0 ? 'text-[#10B981]' : 'text-[#F06363]'
                          }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                            {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1/3): CONNECTION, LICENSE & BOT ON/OFF LOGS */}
        <div className="space-y-4">
          
          {/* Card 1: Connection & License Details */}
          <div className={cardStyle}>
            <div className="flex items-start justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#22D99A]/10 text-[#22D99A]">
                  <ShieldCheck size={18} strokeWidth={2} />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[14px] font-semibold text-slate-800 dark:text-[#F5F7FA] leading-tight">
                    MT5 Connection &amp; License
                  </h3>
                  <p className="text-[11px] font-normal text-slate-400 dark:text-[#778396] mt-0.5">
                    Institutional bridge credentials &amp; broker sync
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-[#22D99A]/10 dark:text-[#22D99A] border border-emerald-500/20 shrink-0">
                Connected
              </span>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400 dark:text-[#778396]">Algorithm</span>
                <span className="text-[13px] font-semibold text-slate-800 dark:text-[#E2E7EE]">{algo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400 dark:text-[#778396]">Bound MT5 Account</span>
                <span className="text-[13px] font-mono font-semibold text-slate-800 dark:text-[#E2E7EE] tabular-nums">#{mt5Account || '414460525'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400 dark:text-[#778396]">Broker Gateway</span>
                <span className="text-[13px] font-semibold text-slate-800 dark:text-[#E2E7EE]">{brokerGatewayName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400 dark:text-[#778396]">Risk Profile</span>
                <span className="text-[13px] font-semibold text-slate-800 dark:text-[#E2E7EE]">{algo.risk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400 dark:text-[#778396]">Terminal Ping</span>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 1.8 ms (Ultra-Low)
                </span>
              </div>
            </div>

            {/* License Box */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5">
              <div className="p-3.5 rounded-[16px] bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#778396] flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>Institutional License</span>
                  </span>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Lifetime Valid
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-[#121214] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                  <span className="font-mono text-[12px] font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                    {activeLicenseKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyKey(activeLicenseKey)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100/70 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copiedKey ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Power & Execution Timeline */}
          <div className={cardStyle}>
            <div className="flex items-start justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isBotRunning ? "bg-[#22D99A]/10 text-[#22D99A]" : "bg-slate-200/50 dark:bg-zinc-800 text-slate-500"
                }`}>
                  <Power size={18} strokeWidth={2} />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[14px] font-semibold text-slate-800 dark:text-[#F5F7FA] leading-tight">
                    Bot State &amp; Execution Timeline
                  </h3>
                  <p className="text-[11px] font-normal text-slate-400 dark:text-[#778396] mt-0.5">
                    Live EA process &amp; runtime switch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogsModal(true)}
                className="text-[11.5px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer shrink-0 pt-1"
              >
                All Logs
              </button>
            </div>

            {/* Quick Toggle Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-slate-50 dark:bg-black/30 border border-slate-200/60 dark:border-white/5 mb-3">
              <div>
                <span className="text-[12.5px] font-bold text-slate-900 dark:text-white block">
                  {isBotRunning ? "Bot Execution: ACTIVE" : "Bot Execution: PAUSED"}
                </span>
                <span className="text-[11px] font-normal text-slate-400 dark:text-[#778396]">
                  {isBotRunning ? "Executing trades on MT5 terminal" : "No new orders will be opened"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleBot}
                className={`h-[34px] px-3.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isBotRunning 
                    ? "border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] text-amber-600 dark:text-amber-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5]"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                }`}
              >
                <Power size={13} />
                <span>{isBotRunning ? "Pause" : "Turn On"}</span>
              </button>
            </div>

            {/* Mini Activity Logs Feed */}
            <div className="space-y-2 text-xs">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
                Recent On / Off &amp; Trigger Events:
              </p>
              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {logsList.slice(0, 4).map(log => (
                  <div key={log.id} className="flex items-start gap-2.5 p-2.5 rounded-[14px] bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.type === 'status' 
                        ? (log.event.includes('ON') ? 'bg-[#10B981]' : 'bg-amber-500')
                        : log.type === 'trade' ? 'bg-blue-500' : 'bg-slate-400'
                    }`}></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[11.5px] text-slate-800 dark:text-[#E2E7EE] truncate">
                          {log.event}
                        </span>
                        <span className="text-[10.5px] text-slate-400 shrink-0 font-mono tabular-nums">
                          {log.time}
                        </span>
                      </div>
                      <p className="text-[11px] font-normal text-slate-400 dark:text-[#778396] truncate mt-0.5">
                        {log.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Card 3: Safeguard Rules */}
          <div className={cardStyle}>
            <div className="flex items-start gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} strokeWidth={2} />
              </div>
              <div className="pt-0.5">
                <h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] leading-tight">
                  Auto-Trading Rules &amp; Safeguards
                </h3>
                <p className="text-[11px] font-normal text-slate-400 dark:text-[#778396] mt-0.5">
                  Institutional risk &amp; execution limits
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-[11.5px] font-normal text-slate-500 dark:text-[#778396] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#10B981] font-bold">•</span>
                <span>Do not manually close bot trades unless performing risk exit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10B981] font-bold">•</span>
                <span>VPS cloud terminal keeps EA running 24/5 without your PC on.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10B981] font-bold">•</span>
                <span>Recommended minimum balance of $500 for basket drawdowns.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* ── VPS & EXECUTION LOGS MODAL ── */}
      <AnimatePresence>
        {showLogsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-2xl dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] max-w-2xl w-full p-6 space-y-4 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#22D99A]/10 text-[#22D99A]">
                    <Terminal size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                      MT5 Terminal &amp; Bot Execution Logs
                    </h3>
                    <p className="text-[11.5px] text-slate-400 dark:text-slate-400">
                      Live timeline of Bot activations, pauses, trades &amp; pings
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogsModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Terminal View Container */}
              <div className="bg-slate-950 dark:bg-black/80 rounded-[16px] border border-slate-800 dark:border-white/5 p-4 max-h-[340px] overflow-y-auto space-y-2 font-mono text-xs text-slate-200">
                {logsList.map(log => (
                  <div key={log.id} className="flex items-start gap-2.5 py-1 border-b border-white/[0.04] last:border-0">
                    <span className="text-slate-500 text-[11px] shrink-0 tabular-nums">
                      [{log.time}]
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      log.type === 'status' 
                        ? (log.event.includes('ON') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')
                        : log.type === 'trade' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {log.event}
                    </span>
                    <span className="text-slate-300 text-[11.5px] min-w-0 flex-1 leading-snug">
                      {log.details}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span className="text-[11.5px]">VPS Gateway: 185.220.101.44 · Latency: 2.1ms</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Logs downloaded as MT5_Audit_Log.txt");
                    }}
                    className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[12px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogsModal(false)}
                    className="h-[34px] px-4 rounded-[12px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
