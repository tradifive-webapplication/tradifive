import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Upload, Download, Share2 } from "lucide-react";
import {
  ChevronDown as IconlyChevronDown,
  InfoSquare as IconlyInfoSquare,
} from "react-iconly";
import { Skeleton } from "@/components/ui/skeleton";
import { useJournalSettings } from "@/contexts/JournalSettingsContext";
import { useTradingTheme } from "@/hooks/useTradingTheme";
import { useMarket } from "@/contexts/MarketContext";
import { toast } from "sonner";

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

function getFlagIcon(symbol: string): string {
  const s = (symbol || "").trim().toUpperCase();
  if (s.includes("XAU")) return "🥇";
  if (s.includes("BTC")) return "₿";
  if (s.includes("EUR")) return "🇪🇺";
  if (s.includes("GBP")) return "🇬🇧";
  if (s.includes("JPY")) return "🇯🇵";
  if (s.includes("NIFTY") || s.includes("BANK")) return "🇮🇳";
  return "📈";
}

function formatUTCDate(dateString?: string): string {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";

  const pad = (n: number) => String(n).padStart(2, "0");
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const year = d.getUTCFullYear();

  let hours = d.getUTCHours();
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = pad(hours);

  return `${month}/${day}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

interface JournalTradesTableProps {
  onTradeClick?: (trade: TradeRecord) => void;
  onImportCsv?: () => void;
  refreshKey?: number;
  demoData?: {
    allTrades: any[];
    balance: number;
    equity: number;
  } | null;
}

export default function JournalTradesTable({
  onTradeClick,
  onImportCsv,
  refreshKey = 0,
  demoData,
}: JournalTradesTableProps = {}) {
  const [activeTab, setActiveTab] = useState<
    "positions" | "pending" | "closed" | "alerts"
  >("closed");
  const [hasSetInitialTab, setHasSetInitialTab] = useState(false);
  const [plFilter, setPlFilter] = useState<"all" | "profit" | "loss">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null);
  const [isDataLoading, setIsLoading] = useState(true);
  const {
    formatMoney: fmtMoney,
    percentageOnly,
    hideBalance,
    hideOnlyBalance,
    isSettingsLoading,
  } = useJournalSettings();
  const { activeMarket } = useMarket();
  const { config: tradingTheme } = useTradingTheme();
  const isLoading = demoData ? isSettingsLoading : isDataLoading || isSettingsLoading;

  useEffect(() => {
    if (demoData) {
      setTrades(demoData.allTrades as TradeRecord[]);
      setMetrics({
        balance: demoData.balance,
        equity: demoData.equity,
        broker_server: "TradiFive Demo",
        account_number: "DEMO-8421",
      });
      setIsLoading(false);
      return;
    }
    let isMounted = true;

    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          if (isMounted) {
            setTrades([]);
            setMetrics(null);
            setIsLoading(false);
          }
          return;
        }

        let accountData: any = null;
        if (activeMarket === "indian") {
          const { data: indAcc } = await supabase
            .from("indian_broker_accounts")
            .select("balance, equity, broker_name, client_id, account_number")
            .eq("user_id", user.id)
            .maybeSingle();

          if (indAcc) {
            accountData = {
              balance: indAcc.balance || 0,
              equity: indAcc.equity || 0,
              broker_server: `${indAcc.broker_name?.toUpperCase() || "INDIAN"} API`,
              account_number: indAcc.client_id || indAcc.account_number || "Connected",
            };
          }
        }

        if (!accountData) {
          const { data: mt5Acc } = await supabase
            .from("mt5_accounts")
            .select("balance, equity, broker_server, account_number")
            .eq("user_id", user.id)
            .maybeSingle();
          if (mt5Acc) {
            accountData = mt5Acc;
          }
        }

        if (accountData && isMounted) {
          setMetrics(accountData);
        }

        const { data: tradesData } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .order("closed_at", { ascending: false });

        if (tradesData && isMounted) {
          const list = tradesData as TradeRecord[];
          setTrades(list);
          if (!hasSetInitialTab) {
            const hasOpen = list.some((t) => !t.closed_at && !t.is_pending);
            setActiveTab(hasOpen ? "positions" : "closed");
            setHasSetInitialTab(true);
          }
        }
      } catch (err) {
        console.error("Failed to load real-time positions table:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel("realtime-positions-table")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mt5_accounts" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [refreshKey, demoData]);

  const balance = metrics?.balance || 0;
  const equity = metrics?.equity || 0;

  const openPositions = useMemo(
    () => trades.filter((t) => !t.closed_at && !t.is_pending),
    [trades]
  );
  const closedPositions = useMemo(
    () => trades.filter((t) => t.closed_at && !t.is_pending),
    [trades]
  );
  const pendingOrders = useMemo(
    () => trades.filter((t) => t.is_pending),
    [trades]
  );

  const displayTrades = useMemo(() => {
    let base =
      activeTab === "positions"
        ? openPositions
        : activeTab === "closed"
        ? closedPositions
        : activeTab === "pending"
        ? pendingOrders
        : [];

    if (plFilter === "profit") {
      base = base.filter((t) => Number(t.profit || 0) >= 0);
    } else if (plFilter === "loss") {
      base = base.filter((t) => Number(t.profit || 0) < 0);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      base = base.filter((t) => {
        const sym = String(t.symbol || "").toLowerCase();
        const setup = String(t.setup || "").toLowerCase();
        const notes = String(t.notes || "").toLowerCase();
        const ticket = String(t.ticket || "").toLowerCase();
        return (
          sym.includes(q) ||
          setup.includes(q) ||
          notes.includes(q) ||
          ticket.includes(q)
        );
      });
    }
    return base;
  }, [
    activeTab,
    openPositions,
    closedPositions,
    pendingOrders,
    plFilter,
    searchQuery,
  ]);

  const profitAndLoss = trades.reduce(
    (acc, t) => acc + Number(t.profit || 0),
    0
  );

  const formatPnl = (pnl: number) => {
    let str = "";
    if (percentageOnly) {
      const denom = balance > 0 ? balance : 10000;
      str = `${pnl >= 0 ? "+" : ""}${((pnl / denom) * 100).toFixed(2)}%`;
    } else {
      str = fmtMoney(pnl, { showSign: true, raw: true });
    }
    return hideBalance ? (
      <span className="blur-[5px] select-none opacity-60 transition-all duration-200">
        {str}
      </span>
    ) : (
      str
    );
  };

  const handleShareTrade = (e: React.MouseEvent, ticket: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`TRADIFIVE-TRADE-${ticket || "LOG"}`);
    toast.success(`Trade #${ticket || "LOG"} copied to clipboard!`);
  };

  const handleExportCsv = () => {
    if (displayTrades.length === 0) {
      toast.info("No trades to export");
      return;
    }
    const headers = [
      "Instrument",
      "Side",
      "Lots",
      "Entry Price",
      "Exit Price",
      "Stop Loss",
      "Take Profit",
      "Commission",
      "Swaps",
      "Net P&L",
      "Entry Time (UTC)",
      "Exit Time (UTC)",
    ];
    const rows = displayTrades.map((t) => [
      t.symbol || "",
      t.trade_type === 0 ? "BUY" : "SELL",
      Number(t.lot_size || 0).toFixed(2),
      t.open_price ?? t.entry_price ?? "",
      t.close_price ?? t.exit_price ?? "",
      t.stop_loss ?? "",
      t.take_profit ?? "",
      t.commission ?? 0,
      t.swap ?? 0,
      Number(t.profit || 0).toFixed(2),
      t.opened_at || t.created_at || "",
      t.closed_at || "Open",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tradifive-trades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${displayTrades.length} trades`);
  };

  return (
    <div className="bg-white dark:bg-[#17171A] rounded-[18px] border border-slate-200/70 dark:border-white/[0.07] shadow-[0_2px_10px_rgba(15,23,42,0.04),0_10px_26px_-10px_rgba(15,23,42,0.07)] dark:shadow-none overflow-hidden flex flex-col">
      {/* Account Metrics Bar */}
      <div className="flex items-center space-x-8 sm:space-x-10 px-5 py-3.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Balance
          </span>
          {isLoading ? (
            <Skeleton className="h-[18px] w-20 bg-slate-200 dark:bg-white/10 rounded" />
          ) : (
            <span
              className={`text-[13px] font-semibold text-slate-900 dark:text-white tabular-nums ${
                hideBalance || hideOnlyBalance || percentageOnly
                  ? "blur-[5px] select-none opacity-60"
                  : ""
              }`}
            >
              {fmtMoney(balance, { raw: true })}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Profit &amp; Loss
          </span>
          {isLoading ? (
            <Skeleton className="h-[18px] w-16 bg-slate-200 dark:bg-white/10 rounded" />
          ) : (
            <span
              className={`text-[13px] font-semibold tabular-nums ${
                profitAndLoss < 0
                  ? tradingTheme.lossText
                  : tradingTheme.profitText
              }`}
            >
              {formatPnl(profitAndLoss)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Equity
          </span>
          {isLoading ? (
            <Skeleton className="h-[18px] w-20 bg-slate-200 dark:bg-white/10 rounded" />
          ) : (
            <span
              className={`text-[13px] font-semibold text-slate-900 dark:text-white tabular-nums ${
                hideBalance || hideOnlyBalance || percentageOnly
                  ? "blur-[5px] select-none opacity-60"
                  : ""
              }`}
            >
              {fmtMoney(equity, { raw: true })}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Initial Margin
          </span>
          {isLoading ? (
            <Skeleton className="h-[18px] w-12 bg-slate-200 dark:bg-white/10 rounded" />
          ) : (
            <span
              className={`text-[13px] font-semibold text-slate-900 dark:text-white tabular-nums ${
                hideBalance || percentageOnly
                  ? "blur-[5px] select-none opacity-60"
                  : ""
              }`}
            >
              {fmtMoney(0, { raw: true })}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Available Funds
          </span>
          {isLoading ? (
            <Skeleton className="h-[18px] w-20 bg-slate-200 dark:bg-white/10 rounded" />
          ) : (
            <span
              className={`text-[13px] font-semibold text-slate-900 dark:text-white tabular-nums ${
                hideBalance || hideOnlyBalance || percentageOnly
                  ? "blur-[5px] select-none opacity-60"
                  : ""
              }`}
            >
              {fmtMoney(equity, { raw: true })}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Margin Level
            <IconlyInfoSquare
              set="curved"
              primaryColor="currentColor"
              size={11}
              stroke="bold"
              className="text-slate-400"
            />
          </span>
          {isLoading ? (
            <Skeleton className="h-[18px] w-8 bg-slate-200 dark:bg-white/10 rounded" />
          ) : (
            <span
              className={`text-[13px] font-semibold text-slate-900 dark:text-white tabular-nums ${
                hideBalance || percentageOnly
                  ? "blur-[5px] select-none opacity-60"
                  : ""
              }`}
            >
              ∞
            </span>
          )}
        </div>
      </div>

      {/* cTrader Style Tab Bar + Search / Filters / Import-Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-5 pt-3.5 pb-0 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center space-x-5 overflow-x-auto no-scrollbar">
          {[
            { id: "positions" as const, label: "Positions", count: openPositions.length },
            { id: "pending" as const, label: "Pending", count: pendingOrders.length },
            {
              id: "closed" as const,
              label: "Closed Positions",
              count: closedPositions.length,
            },
            { id: "alerts" as const, label: "Alerts", count: null },
          ].map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 text-[12px] font-semibold pb-3 shrink-0 transition-colors border-b-2 cursor-pointer ${
                  active
                    ? "text-slate-900 dark:text-white border-[#2563EB]"
                    : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-neutral-200"
                }`}
              >
                <span>{t.label}</span>
                {t.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums ${
                      active
                        ? "bg-blue-50 text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-400"
                        : "bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-neutral-400"
                    }`}
                  >
                    {isLoading ? "…" : t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pb-3 flex-wrap">
          <div className="relative flex-1 sm:flex-initial sm:w-[175px]">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbol..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-[10px] bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-[11.5px] text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* P/L Filter Toggle */}
          <div className="inline-flex items-center bg-slate-100/90 dark:bg-white/[0.06] rounded-[10px] p-0.5">
            {(
              [
                { id: "all", label: "All" },
                { id: "profit", label: "Wins" },
                { id: "loss", label: "Losses" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPlFilter(f.id)}
                className={`px-2.5 py-1 text-[10.5px] font-semibold rounded-[8px] transition-all cursor-pointer ${
                  plFilter === f.id
                    ? "bg-white dark:bg-[#26262B] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {onImportCsv && (
            <button
              type="button"
              onClick={onImportCsv}
              className="tactile-white-pill rounded-[10px] px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Upload size={12} />
              <span>Import</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="tactile-white-pill rounded-[10px] px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Download size={12} />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info("No live open orders to close.")}
            className="hidden xl:inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 cursor-pointer"
          >
            <span>Close All</span>
            <IconlyChevronDown
              set="curved"
              primaryColor="currentColor"
              size={11}
              stroke="bold"
            />
          </button>
        </div>
      </div>

      {/* Live Positions Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[360px] amazing-scrollbar relative">
        <table className="w-full text-left border-collapse min-w-[1140px]">
          <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#1C1C20] z-10 border-b border-slate-100 dark:border-white/[0.06]">
            <tr className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              <th className="px-3.5 py-3">Instrument</th>
              <th className="px-3 py-3">Entry Time (UTC)</th>
              <th className="px-3 py-3">Side</th>
              <th className="px-3 py-3">
                {activeMarket === "indian" ? "Qty" : "Lots"}
              </th>
              <th className="px-3 py-3">Entry Price</th>
              <th className="px-3 py-3 text-center">Stop Loss</th>
              <th className="px-3 py-3 text-center">Take Profit</th>
              <th className="px-3 py-3">Exit Time (UTC)</th>
              <th className="px-3 py-3">Exit Price</th>
              <th className="px-3 py-3 text-right">Commission</th>
              <th className="px-3 py-3 text-right">Swaps</th>
              <th className="px-3 py-3 text-right">P&amp;L</th>
              <th className="px-3 py-3 text-right">Net P&amp;L</th>
              <th className="px-3 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] whitespace-nowrap">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="animate-pulse">
                  <td className="px-3.5 py-3.5">
                    <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
                  </td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" />
                  </td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-10 bg-slate-200 dark:bg-white/10" />
                  </td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-10 bg-slate-200 dark:bg-white/10" />
                  </td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
                  </td>
                  <td className="px-3 py-3.5 text-center text-slate-300">-</td>
                  <td className="px-3 py-3.5 text-center text-slate-300">-</td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" />
                  </td>
                  <td className="px-3 py-3.5">
                    <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Skeleton className="h-4 w-12 bg-slate-200 dark:bg-white/10 ml-auto" />
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Skeleton className="h-4 w-12 bg-slate-200 dark:bg-white/10 ml-auto" />
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Skeleton className="h-4 w-14 bg-slate-200 dark:bg-white/10 ml-auto" />
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <Skeleton className="h-4 w-14 bg-slate-200 dark:bg-white/10 ml-auto" />
                  </td>
                  <td className="px-3 py-3.5"></td>
                </tr>
              ))
            ) : displayTrades.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  className="text-center py-12 text-slate-400 text-[12.5px] font-medium"
                >
                  No {activeTab === "closed" ? "closed trades" : activeTab} found yet.
                  Log a trade, import CSV, or connect your broker to sync.
                </td>
              </tr>
            ) : (
              displayTrades.map((trade) => {
                const side: "BUY" | "SELL" =
                  trade.trade_type === 0 ||
                  String(trade.trade_type).toUpperCase().includes("BUY")
                    ? "BUY"
                    : "SELL";
                const profit = Number(trade.profit || 0);
                const lot = Number(trade.lot_size || 0);
                const grossPnl =
                  profit -
                  Number(trade.commission || 0) -
                  Number(trade.swap || 0) -
                  Number(trade.fee || 0);

                const entryDateStr = formatUTCDate(
                  trade.opened_at || trade.created_at
                );
                const exitDateStr = trade.closed_at
                  ? formatUTCDate(trade.closed_at)
                  : "Open";

                return (
                  <tr
                    key={trade.id}
                    onClick={() => onTradeClick?.(trade)}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-3.5 py-3 text-[12.5px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{getFlagIcon(trade.symbol)}</span>
                      <span>{trade.symbol}</span>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] text-slate-500 dark:text-neutral-400 tabular-nums">
                      {entryDateStr}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          side === "BUY"
                            ? tradingTheme.profitBadge
                            : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                        }`}
                      >
                        {side}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] font-semibold text-slate-800 dark:text-neutral-200 tabular-nums">
                      {lot.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-[12px] font-medium text-slate-700 dark:text-neutral-300 tabular-nums">
                      {trade.open_price
                        ? Number(trade.open_price).toFixed(5)
                        : trade.entry_price
                        ? Number(trade.entry_price).toFixed(5)
                        : "-"}
                    </td>
                    <td className="px-3 py-3 text-[12px] text-slate-400 text-center tabular-nums">
                      {trade.stop_loss ? Number(trade.stop_loss).toFixed(5) : "-"}
                    </td>
                    <td className="px-3 py-3 text-[12px] text-slate-400 text-center tabular-nums">
                      {trade.take_profit
                        ? Number(trade.take_profit).toFixed(5)
                        : "-"}
                    </td>
                    <td className="px-3 py-3 text-[11.5px] text-slate-500 dark:text-neutral-400 tabular-nums">
                      {exitDateStr}
                    </td>
                    <td className="px-3 py-3 text-[12px] font-medium text-slate-700 dark:text-neutral-300 tabular-nums">
                      {trade.closed_at
                        ? trade.close_price
                          ? Number(trade.close_price).toFixed(5)
                          : trade.exit_price
                          ? Number(trade.exit_price).toFixed(5)
                          : "-"
                        : "-"}
                    </td>
                    <td className="px-3 py-3 text-[12px] font-medium text-slate-600 dark:text-neutral-300 tabular-nums text-right">
                      {fmtMoney(Number(trade.commission || 0), { raw: true })}
                    </td>
                    <td className="px-3 py-3 text-[12px] font-medium text-slate-600 dark:text-neutral-300 tabular-nums text-right">
                      {fmtMoney(Number(trade.swap || 0), { raw: true })}
                    </td>
                    <td
                      className={`px-3 py-3 text-[12.5px] font-semibold tabular-nums text-right ${
                        grossPnl < 0
                          ? tradingTheme.lossText
                          : tradingTheme.profitText
                      }`}
                    >
                      {formatPnl(grossPnl)}
                    </td>
                    <td
                      className={`px-3 py-3 text-[12.5px] font-bold tabular-nums text-right ${
                        profit < 0
                          ? tradingTheme.lossText
                          : tradingTheme.profitText
                      }`}
                    >
                      {formatPnl(profit)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleShareTrade(e, trade.ticket)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-[#2563EB] cursor-pointer"
                        title="Copy trade reference"
                      >
                        <Share2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
