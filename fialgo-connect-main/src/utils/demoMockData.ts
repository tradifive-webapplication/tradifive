// demoMockData.ts
export const USE_DEMO_DATA = false;

const timeAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const DEMO_STORIES = [
  { id: 'demo-s1', user_id: 'u1', post_type: 'story', content: 'Morning setup on NIFTY50!', media_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3', created_at: timeAgo(1), profiles: { full_name: 'Rahul Kumar', username: 'rahul_trades', avatar_url: "/default-avatar.svg" } },
  { id: 'demo-s2', user_id: 'u2', post_type: 'story', content: 'Forex majors looking primed for breakout', media_url: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29', created_at: timeAgo(2), profiles: { full_name: 'Sarah Chen', username: 'sarah_fx', avatar_url: "/default-avatar.svg" } },
  { id: 'demo-s3', user_id: 'u3', post_type: 'story', content: 'BTC holding strong above support', media_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d', created_at: timeAgo(3), profiles: { full_name: 'Crypto King', username: 'cryptok', avatar_url: "/default-avatar.svg" } },
  { id: 'demo-s4', user_id: 'u4', post_type: 'story', content: 'Don\'t overleverage today!', created_at: timeAgo(4), profiles: { full_name: 'Risk Manager', username: 'safe_trade', avatar_url: "/default-avatar.svg" } },
  { id: 'demo-s5', user_id: 'u5', post_type: 'story', content: 'Live session starting in 10 mins', created_at: timeAgo(5), profiles: { full_name: 'Options Guru', username: 'options_g', avatar_url: "/default-avatar.svg" } },
];

export const DEMO_FEEDS = [
  { id: 'demo-f1', user_id: 'u1', post_type: 'post', content: 'Took a massive 150 point move on BankNifty today. The setup was textbook supply zone rejection. Always trust the structure! 📈🔥', created_at: timeAgo(0.5), profiles: { full_name: 'Rahul Kumar', username: 'rahul_trades', avatar_url: "/default-avatar.svg" }, likes_count: 245, comments_count: 56 },
  { id: 'demo-f2', user_id: 'u2', post_type: 'post', content: 'EURUSD just broke out of a multi-week consolidation. I am scaling in here, but keeping a tight stop. What are your thoughts?', media_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3', created_at: timeAgo(1.5), profiles: { full_name: 'Sarah Chen', username: 'sarah_fx', avatar_url: "/default-avatar.svg" }, likes_count: 189, comments_count: 42 },
  { id: 'demo-f3', user_id: 'u3', post_type: 'post', content: 'Psychology tip: Your biggest edge is knowing when NOT to trade. Cash is a position. Stay disciplined.', created_at: timeAgo(3), profiles: { full_name: 'Trader Mindset', username: 'mindset_coach', avatar_url: "/default-avatar.svg" }, likes_count: 512, comments_count: 89 },
  { id: 'demo-f4', user_id: 'u4', post_type: 'post', content: 'BTC attempting a massive breakout. If it clears this level, there is no major resistance for the next 10% move.', media_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d', created_at: timeAgo(5), profiles: { full_name: 'Crypto King', username: 'cryptok', avatar_url: "/default-avatar.svg" }, likes_count: 342, comments_count: 67 },
  { id: 'demo-f5', user_id: 'u5', post_type: 'post', content: 'Sharing my complete options selling strategy for sideways markets. Thread below 🧵👇', created_at: timeAgo(8), profiles: { full_name: 'Options Guru', username: 'options_g', avatar_url: "/default-avatar.svg" }, likes_count: 890, comments_count: 124 },
];

export const DEMO_JOURNAL_TRADES = [
  { id: 'demo-t1', ticket: '1001', symbol: 'XAUUSD', profit: 450.50, trade_type: 0, open_time: timeAgo(5), closed_at: timeAgo(4.5), volume: 1.0 },
  { id: 'demo-t2', ticket: '1002', symbol: 'EURUSD', profit: -120.00, trade_type: 1, open_time: timeAgo(10), closed_at: timeAgo(8), volume: 0.5 },
  { id: 'demo-t3', ticket: '1003', symbol: 'GBPUSD', profit: 340.25, trade_type: 1, open_time: timeAgo(24), closed_at: timeAgo(22), volume: 2.0 },
  { id: 'demo-t4', ticket: '1004', symbol: 'BTCUSDT', profit: 890.00, trade_type: 0, open_time: timeAgo(48), closed_at: timeAgo(40), volume: 0.1 },
  { id: 'demo-t5', ticket: '1005', symbol: 'NIFTY50', profit: 210.75, trade_type: 0, open_time: timeAgo(72), closed_at: timeAgo(70), volume: 50 },
  { id: 'demo-t6', ticket: '1006', symbol: 'USDJPY', profit: -50.20, trade_type: 1, open_time: timeAgo(80), closed_at: timeAgo(79), volume: 1.0 },
  { id: 'demo-t7', ticket: '1007', symbol: 'XAUUSD', profit: 620.10, trade_type: 0, open_time: timeAgo(96), closed_at: timeAgo(90), volume: 1.5 }
];

export const DEMO_RISK_CONFIG = {
  maxDrawdown: 500,
  weeklyDrawdown: 1500,
  monthlyDrawdown: 3000,
  stopAfterLoss: true,
  tradeLimit: 10,
  revengeGuard: true,
  cooldownActive: true,
  targetCapital: 10000,
  startingCapital: 5000,
  autoTrading: false,
  maxLot: 5,
  maxLotActive: true,
  drawdownGuardActive: true,
  disciplineActive: true
};

export const DEMO_DISCOVER_USERS = [
  { id: 'demo-u1', full_name: 'Elena Rostova', username: 'elena_fx', avatar_url: "/default-avatar.svg", location: 'London, UK', streak_days: 45, win_rate: 78, total_trades: 1240, cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71' },
  { id: 'demo-u2', full_name: 'Vikram Singh', username: 'vikram_nifty', avatar_url: "/default-avatar.svg", location: 'Mumbai, IN', streak_days: 32, win_rate: 82, total_trades: 890, cover_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7' },
  { id: 'demo-u3', full_name: 'David Chen', username: 'david_crypto', avatar_url: "/default-avatar.svg", location: 'Singapore', streak_days: 28, win_rate: 65, total_trades: 3400, cover_url: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf' },
  { id: 'demo-u4', full_name: 'Sarah Jenkins', username: 'sarah_trades', avatar_url: "/default-avatar.svg", location: 'New York, US', streak_days: 14, win_rate: 71, total_trades: 450, cover_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3' },
  { id: 'demo-u5', full_name: 'Carlos Mendez', username: 'carlos_scalper', avatar_url: "/default-avatar.svg", location: 'Madrid, ES', streak_days: 56, win_rate: 88, total_trades: 5200, cover_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f' },
  { id: 'demo-u6', full_name: 'Aisha Patel', username: 'aisha_invests', avatar_url: "/default-avatar.svg", location: 'Toronto, CA', streak_days: 5, win_rate: 62, total_trades: 120, cover_url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74' },
];

export const DEMO_DISCOVER_CHANNELS = [
  { id: 'demo-c1', name: 'Smart Money Concepts Pro', description: 'Advanced ICT & SMC strategies for Forex and Indices.', avatar_url: "/default-avatar.svg", members: 4500, created_by: 'demo-u1', cover_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3' },
  { id: 'demo-c2', name: 'NIFTY Options Masters', description: 'Daily live trading, zero hero setups, and option greek analysis.', avatar_url: "/default-avatar.svg", members: 12500, created_by: 'demo-u2', cover_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f' },
  { id: 'demo-c3', name: 'Crypto Breakout Hunters', description: 'Altcoin gems, BTC analysis, and portfolio management.', avatar_url: "/default-avatar.svg", members: 8900, created_by: 'demo-u3', cover_url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82' },
  { id: 'demo-c4', name: 'Global Macro Insights', description: 'Discussing global economic trends, interest rates, and FX majors.', avatar_url: "/default-avatar.svg", members: 3200, created_by: 'demo-u1', cover_url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74' },
  { id: 'demo-c5', name: 'Algo Trading Builders', description: 'Python, Pinescript, and algorithmic trading discussions.', avatar_url: "/default-avatar.svg", members: 5400, created_by: 'demo-u2', cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71' },
  { id: 'demo-c6', name: 'Price Action Purists', description: 'Naked chart trading, support/resistance, and candlestick psychology.', avatar_url: "/default-avatar.svg", members: 7800, created_by: 'demo-u3', cover_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7' },
  { id: 'demo-c7', name: 'BankNifty Scalpers', description: '1-minute chart scalping strategies for Indian indices.', avatar_url: "/default-avatar.svg", members: 15400, created_by: 'demo-u4', cover_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3' },
  { id: 'demo-c8', name: 'Forex Majors Daily', description: 'EURUSD, GBPUSD, and USDJPY daily setups and bias.', avatar_url: "/default-avatar.svg", members: 4100, created_by: 'demo-u5', cover_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f' },
  { id: 'demo-c9', name: 'Prop Firm Funded', description: 'Passing FTMO and MFF challenges, risk management tips.', avatar_url: "/default-avatar.svg", members: 9200, created_by: 'demo-u6', cover_url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82' },
  { id: 'demo-c10', name: 'Swing Trading Equities', description: 'Long term holds and swing setups for US Stocks.', avatar_url: "/default-avatar.svg", members: 6300, created_by: 'demo-u7', cover_url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74' },
  { id: 'demo-c11', name: 'DeFi Alpha Drops', description: 'Airdrops, yield farming, and new web3 protocols.', avatar_url: "/default-avatar.svg", members: 11000, created_by: 'demo-u8', cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71' },
];
