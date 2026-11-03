import { useState, useEffect } from 'react';
import { supabase } from '../app/utils/supabase';
import { useStore } from '../app/store';

export function useDashboardData() {
  const [balance, setBalance] = useState(0);
  const [equity, setEquity] = useState(0);
  const [drawdown, setDrawdown] = useState(0);
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
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }
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
        // Zero balance/equity details if no real account is bound
        setBalance(0);
        setEquity(0);
        setDrawdown(0);
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
        // Clean authentic empty state: zero mock trades
        setRecentTrades([]);
        setWinRate(0);
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
