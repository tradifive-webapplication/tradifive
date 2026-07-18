/**
 * TRADIFIVE MISSION CONTROL - DEMO DATA CONFIGURATION
 * High-fidelity sample data for the 'Demo Experience' flow.
 */

export const DEMO_ACCOUNT_METRICS = {
  account_number: "88855522",
  account_name: "TRADIFIVE_DEMO_PILOT",
  broker_name: "Tradifive Institutional",
  balance: 10450.75,
  equity: 10522.30,
  margin: 120.40,
  free_margin: 10401.90,
  margin_level: 8739.45,
  leverage: 100,
  currency: "USD",
  algo_status: true,
  active_strategy: "scalper",
  daily_profit: 450.20,
  total_profit: 450.75,
  drawdown_percent: 1.25,
  win_rate_percent: 68
};

// Generate more trades for a "real" feel
const generateDemoTrades = () => {
  const assets = ["XAUUSD", "BTCUSD", "EURUSD", "USDJPY", "GBPUSD", "NAS100"];
  const trades = [];
  const now = Date.now();
  
  for (let i = 1; i <= 20; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const type = Math.random() > 0.4 ? "BUY" : "SELL";
    const profit = Math.random() > 0.3 ? (Math.random() * 150 + 20) : -(Math.random() * 80 + 10);
    const dateOffset = 1000 * 60 * 60 * (i * 12 + Math.random() * 12); // Spread over ~14 days
    
    trades.push({
      id: `demo-${i}`,
      symbol: asset,
      type,
      lots: (Math.random() * 0.5 + 0.1).toFixed(2),
      open_price: (Math.random() * 100 + 1000).toFixed(2),
      close_price: (Math.random() * 100 + 1000).toFixed(2),
      profit: parseFloat(profit.toFixed(2)),
      status: "CLOSED",
      closed_at: new Date(now - dateOffset).toISOString(),
      pips: Math.floor(profit / 10)
    });
  }
  return trades.sort((a, b) => new Date(b.closed_at).getTime() - new Date(a.closed_at).getTime());
};

export const DEMO_RECENT_TRADES = generateDemoTrades();

export const DEMO_JOURNAL_ENTRIES = DEMO_RECENT_TRADES.slice(0, 8).map((t, i) => ({
  id: `j-${i}`,
  trade_id: t.id,
  notes: i % 2 === 0 ? "Strategic execution based on 4H institutional order flow." : "Scalp trade following the 15m breakout. Managed risk strictly.",
  tags: ["Technical", "Trend", i % 2 === 0 ? "Swing" : "Scalp"],
  mood: i % 3 === 0 ? "Confident" : "Focused",
  created_at: t.closed_at
}));

export const DEMO_RISK_STATS = {
  max_drawdown: 2.45,
  sharpe_ratio: 1.85,
  profit_factor: 2.10,
  average_win: 85.20,
  average_loss: -32.40,
  recovery_factor: 4.5
};
