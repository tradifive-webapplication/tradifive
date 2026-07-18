import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { recordUserActivity } from '@/lib/activity';
import { createNotification } from '@/lib/notifications';
import { useTrading } from '@/contexts/TradingContext';
import { useMarket } from '@/contexts/MarketContext';

export function useDashboardData() {
  const [todayProfit, setTodayProfit] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [tradesToday, setTradesToday] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [drawdown, setDrawdown] = useState(0);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [lastClosedTrade, setLastClosedTrade] = useState<any>(null);
  const [isAlgoRunning, setIsAlgoRunning] = useState(false);
  const [balance, setBalance] = useState(0);
  const [equity, setEquity] = useState(0);
  const [accountMetrics, setAccountMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastImportTime, setLastImportTime] = useState<string>("Feb 18, 2026 05:17 AM");

  // New Live Telemetry State Variables
  const [avgDisciplineScore, setAvgDisciplineScore] = useState<number | null>(null);
  const [dailyXpEarned, setDailyXpEarned] = useState<number>(0);
  const [riskConfig, setRiskConfig] = useState<any | null>(null);
  const [breachLogs, setBreachLogs] = useState<any[]>([]);

  const { activeMarket } = useMarket();

  // Auto-sync Indian broker data (balance + trades) whenever on Indian market
  useEffect(() => {
    if (activeMarket !== 'indian') return;

    const triggerIndianSync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Check if user has an active Indian broker connection
        const { data: brokerData } = await supabase
          .from('broker_connections')
          .select('id, broker_name, connection_status')
          .eq('user_id', session.user.id)
          .eq('connection_status', 'active')
          .limit(1)
          .maybeSingle();

        if (brokerData) {
          // Fire sync in background — do not block the UI
          supabase.functions.invoke('sync-indian-trades', {
            body: { action: 'sync' }
          }).then(() => {
            // After sync completes, re-fetch the updated balance
            fetchData();
          }).catch((err) => {
            console.warn('Indian broker sync error (non-blocking):', err?.message || err);
          });
        }
      } catch (err) {
        // Silently swallow — sync is best-effort
      }
    };

    triggerIndianSync();
    // Re-sync every 5 minutes while on Indian market
    const interval = setInterval(triggerIndianSync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeMarket]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Use getSession() instead of getUser() to avoid acquiring the
      // Supabase auth lock. Multiple components calling getUser()
      // simultaneously causes NavigatorLockAcquireTimeoutError.
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        const formatTime = (date: Date) => date.toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        if (activeMarket === 'indian') {
          // ── INDIAN MARKET ── Read from dedicated indian_broker_accounts table
          const { data: indianAccount } = await supabase
            .from('indian_broker_accounts')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (indianAccount) {
            setAccountMetrics({
              broker: indianAccount.broker_name,
              account_number: indianAccount.client_id || indianAccount.account_number || 'Connected',
              broker_server: `${indianAccount.broker_name?.toUpperCase()} API`,
              connection_status: indianAccount.connection_status,
              balance: indianAccount.balance,
              equity: indianAccount.equity,
            });
            setBalance(indianAccount.balance || 0);
            setEquity(indianAccount.equity || 0);
            const bal = indianAccount.balance || 0;
            const eq = indianAccount.equity || 0;
            const dd = bal > 0 && eq < bal ? ((bal - eq) / bal) * 100 : 0;
            setDrawdown(dd);
            setIsAlgoRunning(false); // Indian market has no algo runner yet
            setLastImportTime(formatTime(new Date(indianAccount.last_synced_at || indianAccount.updated_at)));
          } else {
            // No indian_broker_accounts record yet — check if we at least have a broker_connections entry
            const { data: connData } = await supabase
              .from('broker_connections')
              .select('*')
              .eq('user_id', user.id)
              .eq('connection_status', 'active')
              .limit(1)
              .maybeSingle();

            if (connData) {
              // Broker connected but not yet synced — show connected state with 0 balance until sync runs
              setAccountMetrics({
                broker: connData.broker_name,
                account_number: connData.client_id || 'Connected',
                broker_server: `${connData.broker_name?.toUpperCase()} API`,
                connection_status: connData.connection_status,
                balance: (connData as any).balance || 0,
                equity: (connData as any).balance || 0,
              });
              setBalance((connData as any).balance || 0);
              setEquity((connData as any).balance || 0);
              setDrawdown(0);
              setIsAlgoRunning(false);
              setLastImportTime(formatTime(new Date(connData.updated_at)));
            } else {
              setAccountMetrics(null);
              setBalance(0);
              setEquity(0);
              setDrawdown(0);
              setIsAlgoRunning(false);
            }
          }
        } else {
          // ── GLOBAL MARKET (Forex) ── Read from mt5_accounts table
          const { data: accountData } = await supabase
            .from('mt5_accounts')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (accountData) {
            setAccountMetrics(accountData);
            const bal = accountData.balance || 0;
            const eq = accountData.equity || 0;
            setBalance(bal);
            setEquity(eq);
            setIsAlgoRunning(accountData.algo_status || false);
            const calculatedDD = bal > 0 && eq < bal ? ((bal - eq) / bal) * 100 : 0;
            setDrawdown(calculatedDD);
            setLastImportTime(formatTime(new Date()));
          } else {
            setAccountMetrics(null);
            setBalance(0);
            setEquity(0);
            setIsAlgoRunning(false);
            setDrawdown(0);
          }
        }

        // 2. Fetch trades data
        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('closed_at', { ascending: false });

        let uniqueTrades: any[] = [];
        if (tradesData && tradesData.length > 0) {
          // Deduplicate trades based on MT5 ticket or Supabase ID to prevent inflated profits if the webhook double-inserted
          const uniqueMap = new Map();
          tradesData.forEach(t => {
            const key = t.ticket || t.id;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, t);
            }
          });
          uniqueTrades = Array.from(uniqueMap.values());
        } else {
          uniqueTrades = [];
        }

        if (uniqueTrades.length > 0) {
          setRecentTrades(uniqueTrades);
          // Track the most recently closed trade for revenge-trade detection
          setLastClosedTrade(uniqueTrades[0]);
          const winners = uniqueTrades.filter(t => t.profit > 0);
          const wr = uniqueTrades.length > 0 ? (winners.length / uniqueTrades.length) * 100 : 0;
          setWinRate(Math.round(wr));

          // Overall P&L across ALL trades
          setTotalProfit(uniqueTrades.reduce((acc, t) => acc + (t.profit || 0), 0));

          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const todays = uniqueTrades.filter(t => new Date(t.closed_at || t.created_at) >= startOfToday);
          setTodayProfit(todays.reduce((acc, t) => acc + (t.profit || 0), 0));
          setTradesToday(todays.length);

          // Calculate average discipline score from actual completed trades
          const scoredTrades = uniqueTrades.filter(t => t.discipline_score !== null && t.discipline_score !== undefined);
          const avgScore = scoredTrades.length > 0
            ? Math.round(scoredTrades.reduce((acc, t) => acc + (t.discipline_score || 0), 0) / scoredTrades.length)
            : null;
          setAvgDisciplineScore(avgScore);
        } else {
          setRecentTrades([]);
          setLastClosedTrade(null);
          setWinRate(0);
          setTotalProfit(0);
          setTodayProfit(0);
          setTradesToday(0);
          setAvgDisciplineScore(null);
        }


        // 3. Fetch today's accumulated XP
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const { data: xpData } = await supabase
          .from('user_xp_ledger')
          .select('xp_amount')
          .eq('user_id', user.id)
          .gte('created_at', startOfToday.toISOString());

        const xpSum = xpData ? xpData.reduce((acc, r) => acc + (r.xp_amount || 0), 0) : 0;
        setDailyXpEarned(xpSum);

        // 4. Fetch risk limit configurations
        const { data: configData } = await supabase
          .from('user_risk_configs')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        setRiskConfig(configData);

        // 5. Fetch today's active risk logs
        const { data: logsData } = await supabase
          .from('risk_breach_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startOfToday.toISOString())
          .order('created_at', { ascending: false });
        setBreachLogs(logsData || []);
      }
    } catch (err) {
      console.error("Dashboard Data Sync Failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let channel: any = null;
    let isMounted = true;

    fetchData();

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || !isMounted) return;

      const uniqueId = Math.random().toString(36).substring(2, 9);
      channel = supabase.channel(`dashboard_sync_v4_${user.id}_${Date.now()}_${uniqueId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mt5_accounts', filter: `user_id=eq.${user.id}` },
          payload => {
            if (!isMounted) return;
            setAccountMetrics(payload.new);
            const bal = payload.new.balance || 0;
            const eq = payload.new.equity || 0;
            setBalance(bal);
            setEquity(eq);
            setIsAlgoRunning(payload.new.algo_status);

            const calculatedDD = bal > 0 && eq < bal ? ((bal - eq) / bal) * 100 : 0;
            setDrawdown(calculatedDD);

            const formatTime = (date: Date) => {
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            };
            setLastImportTime(formatTime(new Date()));
          })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` },
          () => { if (isMounted) fetchData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_xp_ledger', filter: `user_id=eq.${user.id}` },
          () => { if (isMounted) fetchData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_risk_configs', filter: `user_id=eq.${user.id}` },
          () => { if (isMounted) fetchData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_breach_logs', filter: `user_id=eq.${user.id}` },
          () => { if (isMounted) fetchData(); })
        .subscribe();
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeMarket]);

  const toggleAlgoStatus = async (forcedState?: boolean) => {
    const newState = typeof forcedState === 'boolean' ? forcedState : !isAlgoRunning;
    setIsAlgoRunning(newState);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user) {
      await supabase.from('mt5_accounts').update({ algo_status: newState }).eq('user_id', user.id);
      await recordUserActivity(newState ? 'SWITCH_ON' : 'SWITCH_OFF', `User manually ${newState ? 'activated' : 'paused'} the trading engine.`);
      await createNotification({
        userId: user.id,
        type: 'TRADE',
        title: newState ? 'Trading Engine Active' : 'Trading Engine Paused',
        message: newState ? 'System synchronized. Automated executions are now active.' : 'Operational halt initiated. No new trades will be placed.'
      });
    }
  };

  const isConnected = !!accountMetrics?.account_number;

  const { terminalState } = useTrading();

  return {
    activeMarket,
    todayProfit: todayProfit,
    totalProfit: totalProfit,
    tradesToday: tradesToday,
    winRate: winRate,
    drawdown: drawdown,
    recentTrades: recentTrades,
    isAlgoRunning,
    balance: balance,
    equity: equity,
    accountMetrics,
    isDemoMode: !isConnected,
    serverData: accountMetrics,
    isConnected,
    loading: isLoading,
    toggleAlgoStatus,
    lastImportTime,
    refetch: fetchData,

    // New live fields
    avgDisciplineScore: avgDisciplineScore,
    dailyXpEarned: dailyXpEarned,
    riskConfig,
    breachLogs: breachLogs,
    lastClosedTrade
  };
}
