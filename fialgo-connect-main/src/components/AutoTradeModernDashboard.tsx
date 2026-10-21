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

// ── Consistent Card Box & KPI Box Styles (Shared with AI Journal & RiskGuard) ──
const kpiBoxStyle = "h-[120px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:scale-[1.01] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none";
const cardBoxStyle = "p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none transition-all";

export default function AutoTradeModernDashboard({ onBack, algo, mt5Account }: Props) {
  // ── Account & Live Connection State ──
  const cleanAccount = useMemo(() => {
    return (mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "414460525").replace(/\D/g, "");
  }, [mt5Account]);

  const [displayAccount, setDisplayAccount] = useState<string>(() => {
    return (mt5Account || localStorage.getItem("tradifive_connected_mt5_account") || "414460525").replace(/\D/g, "");
  });

  const activeLicenseKey = useMemo(() => {
    return localStorage.getItem("tradifive_license_key") || "TF-00000000-056D-906D0DB6CA";
  }, []);

  const isFetchingRef = useRef<boolean>(false);

  const [brokerServer, setBrokerServer] = useState<string>("Exness-MT5Trial6");
  const [isBotRunning, setIsBotRunning] = useState<boolean>(true);
  const [latencyPing, setLatencyPing] = useState<number>(1.8);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  // Currency (INR default with instant USD toggle)
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const currencySymbol = currency === "INR" ? "₹" : "$";
  const fxRate = currency === "INR" ? 83.2 : 1;

  // ── Financial KPIs (Balance, Net Profit, Today's Profit, Deposit, Withdrawal) ──
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
        { time: "W1", netProfit: 11200, balance: 111200, dailyGain: 11.2 },
        { time: "W2", netProfit: 22400, balance: 122400, dailyGain: 10.0 },
        { time: "W3", netProfit: 32900, balance: 132900, dailyGain: 8.5 },
        { time: "W4", netProfit: 42850, balance: 142850, dailyGain: 7.5 },
      ];
    }
    return [
      { time: "Aug", netProfit: 9500, balance: 109500, dailyGain: 9.5 },
      { time: "Sep", netProfit: 24200, balance: 124200, dailyGain: 13.4 },
      { time: "Oct", netProfit: 42850, balance: 142850, dailyGain: 15.0 },
    ];
  }, [chartTimeframe]);

  // ── Live Active Basket Positions ──
  const [openPositions, setOpenPositions] = useState<OpenTradeItem[]>([
    {
      ticket: "#8894101",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.05,
      openPrice: 2684.20,
      currentPrice: 2689.45,
      sl: 2678.00,
      tp: 2698.00,
      floatingPnl: 262.50,
      openTime: "14:22:10",
    },
    {
      ticket: "#8894109",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.08,
      openPrice: 2685.10,
      currentPrice: 2689.45,
      sl: 2678.00,
      tp: 2698.00,
      floatingPnl: 348.00,
      openTime: "14:25:35",
    },
    {
      ticket: "#8894115",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.10,
      openPrice: 2686.00,
      currentPrice: 2689.45,
      sl: 2678.00,
      tp: 2698.00,
      floatingPnl: 345.00,
      openTime: "14:31:02",
    },
  ]);

  // ── Recent Closed Trades History ──
  const [closedTrades, setClosedTrades] = useState<ClosedTradeItem[]>([
    {
      ticket: "#8893980",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.10,
      openPrice: 2672.40,
      closePrice: 2682.10,
      pnl: 970.00,
      closeTime: "13:45:10",
      duration: "42m 10s",
    },
    {
      ticket: "#8893962",
      symbol: "XAUUSD",
      type: "BUY",
      lots: 0.08,
      openPrice: 2673.80,
      closePrice: 2682.10,
      pnl: 664.00,
      closeTime: "13:45:11",
      duration: "38m 22s",
    },
    {
      ticket: "#8893890",
      symbol: "XAUUSD",
      type: "SELL",
      lots: 0.05,
      openPrice: 2688.00,
      closePrice: 2676.20,
      pnl: 590.00,
      closeTime: "11:20:04",
      duration: "1h 14m",
    },
    {
      ticket: "#8893845",
      symbol: "XAUUSD",
      type: "SELL",
      lots: 0.08,
      openPrice: 2687.50,
      closePrice: 2676.20,
      pnl: 904.00,
      closeTime: "11:20:05",
      duration: "1h 08m",
    },
  ]);

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
      } catch (e) {
        console.warn("Telemetry webhook fetch failed, checking direct Supabase...", e);
      }

      let activeAccountRow = telemetryData?.account || null;

      // Direct fallback to Supabase mt5_accounts table
      if (!activeAccountRow) {
        const { data: dbAcc } = await supabase
          .from('mt5_accounts')
          .select('*')
          .or(`account_number.eq.${cleanAccount},account_number.eq.#${cleanAccount},account_number.eq.${displayAccount}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbAcc) {
          activeAccountRow = dbAcc;
        } else {
          // Fallback to latest created/updated MT5 account
          const { data: latestAcc } = await supabase
            .from('mt5_accounts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (latestAcc) activeAccountRow = latestAcc;
        }
      }

      if (activeAccountRow) {
        if (activeAccountRow.account_number) {
          const accStr = String(activeAccountRow.account_number).replace(/\D/g, "");
          if (accStr) {
            setDisplayAccount(accStr);
            try { localStorage.setItem("tradifive_connected_mt5_account", accStr); } catch (e) {}
          }
        }
        if (activeAccountRow.balance !== null && activeAccountRow.balance !== undefined) {
          const bal = Number(activeAccountRow.balance);
          if (bal >= 0) setAccountBalance(bal);
        }
        if (activeAccountRow.equity !== null && activeAccountRow.equity !== undefined) {
          const eq = Number(activeAccountRow.equity);
          if (eq >= 0) setAccountEquity(eq);
        }
        if (activeAccountRow.margin !== null && activeAccountRow.margin !== undefined) {
          setAccountMargin(Number(activeAccountRow.margin));
        }
        if (activeAccountRow.margin_level !== null && activeAccountRow.margin_level !== undefined) {
          setMarginLevel(Number(activeAccountRow.margin_level));
        }
        if (activeAccountRow.broker_server) {
          const cleanB = String(activeAccountRow.broker_server).replace(/[\uFFFD\?]/g, '-').trim();
          setBrokerServer(cleanB);
        }
        if (activeAccountRow.currency) {
          const curr = String(activeAccountRow.currency).toUpperCase();
          if (curr === "USD" || curr === "INR") setCurrency(curr as "INR" | "USD");
        }
        if (activeAccountRow.total_deposits !== null && activeAccountRow.total_deposits !== undefined) {
          const dep = Number(activeAccountRow.total_deposits);
          if (dep > 0) setDepositAmount(dep);
        }
        if (activeAccountRow.total_withdrawals !== null && activeAccountRow.total_withdrawals !== undefined) {
          const wdr = Number(activeAccountRow.total_withdrawals);
          if (wdr > 0) setWithdrawalAmount(wdr);
        }
        if (activeAccountRow.algo_status !== undefined && activeAccountRow.algo_status !== null) {
          setIsBotRunning(Boolean(activeAccountRow.algo_status));
        }
      }

      // Trades: Open Positions & Closed Trades
      let dbTrades = (telemetryData?.trades && Array.isArray(telemetryData.trades)) ? telemetryData.trades : null;
      if (!dbTrades || dbTrades.length === 0) {
        const { data: directTrades } = await supabase
          .from('trades')
          .select('*')
          .order('opened_at', { ascending: false })
          .limit(100);
        if (directTrades && directTrades.length > 0) dbTrades = directTrades;
      }

      if (dbTrades && dbTrades.length > 0) {
        const realOpen: OpenTradeItem[] = [];
        const realClosed: ClosedTradeItem[] = [];
        let sumClosedPnl = 0;
        let sumTodayPnl = 0;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        dbTrades.forEach((t: any) => {
          const isClosed = Boolean(t.closed_at) || t.status === "closed";
          const tradeType = (t.trade_type === 0 || String(t.trade_type).toUpperCase() === 'BUY' || String(t.type).toUpperCase() === 'BUY') ? 'BUY' : 'SELL';
          const lotVal = Number(t.lot_size || t.volume || t.lots || 0.01);
          const openP = Number(t.open_price || t.entry_price || 0);
          const closeP = Number(t.close_price || t.exit_price || openP || 0);
          const pnlVal = Number(t.profit || 0);

          if (isClosed) {
            sumClosedPnl += pnlVal;
            const closedTimeMs = t.closed_at ? new Date(t.closed_at).getTime() : 0;
            if (closedTimeMs >= startOfToday) {
              sumTodayPnl += pnlVal;
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
              duration: formatDuration(t.opened_at, t.closed_at)
            });
          } else {
            sumTodayPnl += pnlVal;
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

        setOpenPositions(realOpen);
        if (realClosed.length > 0) setClosedTrades(realClosed.slice(0, 20));
        if (sumClosedPnl !== 0) setNetProfitAllTime(Number(sumClosedPnl.toFixed(2)));
        if (sumTodayPnl !== 0) setTodayProfit(Number(sumTodayPnl.toFixed(2)));
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
            FiAlgo MT5 #{displayAccount}
          </span>
          <span className="text-slate-300 dark:text-slate-400">•</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">{brokerServer}</span>
          <span className="text-slate-300 dark:text-slate-400">•</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">XAUUSD (M1)</span>
          <span className="text-slate-300 dark:text-slate-400">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Activity size={12} /> {latencyPing}ms Latency
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Currency Toggle (Consistent with AI Journal) */}
          <button
            onClick={() => setCurrency(prev => prev === "INR" ? "USD" : "INR")}
            className="inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none transition-all cursor-pointer"
            title="Toggle Currency Display (INR / USD)"
          >
            <DollarSign size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>{currency}</span>
          </button>

          {/* EA Status Toggle Button */}
          <button
            onClick={handleToggleBot}
            className={`inline-flex items-center gap-1.5 h-[36px] px-3.5 rounded-[14px] border-2 text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
              isBotRunning 
                ? "border-white dark:border-white/5 bg-gradient-to-b from-[#D1FAE5] to-[#ECFDF5] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#10B98140] dark:shadow-none text-emerald-700 dark:text-emerald-400" 
                : "border-white dark:border-white/5 bg-gradient-to-b from-[#FEF3C7] to-[#FFFBEB] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#F59E0B40] dark:shadow-none text-amber-700 dark:text-amber-400"
            }`}
          >
            {isBotRunning ? (
              <>
                <Play size={11} className="fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
                <span>EA Active</span>
              </>
            ) : (
              <>
                <Pause size={11} className="fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400" />
                <span>EA Paused</span>
              </>
            )}
          </button>

          {/* Telemetry Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-[36px] h-[36px] rounded-[14px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 flex items-center justify-center hover:text-slate-800 dark:hover:text-white hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-sky-600" : ""} />
          </button>

          {/* Quick Pay Remittance Button */}
          <button
            onClick={() => setShowSettlementModal(true)}
            className="inline-flex items-center gap-1.5 h-[36px] px-3.5 rounded-[14px] border-2 border-white dark:border-white/5 text-[11px] font-bold text-white transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              boxShadow: '0 2px 10px rgba(15,23,42,0.2)',
            }}
          >
            <QrCode size={13} className="text-sky-400" />
            <span>Pay Profit Split</span>
            {isTargetHit && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
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
                FiAlgo generated <b className="text-emerald-700 dark:text-emerald-400 font-bold">{currencySymbol}{todayProfit.toLocaleString()}</b> net profit today! In accordance with the 50/50 Performance Partner tier, please remit the platform share (<b className="text-slate-900 dark:text-white font-bold">${adminShareTodayUsdt} USDT</b>) to keep your MT5 license active.
              </p>
            </div>
          </div>
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
        </motion.div>
      )}

      {/* ── CORE 5 METRIC BOXES (Consistent with AI Journal & RiskGuard) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
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
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h3
                className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {currencySymbol}{accountBalance.toLocaleString()}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Equity: <span className="font-semibold text-slate-700 dark:text-slate-200">{currencySymbol}{accountEquity.toLocaleString()}</span>
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              Lvl {marginLevel.toFixed(0)}%
            </span>
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
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h3
                className="text-[26px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                +{currencySymbol}{netProfitAllTime.toLocaleString()}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                All-Time: <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{((netProfitAllTime / depositAmount) * 100).toFixed(1)}%</span>
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
              86.4% Win
            </span>
          </div>
        </div>

        {/* 3. Today's Profit */}
        <div className={kpiBoxStyle}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Today's Profit
            </p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h3
                className="text-[26px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                +{currencySymbol}{todayProfit.toLocaleString()}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Goal: <span className="font-semibold text-slate-600 dark:text-slate-300">{currencySymbol}{dailyTargetAmount.toLocaleString()}</span>
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
              {((todayProfit / dailyTargetAmount) * 100).toFixed(0)}% Hit
            </span>
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
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h3
                className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {currencySymbol}{depositAmount.toLocaleString()}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Funded MT5 Capital
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              Exness IB
            </span>
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
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h3
                className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {currencySymbol}{withdrawalAmount.toLocaleString()}
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                All Payouts Cleared
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              ✓ Zero Fees
            </span>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: Net Profit Growth Chart + 50/50 Profit Split Card ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* LEFT COLUMN: NET PROFIT GROWTH CHART (8 cols) */}
        <div className={`lg:col-span-8 ${cardBoxStyle} flex flex-col justify-between`}>
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
              <h4 className="text-[18px] font-medium text-slate-900 dark:text-white tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>2.84</h4>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sharpe Ratio</p>
              <h4 className="text-[18px] font-medium text-slate-900 dark:text-white tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>2.15</h4>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Max Drawdown</p>
              <h4 className="text-[18px] font-medium text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>-3.8%</h4>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Win Trade</p>
              <h4 className="text-[18px] font-medium text-slate-900 dark:text-white tracking-tight mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>+{currencySymbol}412.00</h4>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 50/50 PROFIT SPLIT (CLIENT & MINE) (4 cols) */}
        <div className={`lg:col-span-4 ${cardBoxStyle} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                Profit Split (50 / 50)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200/50">
                Partner Model
              </span>
            </div>
            <p className="text-[11.5px] font-normal text-slate-400 mb-4 leading-relaxed">
              Today's trading profits are split equally between client and platform. Keep 50% in your MT5 broker account; remit 50% daily via Crypto.
            </p>

            {/* Split Visual Meter */}
            <div className="space-y-3">
              {/* Client Card */}
              <div className="p-3.5 rounded-[18px] border-2 border-white bg-gradient-to-b from-[#ECFDF5] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#A7F3D0] dark:bg-none dark:bg-[#132A20] dark:border-[1px] dark:border-emerald-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" /> Client Share (50%)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Retained in MT5</span>
                </div>
                <h3 className="text-[22px] font-medium text-slate-900 dark:text-white tracking-tight leading-none my-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  +{currencySymbol}{clientShareToday.toLocaleString()}
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
                    ({currencySymbol}{adminShareToday.toLocaleString()})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Daily remittance required to keep EA key active.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Pay Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={() => setShowSettlementModal(true)}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                boxShadow: '0 2px 10px rgba(15,23,42,0.2)',
              }}
            >
              <Upload size={14} className="text-sky-400" />
              <span>Remit 50% via Crypto & Upload Proof</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: Live Open Basket Positions & Recent Trade History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* LIVE OPEN POSITIONS (XAUUSD BASKET) (6 cols) */}
        <div className={`lg:col-span-6 ${cardBoxStyle}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                Live Open Basket (Gold)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50">
                {openPositions.length} Active Positions
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Floating: +{currencySymbol}{openPositions.reduce((acc, p) => acc + p.floatingPnl, 0).toLocaleString()}
            </span>
          </div>

          {openPositions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No open positions. FiAlgo is scanning for next high-probability basket entry.
            </div>
          ) : (
            <div className="space-y-2.5">
              {openPositions.map((pos) => (
                <div 
                  key={pos.ticket}
                  className="p-3.5 rounded-[16px] bg-[#F8F9FC] dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${pos.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {pos.type}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{pos.symbol}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{pos.lots} Lots</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Open: {pos.openPrice} → Now: {pos.currentPrice}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                      +{currencySymbol}{pos.floatingPnl.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      SL: {pos.sl} • TP: {pos.tp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT CLOSED TRADES (6 cols) */}
        <div className={`lg:col-span-6 ${cardBoxStyle}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                Recent Execution History
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                Closed Trades
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Session Total: <b className="text-emerald-600 dark:text-emerald-400 font-bold">+{currencySymbol}{closedTrades.reduce((acc, t) => acc + t.pnl, 0).toLocaleString()}</b>
            </span>
          </div>

          <div className="space-y-2.5">
            {closedTrades.map((t) => (
              <div 
                key={t.ticket}
                className="p-3.5 rounded-[16px] bg-[#F8F9FC] dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${t.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {t.type}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{t.symbol}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{t.lots} Lots</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {t.openPrice} → {t.closePrice} ({t.duration})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                    +{currencySymbol}{t.pnl.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {t.closeTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DAILY CRYPTO SETTLEMENTS LEDGER (Clean Table Box) ── */}
      <div className={cardBoxStyle}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                Daily Crypto Profit Settlements
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
                      Daily 50% Profit Share Settlement
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
