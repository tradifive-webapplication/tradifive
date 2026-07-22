import { useState, useEffect } from 'react';
import { supabase } from '../app/utils/supabase';
import { useStore } from '../app/store';

export function useDashboardData() {
  const [balance, setBalance] = useState(10540.25);
  const [equity, setEquity] = useState(10485.50);
  const [drawdown, setDrawdown] = useState(0.52);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [winRate, setWinRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentUser = useStore(state => state.currentUser);
  // Default to global forex market for mobile for now
  const activeMarket = 'global'; 

  useEffect(() => {
    fetchData();
  }, [currentUser?.id, activeMarket]);

  const fetchData = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);

    try {
      // ── GLOBAL MARKET (Forex) ── Read from mt5_accounts table
      const { data: accountData } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      if (accountData && accountData.balance && accountData.balance > 0) {
        setBalance(accountData.balance);
        setEquity(accountData.equity || accountData.balance);
        
        const bal = accountData.balance;
        const eq = accountData.equity || accountData.balance;
        const dd = bal > 0 && eq < bal ? ((bal - eq) / bal) * 100 : 0;
        setDrawdown(dd);
      } else {
        // Fallback to mock balance/equity details if no real data exists
        setBalance(10540.25);
        setEquity(10485.50);
        setDrawdown(0.52);
      }

      // ── Fetch Recent Trades ──
      const { data: trades } = await supabase
        .from('recent_trades')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('close_time', { ascending: false })
        .limit(10);

      if (trades && trades.length > 0) {
        setRecentTrades(trades);
        
        // Calculate basic win rate
        const wins = trades.filter(t => (t.profit || 0) > 0).length;
        setWinRate(Math.round((wins / trades.length) * 100));
      } else {
        // Fallback to mock trades
        const now = Date.now();
        const mockRecent = [
          { id: 't1', symbol: 'EURUSD', profit: 450.00, type: 'BUY', volume: 1.5, close_time: new Date(now - 1000 * 60 * 30).toISOString(), notes: 'Followed strategy perfectly, exited at target.' },
          { id: 't2', symbol: 'GBPUSD', profit: -120.00, type: 'SELL', volume: 1.0, close_time: new Date(now - 1000 * 60 * 180).toISOString(), notes: 'Stopped out early. Adhered to strict loss rule.' },
          { id: 't3', symbol: 'XAUUSD', profit: 800.00, type: 'BUY', volume: 2.0, close_time: new Date(now - 1000 * 60 * 600).toISOString(), notes: 'Great breakout execution on high volume.' },
          { id: 't4', symbol: 'USDCAD', profit: -50.00, type: 'BUY', volume: 0.8, close_time: new Date(now - 1000 * 60 * 1200).toISOString(), notes: 'Minor loss, setup invalidation reached.' },
          { id: 't5', symbol: 'USDJPY', profit: 600.00, type: 'SELL', volume: 1.2, close_time: new Date(now - 1000 * 60 * 2000).toISOString(), notes: 'Rode the trend to dynamic support level.' },
          { id: 't6', symbol: 'EURGBP', profit: 650.50, type: 'BUY', volume: 1.5, close_time: new Date(now - 1000 * 60 * 3000).toISOString(), notes: 'Perfect pull-back entry near key moving average.' }
        ];
        setRecentTrades(mockRecent);
        setWinRate(67);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance,
    equity,
    drawdown,
    recentTrades,
    winRate,
    isLoading,
    refetch: fetchData
  };
}
