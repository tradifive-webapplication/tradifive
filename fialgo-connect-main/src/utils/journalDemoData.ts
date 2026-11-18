export interface DemoTrade {
  id: string;
  ticket: string;
  symbol: string;
  profit: number;
  trade_type: number; // 0 = BUY, 1 = SELL
  type: "BUY" | "SELL";
  lot_size: number;
  volume: number;
  open_price: number;
  close_price?: number;
  entry_price: number;
  exit_price?: number;
  stop_loss: number;
  take_profit: number;
  commission: number;
  swap: number;
  fee: number;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
  is_pending: boolean;
  setup: string;
  tags: string[];
  notes: string;
  risk_reward_ratio: number;
}

export function buildJournalDemoData(activeMarket: string = "forex") {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const isIndian = activeMarket === "indian";

  // Anchor days safely within the current month up to today
  const makeDate = (daysAgo: number, hour: number, minute: number) => {
    const targetDay = Math.max(1, todayDate - daysAgo);
    return new Date(year, month, targetDay, hour, minute, 0);
  };

  const specs: {
    daysAgo: number;
    hour: number;
    durationMin: number;
    symbol: string;
    indianSymbol: string;
    side: "BUY" | "SELL";
    lot: number;
    entry: number;
    exit: number;
    sl: number;
    tp: number;
    profit: number;
    rr: number;
    setup: string;
    tags: string[];
    notes: string;
  }[] = [
    {
      daysAgo: 15,
      hour: 9,
      durationMin: 42,
      symbol: "XAUUSD",
      indianSymbol: "NIFTY50",
      side: "BUY",
      lot: 1.0,
      entry: 2642.5,
      exit: 2646.3,
      sl: 2640.0,
      tp: 2647.0,
      profit: 380.0,
      rr: 1.9,
      setup: "London Breakout",
      tags: ["London Breakout", "A+ Setup"],
      notes: "Clean break above Asian high with strong displacement.",
    },
    {
      daysAgo: 15,
      hour: 13,
      durationMin: 28,
      symbol: "EURUSD",
      indianSymbol: "BANKNIFTY",
      side: "SELL",
      lot: 1.5,
      entry: 1.0842,
      exit: 1.0853,
      sl: 1.0855,
      tp: 1.0815,
      profit: -165.0,
      rr: -1.0,
      setup: "OB Retest",
      tags: ["OB Retest"],
      notes: "Stopped out ahead of CPI print. Respected hard SL.",
    },
    {
      daysAgo: 13,
      hour: 10,
      durationMin: 65,
      symbol: "NAS100",
      indianSymbol: "RELIANCE",
      side: "BUY",
      lot: 0.5,
      entry: 20410.0,
      exit: 20494.0,
      sl: 20370.0,
      tp: 20500.0,
      profit: 420.0,
      rr: 2.1,
      setup: "VWAP Pullback",
      tags: ["VWAP Pullback", "NY Open"],
      notes: "NY open pullback to VWAP held cleanly; scaled out near HOD.",
    },
    {
      daysAgo: 12,
      hour: 14,
      durationMin: 19,
      symbol: "GBPUSD",
      indianSymbol: "HDFCBANK",
      side: "SELL",
      lot: 1.0,
      entry: 1.2945,
      exit: 1.2966,
      sl: 1.2968,
      tp: 1.2905,
      profit: -210.0,
      rr: -1.0,
      setup: "Liquidity Sweep",
      tags: ["Liquidity Sweep"],
      notes: "Entered slightly early before 5m candle confirmation.",
    },
    {
      daysAgo: 11,
      hour: 8,
      durationMin: 95,
      symbol: "XAUUSD",
      indianSymbol: "NIFTY50",
      side: "BUY",
      lot: 1.2,
      entry: 2651.2,
      exit: 2656.4,
      sl: 2648.5,
      tp: 2657.0,
      profit: 624.0,
      rr: 2.6,
      setup: "Liquidity Sweep",
      tags: ["Liquidity Sweep", "A+ Setup"],
      notes: "Textbook sweep of session lows followed by impulsive MSS.",
    },
    {
      daysAgo: 9,
      hour: 11,
      durationMin: 50,
      symbol: "US30",
      indianSymbol: "TCS",
      side: "SELL",
      lot: 0.5,
      entry: 43890.0,
      exit: 43832.0,
      sl: 43925.0,
      tp: 43820.0,
      profit: 290.0,
      rr: 1.7,
      setup: "OB Retest",
      tags: ["OB Retest", "NY Open"],
      notes: "Rejected 15m supply zone cleanly.",
    },
    {
      daysAgo: 8,
      hour: 10,
      durationMin: 24,
      symbol: "EURUSD",
      indianSymbol: "INFY",
      side: "BUY",
      lot: 1.0,
      entry: 1.0815,
      exit: 1.0815,
      sl: 1.0802,
      tp: 1.0845,
      profit: 0.0,
      rr: 0.0,
      setup: "London Breakout",
      tags: ["London Breakout"],
      notes: "Moved SL to breakeven at +1R; tagged out flat.",
    },
    {
      daysAgo: 7,
      hour: 15,
      durationMin: 36,
      symbol: "NAS100",
      indianSymbol: "BANKNIFTY",
      side: "SELL",
      lot: 0.5,
      entry: 20580.0,
      exit: 20636.0,
      sl: 20640.0,
      tp: 20480.0,
      profit: -280.0,
      rr: -1.0,
      setup: "VWAP Pullback",
      tags: ["VWAP Pullback"],
      notes: "Fought strong trend afternoon momentum. Lesson noted.",
    },
    {
      daysAgo: 6,
      hour: 9,
      durationMin: 74,
      symbol: "XAUUSD",
      indianSymbol: "NIFTY50",
      side: "BUY",
      lot: 1.0,
      entry: 2664.0,
      exit: 2668.9,
      sl: 2661.5,
      tp: 2669.5,
      profit: 490.0,
      rr: 2.0,
      setup: "London Breakout",
      tags: ["London Breakout", "A+ Setup"],
      notes: "Held full target with zero heat after entry.",
    },
    {
      daysAgo: 5,
      hour: 13,
      durationMin: 48,
      symbol: "GBPUSD",
      indianSymbol: "RELIANCE",
      side: "BUY",
      lot: 1.2,
      entry: 1.2980,
      exit: 1.3008,
      sl: 1.2966,
      tp: 1.3010,
      profit: 336.0,
      rr: 2.0,
      setup: "OB Retest",
      tags: ["OB Retest"],
      notes: "Clean demand tap on 15m timeframe.",
    },
    {
      daysAgo: 4,
      hour: 14,
      durationMin: 22,
      symbol: "US30",
      indianSymbol: "HDFCBANK",
      side: "BUY",
      lot: 0.5,
      entry: 43740.0,
      exit: 43702.0,
      sl: 43700.0,
      tp: 43830.0,
      profit: -190.0,
      rr: -1.0,
      setup: "VWAP Pullback",
      tags: ["VWAP Pullback"],
      notes: "Choppy pre-FOMC range; stopped cleanly.",
    },
    {
      daysAgo: 3,
      hour: 9,
      durationMin: 112,
      symbol: "NAS100",
      indianSymbol: "BANKNIFTY",
      side: "BUY",
      lot: 0.6,
      entry: 20615.0,
      exit: 20705.0,
      sl: 20575.0,
      tp: 20710.0,
      profit: 540.0,
      rr: 2.25,
      setup: "Liquidity Sweep",
      tags: ["Liquidity Sweep", "NY Open"],
      notes: "Sweep of London low right at NY open; held runner to TP.",
    },
    {
      daysAgo: 2,
      hour: 11,
      durationMin: 58,
      symbol: "XAUUSD",
      indianSymbol: "NIFTY50",
      side: "SELL",
      lot: 1.0,
      entry: 2681.5,
      exit: 2678.1,
      sl: 2683.4,
      tp: 2677.5,
      profit: 340.0,
      rr: 1.8,
      setup: "OB Retest",
      tags: ["OB Retest", "A+ Setup"],
      notes: "Bearish engulfing off daily supply level.",
    },
    {
      daysAgo: 2,
      hour: 15,
      durationMin: 31,
      symbol: "EURUSD",
      indianSymbol: "TCS",
      side: "SELL",
      lot: 1.0,
      entry: 1.0870,
      exit: 1.0884,
      sl: 1.0885,
      tp: 1.0840,
      profit: -140.0,
      rr: -1.0,
      setup: "London Breakout",
      tags: ["London Breakout"],
      notes: "False breakdown; cut at predetermined stop.",
    },
    {
      daysAgo: 1,
      hour: 10,
      durationMin: 84,
      symbol: "XAUUSD",
      indianSymbol: "NIFTY50",
      side: "BUY",
      lot: 1.0,
      entry: 2674.2,
      exit: 2678.5,
      sl: 2672.0,
      tp: 2679.0,
      profit: 430.0,
      rr: 2.0,
      setup: "VWAP Pullback",
      tags: ["VWAP Pullback", "A+ Setup"],
      notes: "Patience paid off waiting for retest of session VWAP.",
    },
    {
      daysAgo: 0,
      hour: 9,
      durationMin: 46,
      symbol: "NAS100",
      indianSymbol: "BANKNIFTY",
      side: "BUY",
      lot: 0.5,
      entry: 20740.0,
      exit: 20798.0,
      sl: 20710.0,
      tp: 20805.0,
      profit: 290.0,
      rr: 1.95,
      setup: "London Breakout",
      tags: ["London Breakout", "NY Open"],
      notes: "Strong opening drive; locked profits cleanly before midday.",
    },
  ];

  const closedTrades: DemoTrade[] = specs.map((s, idx) => {
    const opened = makeDate(s.daysAgo, s.hour, 10);
    const closed = new Date(opened.getTime() + s.durationMin * 60 * 1000);
    const sym = isIndian ? s.indianSymbol : s.symbol;
    return {
      id: `demo-closed-${idx + 1}`,
      ticket: `${842100 + idx}`,
      symbol: sym,
      profit: s.profit,
      trade_type: s.side === "BUY" ? 0 : 1,
      type: s.side,
      lot_size: s.lot,
      volume: s.lot,
      open_price: s.entry,
      close_price: s.exit,
      entry_price: s.entry,
      exit_price: s.exit,
      stop_loss: s.sl,
      take_profit: s.tp,
      commission: -Number((s.lot * 3.5).toFixed(2)),
      swap: idx % 4 === 0 ? -1.8 : 0,
      fee: 0,
      opened_at: opened.toISOString(),
      closed_at: closed.toISOString(),
      created_at: opened.toISOString(),
      is_pending: false,
      setup: s.setup,
      tags: s.tags,
      notes: s.notes,
      risk_reward_ratio: s.rr,
    };
  });

  // 2 Live Open Positions + 1 Pending Order so all table tabs look populated
  const openPositions: DemoTrade[] = [
    {
      id: "demo-open-1",
      ticket: "842191",
      symbol: isIndian ? "NIFTY50" : "XAUUSD",
      profit: 185.5,
      trade_type: 0,
      type: "BUY",
      lot_size: 1.0,
      volume: 1.0,
      open_price: 2684.4,
      entry_price: 2684.4,
      stop_loss: 2681.5,
      take_profit: 2692.0,
      commission: -3.5,
      swap: 0,
      fee: 0,
      opened_at: makeDate(0, Math.max(8, now.getHours() - 1), 15).toISOString(),
      closed_at: null,
      created_at: makeDate(0, Math.max(8, now.getHours() - 1), 15).toISOString(),
      is_pending: false,
      setup: "Liquidity Sweep",
      tags: ["Liquidity Sweep", "Running"],
      notes: "Holding runner above break-even into NY session.",
      risk_reward_ratio: 2.5,
    },
    {
      id: "demo-open-2",
      ticket: "842192",
      symbol: isIndian ? "RELIANCE" : "EURUSD",
      profit: -32.0,
      trade_type: 1,
      type: "SELL",
      lot_size: 0.8,
      volume: 0.8,
      open_price: 1.0892,
      entry_price: 1.0892,
      stop_loss: 1.0912,
      take_profit: 1.0845,
      commission: -2.8,
      swap: 0,
      fee: 0,
      opened_at: makeDate(0, Math.max(8, now.getHours()), 5).toISOString(),
      closed_at: null,
      created_at: makeDate(0, Math.max(8, now.getHours()), 5).toISOString(),
      is_pending: false,
      setup: "OB Retest",
      tags: ["OB Retest"],
      notes: "Scaling into 15m resistance zone.",
      risk_reward_ratio: 2.3,
    },
  ];

  const pendingOrders: DemoTrade[] = [
    {
      id: "demo-pending-1",
      ticket: "842199",
      symbol: isIndian ? "BANKNIFTY" : "NAS100",
      profit: 0,
      trade_type: 0,
      type: "BUY",
      lot_size: 0.5,
      volume: 0.5,
      open_price: 20710.0,
      entry_price: 20710.0,
      stop_loss: 20675.0,
      take_profit: 20810.0,
      commission: 0,
      swap: 0,
      fee: 0,
      opened_at: now.toISOString(),
      closed_at: null,
      created_at: now.toISOString(),
      is_pending: true,
      setup: "VWAP Pullback",
      tags: ["Limit Order"],
      notes: "Buy limit resting at morning FVG.",
      risk_reward_ratio: 2.8,
    },
  ];

  const allTrades = [...openPositions, ...pendingOrders, ...closedTrades].sort(
    (a, b) =>
      new Date(b.closed_at || b.opened_at).getTime() -
      new Date(a.closed_at || a.opened_at).getTime()
  );

  const totalProfit = closedTrades.reduce((s, t) => s + t.profit, 0);
  const wins = closedTrades.filter((t) => t.profit > 0).length;
  const winRate =
    closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;

  return {
    allTrades,
    closedTrades,
    balance: 25000 + totalProfit,
    equity: 25000 + totalProfit + 153.5,
    totalProfit,
    winRate,
    drawdown: 1.8,
    lastImportTime: "Demo preview · live",
  };
}
