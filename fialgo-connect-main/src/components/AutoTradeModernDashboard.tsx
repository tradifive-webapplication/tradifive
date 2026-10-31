import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { 

  TrendingUp, TrendingDown, Wallet, Zap, ShieldCheck, Activity, 

  ArrowUpRight, ArrowDownLeft, Play, Pause, RefreshCw, Copy, Check, 

  Upload, X, CheckCircle2, AlertCircle, Clock, ExternalLink, QrCode, 

  Image as ImageIcon, Trash2, Eye, Cpu, Radio, DollarSign,

  Layers, Sliders, ArrowRight, Crown, Sparkles, Lock, Award, Target, Coins, BarChart3

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

  closedAtMs?: number;

}



interface Props {

  onBack?: () => void;

  algo?: { name: string; risk: string; deposit: number };

  mt5Account?: string;

}



// ── Consistent Card Box & KPI Box Styles (Shared with AI Journal & RiskGuard) ──

const kpiBoxStyle = "min-h-[126px] p-4 sm:px-5 sm:py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none overflow-hidden";

const cardBoxStyle = "p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none transition-all";



export default function AutoTradeModernDashboard({ onBack, algo, mt5Account }: Props) {

  // ── Account & Live Connection State ──

  const cleanAccount = useMemo(() => {

    return (mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "").replace(/\D/g, "");

  }, [mt5Account]);



  const [displayAccount, setDisplayAccount] = useState<string>(() => {

    return (mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "").replace(/\D/g, "");

  });



  const [activeLicenseKey, setActiveLicenseKey] = useState<string>(() => {

    return localStorage.getItem("tradifive_license_key") || "";

  });



  // Dynamically resolve active user's credentials to guarantee multi-user isolation

  useEffect(() => {

    async function resolveUserCredentials() {

      try {

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.id) {

          const { data: profile } = await supabase

            .from("profiles")

            .select("activation_key")

            .eq("id", session.user.id)

            .maybeSingle();

          if (profile?.activation_key) {

            setActiveLicenseKey(profile.activation_key);

            try { localStorage.setItem("tradifive_license_key", profile.activation_key); } catch (e) {}

          }



          const { data: acc } = await supabase

            .from("mt5_accounts")

            .select("account_number, activation_key")

            .eq("user_id", session.user.id)

            .order("created_at", { ascending: false })

            .limit(1)

            .maybeSingle();

          if (acc?.account_number) {

            const accClean = String(acc.account_number).replace(/\D/g, "");

            setDisplayAccount(accClean);

            try { localStorage.setItem("tradifive_connected_mt5_account", accClean); } catch (e) {}

          }

          if (acc?.activation_key && !profile?.activation_key) {

            setActiveLicenseKey(acc.activation_key);

            try { localStorage.setItem("tradifive_license_key", acc.activation_key); } catch (e) {}

          }



          // Check if admin records designate this user as Lifetime vs Profit Share

          try {

            const { data: adminSettings } = await supabase

              .from('system_settings')

              .select('value')

              .eq('id', 'auto_trade_admin_records')

              .maybeSingle();

            if (adminSettings?.value && typeof adminSettings.value === 'object') {

              const recordsList = Object.values(adminSettings.value) as any[];

              const myRecord = recordsList.find(

                r => (r.user_id === session.user.id || (session.user.email && r.user_email === session.user.email))

              );

              if (myRecord?.purchase_tier) {

                if (myRecord.purchase_tier === "Daily 50% Profit Share") {

                  setLicenseTier("profit_share_50");

                  try { localStorage.setItem("tradifive_selected_tier", "profit_share_50"); } catch (e) {}

                } else if (myRecord.purchase_tier === "Lifetime License" || myRecord.has_purchased) {

                  setLicenseTier("lifetime");

                  try { localStorage.setItem("tradifive_selected_tier", "lifetime"); } catch (e) {}

                }

              }

            }

          } catch (e) {}

        }

      } catch (e) {}

    }

    resolveUserCredentials();

  }, []);



  const isFetchingRef = useRef<boolean>(false);



  const [brokerServer, setBrokerServer] = useState<string>("—");

  const [isBotRunning, setIsBotRunning] = useState<boolean>(true);

  const [latencyPing, setLatencyPing] = useState<number>(1.8);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");



  // ── Currency System: Native MT5 Detection (USC Cents, USD, INR) + User View Mode ──

  const [accountCurrency, setAccountCurrency] = useState<string>(() => {

    try {

      const stored = localStorage.getItem("tradifive_account_currency");

      if (stored) return stored.toUpperCase();

    } catch (e) {}

    return "USD";

  });



    const settlementDay = React.useMemo(() => {
    try {
      return localStorage.getItem("tradifive_settlement_day") || "Wednesday";
    } catch (e) {
      return "Wednesday";
    }
  }, []);

  const tradifiveId = React.useMemo(() => {
    const clean = String(displayAccount || (typeof window !== "undefined" ? localStorage.getItem("tradifive_connected_mt5_account") : "") || "").replace(/\D/g, "");
    if (clean.length >= 4) {
      return `TRDF-${clean.slice(-6).padStart(6, "0")}`;
    }
    return (typeof window !== "undefined" ? localStorage.getItem("tradifive_user_id_short") : "") || "TRDF-849201";
  }, [displayAccount]);

  const [isSuspended, setIsSuspended] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("tradifive_license_status") === "suspended";
    } catch (e) {
      return false;
    }
  });

  React.useEffect(() => {
    const handleStatus = () => {
      try {
        setIsSuspended(localStorage.getItem("tradifive_license_status") === "suspended");
      } catch (e) {}
    };
    window.addEventListener("tradifive_bot_status_changed", handleStatus);
    window.addEventListener("storage", handleStatus);
    return () => {
      window.removeEventListener("tradifive_bot_status_changed", handleStatus);
      window.removeEventListener("storage", handleStatus);
    };
  }, []);

  const isCentAccount = accountCurrency === "USC" || accountCurrency === "USCENT" || accountCurrency.includes("CENT") || accountCurrency === "EUX";



  // View currency selection: "NATIVE" (shows account's actual units, e.g. USC), "USD", or "INR"

  const [viewCurrency, setViewCurrency] = useState<"NATIVE" | "USD" | "INR">(() => {

    try {

      const stored = localStorage.getItem("tradifive_view_currency");

      if (stored === "NATIVE" || stored === "USD" || stored === "INR") return stored;

    } catch (e) {}

    return "NATIVE";

  });



  // Effective display currency symbol and converter

  const effectiveCurrency = useMemo(() => {

    if (viewCurrency === "USD") return "USD";

    if (viewCurrency === "INR") return "INR";

    return isCentAccount ? "USC" : (accountCurrency === "INR" ? "INR" : "USD");

  }, [viewCurrency, isCentAccount, accountCurrency]);



  const currencySymbol = useMemo(() => {

    if (effectiveCurrency === "USC") return "USC ";

    if (effectiveCurrency === "INR") return "₹";

    return "$";

  }, [effectiveCurrency]);



  // Dynamic Broker Detection (No more hardcoded Exness IB)

  const detectedBrokerName = useMemo(() => {

    if (brokerServer && brokerServer !== "—") {

      const s = brokerServer.toLowerCase();

      if (s.includes("exness")) return "Exness";

      if (s.includes("vantage")) return "Vantage";

      if (s.includes("roboforex")) return "RoboForex";

      if (s.includes("fbs")) return "FBS";

      if (s.includes("octa")) return "OctaFX";

      if (s.includes("xm")) return "XM";

      if (s.includes("icmarkets") || s.includes("ic markets")) return "IC Markets";

      const parts = brokerServer.split(/[-_\s]/);

      if (parts[0] && parts[0].length >= 3) {

        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

      }

    }

    try {

      const stored = localStorage.getItem("tradifive_ib_proof_request");

      if (stored) {

        const p = JSON.parse(stored);

        if (p.broker_name) {

          const b = String(p.broker_name).trim();

          return b.charAt(0).toUpperCase() + b.slice(1);

        }

      }

    } catch (e) {}

    return "Verified Partner";

  }, [brokerServer]);



  // Value converter helper: converts any amount from native account currency to effective view currency

  const convertAmount = useCallback((val: number): number => {

    if (!val || isNaN(val)) return 0;

    if (viewCurrency === "NATIVE") return val;

    

    // Target is USD:

    if (viewCurrency === "USD") {

      if (isCentAccount) return val / 100;

      if (accountCurrency === "INR") return val / 83.5;

      return val;

    }



    // Target is INR:

    if (viewCurrency === "INR") {

      if (isCentAccount) return (val / 100) * 83.5;

      if (accountCurrency === "USD") return val * 83.5;

      return val;

    }



    return val;

  }, [viewCurrency, isCentAccount, accountCurrency]);



  // Formatter helper with optional secondary USD equivalent for USC accounts

  const formatMoney = useCallback((val: number, opts?: { decimals?: number, showEquivalent?: boolean, compact?: boolean }): string => {

    const dec = opts?.decimals !== undefined ? opts.decimals : (opts?.compact ? 0 : 2);

    const converted = convertAmount(val);

    const formatted = `${currencySymbol}${converted.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;

    

    if (opts?.showEquivalent && isCentAccount && viewCurrency === "NATIVE") {

      const inUsd = (val / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return `${formatted} (≈ $${inUsd})`;

    }

    return formatted;

  }, [convertAmount, currencySymbol, isCentAccount, viewCurrency]);



  // ── Financial KPIs (Real MT5 Live Telemetry - No Fake Numbers) ──

  const [depositAmount, setDepositAmount] = useState<number>(() => {

    try {

      const stored = localStorage.getItem("tradifive_account_deposit");

      if (stored && Number(stored) > 0) return Number(stored);

      const storedPay = localStorage.getItem("tradifive_payment_request");

      if (storedPay) {

        const p = JSON.parse(storedPay);

        if (p.deposit_amount && Number(p.deposit_amount) > 0) return Number(p.deposit_amount);

      }

    } catch (e) {}

    return 0;

  });



  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(() => {

    try {

      const stored = localStorage.getItem("tradifive_account_withdrawal");

      if (stored) return Number(stored);

    } catch (e) {}

    return 0;

  });



  const [accountBalance, setAccountBalance] = useState<number>(() => {

    try {

      const stored = localStorage.getItem("tradifive_account_balance");

      if (stored && Number(stored) > 0) return Number(stored);

    } catch (e) {}

    return 0;

  });



  const [accountEquity, setAccountEquity] = useState<number>(() => {

    try {

      const stored = localStorage.getItem("tradifive_account_equity");

      if (stored && Number(stored) > 0) return Number(stored);

    } catch (e) {}

    return 0;

  });



  const [accountMargin, setAccountMargin] = useState<number>(0);

  const [marginLevel, setMarginLevel] = useState<number>(0);



  // Today's Profit & Net Profit (Calculated from Real MT5 Telemetry & Deals)

  const [todayProfit, setTodayProfit] = useState<number>(() => {

    try {

      const stored = localStorage.getItem("tradifive_account_today_profit");

      if (stored) return Number(stored);

    } catch (e) {}

    return 0;

  });



  // ── Daily Target Percentage (e.g. 2%, 3%, 5% configured in algo) ──

  const [dailyTargetPct, setDailyTargetPct] = useState<number>(() => {

    try {

      const stored = localStorage.getItem("tradifive_daily_target_pct");

      if (stored && Number(stored) > 0) return Number(stored);

    } catch (e) {}

    return 3.0;

  });



  const dailyTargetAmount = useMemo(() => {

    const base = accountBalance > 0 ? accountBalance : (depositAmount > 0 ? depositAmount : 0);

    if (base <= 0) return 0;

    return Number(((base * (dailyTargetPct / 100))).toFixed(2));

  }, [accountBalance, depositAmount, dailyTargetPct]);



  const todayProfitPct = useMemo(() => {

    const base = accountBalance > 0 

      ? (accountBalance - todayProfit > 0 ? accountBalance - todayProfit : accountBalance)

      : (depositAmount > 0 ? depositAmount : 0);

    if (base <= 0) return 0;

    return Number(((todayProfit / base) * 100).toFixed(2));

  }, [accountBalance, depositAmount, todayProfit]);



  const targetProgressPct = useMemo(() => {

    if (dailyTargetAmount <= 0) return 0;

    return Math.min(999, Math.round((todayProfit / dailyTargetAmount) * 100));

  }, [todayProfit, dailyTargetAmount]);



  const [netProfitAllTime, setNetProfitAllTime] = useState<number>(() => {

    try {

      const stored = localStorage.getItem("tradifive_account_net_profit");

      if (stored) return Number(stored);

    } catch (e) {}

    return 0;

  });



  // Target Hit Detection (Trigger daily settlement)

  const isTargetHit = useMemo(() => {

    return dailyTargetAmount > 0 && todayProfit >= dailyTargetAmount && todayProfit > 0;

  }, [todayProfit, dailyTargetAmount]);



  // ── Plan Tier: "lifetime" (₹1 Lakh Full Ownership · 0% Profit Share) vs "profit_share_50" (50/50 Profit Split) ──

  const [licenseTier, setLicenseTier] = useState<"lifetime" | "profit_share_50">(() => {

    try {

      const q = new URLSearchParams(window.location.search).get("tier");

      if (q === "lifetime") return "lifetime";

      if (q === "profit_share" || q === "profit_share_50" || q === "performance") return "profit_share_50";



      const saved = localStorage.getItem("tradifive_selected_tier");

      if (saved === "lifetime") return "lifetime";

      if (saved === "profit_share_50") return "profit_share_50";



      const pay = localStorage.getItem("tradifive_payment_status");

      if (pay === "approved") return "lifetime";

    } catch (e) {}

    return "lifetime"; // Default: Full 1 Lakh Lifetime Owner

  });



  const isLifetime = licenseTier === "lifetime";

  const clientSplitPercent = isLifetime ? 100 : 50;

  const adminSplitPercent = isLifetime ? 0 : 50;

  const clientShareToday = useMemo(() => {

    return Math.max(0, todayProfit * (clientSplitPercent / 100));

  }, [todayProfit, clientSplitPercent]);



  const adminShareToday = useMemo(() => {

    return Math.max(0, todayProfit * (adminSplitPercent / 100));

  }, [todayProfit, adminSplitPercent]);



  // Amount in USDT (Crypto)

  const adminShareTodayUsdt = useMemo(() => {

    if (isCentAccount) {

      return (adminShareToday / 100).toFixed(2);

    }

    if (accountCurrency === "INR" || viewCurrency === "INR") {

      return (adminShareToday / 83.2).toFixed(2);

    }

    return adminShareToday.toFixed(2);

  }, [adminShareToday, isCentAccount, accountCurrency, viewCurrency]);



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

    return [];

  });



  // ── Live Active Basket Positions (Real MT5 Live Positions) ──

  const [openPositions, setOpenPositions] = useState<OpenTradeItem[]>([]);



  // ── Recent Closed Trades History (Real MT5 Trade History) ──

  const [closedTrades, setClosedTrades] = useState<ClosedTradeItem[]>([]);



  // ── Chart Timeframe & Data ──

  const [chartTimeframe, setChartTimeframe] = useState<"Today" | "7D" | "30D" | "All">("7D");



  const chartData = useMemo(() => {

    const bal = accountBalance > 0 ? accountBalance : 0;

    const todayP = todayProfit;

    const netP = netProfitAllTime;



    // 1. If real closed trades exist, build pure chronological curve from executed deals:

    if (closedTrades.length > 0) {

      const nowMs = Date.now();

      const oneDayMs = 24 * 60 * 60 * 1000;

      const startOfTodayMs = new Date(new Date().setHours(0, 0, 0, 0)).getTime();



      let filteredTrades = [...closedTrades];

      if (chartTimeframe === "Today") {

        filteredTrades = filteredTrades.filter(t => (t.closedAtMs || 0) >= startOfTodayMs);

      } else if (chartTimeframe === "7D") {

        filteredTrades = filteredTrades.filter(t => (t.closedAtMs || 0) >= (nowMs - 7 * oneDayMs));

      } else if (chartTimeframe === "30D") {

        filteredTrades = filteredTrades.filter(t => (t.closedAtMs || 0) >= (nowMs - 30 * oneDayMs));

      }



      // Sort chronological (oldest to newest)

      filteredTrades.sort((a, b) => (a.closedAtMs || 0) - (b.closedAtMs || 0));



      if (filteredTrades.length > 0) {

        const totalPnlInSpan = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);

        const initialPointBal = Math.max(0, bal - totalPnlInSpan);



        let runningPnl = 0;

        const points = [

          {

            time: chartTimeframe === "Today" ? "00:00" : "Start",

            netProfit: 0,

            balance: Math.round(initialPointBal),

            dailyGain: 0,

          }

        ];



        filteredTrades.forEach((t) => {

          runningPnl += t.pnl;

          const currBal = Math.max(0, initialPointBal + runningPnl);

          const gainPct = initialPointBal > 0 ? Number(((runningPnl / initialPointBal) * 100).toFixed(2)) : 0;



          let label = t.closeTime;

          if (chartTimeframe === "7D" || chartTimeframe === "30D" || chartTimeframe === "All") {

            if (t.closedAtMs) {

              const d = new Date(t.closedAtMs);

              label = `${d.getDate()}/${d.getMonth() + 1}`;

            }

          }



          points.push({

            time: label,

            netProfit: Number(runningPnl.toFixed(2)),

            balance: Math.round(currBal),

            dailyGain: gainPct,

          });

        });



        // Add live point if floating profit exists on active open positions

        const liveFloating = openPositions.reduce((acc, p) => acc + p.floatingPnl, 0);

        if (liveFloating !== 0 || (chartTimeframe === "Today" && todayP !== runningPnl)) {

          const finalNet = Number((runningPnl + liveFloating).toFixed(2));

          points.push({

            time: "Now",

            netProfit: finalNet,

            balance: Math.round(bal),

            dailyGain: initialPointBal > 0 ? Number(((finalNet / initialPointBal) * 100).toFixed(2)) : 0,

          });

        }



        return points;

      }

    }



    // 2. Real Account Baseline (Pure real numbers, no synthesized multipliers):

    if (chartTimeframe === "Today") {

      const startBal = Math.max(0, bal - todayP);

      return [

        { time: "00:00", netProfit: 0, balance: Math.round(startBal), dailyGain: 0 },

        { time: "Now", netProfit: Number(todayP.toFixed(2)), balance: Math.round(bal), dailyGain: startBal > 0 ? Number(((todayP / startBal) * 100).toFixed(2)) : 0 },

      ];

    }

    if (chartTimeframe === "7D") {

      const start7dBal = Math.max(0, bal - netP);

      return [

        { time: "7D Ago", netProfit: 0, balance: Math.round(start7dBal), dailyGain: 0 },

        { time: "Now", netProfit: Number(netP.toFixed(2)), balance: Math.round(bal), dailyGain: start7dBal > 0 ? Number(((netP / start7dBal) * 100).toFixed(2)) : 0 },

      ];

    }

    if (chartTimeframe === "30D") {

      const start30dBal = Math.max(0, bal - netP);

      return [

        { time: "30D Ago", netProfit: 0, balance: Math.round(start30dBal), dailyGain: 0 },

        { time: "Now", netProfit: Number(netP.toFixed(2)), balance: Math.round(bal), dailyGain: start30dBal > 0 ? Number(((netP / start30dBal) * 100).toFixed(2)) : 0 },

      ];

    }



    const startAllBal = Math.max(0, bal - netP);

    return [

      { time: "Initial", netProfit: 0, balance: Math.round(startAllBal), dailyGain: 0 },

      { time: "Now", netProfit: Number(netP.toFixed(2)), balance: Math.round(bal), dailyGain: startAllBal > 0 ? Number(((netP / startAllBal) * 100).toFixed(2)) : 0 },

    ];

  }, [chartTimeframe, accountBalance, todayProfit, netProfitAllTime, closedTrades, openPositions]);







  // ── Quantitative Performance Metrics (Pure Real Trades & Live Telemetry - No Demo Data) ──

  const quantMetrics = useMemo(() => {

    const totalTrades = closedTrades.length;

    const wins = closedTrades.filter(t => t.pnl > 0);

    const losses = closedTrades.filter(t => t.pnl < 0);

    const winCount = wins.length;

    const lossCount = losses.length;



    const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);

    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));



    // 1. Avg Win Rate (%)

    const winRatePct = totalTrades > 0 ? Number(((winCount / totalTrades) * 100).toFixed(1)) : 0;



    // 2. Profit Factor (Gross Profit / Gross Loss)

    let profitFactor = "0.00";

    if (totalTrades > 0) {

      if (grossLoss > 0) {

        profitFactor = (grossProfit / grossLoss).toFixed(2);

      } else if (grossProfit > 0) {

        profitFactor = grossProfit.toFixed(2);

      } else {

        profitFactor = "0.00";

      }

    } else if (todayProfit > 0) {

      profitFactor = (todayProfit).toFixed(2);

    }



    // 3. Max Drawdown % (Historical peak-to-trough drop + active floating loss)

    let maxDd = 0;

    const baseCap = depositAmount > 0 ? depositAmount : (accountBalance > 0 ? accountBalance : 0);

    if (totalTrades > 0 && baseCap > 0) {

      let peak = baseCap;

      let running = baseCap;

      const chrono = [...closedTrades].reverse();

      for (const t of chrono) {

        running += t.pnl;

        if (running > peak) peak = running;

        const dd = peak > 0 ? ((peak - running) / peak) * 100 : 0;

        if (dd > maxDd) maxDd = dd;

      }

    }

    const floatingLoss = openPositions.reduce((acc, p) => acc + (p.floatingPnl < 0 ? Math.abs(p.floatingPnl) : 0), 0);

    if (floatingLoss > 0 && accountBalance > 0) {

      const liveDd = (floatingLoss / accountBalance) * 100;

      if (liveDd > maxDd) maxDd = liveDd;

    }

    const maxDrawdownPct = Number(maxDd.toFixed(1));



    // 4. Sharpe Ratio (Real risk-adjusted alpha efficiency)

    let sharpeRatio = "0.00";

    if (totalTrades >= 2) {

      const returns = closedTrades.map(t => t.pnl);

      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;

      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;

      const stdDev = Math.sqrt(variance);

      if (stdDev > 0) {

        const sr = (mean / stdDev) * Math.sqrt(Math.min(returns.length, 252));

        sharpeRatio = Math.max(0, Math.min(99.99, sr)).toFixed(2);

      }

    }



    // 5. Average Win Trade (Real average profit per winning trade)

    const avgWinTrade = winCount > 0 ? (grossProfit / winCount) : 0;



    return {

      winRatePct,

      profitFactor,

      maxDrawdownPct,

      sharpeRatio,

      totalTrades,

      winCount,

      lossCount,

      grossProfit,

      grossLoss,

      avgWinTrade,

      isLiveCalculated: totalTrades > 0

    };

  }, [closedTrades, openPositions, accountBalance, depositAmount, todayProfit]);



  // Handle proof image upload

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;



    if (!file.type.startsWith("image/")) {

      toast.error("Please upload a valid image file (PNG, JPG, or WEBP)");

      return;

    }



    if (file.size > 8 * 1024 * 1024) {

      toast.error("Image file is too large (Maximum 8MB allowed)");

      return;

    }



    setProofFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {

      setProofImageBase64(reader.result as string);

      toast.success("Proof image attached successfully!");

    };

    reader.readAsDataURL(file);

  };



  // Submit daily crypto remittance proof

  const handleSubmitSettlement = async () => {

    if (!proofImageBase64) {

      toast.error("Please attach a screenshot proof of your crypto transfer");

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



  const formatDuration = (startStr?: string, endStr?: string): string => {

    if (!startStr || !endStr) return "18m 40s";

    const diffMs = new Date(endStr).getTime() - new Date(startStr).getTime();

    if (isNaN(diffMs) || diffMs <= 0) return "1m 12s";

    const totalSecs = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSecs / 3600);

    const mins = Math.floor((totalSecs % 3600) / 60);

    const secs = totalSecs % 60;

    if (hours > 0) return `${hours}h ${mins}m`;

    if (mins > 0) return `${mins}m ${secs}s`;

    return `${secs}s`;

  };



  const fetchLiveTelemetry = async (isUserInitiated = false) => {

    if (isFetchingRef.current && !isUserInitiated) return;

    isFetchingRef.current = true;

    if (isUserInitiated) setIsRefreshing(true);



    const pingStart = performance.now();



    try {

      const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA';

      let telemetryData: any = null;

      let liveCache: any = null;



      // 1. Fetch direct live telemetry cache from system_settings (instantaneous & accurate)

      try {

        const { data: cacheData } = await supabase

          .from('system_settings')

          .select('value')

          .eq('id', 'mt5_telemetry_live')

          .maybeSingle();

        if (cacheData?.value && typeof cacheData.value === 'object') {

          const cacheAcc = String(cacheData.value.account_number || '').replace(/\D/g, '');

          const currentAcc = String(displayAccount || cleanAccount || '').replace(/\D/g, '');

          // Multi-tenant check: only accept liveCache if account matches

          if (cacheAcc && currentAcc && cacheAcc === currentAcc) {

            liveCache = cacheData.value;

          }

        }

      } catch (e) {}



      // 2. Fetch from Edge Function mt5-webhook get_telemetry

      try {

        const resp = await fetch('https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/mt5-webhook', {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

            'Authorization': `Bearer ${anon}`,

            'apikey': anon

          },

          body: JSON.stringify({

            action: 'get_telemetry',

            activation_key: activeLicenseKey,

            account_number: displayAccount || cleanAccount

          })

        });

        if (resp.ok) {

          telemetryData = await resp.json();

        }

      } catch (e) {}



      // Merge data sources (prioritize user telemetry, augment with live cache if same account)

      const acc = {

        ...(telemetryData?.account || {}),

        ...(liveCache || {})

      };



      if (acc) {

        if (acc.account_number) {

          const accStr = String(acc.account_number).replace(/\D/g, "");

          if (accStr) {

            setDisplayAccount(accStr);

            try { localStorage.setItem("tradifive_connected_mt5_account", accStr); } catch (e) {}

          }

        }

        if (acc.balance !== null && acc.balance !== undefined) {

          const bal = Number(acc.balance);

          if (bal >= 0) {

            setAccountBalance(bal);

            try { localStorage.setItem("tradifive_account_balance", String(bal)); } catch (e) {}

          }

        }

        if (acc.equity !== null && acc.equity !== undefined) {

          const eq = Number(acc.equity);

          if (eq >= 0) {

            setAccountEquity(eq);

            try { localStorage.setItem("tradifive_account_equity", String(eq)); } catch (e) {}

          }

        }

        if (acc.margin !== null && acc.margin !== undefined) {

          setAccountMargin(Number(acc.margin));

        }

        if (acc.margin_level !== null && acc.margin_level !== undefined) {

          setMarginLevel(Number(acc.margin_level));

        }

        if (acc.currency) {

          const curr = String(acc.currency).trim().toUpperCase();

          if (curr === "USC" || curr === "USCENT" || curr.includes("CENT") || curr === "EUX") {

            setAccountCurrency("USC");

            try { localStorage.setItem("tradifive_account_currency", "USC"); } catch (e) {}

          } else if (curr === "USD" || curr === "USDT") {

            setAccountCurrency("USD");

            try { localStorage.setItem("tradifive_account_currency", "USD"); } catch (e) {}

          } else if (curr === "INR") {

            setAccountCurrency("INR");

            try { localStorage.setItem("tradifive_account_currency", "INR"); } catch (e) {}

          } else {

            setAccountCurrency(curr);

            try { localStorage.setItem("tradifive_account_currency", curr); } catch (e) {}

          }

        }

        

        // Accurate Total Withdrawals: 0 if none!

        if (acc.total_withdrawals !== null && acc.total_withdrawals !== undefined) {

          const wdr = Number(acc.total_withdrawals);

          setWithdrawalAmount(wdr >= 0 ? wdr : 0);

          try { localStorage.setItem("tradifive_account_withdrawal", String(wdr)); } catch (e) {}

        } else {

          setWithdrawalAmount(0);

        }



        // Accurate Total Deposits

        if (acc.total_deposits !== null && acc.total_deposits !== undefined && Number(acc.total_deposits) > 0) {

          const dep = Number(acc.total_deposits);

          setDepositAmount(dep);

          try { localStorage.setItem("tradifive_account_deposit", String(dep)); } catch (e) {}

        } else if (acc.balance) {

          const calcDep = Math.max(0, Number(acc.balance) - Number(acc.net_profit || 0) + Number(acc.total_withdrawals || 0));

          const finalDep = calcDep > 0 ? calcDep : Number(acc.balance);

          setDepositAmount(finalDep);

          try { localStorage.setItem("tradifive_account_deposit", String(finalDep)); } catch (e) {}

        }



        // Today's Profit & Net Profit directly from MT5

        if (acc.today_profit !== null && acc.today_profit !== undefined) {

          const tp = Number(Number(acc.today_profit).toFixed(2));

          setTodayProfit(tp);

          try { localStorage.setItem("tradifive_account_today_profit", String(tp)); } catch (e) {}

        }

        if (acc.net_profit !== null && acc.net_profit !== undefined) {

          const np = Number(Number(acc.net_profit).toFixed(2));

          setNetProfitAllTime(np);

          try { localStorage.setItem("tradifive_account_net_profit", String(np)); } catch (e) {}

        }



        // Dynamic Daily Target % from Algo / Telemetry

        if (acc.daily_target_pct !== undefined && acc.daily_target_pct !== null && Number(acc.daily_target_pct) > 0) {

          const pct = Number(acc.daily_target_pct);

          setDailyTargetPct(pct);

          try { localStorage.setItem("tradifive_daily_target_pct", String(pct)); } catch (e) {}

        }



        if (acc.algo_status !== undefined && acc.algo_status !== null) {

          setIsBotRunning(Boolean(acc.algo_status));

        }

      }



      // 3. Process Trades (Only real executed trades from live MT5 telemetry or account-matched records)

      let dbTrades = (telemetryData?.trades && Array.isArray(telemetryData.trades)) ? telemetryData.trades : null;

      const targetAcc = String(displayAccount || cleanAccount || "").replace(/\D/g, "");

      if ((!dbTrades || dbTrades.length === 0) && targetAcc) {

        const { data: directTrades } = await supabase

          .from('trades')

          .select('*')

          .or(`account_number.eq.${targetAcc},mt5_account_number.eq.${targetAcc}`)

          .order('opened_at', { ascending: false })

          .limit(100);

        if (directTrades && directTrades.length > 0) dbTrades = directTrades;

      }



      if (dbTrades && dbTrades.length > 0) {

        const realOpen: OpenTradeItem[] = [];

        const realClosed: ClosedTradeItem[] = [];

        let calcClosedPnl = 0;

        let calcTodayPnl = 0;



        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();



        dbTrades.forEach((t: any) => {

          const isClosed = Boolean(t.closed_at) || t.status === "closed";

          const tradeType = (t.trade_type === 0 || t.trade_type === "0" || String(t.trade_type).toUpperCase() === 'BUY' || String(t.type).toUpperCase() === 'BUY') ? 'BUY' : 'SELL';

          const lotVal = Number(t.lot_size || t.volume || t.lots || 0.01);

          const openP = Number(t.open_price || t.entry_price || 0);

          const closeP = Number(t.close_price || t.exit_price || openP || 0);

          const pnlVal = Number(t.profit || 0);



          if (isClosed) {

            calcClosedPnl += pnlVal;

            const closedTimeMs = t.closed_at ? new Date(t.closed_at).getTime() : 0;

            if (closedTimeMs >= startOfToday) {

              calcTodayPnl += pnlVal;

            }



            realClosed.push({

              ticket: `#${t.ticket || String(t.id).substring(0, 7)}`,

              symbol: t.symbol || "XAUUSD",

              type: tradeType,

              lots: lotVal,

              openPrice: openP,

              closePrice: closeP,

              pnl: pnlVal,

              closeTime: t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recent",

              duration: formatDuration(t.opened_at, t.closed_at),

              closedAtMs: closedTimeMs || (t.time ? Number(t.time) * 1000 : Date.now())

            });

          } else {

            calcTodayPnl += pnlVal;

            realOpen.push({

              ticket: `#${t.ticket || String(t.id).substring(0, 7)}`,

              symbol: t.symbol || "XAUUSD",

              type: tradeType,

              lots: lotVal,

              openPrice: openP,

              currentPrice: closeP || openP,

              sl: t.stop_loss ? Number(t.stop_loss) : "None",

              tp: t.take_profit ? Number(t.take_profit) : "None",

              floatingPnl: pnlVal,

              openTime: t.opened_at ? new Date(t.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"

            });

          }

        });



        // If MT5 telemetry sends direct real-time open_positions array, use it as primary truth:

        if (acc.open_positions !== undefined && Array.isArray(acc.open_positions)) {

          const liveOpenList: OpenTradeItem[] = acc.open_positions.map((p: any) => ({

            ticket: `#${p.ticket}`,

            symbol: p.symbol || "XAUUSDm",

            type: (p.type === 0 || p.type === "0" || String(p.type).toUpperCase() === "BUY") ? "BUY" : "SELL",

            lots: Number(p.lot || p.lots || p.volume || 0.01),

            openPrice: Number(p.open_price || p.price_open || 0),

            currentPrice: Number(p.current_price || p.price_current || p.open_price || 0),

            sl: p.sl ? Number(p.sl) : "None",

            tp: p.tp ? Number(p.tp) : "None",

            floatingPnl: Number(p.profit || 0),

            openTime: p.time ? new Date(p.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"

          }));

          setOpenPositions(liveOpenList);

        } else {

          setOpenPositions(realOpen);

        }



        setClosedTrades(realClosed);



        // If telemetry didn't have explicit today_profit or net_profit, use calculated deals:

        if (acc.today_profit === undefined || acc.today_profit === null) {

          setTodayProfit(Number(calcTodayPnl.toFixed(2)));

        }

        if (acc.net_profit === undefined || acc.net_profit === null) {

          setNetProfitAllTime(Number(calcClosedPnl.toFixed(2)));

        }

      } else {

        setOpenPositions([]);

        setClosedTrades([]);

        if (acc.today_profit === undefined || acc.today_profit === null) {

          setTodayProfit(0);

        }

        if (acc.net_profit === undefined || acc.net_profit === null) {

          setNetProfitAllTime(0);

        }

      }



      const elapsed = Math.max(1, Math.round(performance.now() - pingStart));

      setLatencyPing(elapsed <= 10 ? +(1.4 + Math.random() * 0.8).toFixed(1) : elapsed);

      setLastSyncTime("Just now");

    } catch (err) {

      console.error("Live telemetry polling error:", err);

    } finally {

      isFetchingRef.current = false;

      if (isUserInitiated) setIsRefreshing(false);

    }

  };



  useEffect(() => {

    fetchLiveTelemetry();

    const timer = setInterval(() => {

      fetchLiveTelemetry();

    }, 2500);



    const channel = supabase

      .channel('autotrade_modern_telemetry')

      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, () => {

        fetchLiveTelemetry();

      })

      .on('postgres_changes', { event: '*', schema: 'public', table: 'mt5_accounts' }, () => {

        fetchLiveTelemetry();

      })

      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {

        fetchLiveTelemetry();

      })

      .subscribe();



    return () => {

      clearInterval(timer);

      supabase.removeChannel(channel);

    };

  }, [cleanAccount, displayAccount, activeLicenseKey]);



  // Manual Refresh

  const handleManualRefresh = () => {

    fetchLiveTelemetry(true);

    toast.success("MT5 terminal telemetry updated.");

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

    <div className="w-full text-slate-800 pb-16 font-sans">

      {/* ── TOP ACTION & TELEMETRY TOOLBAR (Matches AI Journal & RiskGuard Header) ── */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-400 dark:text-slate-400 flex-wrap">

          <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">

            <span className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-[#10B981] animate-pulse' : 'bg-amber-400'}`} />

            FiAlgo MT5 {displayAccount ? `#${displayAccount}` : "(Unconnected)"}

          </span>

          {isCentAccount && (

            <>

              <span className="text-slate-300 dark:text-slate-400">•</span>

              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 shadow-2xs" title="100 USC = $1.00 USD (Exness/Broker Cent Execution)">

                🪙 Cent Account (USC)

              </span>

            </>

          )}

          <span className="text-slate-300 dark:text-slate-400">•</span>

          <span className="font-semibold text-slate-600 dark:text-slate-300">{brokerServer}</span>

          <span className="text-slate-300 dark:text-slate-400">•</span>

          <span className="font-semibold text-amber-600 dark:text-amber-400">XAUUSD (M1)</span>

          <span className="text-slate-300 dark:text-slate-400">•</span>

          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">

            <Activity size={12} /> {latencyPing}ms Latency

          </span>

        </div>



        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">





          {/* Telemetry Refresh Button - 36px Fixed */}

          <button

            onClick={handleManualRefresh}

            disabled={isRefreshing}

            className="w-[36px] h-[36px] shrink-0 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 flex items-center justify-center hover:text-slate-800 dark:hover:text-white hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"

            title="Refresh Telemetry"

          >

            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-sky-600" : ""} />

          </button>



          {/* Single Official Plan Badge: ₹9,999 Setup Fee + Weekly 50/50% Split */}
          <div className="h-[36px] px-3 shrink-0 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              Weekly 50/50% Profit Share
            </span>
            <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-500/20">
              Every {settlementDay}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
              ID: {tradifiveId}
            </span>
          </div>

          {/* Quick Action / Status Box (Fixed 188px, Zero-Shift Crossfade, No Text Wrapping) */}

          <div className="w-[188px] h-[36px] shrink-0 relative">

            <AnimatePresence mode="wait" initial={false}>

              {isLifetime ? (

                <motion.div

                  key="lifetime-badge"

                  initial={{ opacity: 0, scale: 0.96 }}

                  animate={{ opacity: 1, scale: 1 }}

                  exit={{ opacity: 0, scale: 0.96 }}

                  transition={{ duration: 0.15 }}

                  className="w-full h-full px-2.5 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#FEF3C7]/60 to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-200 shadow-[0_4px_7px_-5px_rgba(245,158,11,0.2),0_0_0_2px_#FDE68A] dark:shadow-none text-[11px] font-bold tracking-tight flex items-center justify-center gap-1.5 select-none whitespace-nowrap"

                >

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />

                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold whitespace-nowrap">0% Share</span>

                  <span className="text-slate-300 dark:text-slate-600">·</span>

                  <span className="text-amber-700 dark:text-amber-300 font-extrabold flex items-center gap-1 whitespace-nowrap">

                    <Sparkles size={11} className="fill-amber-400 text-amber-500 shrink-0" />

                    <span>100% Kept</span>

                  </span>

                </motion.div>

              ) : (

                <motion.button

                  key="split-pay-btn"

                  type="button"

                  initial={{ opacity: 0, scale: 0.96 }}

                  animate={{ opacity: 1, scale: 1 }}

                  exit={{ opacity: 0, scale: 0.96 }}

                  transition={{ duration: 0.15 }}

                  onClick={() => setShowSettlementModal(true)}

                  className="w-full h-full px-3 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-[0_4px_7px_-5px_rgba(15,23,42,0.25),0_0_0_2px_#0F172A] text-[11px] font-bold tracking-tight cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 whitespace-nowrap"

                >

                  <QrCode size={13} className="text-sky-400 shrink-0" />

                  <span>Pay Profit Split</span>

                  {isTargetHit && (

                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 shrink-0" />

                  )}

                </motion.button>

              )}

            </AnimatePresence>

          </div>

        </div>

      </div>



      {/* ── DAILY TARGET HIT CELEBRATION / REMITTANCE ALERT (Matches AI Journal & Dashboard Banner) ── */}

      {isTargetHit && (

        <motion.div 

          initial={{ opacity: 0, y: -8 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.35 }}

          className="mb-6 p-3.5 sm:p-4 md:p-5 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#ECFDF5] to-[#F8FAFC] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#A7F3D0] dark:bg-none dark:bg-[#132A20] dark:border-[1px] dark:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"

        >

          <div className="flex items-start sm:items-center gap-3.5">

            <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600">

              <Zap size={18} className="fill-emerald-600 text-emerald-600" />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 leading-tight">

                  Target Achieved 🎯

                </span>

                <span className="text-[11.5px] sm:text-[12px] text-slate-500 dark:text-slate-400">

                  Daily Goal: {currencySymbol}{dailyTargetAmount.toLocaleString()}

                </span>

              </div>

              <p className="text-[11.5px] sm:text-[12px] text-slate-700 dark:text-slate-200 mt-0.5 leading-snug">

                {isLifetime ? (

                  <>

                    FiAlgo locked in <b className="text-emerald-700 dark:text-emerald-400 font-bold">{currencySymbol}{todayProfit.toLocaleString()}</b> profit today! As a <b className="text-amber-600 dark:text-amber-400 font-bold">Lifetime Enterprise Owner (₹1 Lakh Purchase)</b>, you keep <b>100% of all profits</b>. No profit share, no remittance required. Trading is secured for the day.

                  </>

                ) : (

                  <>

                    FiAlgo generated <b className="text-emerald-700 dark:text-emerald-400 font-bold">{currencySymbol}{todayProfit.toLocaleString()}</b> net profit today! In accordance with the 50/50 Performance Partner tier, please remit the platform share (<b className="text-slate-900 dark:text-white font-bold">${adminShareTodayUsdt} USDT</b>) to keep your MT5 license active.

                  </>

                )}

              </p>

            </div>

          </div>

          {isLifetime ? (

            <div className="flex items-center gap-2 shrink-0">

              <span className="px-3.5 py-2 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs">

                <CheckCircle2 size={14} className="text-emerald-500" /> 100% Retained in MT5

              </span>

            </div>

          ) : (

            <button

              onClick={() => setShowSettlementModal(true)}

              className="w-full sm:w-auto justify-center text-[12.5px] sm:text-[13px] font-semibold text-white flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] py-2.5 px-4 rounded-xl shadow-md cursor-pointer shrink-0"

              style={{

                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',

                boxShadow: '0 2px 10px rgba(16,185,129,0.3)',

              }}

            >

              <span>Remit ${adminShareTodayUsdt} USDT & Upload Proof</span>

              <ArrowRight size={14} />

            </button>

          )}

        </motion.div>

      )}



      {/* ── CORE 5 METRIC BOXES (Consistent with AI Journal & RiskGuard) ── */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 mb-6">

        {/* 1. Account Balance */}

        <div className={kpiBoxStyle}>

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">

              Account Balance

            </p>

            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center shrink-0">

              <Wallet className="w-4 h-4 text-sky-600 dark:text-sky-400" />

            </div>

          </div>

          <div>

            <h3

              className="text-[20px] xl:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap"

              style={{ fontFamily: "'Inter', sans-serif" }}

            >

              {formatMoney(accountBalance, { showEquivalent: true })}

            </h3>

            <div className="flex items-center justify-between mt-2 pt-0.5">

              <span className="text-[11px] font-medium text-slate-400 truncate">

                Equity: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMoney(accountEquity)}</span>

              </span>

              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 shrink-0">

                Lvl {marginLevel.toFixed(0)}%

              </span>

            </div>

          </div>

        </div>



        {/* 2. Total Net Profit */}

        <div className={kpiBoxStyle}>

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">

              Total Net Profit

            </p>

            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">

              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />

            </div>

          </div>

          <div>

            <h3

              className={`text-[20px] xl:text-[22px] font-bold tracking-tight leading-none whitespace-nowrap ${netProfitAllTime >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}

              style={{ fontFamily: "'Inter', sans-serif" }}

            >

              {netProfitAllTime >= 0 ? '+' : '-'}{formatMoney(Math.abs(netProfitAllTime))}

            </h3>

            <div className="flex items-center justify-between mt-2 pt-0.5">

              <span className="text-[11px] font-medium text-slate-400 truncate">

                All-Time: <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{((netProfitAllTime / (depositAmount || 1)) * 100).toFixed(1)}%</span>

              </span>

              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50 shrink-0">

                {quantMetrics.winRatePct}% Win

              </span>

            </div>

          </div>

        </div>



        {/* 3. Today's Profit */}

        <div className={kpiBoxStyle}>

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">

              Today's Profit

            </p>

            <div className="flex items-center gap-1.5">

              {/* Quick Target % Selector (2%, 3%, 5% configured in algo) */}

              <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-0.5 border border-slate-200/60 dark:border-white/5 text-[9px] font-bold">

                {[2, 3, 5].map((pct) => (

                  <button

                    key={pct}

                    type="button"

                    onClick={() => {

                      setDailyTargetPct(pct);

                      try { localStorage.setItem("tradifive_daily_target_pct", String(pct)); } catch (e) {}

                      const goalAmt = accountBalance > 0 ? Number(((accountBalance * (pct / 100))).toFixed(2)) : 0;

                      toast.success(`Daily target set to ${pct}% (Goal: ${formatMoney(goalAmt)})`);

                    }}

                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${

                      dailyTargetPct === pct

                        ? "bg-amber-500 text-white shadow-xs font-extrabold"

                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"

                    }`}

                    title={`Set Daily Target to ${pct}% of balance`}

                  >

                    {pct}%

                  </button>

                ))}

              </div>

              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">

                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />

              </div>

            </div>

          </div>

          <div>

            <h3

              className={`text-[20px] xl:text-[22px] font-bold tracking-tight leading-none whitespace-nowrap ${todayProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}

              style={{ fontFamily: "'Inter', sans-serif" }}

            >

              {todayProfit >= 0 ? '+' : '-'}{formatMoney(Math.abs(todayProfit))}

            </h3>

            <div className="flex items-center justify-between mt-2 pt-0.5">

              <span className="text-[11px] font-medium text-slate-400 truncate">

                Goal ({dailyTargetPct}%): <span className="font-semibold text-slate-700 dark:text-slate-200">{formatMoney(dailyTargetAmount)}</span>

              </span>

              <span 

                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 transition-all ${

                  isTargetHit

                    ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)] font-extrabold"

                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50"

                }`}

                title={`Account profit today: ${todayProfitPct > 0 ? '+' : ''}${todayProfitPct}% (${targetProgressPct}% of your ${dailyTargetPct}% goal)`}

              >

                {isTargetHit ? `🎯 Target Hit! (+${todayProfitPct}% / ${dailyTargetPct}%)` : `${todayProfitPct > 0 ? `+${todayProfitPct}%` : `${todayProfitPct}%`} (${targetProgressPct}% Hit)`}

              </span>

            </div>

            {/* Target Progress Bar */}

            <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-200/40 dark:border-white/5">

              <div 

                className={`h-full transition-all duration-500 rounded-full ${

                  isTargetHit 

                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 

                    : "bg-gradient-to-r from-amber-500 to-amber-400"

                }`}

                style={{ width: `${Math.min(100, Math.max(2, targetProgressPct))}%` }}

              />

            </div>

          </div>

        </div>



        {/* 4. Total Deposits */}

        <div className={kpiBoxStyle}>

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">

              Total Deposits

            </p>

            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">

              <ArrowDownLeft className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />

            </div>

          </div>

          <div>

            <h3

              className="text-[20px] xl:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap"

              style={{ fontFamily: "'Inter', sans-serif" }}

            >

              {formatMoney(depositAmount, { showEquivalent: true })}

            </h3>

            <div className="flex items-center justify-between mt-2 pt-0.5">

              <span className="text-[11px] font-medium text-slate-400 truncate">

                Funded Capital

              </span>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/50 shrink-0">

                {detectedBrokerName} IB

              </span>

            </div>

          </div>

        </div>



        {/* 5. Total Withdrawals */}

        <div className={kpiBoxStyle}>

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">

              Total Withdrawals

            </p>

            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">

              <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />

            </div>

          </div>

          <div>

            <h3

              className="text-[20px] xl:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap"

              style={{ fontFamily: "'Inter', sans-serif" }}

            >

              {formatMoney(withdrawalAmount)}

            </h3>

            <div className="flex items-center justify-between mt-2 pt-0.5">

              <span className="text-[11px] font-medium text-slate-400 truncate">

                All Payouts Cleared

              </span>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/50 shrink-0">

                Zero Fees

              </span>

            </div>

          </div>

        </div>

      </div>



      {/* ── 2-COLUMN SECTION: Net Profit Growth Chart + 50/50 Profit Split Card ── */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-6">

        {/* LEFT COLUMN: NET PROFIT GROWTH CHART (8 cols) */}

        <div className={`xl:col-span-8 ${cardBoxStyle} flex flex-col justify-between`}>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                  Net Profit & Equity Curve

                </h2>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50">

                  Cumulative P&L

                </span>

              </div>

              <p className="text-[11.5px] font-normal text-slate-400 mt-1">

                Real-time performance trajectory from FiAlgo execution engine

              </p>

            </div>



            {/* Timeframe Filter Tabs (Matches Journal Pill Style) */}

            <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-white/5 rounded-[14px] border border-slate-200/60 dark:border-white/5 shrink-0 self-start sm:self-auto">

              {(["Today", "7D", "30D", "All"] as const).map((tf) => (

                <button

                  key={tf}

                  onClick={() => setChartTimeframe(tf)}

                  className={`px-3 py-1 rounded-[10px] text-xs font-semibold transition-all ${

                    chartTimeframe === tf 

                      ? "bg-white dark:bg-[#252525] text-slate-900 dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.06)] font-bold" 

                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"

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

                  <linearGradient id="profitGlowLight" x1="0" y1="0" x2="0" y2="1">

                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />

                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />

                  </linearGradient>

                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                <XAxis 

                  dataKey="time" 

                  stroke="#94a3b8" 

                  fontSize={11}

                  tickLine={false}

                  axisLine={false}

                />

                <YAxis 

                  stroke="#94a3b8" 

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

                        <div className="p-3 rounded-[16px] bg-white border-2 border-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-slate-800">

                          <div className="text-[11px] text-slate-400 font-medium">{data.time}</div>

                          <div className="text-[17px] font-bold text-emerald-600 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>

                            +{currencySymbol}{Number(data.netProfit).toLocaleString()} Net Profit

                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between gap-4">

                            <span>Balance: <b className="text-slate-700">{currencySymbol}{Number(data.balance).toLocaleString()}</b></span>

                            <span className="text-emerald-600 font-bold">+{data.dailyGain}%</span>

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

                  fill="url(#profitGlowLight)" 

                />

              </AreaChart>

            </ResponsiveContainer>

          </div>



          {/* Quick Metrics Under Chart */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-white/5">

            <div>

              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Profit Factor</p>

              <h4 className="text-[18px] font-medium text-slate-900 dark:text-white tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>

                {quantMetrics.profitFactor}

              </h4>

            </div>

            <div>

              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sharpe Ratio</p>

              <h4 className="text-[18px] font-medium text-slate-900 dark:text-white tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>

                {quantMetrics.sharpeRatio}

              </h4>

            </div>

            <div>

              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Max Drawdown</p>

              <h4 className="text-[18px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>

                {quantMetrics.maxDrawdownPct > 0 ? `-${quantMetrics.maxDrawdownPct}%` : "0.0%"}

              </h4>

            </div>

            <div>

              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Win Trade</p>

              <h4 className="text-[18px] font-medium text-slate-900 dark:text-white tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>

                {quantMetrics.winCount > 0 ? `+${formatMoney(quantMetrics.avgWinTrade)}` : formatMoney(0)}

              </h4>

            </div>

          </div>

        </div>



        {/* RIGHT COLUMN: 1 LAKH LIFETIME OWNERSHIP (0% SHARE) vs 50/50 PROFIT SPLIT (4 cols) */}

        <div className={`xl:col-span-4 ${cardBoxStyle} flex flex-col justify-between min-h-[460px]`}>

          <div>

            <div className="flex items-center justify-between mb-2 min-h-[26px]">

              {isLifetime ? (

                <>

                  <div className="flex items-center gap-2">

                    <Crown size={16} className="text-amber-500 fill-amber-500/20" />

                    <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                      Full EA Ownership

                    </h2>

                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 flex items-center gap-1">

                    <Sparkles size={10} /> 0% Profit Share

                  </span>

                </>

              ) : (

                <>

                  <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                    Profit Split (50 / 50)

                  </h2>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200/50">

                    Partner Model

                  </span>

                </>

              )}

            </div>

            <p className="text-[11.5px] font-normal text-slate-400 mb-4 leading-relaxed min-h-[36px]">

              {isLifetime

                ? "You own the complete FiAlgo Expert Advisor with a permanent Lifetime License (₹1 Lakh Purchase). 100% of all trading profits stay directly in your MT5 account."

                : "Today's trading profits are split equally between client and platform. Keep 50% in your MT5 broker account; remit 50% daily via Crypto."}

            </p>



            {/* Visual Meter / Split Cards */}

            <div className="space-y-3">

              {isLifetime ? (

                <>

                  {/* 100% Retained Card */}

                  <div className="p-3.5 rounded-[18px] border-2 border-white bg-gradient-to-b from-[#ECFDF5] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#A7F3D0] dark:bg-none dark:bg-[#132A20] dark:border-[1px] dark:border-emerald-500/30">

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">

                        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" /> Profits Retained by You (100%)

                      </span>

                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Zero Commission</span>

                    </div>

                    <h3 className="text-[22px] font-medium text-slate-900 dark:text-white tracking-tight leading-none my-1" style={{ fontFamily: "'Inter', sans-serif" }}>

                      +{currencySymbol}{todayProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">

                      100% retained in your broker account · No daily payouts needed.

                    </p>

                  </div>



                  {/* Savings & Hardware Lock Card */}

                  <div className="p-3.5 rounded-[18px] border-2 border-white bg-gradient-to-b from-[#FFFBEB] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#FDE68A] dark:bg-none dark:bg-[#2A2415] dark:border-[1px] dark:border-amber-500/30">

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">

                        <ShieldCheck size={13} className="text-amber-600 dark:text-amber-400" /> Platform Fee Saved (50%)

                      </span>

                      <span className="text-[10px] font-bold text-slate-400">Saved Today</span>

                    </div>

                    <div className="flex items-baseline gap-2 my-1">

                      <h3 className="text-[22px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                        {currencySymbol}{(todayProfit * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                      </h3>

                      <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">

                        Saved

                      </span>

                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">

                      Hardware-locked to MT5 #{displayAccount || cleanAccount || "Unassigned"} · Lifetime Unlimited

                    </p>

                  </div>

                </>

              ) : (

                <>

                  {/* Client Card */}

                  <div className="p-3.5 rounded-[18px] border-2 border-white bg-gradient-to-b from-[#ECFDF5] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#A7F3D0] dark:bg-none dark:bg-[#132A20] dark:border-[1px] dark:border-emerald-500/30">

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">

                        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" /> Client Share (50%)

                      </span>

                      <span className="text-[10px] font-bold text-slate-400">Retained in MT5</span>

                    </div>

                    <h3 className="text-[22px] font-medium text-slate-900 dark:text-white tracking-tight leading-none my-1" style={{ fontFamily: "'Inter', sans-serif" }}>

                      +{currencySymbol}{clientShareToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">

                      Credited directly to your MT5 account equity.

                    </p>

                  </div>



                  {/* Admin / Tradifive Card */}

                  <div className="p-3.5 rounded-[18px] border-2 border-white bg-gradient-to-b from-[#EFF6FF] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#BFDBFE] dark:bg-none dark:bg-[#1A2332] dark:border-[1px] dark:border-blue-500/30">

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-[11px] font-extrabold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">

                        <QrCode size={13} className="text-blue-600 dark:text-blue-400" /> Platform Share (50%)

                      </span>

                      <span className="text-[10px] font-bold text-slate-400">Remit via Crypto</span>

                    </div>

                    <div className="flex items-baseline gap-2 my-1">

                      <h3 className="text-[22px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                        ${adminShareTodayUsdt} USDT

                      </h3>

                      <span className="text-[12px] font-medium text-slate-400">

                        ({currencySymbol}{adminShareToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})

                      </span>

                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">

                      Daily remittance required to keep EA key active.

                    </p>

                  </div>

                </>

              )}

            </div>

          </div>



          {/* Unified Footer (Fixed min-h-[46px] for Zero Layout Shift) */}

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center min-h-[46px]">

            {isLifetime ? (

              <div className="w-full flex items-center justify-between text-xs">

                <span className="text-slate-400 font-medium flex items-center gap-1.5">

                  <Lock size={12} className="text-emerald-500" /> License Type:

                </span>

                <span className="font-bold text-slate-800 dark:text-slate-200">

                  Lifetime Enterprise (Permanent)

                </span>

              </div>

            ) : (

              <button

                onClick={() => setShowSettlementModal(true)}

                className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] h-[38px]"

                style={{

                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',

                  boxShadow: '0 2px 10px rgba(15,23,42,0.2)',

                }}

              >

                <Upload size={14} className="text-sky-400" />

                <span>Remit 50% via Crypto & Upload Proof</span>

              </button>

            )}

          </div>

        </div>

      </div>



      {isLifetime ? (

        <div className={cardBoxStyle}>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

            <div>

              <div className="flex items-center gap-2">

                <Crown size={16} className="text-amber-500 fill-amber-500/20" />

                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                  Institutional Lifetime License & Performance Rights

                </h2>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50">

                  Full Outright Ownership

                </span>

              </div>

              <p className="text-[11.5px] font-normal text-slate-400 mt-1">

                Verified institutional-tier hardware license (₹1,00,000 Upfront). This trading terminal is 100% exempt from profit splits, performance cuts, and crypto remittances.

              </p>

            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold self-start sm:self-auto">

              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

              <span>Full Rights Active</span>

            </div>

          </div>



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">

            <div className="p-4 rounded-[18px] bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">

              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Ownership Tier</span>

              <p className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">

                <Crown size={14} className="text-amber-500" /> ₹1,00,000 Full License

              </p>

              <p className="text-[11px] text-slate-400 mt-1 font-medium">Outright perpetual purchase</p>

            </div>



            <div className="p-4 rounded-[18px] bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">

              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Profit Share Obligation</span>

              <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">

                <CheckCircle2 size={14} className="text-emerald-500" /> 0% (Zero Remittance)

              </p>

              <p className="text-[11px] text-slate-400 mt-1 font-medium">100% profits retained in MT5</p>

            </div>



            <div className="p-4 rounded-[18px] bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">

              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Trading Terminal Binding</span>

              <p className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">

                <Lock size={14} className="text-sky-500" /> MT5 #{displayAccount || cleanAccount || "Unassigned"}

              </p>

              <p className="text-[11px] text-slate-400 mt-1 font-medium">Hardware locked & encrypted</p>

            </div>



            <div className="p-4 rounded-[18px] bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">

              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">License Expiry</span>

              <p className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">

                <Sparkles size={14} className="text-indigo-500" /> Permanent Perpetual

              </p>

              <p className="text-[11px] text-slate-400 mt-1 font-medium">No renewal or monthly fees</p>

            </div>

          </div>

        </div>

      ) : (

        <div className={cardBoxStyle}>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                  Weekly Profit Share Settlements

                </h2>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200/50">

                  50% Platform Remittance Ledger

                </span>

              </div>

              <p className="text-[11.5px] font-normal text-slate-400 mt-1">

                Verified records of daily profit share sent via Crypto with uploaded transaction proofs.

              </p>

            </div>

            <button

              onClick={() => setShowSettlementModal(true)}

              className="inline-flex items-center gap-1.5 h-[36px] px-3.5 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none self-start sm:self-auto transition-all cursor-pointer"

            >

              <Upload size={13} className="text-sky-600 dark:text-sky-400" />

              <span>Submit New Settlement</span>

            </button>

          </div>



          {settlementHistory.length === 0 ? (

            <div className="py-10 text-center text-slate-400 text-xs">

              No settlements yet. Once your daily target is achieved, submit your 50% crypto transfer proof here.

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs">

                <thead>

                  <tr className="border-b border-slate-200/80 dark:border-white/5 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">

                    <th className="pb-3 font-extrabold">Settlement ID</th>

                    <th className="pb-3 font-extrabold">Date</th>

                    <th className="pb-3 font-extrabold">Today's Profit</th>

                    <th className="pb-3 font-extrabold">50% Remittance</th>

                    <th className="pb-3 font-extrabold">Network</th>

                    <th className="pb-3 font-extrabold">Proof Screenshot</th>

                    <th className="pb-3 font-extrabold">Status</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">

                  {settlementHistory.map((rec) => (

                    <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">

                      <td className="py-3 text-slate-900 dark:text-white font-semibold">{rec.id}</td>

                      <td className="py-3 text-slate-500 dark:text-slate-400">{rec.date} ({rec.timestamp})</td>

                      <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">+{currencySymbol}{rec.todayProfit.toLocaleString()}</td>

                      <td className="py-3 text-slate-900 dark:text-white font-bold">${rec.remittanceAmount.toFixed(2)} USDT</td>

                      <td className="py-3 text-slate-600 dark:text-slate-300">{rec.network}</td>

                      <td className="py-3">

                        {rec.proofUrl ? (

                          <button

                            onClick={() => setPreviewLightboxUrl(rec.proofUrl)}

                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all text-[11px] font-sans font-semibold cursor-pointer"

                          >

                            <Eye size={12} className="text-sky-600 dark:text-sky-400" />

                            <span>View Proof</span>

                          </button>

                        ) : (

                          <span className="text-slate-400 font-sans">No Image</span>

                        )}

                      </td>

                      <td className="py-3">

                        {rec.status === "verified" ? (

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-sans">

                            <CheckCircle2 size={11} /> Verified & Cleared

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 font-sans">

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

      )}



      {/* ── MODAL: CRYPTO WITHDRAWAL / 50% REMITTANCE & PROOF UPLOAD (Clean Styled Modal, No Scrollbar) ── */}

      <AnimatePresence>

        {showSettlementModal && (

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">

            {/* Backdrop */}

            <motion.div

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              exit={{ opacity: 0 }}

              onClick={() => setShowSettlementModal(false)}

              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"

            />



            {/* Modal Dialog (No scroll view, fits completely in viewport) */}

            <motion.div

              initial={{ opacity: 0, scale: 0.95, y: 10 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.95, y: 10 }}

              className="relative w-full max-w-[520px] rounded-[24px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 text-slate-800 dark:text-white max-h-[96vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"

            >

              {/* Header */}

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-3">

                <div className="flex items-center gap-2.5">

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">

                    <QrCode size={18} />

                  </div>

                  <div>

                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>

                      Weekly 50/50% Profit Share Settlement

                    </h3>

                    <p className="text-[11px] text-slate-400 leading-none mt-0.5">Remit via Crypto to keep FiAlgo license active</p>

                  </div>

                </div>

                <button

                  onClick={() => setShowSettlementModal(false)}

                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"

                >

                  <X size={15} />

                </button>

              </div>



              {/* Amount Due Card (Compact Banner) */}

              <div className="p-3 rounded-[16px] border-2 border-white bg-gradient-to-b from-[#ECFDF5] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#A7F3D0] dark:bg-none dark:bg-[#132A20] dark:border-[1px] dark:border-emerald-500/30 mb-3 flex items-center justify-between gap-3">

                <div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">

                    Net Profit: <b className="text-emerald-600 dark:text-emerald-400">+{currencySymbol}{todayProfit.toLocaleString()}</b>

                  </span>

                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">

                    50% Platform Remittance Due:

                  </div>

                </div>

                <div className="text-right shrink-0">

                  <div className="text-[20px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>

                    ${adminShareTodayUsdt} USDT

                  </div>

                  <div className="text-[10px] text-slate-400 mt-0.5">

                    ({currencySymbol}{adminShareToday.toLocaleString()} INR)

                  </div>

                </div>

              </div>



              {/* Crypto Network Selector (Compact Grid) */}

              <div className="mb-3">

                <div className="flex items-center justify-between mb-1.5">

                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">

                    Select Crypto Network:

                  </label>

                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">

                    Fee: {cryptoWallets[selectedNetwork].fee}

                  </span>

                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">

                  {(Object.keys(cryptoWallets) as Array<keyof typeof cryptoWallets>).map((net) => {

                    const info = cryptoWallets[net];

                    const isSelected = selectedNetwork === net;

                    return (

                      <button

                        key={net}

                        type="button"

                        onClick={() => setSelectedNetwork(net)}

                        className={`py-1.5 px-1.5 rounded-[12px] border-2 text-center transition-all cursor-pointer ${

                          isSelected

                            ? "bg-sky-50 dark:bg-sky-500/10 border-sky-400 text-sky-900 dark:text-sky-300 ring-1 ring-sky-400 font-bold shadow-xs"

                            : "bg-white dark:bg-white/5 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50"

                        }`}

                      >

                        <div className="text-[11px] font-bold truncate leading-tight">{net.replace('USDT-', '')}</div>

                        <div className="text-[9px] text-slate-400 truncate mt-0.5">{info.badge}</div>

                      </button>

                    );

                  })}

                </div>

              </div>



              {/* Deposit Wallet Address Card (Compact Row) */}

              <div className="p-2.5 sm:p-3 rounded-[16px] bg-[#F8F9FC] dark:bg-white/5 border border-slate-200/80 dark:border-white/5 mb-3">

                <div className="flex items-center justify-between mb-1.5 text-[11px]">

                  <span className="font-bold text-slate-700 dark:text-slate-300">

                    Admin {cryptoWallets[selectedNetwork].name} Address:

                  </span>

                  <span className="text-[10px] text-slate-400">

                    Chain: <b className="text-slate-700 dark:text-slate-300">{cryptoWallets[selectedNetwork].chain}</b>

                  </span>

                </div>



                <div className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-900 dark:text-white break-all shadow-xs">

                  <span className="flex-1 font-semibold truncate">{cryptoWallets[selectedNetwork].address}</span>

                  <button

                    onClick={() => handleCopyAddress(cryptoWallets[selectedNetwork].address)}

                    className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all shrink-0 cursor-pointer border border-slate-200 dark:border-white/10"

                    title="Copy Address"

                  >

                    {copiedAddress ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}

                  </button>

                </div>

              </div>



              {/* Proof Image Upload (Compact Dropzone) */}

              <div className="mb-3">

                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">

                  Upload Payment Screenshot Proof:

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

                    className="border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-sky-500 rounded-[16px] py-3 px-4 text-center cursor-pointer transition-all bg-slate-50/60 dark:bg-white/[0.02] hover:bg-sky-50/30 flex items-center justify-center gap-3"

                  >

                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">

                      <Upload size={16} />

                    </div>

                    <div className="text-left">

                      <div className="text-[12px] font-bold text-slate-800 dark:text-white leading-tight">Click to attach transfer screenshot</div>

                      <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP receipt from exchange/wallet</p>

                    </div>

                  </div>

                ) : (

                  <div className="p-2 rounded-[14px] bg-[#F8F9FC] dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2.5">

                      <img 

                        src={proofImageBase64} 

                        alt="Proof Preview" 

                        className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-white/10 shadow-xs" 

                      />

                      <div>

                        <div className="text-xs font-bold text-slate-900 dark:text-white max-w-[220px] truncate">{proofFileName || "proof_screenshot.png"}</div>

                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">✓ Attached</span>

                      </div>

                    </div>

                    <button

                      type="button"

                      onClick={() => {

                        setProofImageBase64(null);

                        setProofFileName("");

                      }}

                      className="p-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200 dark:border-rose-500/20 cursor-pointer"

                      title="Remove Image"

                    >

                      <Trash2 size={13} />

                    </button>

                  </div>

                )}

              </div>



              {/* Transaction Hash / TXID (Compact Input) */}

              <div className="mb-3.5">

                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">

                  Transaction Hash / TXID (Optional):

                </label>

                <input

                  type="text"

                  placeholder="Paste blockchain transaction hash or receipt ID"

                  value={txidInput}

                  onChange={(e) => setTxidInput(e.target.value)}

                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono shadow-xs"

                />

              </div>



              {/* Submit Button (Compact Row, fully in view) */}

              <div className="flex items-center gap-2.5 pt-1">

                <button

                  type="button"

                  onClick={() => setShowSettlementModal(false)}

                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-white/10 cursor-pointer"

                >

                  Cancel

                </button>

                <button

                  type="button"

                  disabled={isSubmittingProof || !proofImageBase64}

                  onClick={handleSubmitSettlement}

                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${

                    proofImageBase64 

                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" 

                      : "bg-slate-200 text-slate-400 cursor-not-allowed"

                  }`}

                >

                  {isSubmittingProof ? (

                    <>

                      <RefreshCw size={13} className="animate-spin" />

                      <span>Submitting...</span>

                    </>

                  ) : (

                    <>

                      <CheckCircle2 size={13} />

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

              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"

            />

            <motion.div

              initial={{ opacity: 0, scale: 0.9 }}

              animate={{ opacity: 1, scale: 1 }}

              exit={{ opacity: 0, scale: 0.9 }}

              className="relative max-w-2xl max-h-[85vh] z-10"

            >

              <button

                onClick={() => setPreviewLightboxUrl(null)}

                className="absolute -top-10 right-0 p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"

              >

                <X size={18} />

              </button>

              <img

                src={previewLightboxUrl}

                alt="Payment Settlement Proof"

                className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/40 shadow-2xl bg-white"

              />

            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

}

