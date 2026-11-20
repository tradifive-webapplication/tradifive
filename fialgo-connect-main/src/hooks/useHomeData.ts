import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';
import { useMarket } from '@/contexts/MarketContext';


export type FeedPost = Database['public']['Tables']['social_posts']['Row'] & {
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export type WatchItem = Database['public']['Tables']['feed_watchlist']['Row'];
export type CalendarEvent = Database['public']['Tables']['economic_calendar']['Row'];
export type ProfileShort = {
  id: string;
  full_name: string | null;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username: string | null;
  avatar_url: string | null;
  location: string | null;
  streak_days: number | null;
  win_rate: number | null;
  total_trades: number | null;
  created_at?: string | null;
  is_pro?: boolean | null;
  trading_style?: string | null;
};

export type ProfileViewEvent = {
  viewer_id: string;
  viewed_at?: string;
};

// In-memory session cache — ensures instant tab transitions during the active session
// while eliminating the stale localStorage "before data" flash on initial load.
let sessionCachedFeeds: FeedPost[] | null = null;
let sessionCachedWatchlist: WatchItem[] | null = null;
let sessionCachedCalendar: CalendarEvent[] | null = null;
let sessionCachedFollowers: { count: number; avatars: string[] } | null = null;
let sessionCachedSuggestions: ProfileShort[] | null = null;
let sessionCachedProfileViews: ProfileViewEvent[] | null = null;
let sessionCachedWinningStreaks: ProfileShort[] | null = null;
let sessionCachedTopDisciplined: ProfileShort[] | null = null;

// Purge all legacy stale localStorage caches immediately on module load
try {
  localStorage.removeItem('home_cache_feeds');
  localStorage.removeItem('home_cache_suggestions');
  localStorage.removeItem('home_cache_winningStreaks');
  localStorage.removeItem('home_cache_topDisciplined');
  localStorage.removeItem('home_cache_watchlist');
  localStorage.removeItem('home_cache_calendar');
  localStorage.removeItem('home_cache_followers');
  localStorage.removeItem('home_cache_profile_views');
} catch (_) {}

export function useHomeData(userId: string) {
  // Purge any legacy stale localStorage caches permanently
  useEffect(() => {
    try {
      localStorage.removeItem('home_cache_feeds');
      localStorage.removeItem('home_cache_suggestions');
      localStorage.removeItem('home_cache_winningStreaks');
      localStorage.removeItem('home_cache_topDisciplined');
      localStorage.removeItem('home_cache_watchlist');
      localStorage.removeItem('home_cache_calendar');
      localStorage.removeItem('home_cache_followers');
      localStorage.removeItem('home_cache_profile_views');
      
      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      const cleaned = localPosts.filter((p: any) => !p.media_url || !String(p.media_url).startsWith('blob:') && !String(p.id).startsWith('demo-'));
      if (cleaned.length !== localPosts.length) {
        localStorage.setItem('fialgo_local_posts', JSON.stringify(cleaned));
      }
    } catch (_) {}
  }, []);

  const [feeds, setFeeds] = useState<FeedPost[]>(() => sessionCachedFeeds || []);
  const [watchlist, setWatchlist] = useState<WatchItem[]>(() => sessionCachedWatchlist || []);
  const [calendar, setCalendar] = useState<CalendarEvent[]>(() => sessionCachedCalendar || []);
  const [followers, setFollowers] = useState<{ count: number; avatars: string[] }>(
    () => sessionCachedFollowers || { count: 0, avatars: [] }
  );
  const [suggestions, setSuggestions] = useState<ProfileShort[]>(() => sessionCachedSuggestions || []);
  const [profileViews, setProfileViews] = useState<ProfileViewEvent[]>(() => sessionCachedProfileViews || []);
  const [winningStreaks, setWinningStreaks] = useState<ProfileShort[]>(() => sessionCachedWinningStreaks || []);
  const [topDisciplined, setTopDisciplined] = useState<ProfileShort[]>(() => sessionCachedTopDisciplined || []);

  const [livePrices, setLivePrices] = useState<Record<string, { price: string; change: string; is_positive: boolean }>>({});

  // Show clean skeleton loader until real Supabase data arrives (eliminates stale "before data" flash)
  const [loading, setLoading] = useState<boolean>(() => sessionCachedFeeds === null);

  const { activeMarket, finishSwitching, isSwitching } = useMarket();

  const fetchAll = async () => {
    try {
      const [
        { data: rawFeedData, error: feedErr },
        { data: watchData, error: watchErr },
        { data: calData, error: calErr },
        { data: followData, error: followErr, count: followCount },
        { data: sugData, error: sugErr },
        { data: streakData, error: streakErr },
        { data: discData, error: discErr }
      ] = await Promise.all([
        supabase.from('social_posts').select('*').neq('post_type', 'story').order('created_at', { ascending: false }).limit(50),
        userId ? supabase.from('feed_watchlist').select('*').eq('user_id', userId).order('sort_order', { ascending: true }).limit(20) : Promise.resolve({ data: [] } as any),
        supabase.from('economic_calendar').select('*').ilike('impact', '%high%').order('event_time', { ascending: true }).limit(30),
        userId ? supabase.from('social_follows').select('follower_id, profiles!social_follows_follower_id_fkey(avatar_url)', { count: 'exact' }).eq('following_id', userId).limit(5) : Promise.resolve({ data: [], count: 0 } as any),
        supabase.from('profiles').select('id, full_name, display_name, first_name, last_name, username, avatar_url, location, streak_days, win_rate, total_trades, created_at, is_pro, trading_style').neq('id', userId).order('created_at', { ascending: false }).limit(25),
        supabase.from('profiles').select('id, full_name, display_name, first_name, last_name, username, avatar_url, location, streak_days, win_rate, total_trades').order('streak_days', { ascending: false, nullsFirst: false }).limit(3),
        supabase.from('profiles').select('id, full_name, display_name, first_name, last_name, username, avatar_url, location, streak_days, win_rate, total_trades').order('win_rate', { ascending: false, nullsFirst: false }).limit(3)
      ]);

      // Fetch Profile Visitors (who viewed current user's profile)
      let resolvedViews: ProfileViewEvent[] = [];
      let extraVisitorProfiles: ProfileShort[] = [];
      if (userId) {
        try {
          const { data: viewNotifs } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'profile_view')
            .order('created_at', { ascending: false })
            .limit(15);
          if (viewNotifs && viewNotifs.length > 0) {
            viewNotifs.forEach((n: any) => {
              const vId = n.metadata?.viewer_id;
              if (vId && vId !== userId && !resolvedViews.some(rv => rv.viewer_id === vId)) {
                resolvedViews.push({ viewer_id: vId, viewed_at: n.created_at || new Date().toISOString() });
              }
            });
          }
        } catch (_) {}

        // Combine with localStorage instant local visitor entries
        try {
          const localViews = JSON.parse(localStorage.getItem(`tradifive_profile_views_${userId}`) || '[]');
          if (Array.isArray(localViews)) {
            localViews.forEach((lv: any) => {
              if (lv.viewer_id && lv.viewer_id !== userId && !resolvedViews.some(rv => rv.viewer_id === lv.viewer_id)) {
                resolvedViews.push({ viewer_id: lv.viewer_id, viewed_at: lv.viewed_at || new Date().toISOString() });
              }
            });
          }
        } catch (_) {}

        // If any visitor profile is not present in sugData, fetch them directly
        const existingIds = new Set((sugData || []).map((p: any) => p.id));
        const missingViewerIds = resolvedViews.map(v => v.viewer_id).filter(vId => !existingIds.has(vId));
        if (missingViewerIds.length > 0) {
          try {
            const { data: vProfs } = await supabase
              .from('profiles')
              .select('id, full_name, display_name, first_name, last_name, username, avatar_url, location, streak_days, win_rate, total_trades, created_at, is_pro, trading_style')
              .in('id', missingViewerIds);
            if (vProfs && vProfs.length > 0) {
              extraVisitorProfiles = vProfs as ProfileShort[];
            }
          } catch (_) {}
        }
      }

      sessionCachedProfileViews = resolvedViews;
      setProfileViews(resolvedViews);

      // Batch enrich posts with profiles to avoid missing foreign key relation errors
      let feedData: any[] = [];
      if (rawFeedData && rawFeedData.length > 0) {
        const authorIds = Array.from(new Set(rawFeedData.map((f: any) => f.user_id).filter(Boolean)));
        let profileLookup: Record<string, any> = {};
        if (authorIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', authorIds);
          if (profs) {
            profs.forEach((pr: any) => { profileLookup[pr.id] = pr; });
          }
        }
        feedData = rawFeedData.map((f: any) => ({
          ...f,
          profiles: profileLookup[f.user_id] || null
        }));
      }

      let newFollowers = {
        count: followCount ?? 0,
        avatars: followData?.map((f: any) => f.profiles?.avatar_url).filter(Boolean) || []
      };

      sessionCachedFollowers = newFollowers;
      setFollowers(newFollowers);

      const combinedSuggestions = [...extraVisitorProfiles, ...((sugData as ProfileShort[]) || [])];
      sessionCachedSuggestions = combinedSuggestions;
      setSuggestions(combinedSuggestions);

      const streaks = (streakData as ProfileShort[]) || [];
      sessionCachedWinningStreaks = streaks;
      setWinningStreaks(streaks);

      const disciplined = (discData as ProfileShort[]) || [];
      sessionCachedTopDisciplined = disciplined;
      setTopDisciplined(disciplined);

      let deletedPostIds = new Set<string>();
      try {
        const deletedArr = JSON.parse(localStorage.getItem('tradifive_deleted_post_ids') || '[]');
        deletedPostIds = new Set(deletedArr.map(String));
      } catch (_) {}

      // removed unsafe localPosts parse

      const dbSignaturesFeeds = new Set(feedData?.map((f: any) => `${f.user_id}-${f.content}-${f.media_url}`) || []);
      const dbIdsFeeds = new Set(feedData?.map((f: any) => String(f.id)) || []);
      // 3. Local Storage Posts (Immediate UI feedback)
      const localPostsStr = localStorage.getItem('fialgo_local_posts') || '[]';
      let unresolvedLocalPosts = [];
      try {
        unresolvedLocalPosts = JSON.parse(localPostsStr);
        // Aggressively clear mock data from local posts
        const originalLength = unresolvedLocalPosts.length;
        unresolvedLocalPosts = unresolvedLocalPosts.filter((p: any) => !String(p.id).startsWith('demo-'));
        if (unresolvedLocalPosts.length !== originalLength) {
          localStorage.setItem('fialgo_local_posts', JSON.stringify(unresolvedLocalPosts));
        }

        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        unresolvedLocalPosts = unresolvedLocalPosts.filter((p: any) => {
          if (deletedPostIds.has(String(p.id))) return false;
          if (p.user_id && p.user_id !== userId) return false;
          const postTime = p.created_at ? new Date(p.created_at).getTime() : 0;
          if (postTime && postTime < oneDayAgo) return false;
          if (p.profiles && (!p.profiles.avatar_url || p.profiles.avatar_url.includes('dicebear'))) {
            p.profiles.avatar_url = '/nikil_avatar.jpg';
          }
          const sig = `${p.user_id}-${p.content}-${p.media_url}`;
          return !dbSignaturesFeeds.has(sig) && !dbIdsFeeds.has(String(p.id));
        });
      } catch (e) { }

      const localFeeds = unresolvedLocalPosts.filter((p: any) => p.post_type !== 'story');

      const combinedFeeds = [...localFeeds, ...((feedData as any) ?? [])].filter((p: any) => p && p.id && !deletedPostIds.has(String(p.id)));

      combinedFeeds.sort((a: any, b: any) => {
        const timeA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
        return isNaN(timeB) || isNaN(timeA) ? 0 : timeB - timeA;
      });

      sessionCachedFeeds = combinedFeeds;
      setFeeds(combinedFeeds);

      // 1. Filter Watchlist by activeMarket (keep all relevant asset classes visible)
      let finalWatch: WatchItem[] = [];
      const rawWatch = watchData ?? [];
      if (activeMarket === 'indian') {
        finalWatch = rawWatch.filter(item => item.symbol_type === 'index' || item.symbol_type === 'equity');
      } else {
        finalWatch = rawWatch.filter(item => item.symbol_type === 'crypto' || item.symbol_type === 'forex' || item.symbol_type === 'commodity' || item.symbol_type === 'index' || item.symbol_type === 'equity');
      }

      sessionCachedWatchlist = finalWatch;
      setWatchlist(finalWatch);

      // 2. Fetch Real Live Economic News from Forex Factory (official nfs.faireconomy.media feed, with 15m rate-limit-safe cache)
      let finalCal: any[] = [];
      const rawCal = (calData ?? []).filter((item: any) => {
        const imp = (item.impact || '').toLowerCase();
        return imp === 'high' || imp === 'medium' || imp === 'low';
      });
      if (activeMarket === 'indian') {
        finalCal = rawCal.filter(item => item.currency === 'INR');
      } else {
        finalCal = rawCal.filter(item => item.currency !== 'INR');
      }

      try {
        const cachedCal = sessionCachedCalendar;
        const lastFfFetch = Number(sessionStorage.getItem('home_ff_last_fetch_time') || '0');
        const cacheFresh = Array.isArray(cachedCal) && cachedCal.length > 0 && (Date.now() - lastFfFetch) < 15 * 60 * 1000;

        if (cacheFresh && cachedCal[0]?.source === 'ForexFactory') {
          finalCal = cachedCal;
        } else {
          let liveEvents: any[] = [];
          const endpoints = [
            '/api/economic-calendar',
            'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
            'https://www.tradifive.in/api/economic-calendar',
          ];
          for (const url of endpoints) {
            if (liveEvents.length > 0) break;
            try {
              const calRes = await fetch(url, { cache: 'no-store' });
              if (!calRes.ok) continue;
              const ct = calRes.headers.get('content-type') || '';
              if (!ct.includes('json') && !url.endsWith('.json')) continue;
              const parsed = await calRes.json();
              if (Array.isArray(parsed) && parsed.length > 0) {
                liveEvents = parsed;
              }
            } catch {
              // try next endpoint
            }
          }

          if (Array.isArray(liveEvents) && liveEvents.length > 0) {
            // Keep High, Medium, and Low impact real Forex Factory events sorted chronologically
            const filteredLive = liveEvents
              .filter((e: any) => {
                const imp = (e.impact || '').toLowerCase();
                return imp === 'high' || imp === 'medium' || imp === 'low';
              })
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const fetchedLive = filteredLive.map((e: any, idx: number) => ({
              id: `ff-${e.country || 'USD'}-${idx}-${e.date}`,
              event_time: e.date,
              event_title: e.title,
              currency: (e.country || 'USD').toUpperCase(),
              impact: (e.impact || 'low').toLowerCase(),
              forecast: e.forecast || '',
              previous: e.previous || '',
              actual: e.actual || null,
              source: 'ForexFactory',
              created_at: new Date().toISOString()
            }));

            if (fetchedLive.length > 0) {
              finalCal = fetchedLive;
              sessionStorage.setItem('home_ff_last_fetch_time', String(Date.now()));
            }
          } else if (Array.isArray(cachedCal) && cachedCal.length > 0 && cachedCal[0]?.source === 'ForexFactory') {
            // Preserve valid cached Forex Factory data if temporarily rate-limited
            finalCal = cachedCal;
          }
        }
      } catch (e) {
        console.warn('Live Forex Factory fetch failed, using cached/fallback data.', e);
      }

      if (finalCal.length === 0 && rawCal.length > 0) {
        finalCal = rawCal;
      }

      sessionCachedCalendar = finalCal;
      setCalendar(finalCal);
      localStorage.setItem('home_last_fetch_time', String(Date.now()));

    } catch (err) {
      console.error('Home page data loading failed:', err);
    } finally {
      setLoading(false);
      if (isSwitching) {
        // Ensure animation plays for at least a minimum time so it doesn't just flash quickly
        setTimeout(() => {
          finishSwitching();
        }, 1200);
      }
    }
  };

  useEffect(() => {
    fetchAll();

    // Auto-refresh daily & on tab re-focus (keeps economic calendar fresh)
    const onFocus = () => {
      const lastFetch = localStorage.getItem('home_last_fetch_time');
      const now = Date.now();
      // If more than 30 minutes since last full fetch, refresh silently
      if (!lastFetch || now - Number(lastFetch) > 30 * 60 * 1000) {
        fetchAll();
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    const refreshInterval = setInterval(onFocus, 30 * 60 * 1000); // 30 min periodic check
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
      clearInterval(refreshInterval);
    };
  }, [userId, activeMarket]);

  // Real-time multi-asset market data engine (Binance Crypto & Gold, Currency-API Forex/Metals, Yahoo Indices/Stocks)
  useEffect(() => {
    if (!watchlist || watchlist.length === 0) return;

    let isMounted = true;
    let ws: WebSocket | null = null;
    let interval: any;

    const CRYPTO_BASES = new Set([
      'BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'DOGE', 'ADA', 'AVAX', 'LINK', 'DOT',
      'LTC', 'SHIB', 'SUI', 'TON', 'MATIC', 'POL', 'UNI', 'BCH', 'PEPE', 'TRX',
      'ARB', 'OP', 'NEAR', 'APT', 'ATOM', 'XLM', 'ETC', 'FIL', 'INJ', 'PAXG'
    ]);

    const FIAT_AND_METALS = new Set([
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'SGD', 'HKD',
      'CNY', 'INR', 'ZAR', 'MXN', 'TRY', 'SEK', 'NOK', 'DKK', 'PLN', 'AED',
      'XAU', 'XAG', 'XPT', 'XPD'
    ]);

    const YAHOO_ALIAS: Record<string, string> = {
      NAS100: 'NQ=F',
      NASDAQ: '^IXIC',
      NDX: '^NDX',
      US100: 'NQ=F',
      US30: 'YM=F',
      DJI: '^DJI',
      SPX500: 'ES=F',
      US500: 'ES=F',
      SPX: '^GSPC',
      USOIL: 'CL=F',
      WTI: 'CL=F',
      BRENT: 'BZ=F',
      UKOIL: 'BZ=F',
      DXY: 'DX-Y.NYB',
      NIFTY50: '^NSEI',
      NIFTY: '^NSEI',
      BANKNIFTY: '^NSEBANK',
      FINNIFTY: 'NIFTY_FIN_SERVICE.NS',
      SENSEX: '^BSESN',
      RELIANCE: 'RELIANCE.NS',
      TCS: 'TCS.NS',
      INFY: 'INFY.NS',
      HDFCBANK: 'HDFCBANK.NS',
      ICICIBANK: 'ICICIBANK.NS',
      SBIN: 'SBIN.NS',
      TATAMOTORS: 'TATAMOTORS.NS',
      ITC: 'ITC.NS',
      BHARTIARTL: 'BHARTIARTL.NS',
    };

    const normalizePair = (raw: string) => {
      let s = raw.trim().toUpperCase().replace(/\s+/g, '').replace(/[-_]/g, '/');
      // Fix common quote typo (e.g. XAU/UAD -> XAU/USD)
      s = s.replace(/\/UAD$/, '/USD').replace(/UAD$/, 'USD');
      if (s === 'GOLD') return 'XAU/USD';
      if (s === 'SILVER') return 'XAG/USD';
      return s;
    };

    const formatMarketPrice = (val: number, symbol: string) => {
      const upper = symbol.toUpperCase();
      if (upper.includes('JPY') || upper.includes('XAU') || upper.includes('GOLD') || upper.includes('BTC') || upper.includes('ETH') || val >= 50) {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      if (val < 0.1) {
        return val.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 6 });
      }
      return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    };

    // Bucket symbols by best live data provider
    const binanceMap: Record<string, string[]> = {}; // binanceSymbol -> original watchlist symbols[]
    const forexItems: { original: string; normalized: string; base: string; quote: string }[] = [];
    const yahooItems: { original: string; yahooSymbol: string }[] = [];

    watchlist.forEach((item) => {
      const norm = normalizePair(item.symbol);
      const compact = norm.replace(/\//g, '');

      // 1. Gold spot -> real-time Binance PAXGUSDT (1:1 troy oz Gold) + currency-api fallback
      if (norm === 'XAU/USD' || compact === 'XAUUSD' || norm === 'XAU') {
        if (!binanceMap['PAXGUSDT']) binanceMap['PAXGUSDT'] = [];
        binanceMap['PAXGUSDT'].push(item.symbol);
        forexItems.push({ original: item.symbol, normalized: 'XAU/USD', base: 'XAU', quote: 'USD' });
        return;
      }

      // 2. Standard Forex & Precious Metals pairs (check before crypto so mis-tagged FX pairs still resolve!)
      let fxBase = '';
      let fxQuote = '';
      if (norm.includes('/')) {
        [fxBase, fxQuote] = norm.split('/');
      } else if (compact.length === 6) {
        fxBase = compact.slice(0, 3);
        fxQuote = compact.slice(3, 6);
      }
      if (fxBase && fxQuote && FIAT_AND_METALS.has(fxBase) && FIAT_AND_METALS.has(fxQuote)) {
        forexItems.push({ original: item.symbol, normalized: `${fxBase}/${fxQuote}`, base: fxBase, quote: fxQuote });
        return;
      }

      // 3. Known Indices / Oil / Equities -> Yahoo Finance same-origin proxy
      if (YAHOO_ALIAS[compact] || item.symbol_type === 'index' || item.symbol_type === 'equity') {
        const ySym = YAHOO_ALIAS[compact] || (activeMarket === 'indian' && !compact.includes('.') && !compact.startsWith('^') ? `${compact}.NS` : compact);
        yahooItems.push({ original: item.symbol, yahooSymbol: ySym });
        return;
      }

      // 4. Direct Crypto pairs -> Binance REST + WebSocket (normalize /USD -> USDT)
      const [partBase, partQuote] = norm.includes('/') ? norm.split('/') : [compact.replace(/(USDT|USDC|USD)$/, ''), compact.match(/(USDT|USDC|USD)$/)?.[0] || ''];
      if (CRYPTO_BASES.has(partBase) || item.symbol_type === 'crypto' || partQuote === 'USDT' || partQuote === 'USDC') {
        const bSym = `${partBase}${partQuote === 'USD' || !partQuote ? 'USDT' : partQuote}`;
        if (!binanceMap[bSym]) binanceMap[bSym] = [];
        binanceMap[bSym].push(item.symbol);
        return;
      }

      // 5. Fallback: try Yahoo Finance for any other ticker (e.g. AAPL, TSLA, NVDA, RELIANCE)
      yahooItems.push({ original: item.symbol, yahooSymbol: compact });
    });

    // A. Binance Live REST + WebSocket (Crypto + Gold XAU/USD via PAXGUSDT)
    const binanceSymbols = Object.keys(binanceMap);
    if (binanceSymbols.length > 0) {
      const fetchBinanceRest = async () => {
        const updates: Record<string, { price: string; change: string; is_positive: boolean }> = {};
        const applyTicker = (ticker: any) => {
          const origList = binanceMap[ticker.symbol];
          if (!origList) return;
          const p = parseFloat(ticker.lastPrice);
          const ch = parseFloat(ticker.priceChangePercent);
          if (!isNaN(p) && p > 0) {
            origList.forEach((origSym) => {
              updates[origSym] = {
                price: formatMarketPrice(p, origSym),
                change: `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`,
                is_positive: ch >= 0,
              };
            });
          }
        };

        try {
          const encoded = encodeURIComponent(JSON.stringify(binanceSymbols));
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encoded}`);
          if (res.ok) {
            const arr = await res.json();
            if (Array.isArray(arr)) arr.forEach(applyTicker);
          } else {
            // If any single symbol is invalid on Binance, query individually so valid symbols still populate
            await Promise.allSettled(
              binanceSymbols.map(async (sym) => {
                const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(sym)}`);
                if (r.ok) applyTicker(await r.json());
              })
            );
          }
          if (isMounted && Object.keys(updates).length > 0) {
            setLivePrices((prev) => ({ ...prev, ...updates }));
          }
        } catch {
          // WebSocket / fallback will populate
        }
      };

      fetchBinanceRest();

      try {
        const streams = binanceSymbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');
        ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            const d = msg.data;
            if (!d || !d.s) return;
            const origList = binanceMap[d.s];
            if (!origList) return;
            const p = parseFloat(d.c);
            const ch = parseFloat(d.P);
            if (isNaN(p) || p <= 0) return;
            setLivePrices((prev) => {
              const next = { ...prev };
              origList.forEach((origSym) => {
                next[origSym] = {
                  price: formatMarketPrice(p, origSym),
                  change: `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`,
                  is_positive: ch >= 0,
                };
              });
              return next;
            });
          } catch {
            // ignore malformed tick
          }
        };
      } catch {
        // ignore ws errors
      }
    }

    // B. Forex & Metals Real Rates (Today + Yesterday from jsDelivr Currency API -> REAL 24h % change)
    const fetchForexAndYahoo = async () => {
      if (forexItems.length > 0) {
        try {
          const yest = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const yestStr = `${yest.getUTCFullYear()}-${String(yest.getUTCMonth() + 1).padStart(2, '0')}-${String(yest.getUTCDate()).padStart(2, '0')}`;

          const [latestRes, prevRes] = await Promise.all([
            fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', { cache: 'no-store' }),
            fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${yestStr}/v1/currencies/usd.json`).catch(() => null),
          ]);

          if (latestRes.ok) {
            const latestJson = await latestRes.json();
            const prevJson = prevRes && prevRes.ok ? await prevRes.json().catch(() => null) : null;
            const rates = latestJson.usd || {};
            const prevRates = prevJson?.usd || {};

            const calcRate = (map: Record<string, number>, b: string, q: string) => {
              const bl = b.toLowerCase();
              const ql = q.toLowerCase();
              if (bl === 'usd' && map[ql]) return map[ql];
              if (ql === 'usd' && map[bl]) return 1 / map[bl];
              if (map[bl] && map[ql]) return map[ql] / map[bl];
              return 0;
            };

            const forexUpdates: Record<string, { price: string; change: string; is_positive: boolean }> = {};
            forexItems.forEach((item) => {
              const curr = calcRate(rates, item.base, item.quote);
              if (curr > 0) {
                const prevVal = calcRate(prevRates, item.base, item.quote);
                const pct = prevVal > 0 ? ((curr - prevVal) / prevVal) * 100 : 0;
                forexUpdates[item.original] = {
                  price: formatMarketPrice(curr, item.normalized),
                  change: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
                  is_positive: pct >= 0,
                };
              }
            });

            if (isMounted && Object.keys(forexUpdates).length > 0) {
              setLivePrices((prev) => {
                // Keep real-time Binance tick if already populated for Gold (XAU/USD)
                const merged = { ...prev };
                Object.entries(forexUpdates).forEach(([k, v]) => {
                  const isGold = normalizePair(k).startsWith('XAU');
                  if (isGold && merged[k] && merged[k].price !== 'Unavailable' && merged[k].price !== '—') {
                    return;
                  }
                  merged[k] = v;
                });
                return merged;
              });
            }
          }
        } catch {
          // ignore network error
        }
      }

      // C. Indices, Oil, US & Indian Equities via same-origin Vercel Yahoo Finance proxy
      if (yahooItems.length > 0) {
        const yahooUpdates: Record<string, { price: string; change: string; is_positive: boolean }> = {};
        await Promise.allSettled(
          yahooItems.map(async ({ original, yahooSymbol }) => {
            try {
              const res = await fetch(`/api/market-quote/${encodeURIComponent(yahooSymbol)}`, { cache: 'no-store' });
              if (!res.ok) return;
              const ct = res.headers.get('content-type') || '';
              if (!ct.includes('json')) return;
              const json = await res.json();
              const meta = json?.chart?.result?.[0]?.meta;
              const price = Number(meta?.regularMarketPrice);
              const prevClose = Number(meta?.chartPreviousClose || meta?.previousClose || price);
              if (!isNaN(price) && price > 0) {
                const pct = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
                yahooUpdates[original] = {
                  price: formatMarketPrice(price, original),
                  change: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
                  is_positive: pct >= 0,
                };
              }
            } catch {
              // ignore individual ticker failures
            }
          })
        );
        if (isMounted && Object.keys(yahooUpdates).length > 0) {
          setLivePrices((prev) => ({ ...prev, ...yahooUpdates }));
        }
      }
    };

    fetchForexAndYahoo();
    interval = setInterval(fetchForexAndYahoo, 30000);

    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (interval) clearInterval(interval);
    };
  }, [watchlist, activeMarket]);

  // Combine live prices into return watchlist object
  const watchlistWithPrices = watchlist.map(item => {
    const live = livePrices[item.symbol];
    return {
      ...item,
      price: live ? live.price : '—',
      change: live ? live.change : '—',
      is_positive: live ? live.is_positive : (item.symbol_type === 'crypto' || item.is_pinned)
    };
  });

  const removePost = (postId: string) => {
    const postIdStr = String(postId);
    sessionCachedFeeds = (sessionCachedFeeds || []).filter(f => String(f.id) !== postIdStr);
    setFeeds(prev => prev.filter(f => String(f.id) !== postIdStr));

    // Permanently remove from fialgo_local_posts
    try {
      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      const updatedLocal = localPosts.filter((p: any) => String(p.id) !== postIdStr);
      localStorage.setItem('fialgo_local_posts', JSON.stringify(updatedLocal));
    } catch (_) {}

    // Record in deleted posts tombstone to prevent resurrection
    try {
      const deleted = JSON.parse(localStorage.getItem('tradifive_deleted_post_ids') || '[]');
      if (!deleted.includes(postIdStr)) {
        deleted.push(postIdStr);
        localStorage.setItem('tradifive_deleted_post_ids', JSON.stringify(deleted.slice(-500)));
      }
    } catch (_) {}
  };

  return {
    feeds,
    watchlist: watchlistWithPrices,
    calendar,
    followers,
    suggestions,
    profileViews,
    winningStreaks,
    topDisciplined,
    loading,
    refetch: fetchAll,
    removePost
  };
}
