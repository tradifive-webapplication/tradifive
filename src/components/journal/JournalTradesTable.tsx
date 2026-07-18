import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ChevronDown as IconlyChevronDown,
  Category as IconlyCategory,
  InfoSquare as IconlyInfoSquare,
  Send as IconlySend
} from "react-iconly";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, parseISO, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import { useMarket } from "@/contexts/MarketContext";
import { useTrading } from "@/contexts/TradingContext";

interface TradeRecord {
  id: string;
  ticket: string;
  symbol: string;
  profit: number;
  trade_type: number; // 0 = Buy, 1 = Sell
  lot_size: number;
  closed_at: string;
  created_at: string;
  is_pending?: boolean;

  open_price?: number;
  close_price?: number;
  entry_price?: number;
  exit_price?: number;
  stop_loss?: number;
  take_profit?: number;
  commission?: number;
  swap?: number;
  fee?: number;
  opened_at?: string;
  notes?: string | null;
  setup?: string | null;
  tags?: string[] | null;
}

interface AccountMetrics {
  balance: number;
  equity: number;
  broker_server: string;
  account_number: string;
}

const tickStyle = { fontSize: 10, fill: "#94a3b8", fontWeight: 500 };

// Helper to resolve flag emojis for currency pairs & assets
function getFlagIcon(symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (s.includes("XAU")) return "🇺🇸";
  if (s.includes("BTC")) return "🪙";
  if (s.includes("EUR")) return "🇪🇺";
  if (s.includes("GBP")) return "🇬🇧";
  if (s.includes("JPY")) return "🇯🇵";
  return "🏳️";
}

// Helper to format dates to match UTC style in mockup
function formatUTCDate(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";

  const pad = (n: number) => String(n).padStart(2, '0');
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const year = d.getUTCFullYear();

  let hours = d.getUTCHours();
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = pad(hours);

  return `${month}/${day}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}



interface JournalTradesTableProps {
  onTradeClick?: (trade: TradeRecord) => void;
}

export default function JournalTradesTable({ onTradeClick }: JournalTradesTableProps = {}) {
  const [activeTab, setActiveTab] = useState<"positions" | "pending" | "closed" | "alerts">("positions");
  const [plFilter, setPlFilter] = useState<"all" | "profit" | "loss">("all");
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null);
  const [isDataLoading, setIsLoading] = useState(true);
  const { formatMoney: fmtMoney, percentageOnly, hideBalance, hideOnlyBalance, isSettingsLoading } = useJournalSettings();
  const { activeMarket } = useMarket();
  const { isConnected } = useTrading();
  const isLoading = isDataLoading || isSettingsLoading;

  // Fetch real-time data from Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isConnected) {
          const mockRecentTrades: TradeRecord[] = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const profit = [120.00, -50.00, 310.50, 45.00, -110.00, 280.00, 845.50][i];
            return {
              id: `mock${i}`,
              ticket: `1000${i}`,
              symbol: activeMarket === 'indian' 
                ? ["NIFTY50", "BANKNIFTY", "RELIANCE", "HDFCBANK", "INFY", "TCS", "ITC"][i]
                : ["EURUSD", "GBPUSD", "XAUUSD", "US30", "NAS100", "XAUUSD", "XAUUSD"][i],
              profit: profit,
              trade_type: profit > 0 ? 0 : 1, // 0 Buy, 1 Sell
              lot_size: [1.5, 2.0, 1.0, 0.5, 0.8, 1.0, 2.5][i],
              closed_at: d.toISOString(),
              created_at: d.toISOString(),
              is_pending: false,
              notes: "Simulated trade execution."
            };
          });
          
          if (isMounted) {
            setTrades(mockRecentTrades);
            setMetrics({
              balance: 103240.75,
              equity: 103240.75,
              broker_server: "Simulated",
              account_number: "DEMO-123456"
            });
            setIsLoading(false);
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        // 1. Fetch mt5 metrics
        const { data: accountData } = await supabase
          .from('mt5_accounts')
          .select('balance, equity, broker_server, account_number')
          .eq('user_id', user.id)
          .maybeSingle();

        if (accountData && isMounted) {
          setMetrics(accountData);
        }

        // 2. Fetch completed trades
        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('closed_at', { ascending: false });

        if (tradesData && isMounted) {
          const finalTrades = tradesData;
          setTrades(finalTrades as TradeRecord[]);
        }
      } catch (err) {
        console.error("Failed to load real-time positions table:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    // Set up Realtime subscriptions for live dashboard synchronizations
    let channel: any = null;
    
    if (isConnected) {
      channel = supabase.channel('realtime-positions-table')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
          fetchData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mt5_accounts' }, () => {
          fetchData();
        })
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [isConnected]);

  // Calculate stats dynamically
  const balance = metrics?.balance || 0;
  const equity = metrics?.equity || 0;

  // Separate open, closed and pending positions
  const openPositions = trades.filter(t => !t.closed_at && !t.is_pending);
  const closedPositions = trades.filter(t => t.closed_at && !t.is_pending);
  const pendingOrders = trades.filter(t => t.is_pending);
  let displayTrades = activeTab === "positions" ? openPositions : activeTab === "closed" ? closedPositions : activeTab === "pending" ? pendingOrders : [];

  // Apply P/L Filter
  if (plFilter === "profit") {
    displayTrades = displayTrades.filter(t => Number(t.profit || 0) >= 0);
  } else if (plFilter === "loss") {
    displayTrades = displayTrades.filter(t => Number(t.profit || 0) < 0);
  }

  // Calculate overall cumulative Profit & Loss
  const profitAndLoss = trades.reduce((acc, t) => acc + Number(t.profit || 0), 0);

  const formatPnl = (pnl: number) => {
    let str = "";
    if (percentageOnly) {
      const denom = balance > 0 ? balance : 10000;
      str = `${pnl >= 0 ? "+" : ""}${((pnl / denom) * 100).toFixed(2)}%`;
    } else {
      str = fmtMoney(pnl, { showSign: true, raw: true });
    }
    return hideBalance ? <span className="blur-[5.5px] select-none opacity-50 transition-all duration-300">{str}</span> : str;
  };

  // Generate scatter data dynamically from real closed trades for the Recharts graph below
  const scatterData = closedPositions.map(t => {
    const profit = Number(t.profit);
    const openedTime = new Date(t.opened_at || t.created_at).getTime();
    const closedTime = new Date(t.closed_at!).getTime();
    const realDurationSeconds = Math.max(0, Math.floor((closedTime - openedTime) / 1000));
    return {
      dur: realDurationSeconds,
      pnl: profit
    };
  });

  const handleShareTrade = (ticket: string) => {
    navigator.clipboard.writeText(`FIALGO-TRADE-${ticket}`);
    toast.success(`Trade Ticket #${ticket} copied to clipboard! Ready to share.`);
  };

  return (
    <div className="space-y-6">
      <style>{`
        .amazing-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 6px;
        }
        .amazing-scrollbar::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .amazing-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .amazing-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 9999px;
        }
        .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        .dark .amazing-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .dark .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* 📊 Premium Live Trades & Positions Container Card */}
      <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] rounded-[22px] border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.002] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#CBD5E1] relative dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none">

        {/* Account Metrics Bar */}
        <div className="flex items-center space-x-12 px-6 py-4 bg-white/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Balance</span>
            {isLoading ? (
              <Skeleton className="h-[18px] w-20 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span className={`text-[13px] font-medium text-slate-900 dark:text-white tabular-nums ${hideBalance || hideOnlyBalance || percentageOnly ? 'blur-[5.5px] select-none opacity-50' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {fmtMoney(balance, { raw: true })}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Profit & Loss</span>
            {isLoading ? (
              <Skeleton className="h-[18px] w-16 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span className={`text-[13px] font-medium tabular-nums ${profitAndLoss >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {formatPnl(profitAndLoss)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Equity</span>
            {isLoading ? (
              <Skeleton className="h-[18px] w-20 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span className={`text-[13px] font-medium text-slate-900 dark:text-white tabular-nums ${hideBalance || hideOnlyBalance || percentageOnly ? 'blur-[5.5px] select-none opacity-50' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {fmtMoney(equity, { raw: true })}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Initial Margin</span>
            {isLoading ? (
              <Skeleton className="h-[18px] w-12 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span className={`text-[13px] font-medium text-slate-900 dark:text-white tabular-nums ${hideBalance || percentageOnly ? 'blur-[5.5px] select-none opacity-50' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {fmtMoney(0, { raw: true })}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Available Funds</span>
            {isLoading ? (
              <Skeleton className="h-[18px] w-20 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span className={`text-[13px] font-medium text-slate-900 dark:text-white tabular-nums ${hideBalance || hideOnlyBalance || percentageOnly ? 'blur-[5.5px] select-none opacity-50' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {fmtMoney(equity, { raw: true })}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              Margin Level <IconlyInfoSquare set="curved" primaryColor="currentColor" size={11} stroke="bold" className="text-slate-400 dark:text-slate-400" />
            </span>
            {isLoading ? (
              <Skeleton className="h-[18px] w-8 bg-slate-200 dark:bg-white/10 rounded" />
            ) : (
              <span className={`text-[13px] font-medium text-slate-900 dark:text-white tabular-nums ${hideBalance || percentageOnly ? 'blur-[5.5px] select-none opacity-50' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {"\u221E"}
              </span>
            )}
          </div>
        </div>

        {/* cTrader Style Tab Bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/10">
          <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar w-full">
            <button
              onClick={() => setActiveTab("positions")}
              className={`flex items-center gap-2 text-[12px] font-bold pb-3 shrink-0 transition-colors border-b-2 ${activeTab === "positions" ? "text-slate-900 dark:text-white border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-500"
                }`}
            >
              Positions <span className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] inline-flex items-center justify-center min-w-[20px] min-h-[16px]">
                {isLoading ? (
                  <Skeleton className="h-2 w-4 bg-slate-300 dark:bg-white/20 rounded" />
                ) : (
                  openPositions.length
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 text-[12px] font-bold pb-3 shrink-0 transition-colors border-b-2 ${activeTab === "pending" ? "text-slate-900 dark:text-white border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-500"
                }`}
            >
              Pending <span className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] inline-flex items-center justify-center min-w-[20px] min-h-[16px]">
                {isLoading ? (
                  <Skeleton className="h-2 w-4 bg-slate-300 dark:bg-white/20 rounded" />
                ) : (
                  pendingOrders.length
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={`flex items-center gap-2 text-[12px] font-bold pb-3 shrink-0 transition-colors border-b-2 ${activeTab === "closed" ? "text-slate-900 dark:text-white border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-500"
                }`}
            >
              Closed Positions <span className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] inline-flex items-center justify-center min-w-[20px] min-h-[16px]">
                {isLoading ? (
                  <Skeleton className="h-2 w-4 bg-slate-300 dark:bg-white/20 rounded" />
                ) : (
                  closedPositions.length
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex items-center gap-2 text-[12px] font-bold pb-3 shrink-0 transition-colors border-b-2 ${activeTab === "alerts" ? "text-slate-900 dark:text-white border-emerald-500" : "text-slate-400 border-transparent hover:text-slate-500"
                }`}
            >
              Alerts
            </button>
          </div>
          <div className="flex items-center gap-4 pl-6 shrink-0 pb-3">
            <button className="flex items-center gap-1 text-[12px] font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
              Close All <IconlyChevronDown set="curved" primaryColor="currentColor" size={11} stroke="bold" />
            </button>
            <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <IconlyCategory set="curved" primaryColor="currentColor" size={15} stroke="bold" />
            </button>
          </div>
          
          {/* P/L Filter Toggle */}
          <div className="hidden sm:flex items-center bg-white dark:bg-[#1A1A1A] rounded-xl p-1 shadow-sm border border-slate-200 dark:border-white/5 mb-3 self-end shrink-0 ml-4">
            <button
              onClick={() => setPlFilter("all")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${plFilter === "all" ? "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
            >
              All
            </button>
            <button
              onClick={() => setPlFilter("profit")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${plFilter === "profit" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"}`}
            >
              Wins
            </button>
            <button
              onClick={() => setPlFilter("loss")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${plFilter === "loss" ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400" : "text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"}`}
            >
              Losses
            </button>
          </div>
        </div>

        {/* Live Positions Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[310px] amazing-scrollbar relative">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 bg-slate-50 dark:bg-[#1E1E20] z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-none">
              <tr className="bg-slate-50 dark:bg-[#1E1E20] text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                <th className="px-3 py-4">Instrument</th>
                <th className="px-3 py-4">Entry Time (UTC)</th>
                <th className="px-3 py-4">Side</th>
                <th className="px-3 py-4">{activeMarket === 'indian' ? 'Qty' : 'Lots'}</th>
                <th className="px-3 py-4">Entry Price</th>
                <th className="px-3 py-4">Stop Loss</th>
                <th className="px-3 py-4">Take Profit</th>
                <th className="px-3 py-4">Exit Time (UTC)</th>
                <th className="px-3 py-4">Exit Price</th>
                <th className="px-3 py-4">Commission</th>
                <th className="px-3 py-4">Swaps</th>
                <th className="px-3 py-4">P&L</th>
                <th className="px-3 py-4">Net P&L</th>
                <th className="px-3 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 whitespace-nowrap">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-100 dark:border-white/5 animate-pulse">
                    <td className="px-3 py-4"><Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" /></td>
                    <td className="px-3 py-4"><Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" /></td>
                    <td className="px-3 py-4"><Skeleton className="h-4 w-12 bg-slate-200 dark:bg-white/10" /></td>
                    <td className="px-3 py-4"><Skeleton className="h-4 w-10 bg-slate-200 dark:bg-white/10" /></td>
                    <td className="px-3 py-4"><Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" /></td>
                    <td className="px-3 py-4 text-center">-</td>
                    <td className="px-3 py-4 text-center">-</td>
                    <td className="px-3 py-4"><Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" /></td>
                    <td className="px-3 py-4"><Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" /></td>
                    <td className="px-3 py-4 text-right"><Skeleton className="h-4 w-12 bg-slate-200 dark:bg-white/10 ml-auto" /></td>
                    <td className="px-3 py-4 text-right"><Skeleton className="h-4 w-12 bg-slate-200 dark:bg-white/10 ml-auto" /></td>
                    <td className="px-3 py-4 text-right"><Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10 ml-auto" /></td>
                    <td className="px-3 py-4 text-right"><Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10 ml-auto" /></td>
                    <td className="px-3 py-4"></td>
                  </tr>
                ))
              ) : displayTrades.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-12 text-slate-400 text-[13px] font-medium">
                    No positions found for this category. Fire up your MT5 terminal bridge to sync!
                  </td>
                </tr>
              ) : (
                displayTrades.map((trade) => {
                  const side: "BUY" | "SELL" = trade.trade_type === 0 ? "BUY" : "SELL";
                  const profit = Number(trade.profit);
                  const lot = Number(trade.lot_size);

                  // Formatted Dates
                  const entryDateStr = formatUTCDate(trade.opened_at || trade.created_at || new Date().toISOString());
                  const exitDateStr = formatUTCDate(trade.closed_at || trade.created_at);

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => onTradeClick?.(trade)}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{getFlagIcon(trade.symbol)}</span>
                        <span>{trade.symbol}</span>
                      </td>
                      <td className="px-3 py-4 text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">{entryDateStr}</td>
                      <td className="px-3 py-4">
                        <span className={`text-[12px] font-bold tracking-tight ${side === "BUY" ? "text-[#10B981]" : "text-[#F06363]"
                          }`}>
                          {side}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">{lot.toFixed(2)}</td>
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
                        {trade.open_price ? trade.open_price.toFixed(5) : trade.entry_price ? trade.entry_price.toFixed(5) : "-"}
                      </td>
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-500 dark:text-slate-400 text-center">
                        {trade.stop_loss ? trade.stop_loss.toFixed(5) : "-"}
                      </td>
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-500 dark:text-slate-400 text-center">
                        {trade.take_profit ? trade.take_profit.toFixed(5) : "-"}
                      </td>
                      <td className="px-3 py-4 text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">{trade.closed_at ? exitDateStr : "Open"}</td>
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">
                        {trade.closed_at ? (trade.close_price ? trade.close_price.toFixed(5) : trade.exit_price ? trade.exit_price.toFixed(5) : "-") : "-"}
                      </td>
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-900 dark:text-white tabular-nums text-right">
                        {trade.commission ? fmtMoney(trade.commission, { raw: true }) : fmtMoney(0, { raw: true })}
                      </td>
                      <td className="px-3 py-4 text-[13px] font-bold text-slate-900 dark:text-white tabular-nums text-right">
                        {trade.swap ? fmtMoney(trade.swap, { raw: true }) : fmtMoney(0, { raw: true })}
                      </td>
                      <td className={`px-3 py-4 text-[13px] font-bold tabular-nums text-right ${profit - Number(trade.commission || 0) - Number(trade.swap || 0) - Number(trade.fee || 0) >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                        {formatPnl(profit - Number(trade.commission || 0) - Number(trade.swap || 0) - Number(trade.fee || 0))}
                      </td>
                      <td className={`px-3 py-4 text-[13px] font-bold tabular-nums text-right ${profit >= 0 ? "text-[#10B981]" : "text-[#F06363]"}`}>
                        {formatPnl(profit)}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleShareTrade(trade.ticket)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
                        >
                          <IconlySend set="curved" primaryColor="currentColor" size={14} stroke="bold" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Link */}
        <div className="p-6 text-center border-t border-slate-50 dark:border-white/5">
          <button
            onClick={() => toast.info("Displaying full trading history link...")}
            className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
          >
            View Full Execution History
          </button>
        </div>

      </div>

    </div>
  );
}
