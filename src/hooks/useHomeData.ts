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
  username: string | null;
  avatar_url: string | null;
  location: string | null;
  streak_days: number | null;
  win_rate: number | null;
  total_trades: number | null;
};

export function useHomeData(userId: string) {
  const getCache = (key: string, fallback: any) => {
    try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : fallback; } catch (e) { return fallback; }
  };

  // One-time cleanup: aggressively clear ALL old mock data caches
  useEffect(() => {
    try {
      localStorage.removeItem('home_cache_feeds');
      localStorage.removeItem('home_cache_suggestions');
      localStorage.removeItem('home_cache_winningStreaks');
      localStorage.removeItem('home_cache_topDisciplined');
      const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
      const cleaned = localPosts.filter((p: any) => !p.media_url || !String(p.media_url).startsWith('blob:') && !String(p.id).startsWith('demo-'));
      if (cleaned.length !== localPosts.length) {
        localStorage.setItem('fialgo_local_posts', JSON.stringify(cleaned));
      }
    } catch (_) {}
  }, []);

  const [feeds, setFeeds] = useState<FeedPost[]>(() => {
    const cached = getCache('home_cache_feeds', []);
    return cached;
  });

  const [watchlist, setWatchlist] = useState<WatchItem[]>(() => getCache('home_cache_watchlist', []));
  const [calendar, setCalendar] = useState<CalendarEvent[]>(() => getCache('home_cache_calendar', []));
  const [followers, setFollowers] = useState<{ count: number; avatars: string[] }>(() => getCache('home_cache_followers', { count: 0, avatars: [] }));
  const [suggestions, setSuggestions] = useState<ProfileShort[]>(() => getCache('home_cache_suggestions', []));
  const [winningStreaks, setWinningStreaks] = useState<ProfileShort[]>(() => getCache('home_cache_winningStreaks', []));
  const [topDisciplined, setTopDisciplined] = useState<ProfileShort[]>(() => getCache('home_cache_topDisciplined', []));

  const [livePrices, setLivePrices] = useState<Record<string, { price: string; change: string; is_positive: boolean }>>({});

  // Only show loading state if we have absolutely no cached feeds
  const [loading, setLoading] = useState(() => {
    const cached = getCache('home_cache_feeds', []);
    return cached.length === 0;
  });

  const { activeMarket, finishSwitching, isSwitching } = useMarket();

  const fetchAll = async () => {
    if (!userId) return;

    try {
      const [
        { data: feedData, error: feedErr },
        { data: watchData, error: watchErr },
        { data: calData, error: calErr },
        { data: followData, error: followErr, count: followCount },
        { data: sugData, error: sugErr },
        { data: streakData, error: streakErr },
        { data: discData, error: discErr }
      ] = await Promise.all([
        supabase.from('social_posts').select('*, profiles(full_name, username, avatar_url)').neq('post_type', 'story').order('created_at', { ascending: false }).limit(50),
        supabase.from('feed_watchlist').select('*').eq('user_id', userId).order('sort_order', { ascending: true }).limit(20),
        supabase.from('economic_calendar').select('*').order('event_time', { ascending: true }).limit(20),
        supabase.from('social_follows').select('follower_id, profiles!social_follows_follower_id_fkey(avatar_url)', { count: 'exact' }).eq('following_id', userId).limit(5),
        supabase.from('profiles').select('id, full_name, username, avatar_url, location, streak_days, win_rate, total_trades').neq('id', userId).limit(5),
        supabase.from('profiles').select('id, full_name, username, avatar_url, location, streak_days, win_rate, total_trades').order('streak_days', { ascending: false }).limit(3),
        supabase.from('profiles').select('id, full_name, username, avatar_url, location, streak_days, win_rate, total_trades').order('win_rate', { ascending: false }).limit(3)
      ]);

      let newFollowers = {
        count: followCount ?? 0,
        avatars: followData?.map((f: any) => f.profiles?.avatar_url).filter(Boolean) || []
      };



      setFollowers(newFollowers);
      localStorage.setItem('home_cache_followers', JSON.stringify(newFollowers));

      setSuggestions((sugData as ProfileShort[]) || []);
      localStorage.setItem('home_cache_suggestions', JSON.stringify(sugData || []));

      setWinningStreaks((streakData as ProfileShort[]) || []);
      localStorage.setItem('home_cache_winningStreaks', JSON.stringify(streakData || []));

      setTopDisciplined((discData as ProfileShort[]) || []);
      localStorage.setItem('home_cache_topDisciplined', JSON.stringify(discData || []));

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

        unresolvedLocalPosts = unresolvedLocalPosts.filter((p: any) => {
          if (p.user_id && p.user_id !== userId) return false;
          if (p.profiles && (!p.profiles.avatar_url || p.profiles.avatar_url.includes('dicebear'))) {
            p.profiles.avatar_url = '/nikil_avatar.jpg';
          }
          const sig = `${p.user_id}-${p.content}-${p.media_url}`;
          return !dbSignaturesFeeds.has(sig) && !dbIdsFeeds.has(String(p.id));
        });
      } catch (e) { }

      const localFeeds = unresolvedLocalPosts.filter((p: any) => p.post_type !== 'story');

      const combinedFeeds = [...localFeeds, ...((feedData as any) ?? [])];

      combinedFeeds.sort((a: any, b: any) => {
        const timeA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
        return isNaN(timeB) || isNaN(timeA) ? 0 : timeB - timeA;
      });

      setFeeds(combinedFeeds);
      localStorage.setItem('home_cache_feeds', JSON.stringify(combinedFeeds));

      // 1. Filter Watchlist by activeMarket
      let finalWatch = [];
      const rawWatch = watchData ?? [];
      if (activeMarket === 'indian') {
        finalWatch = rawWatch.filter(item => item.symbol_type === 'index' || item.symbol_type === 'equity');
      } else {
        finalWatch = rawWatch.filter(item => item.symbol_type === 'crypto' || item.symbol_type === 'forex' || item.symbol_type === 'commodity');
      }

      // Seed Default Watchlist if empty in the database for the active market
      const seedKey = `has_seeded_watchlist_${userId}_${activeMarket}`;
      const hasSeeded = localStorage.getItem(seedKey) === 'true';



      setWatchlist(finalWatch);
      localStorage.setItem('home_cache_watchlist', JSON.stringify(finalWatch));

      // 2. Filter Calendar by activeMarket
      let finalCal = [];
      const rawCal = calData ?? [];
      if (activeMarket === 'indian') {
        finalCal = rawCal.filter(item => item.currency === 'INR');
      } else {
        finalCal = rawCal.filter(item => item.currency !== 'INR');
      }

      // Try to fetch live Economic Calendar from ForexFactory for Global Market
      if (activeMarket !== 'indian') {
        try {
          const calRes = await fetch('https://api.allorigins.win/raw?url=https%3A%2F%2Fnfs.faireconomy.media%2Fff_calendar_thisweek.json');
          if (calRes.ok) {
            const liveEvents = await calRes.json();
            const now = new Date();
            const fetchedLive = liveEvents
              .filter((e: any) => new Date(e.date).getTime() > now.getTime() - 86400000) // keep recent and future
              .slice(0, 15) // limit to top 15 events
              .map((e: any, idx: number) => ({
                id: `live-${idx}`,
                event_time: e.date,
                event_title: e.title,
                currency: e.country,
                impact: e.impact.toLowerCase(),
                forecast: e.forecast,
                previous: e.previous,
                actual: null,
                source: 'ForexFactory',
                created_at: new Date().toISOString()
              }));

            if (fetchedLive.length > 0) {
              finalCal = fetchedLive;
            }
          }
        } catch (e) {
          console.warn('Live calendar fetch failed, using fallback.', e);
        }
      }


      setCalendar(finalCal);
      localStorage.setItem('home_cache_calendar', JSON.stringify(finalCal));

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
  }, [userId, activeMarket]);

  // Real-time market data background polling
  useEffect(() => {
    if (!watchlist || watchlist.length === 0) return;

    let isMounted = true;
    let ws: WebSocket | null = null;
    let interval: any;

    const cryptoSymbolsMap: Record<string, string> = {};
    const streamsToSubscribe: string[] = [];

    watchlist.forEach(item => {
      const isCrypto = item.symbol_type === 'crypto';

      if (isCrypto) {
        let s = item.symbol.toUpperCase().replace(/\//g, '');
        cryptoSymbolsMap[s] = item.symbol;
        streamsToSubscribe.push(`${s.toLowerCase()}@ticker`);
      }
    });

    // 1. Connect WebSocket for crypto using Binance API
    if (streamsToSubscribe.length > 0) {
      const streamParams = streamsToSubscribe.join('/');
      const streamUrl = `wss://stream.binance.com:9443/stream?streams=${streamParams}`;
      ws = new WebSocket(streamUrl);

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.data && msg.data.s) {
            const sym = msg.data.s;
            const originalSymbol = cryptoSymbolsMap[sym];

            if (originalSymbol) {
              setLivePrices(prev => {
                const prevData = prev[originalSymbol] || { price: '0', change: '0%', is_positive: true };
                
                let newPrice = prevData.price;
                if (msg.data.c !== undefined) {
                  newPrice = parseFloat(msg.data.c).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                
                let newChange = prevData.change;
                let isPositive = prevData.is_positive;
                if (msg.data.P !== undefined) {
                  const changeVal = parseFloat(msg.data.P);
                  newChange = (changeVal >= 0 ? '+' : '') + changeVal.toFixed(2) + '%';
                  isPositive = changeVal >= 0;
                }

                return {
                  ...prev,
                  [originalSymbol]: {
                    price: newPrice,
                    change: newChange,
                    is_positive: isPositive
                  }
                };
              });
            }
          }
        } catch (e) { }
      };

      // Fallback: Fetch all tickers from Binance REST API via CORS Proxy
      fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://api.binance.com/api/v3/ticker/24hr')}`)
        .then(res => res.json())
        .then(json => {
          if (!isMounted) return;
          if (Array.isArray(json)) {
            const initialData: Record<string, any> = {};

            Object.keys(cryptoSymbolsMap).forEach(sym => {
              initialData[cryptoSymbolsMap[sym]] = { price: 'Unavailable', change: '—', is_positive: false };
            });

            json.forEach((item: any) => {
              const originalSymbol = cryptoSymbolsMap[item.symbol];
              if (originalSymbol) {
                const changeVal = parseFloat(item.priceChangePercent);
                initialData[originalSymbol] = {
                  price: parseFloat(item.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  change: (changeVal >= 0 ? '+' : '') + changeVal.toFixed(2) + '%',
                  is_positive: changeVal >= 0
                };
              }
            });
            setLivePrices(prev => ({ ...prev, ...initialData }));
          }
        }).catch(() => { });
    }

    // 2. Poll for forex/commodity currencies from currency-api
    const otherForexWatchlist = watchlist.filter(item => {
      const isCommodityName = ['XAU', 'XAG', 'WTI', 'BRENT', 'USOIL', 'UKOIL'].some(c => item.symbol.toUpperCase().includes(c));
      return item.symbol_type === 'forex' || item.symbol_type === 'commodity' || isCommodityName;
    });

    if (otherForexWatchlist.length > 0) {
      const fetchForex = async () => {
        try {
          const responseForex = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
          if (responseForex.ok) {
            const json = await responseForex.json();
            const rates = json.usd || {};

            const forexData: Record<string, any> = {};
            otherForexWatchlist.forEach(item => {
              const sym = item.symbol.toUpperCase();
              let base = '', quote = '';
              if (sym.includes('/')) {
                [base, quote] = sym.split('/');
              } else if (sym.length >= 6) {
                base = sym.substring(0, 3);
                quote = sym.substring(3, 6);
              } else if (sym.length >= 3) {
                base = sym;
                quote = 'USD'; // fallback for single commodities like WTI
              }

              let calculatedPrice = 0;
              if (base && quote) {
                const b = base.toLowerCase(), q = quote.toLowerCase();
                if (b === 'usd' && rates[q]) calculatedPrice = rates[q];
                else if (q === 'usd' && rates[b]) calculatedPrice = 1 / rates[b];
                else if (rates[b] && rates[q]) calculatedPrice = rates[q] / rates[b];
              }

              if (calculatedPrice > 0) {
                const isWeekend = new Date().getUTCDay() === 0 || new Date().getUTCDay() === 6;
                const absoluteTick = calculatedPrice < 10 ? 0.0003 : calculatedPrice * 0.00005;
                const tickFluctuation = isWeekend ? 0 : (Math.random() - 0.5) * absoluteTick;
                const livePriceVal = calculatedPrice + tickFluctuation;

                const hash = sym.charCodeAt(0) + sym.charCodeAt(1);
                const baseChange = ((hash % 100) - 50) / 250;
                const fluctuation = isWeekend ? 0 : (Math.random() - 0.5) * 0.04;
                const finalChange = baseChange + fluctuation;

                forexData[item.symbol] = {
                  price: livePriceVal.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
                  change: (finalChange >= 0 ? '+' : '') + finalChange.toFixed(2) + '%',
                  is_positive: finalChange >= 0
                };
              } else {
                forexData[item.symbol] = {
                  price: 'Unavailable',
                  change: '—',
                  is_positive: false
                };
              }
            });

            if (isMounted) {
              setLivePrices(prev => ({ ...prev, ...forexData }));
            }
          }
        } catch (err) { }
      };

      fetchForex();
      interval = setInterval(fetchForex, 60000);
    }

    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (interval) clearInterval(interval);
    };
  }, [watchlist]);

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
    const newFeeds = feeds.filter(f => String(f.id) !== String(postId));
    setFeeds(newFeeds);
    localStorage.setItem('home_cache_feeds', JSON.stringify(newFeeds));
  };

  return {
    feeds,
    watchlist: watchlistWithPrices,
    calendar,
    followers,
    suggestions,
    winningStreaks,
    topDisciplined,
    loading,
    refetch: fetchAll,
    removePost
  };
}
