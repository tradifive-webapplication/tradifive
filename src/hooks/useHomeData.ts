import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';
import { useMarket } from '@/contexts/MarketContext';
import { ENABLE_MOCK_DATA, mockFeeds, mockStories, mockProfiles } from '@/lib/mockData';

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

  // One-time cleanup: remove old local posts that used blob:// URLs (dead after page reload)
  try {
    const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
    const cleaned = localPosts.filter((p: any) => !p.media_url || !String(p.media_url).startsWith('blob:'));
    if (cleaned.length !== localPosts.length) {
      localStorage.setItem('fialgo_local_posts', JSON.stringify(cleaned));
    }
  } catch (_) {}

  const [feeds, setFeeds] = useState<FeedPost[]>(() => {
    const cached = getCache('home_cache_feeds', []);
    return cached;
  });
  const [stories, setStories] = useState<FeedPost[]>(() => {
    const cached = getCache('home_cache_stories', []);
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
        { data: storyData, error: storyErr },
        { data: watchData, error: watchErr },
        { data: calData, error: calErr },
        { data: followData, error: followErr, count: followCount },
        { data: sugData, error: sugErr },
        { data: streakData, error: streakErr },
        { data: discData, error: discErr }
      ] = await Promise.all([
        supabase.from('social_posts').select('*, profiles(full_name, username, avatar_url)').neq('post_type', 'story').order('created_at', { ascending: false }).limit(50),
        supabase.from('social_posts').select('*, profiles(full_name, username, avatar_url)').eq('post_type', 'story').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: true }).limit(20),
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

      if (ENABLE_MOCK_DATA) {
        newFollowers = {
          count: 1420,
          avatars: mockProfiles.slice(0, 3).map(p => p.avatar_url).filter(Boolean) as string[]
        };
      }

      setFollowers(newFollowers);
      localStorage.setItem('home_cache_followers', JSON.stringify(newFollowers));

      // Fallback mocks for Indian demo
      let finalSug = (sugData && sugData.length > 0) ? sugData : [];
      let finalStreak = (streakData && streakData.length > 0) ? streakData : [];
      let finalDisc = (discData && discData.length > 0) ? discData : [];

      if (ENABLE_MOCK_DATA) {
        finalSug = mockProfiles.slice(0, 5);
        finalStreak = [...mockProfiles].sort((a, b) => b.streak_days - a.streak_days).slice(0, 5);
        finalDisc = [...mockProfiles].sort((a, b) => b.win_rate - a.win_rate).slice(0, 5);
      }

      setSuggestions(finalSug as ProfileShort[]);
      localStorage.setItem('home_cache_suggestions', JSON.stringify(finalSug));

      setWinningStreaks(finalStreak as ProfileShort[]);
      localStorage.setItem('home_cache_winningStreaks', JSON.stringify(finalStreak));

      setTopDisciplined(finalDisc as ProfileShort[]);
      localStorage.setItem('home_cache_topDisciplined', JSON.stringify(finalDisc));

      // removed unsafe localPosts parse

      const dbSignaturesFeeds = new Set(feedData?.map((f: any) => `${f.user_id}-${f.content}-${f.media_url}`) || []);
      const dbSignaturesStories = new Set(storyData?.map((s: any) => `${s.user_id}-${s.content}-${s.media_url}`) || []);
      const dbIdsFeeds = new Set(feedData?.map((f: any) => String(f.id)) || []);
      const dbIdsStories = new Set(storyData?.map((s: any) => String(s.id)) || []);
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
          if (p.post_type === 'story') return !dbSignaturesStories.has(sig) && !dbIdsStories.has(String(p.id));
          return !dbSignaturesFeeds.has(sig) && !dbIdsFeeds.has(String(p.id));
        });
      } catch (e) { }

      const localStories = unresolvedLocalPosts.filter((p: any) => p.post_type === 'story');
      const localFeeds = unresolvedLocalPosts.filter((p: any) => p.post_type !== 'story');

      const activeMockFeeds = ENABLE_MOCK_DATA ? mockFeeds : [];

      const combinedFeeds = [...activeMockFeeds, ...localFeeds, ...((feedData as any) ?? [])];

      combinedFeeds.sort((a: any, b: any) => {
        const timeA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
        return isNaN(timeB) || isNaN(timeA) ? 0 : timeB - timeA;
      });

      setFeeds(combinedFeeds);
      localStorage.setItem('home_cache_feeds', JSON.stringify(combinedFeeds));

      const activeMockStories = ENABLE_MOCK_DATA ? mockStories : [];

      const combinedStories = [...activeMockStories, ...localStories, ...((storyData as any) ?? [])];
      setStories(combinedStories);
      localStorage.setItem('home_cache_stories', JSON.stringify(combinedStories));

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

      if (finalWatch.length > 0 && !hasSeeded) {
        localStorage.setItem(seedKey, 'true');
      } else if (finalWatch.length === 0 && !hasSeeded) {
        localStorage.setItem(seedKey, 'true');
        const defaultWatch = activeMarket === 'indian' ? [
          { symbol: 'NIFTY50', symbol_type: 'index', is_pinned: true, sort_order: 1, user_id: userId },
          { symbol: 'BANKNIFTY', symbol_type: 'index', is_pinned: true, sort_order: 2, user_id: userId },
          { symbol: 'RELIANCE', symbol_type: 'equity', is_pinned: false, sort_order: 3, user_id: userId },
          { symbol: 'HDFCBANK', symbol_type: 'equity', is_pinned: false, sort_order: 4, user_id: userId },
          { symbol: 'TCS', symbol_type: 'equity', is_pinned: false, sort_order: 5, user_id: userId }
        ] : [
          { symbol: 'BTC/USDT', symbol_type: 'crypto', is_pinned: true, sort_order: 1, user_id: userId },
          { symbol: 'ETH/USDT', symbol_type: 'crypto', is_pinned: true, sort_order: 2, user_id: userId },
          { symbol: 'EUR/USD', symbol_type: 'forex', is_pinned: false, sort_order: 3, user_id: userId },
          { symbol: 'GBP/USD', symbol_type: 'forex', is_pinned: false, sort_order: 4, user_id: userId },
          { symbol: 'USD/JPY', symbol_type: 'forex', is_pinned: false, sort_order: 5, user_id: userId }
        ];
        try {
          const { data: insertedWatch } = await supabase.from('feed_watchlist').insert(defaultWatch).select('*');
          if (insertedWatch && insertedWatch.length > 0) {
            finalWatch = insertedWatch;
          } else {
            finalWatch = defaultWatch.map((item, idx) => ({ ...item, id: `mock-w-${idx}`, created_at: null }));
          }
        } catch (e) {
          finalWatch = defaultWatch.map((item, idx) => ({ ...item, id: `mock-w-${idx}`, created_at: null }));
        }
      }

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

      // Seed Default Calendar if empty in the database and live fetch failed
      if (finalCal.length === 0 || activeMarket === 'indian') {
        const today = new Date();
        const setTime = (hours: number, minutes: number) => {
          const d = new Date(today);
          d.setHours(hours, minutes, 0, 0);
          return d.toISOString();
        };

        const defaultCal = activeMarket === 'indian' ? [
          { event_time: setTime(10, 0), event_title: 'RBI Monetary Policy Meeting', currency: 'INR', impact: 'high', forecast: '6.50%', previous: '6.50%', actual: null, source: 'RBI' },
          { event_time: setTime(12, 0), event_title: 'India Industrial Production', currency: 'INR', impact: 'medium', forecast: '4.5%', previous: '3.8%', actual: '4.2%', source: 'MOSPI' },
          { event_time: setTime(17, 30), event_title: 'India CPI Inflation YoY', currency: 'INR', impact: 'high', forecast: '5.1%', previous: '5.09%', actual: null, source: 'MOSPI' },
          { event_time: setTime(14, 0), event_title: 'India Foreign Exchange Reserves', currency: 'INR', impact: 'low', forecast: null, previous: '$642B', actual: null, source: 'RBI' },
        ] : [
          { event_time: setTime(8, 30), event_title: 'US ISM Manufacturing PMI', currency: 'USD', impact: 'high', forecast: '51.2', previous: '49.8', actual: '51.5', source: 'ISM' },
          { event_time: setTime(14, 0), event_title: 'Fed Interest Rate Decision', currency: 'USD', impact: 'high', forecast: '5.25%', previous: '5.25%', actual: null, source: 'FOMC' },
          { event_time: setTime(14, 30), event_title: 'ECB Press Conference', currency: 'EUR', impact: 'high', forecast: null, previous: null, actual: null, source: 'ECB' },
          { event_time: setTime(7, 0), event_title: 'UK CPI YoY', currency: 'GBP', impact: 'medium', forecast: '2.1%', previous: '2.3%', actual: '2.0%', source: 'ONS' },
          { event_time: setTime(8, 30), event_title: 'CAD Unemployment Rate', currency: 'CAD', impact: 'medium', forecast: '6.1%', previous: '6.2%', actual: null, source: 'StatCan' }
        ];

        // Only insert to DB if forex and it was empty. If indian, we just mock for now.
        if (activeMarket !== 'indian' && finalCal.length === 0) {
          try {
            const { data: insertedCal } = await supabase.from('economic_calendar').insert(defaultCal).select('*');
            if (insertedCal && insertedCal.length > 0) {
              finalCal = insertedCal;
            } else {
              finalCal = defaultCal.map((item, idx) => ({ ...item, id: `mock-cal-${idx}`, created_at: null }));
            }
          } catch (e) {
            finalCal = defaultCal.map((item, idx) => ({ ...item, id: `mock-cal-${idx}`, created_at: null }));
          }
        } else {
          finalCal = defaultCal.map((item, idx) => ({ ...item, id: `mock-cal-${idx}`, created_at: null }));
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
      interval = setInterval(fetchForex, 1000);
    }

    // 3. Realistic Mock for Indian Stocks (To bypass CORS from browser)
    const indianWatchlist = watchlist.filter(item => item.symbol_type === 'index' || item.symbol_type === 'equity');
    let indInterval: any;

    if (indianWatchlist.length > 0) {
      // Realistic base prices
      const basePrices: Record<string, number> = {
        'NIFTY50': 24056,
        'BANKNIFTY': 58177,
        'RELIANCE': 1318,
        'HDFCBANK': 796,
        'TCS': 2094
      };

      const fetchIndianStocks = () => {
        if (!isMounted) return;
        const indData: Record<string, any> = {};
        const isWeekend = new Date().getUTCDay() === 0 || new Date().getUTCDay() === 6;

        indianWatchlist.forEach(item => {
          const base = basePrices[item.symbol] || 1000;
          const absoluteTick = base * 0.0001; // 0.01% tick
          const tickFluctuation = isWeekend ? 0 : (Math.random() - 0.5) * absoluteTick;
          const livePriceVal = base + tickFluctuation;

          const hash = item.symbol.charCodeAt(0) + item.symbol.charCodeAt(1);
          const baseChange = ((hash % 100) - 50) / 250; // Random deterministic base change -0.2 to +0.2%
          const fluctuation = isWeekend ? 0 : (Math.random() - 0.5) * 0.04;
          const finalChange = baseChange + fluctuation;

          indData[item.symbol] = {
            price: livePriceVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: (finalChange >= 0 ? '+' : '') + finalChange.toFixed(2) + '%',
            is_positive: finalChange >= 0
          };
        });

        setLivePrices(prev => ({ ...prev, ...indData }));
      };

      fetchIndianStocks();
      indInterval = setInterval(fetchIndianStocks, 1000); // 1s tick updates
    }

    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (interval) clearInterval(interval);
      if (indInterval) clearInterval(indInterval);
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
    const newStories = stories.filter(s => String(s.id) !== String(postId));
    setStories(newStories);
    localStorage.setItem('home_cache_stories', JSON.stringify(newStories));
  };

  return {
    feeds,
    stories,
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
