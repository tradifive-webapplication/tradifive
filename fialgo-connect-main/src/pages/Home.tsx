import { Search, Plus, X, MoreHorizontal, Heart, MessageCircle, MessageSquare, Bookmark, UserPlus, UserCheck, Flame, ShieldCheck, TrendingUp, Layers, Eye, Calendar, Sliders, Trash2, Check, ArrowUp, RotateCw, Globe, Home as HomeIcon, Compass, Radio, Bell, Users, Smile, ImagePlus, Video as VideoIcon, Loader2, Sparkles } from "lucide-react";
import { CommunityPageWrapper, useCommunityShell } from "@/components/CommunityShell";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useHomeData, FeedPost } from "@/hooks/useHomeData";
import { useMarket } from "@/contexts/MarketContext";
import { usePlan } from "@/hooks/usePlan";
import CreatePostModal from "@/components/CreatePostModal";
import FeedCard from "@/components/FeedCard";
import HomeProfileCard from "@/components/HomeProfileCard";
import DashboardNewsCard from "@/components/dashboard/DashboardNewsCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const HOME_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const homeContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.04,
        },
    },
};

const homeCardVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.42,
            ease: HOME_EXPO_OUT,
        },
    },
};
import CommunityHeaderBar from "@/components/CommunityHeaderBar";
import InlineNotificationsPanel from "@/components/InlineNotificationsPanel";
import { triggerHaptic } from "@/utils/haptics";
import { playSound } from "@/utils/soundEffects";
import {
    Star as IconlyStar,
    Discovery as IconlyDiscovery,
    Wallet as IconlyWallet,
    Activity as IconlyActivity,
    Graph as IconlyGraph,
    AddUser as IconlyAddUser,
    ShieldDone as IconlyShieldDone,
    Calendar as IconlyCalendar,
    Home as IconlyHome,
    Notification as IconlyNotification,
    Play as IconlyPlay,
    Chat as IconlyChat,
    TwoUsers as IconlyTwoUsers,
    Image as IconlyImage,
    Video as IconlyVideo,
} from "react-iconly";
import EconomicCalendarWidget from "@/components/EconomicCalendarWidget";
import NewsWidget from "@/components/NewsWidget";
import MajorsWidget from "@/components/MajorsWidget";
import CustomEconomicCalendar from "@/components/CustomEconomicCalendar";
import ForexFactoryDashboard from "@/components/ForexFactoryDashboard";
import TickersWidget from "@/components/TickersWidget";



function ToggleRow({ label, checked, onChange, dotClass }: { label: string, checked: boolean, onChange: (val: boolean) => void, dotClass?: string }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group py-0.5 select-none">
            <span className="flex items-center gap-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {dotClass && <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />}
                {label}
            </span>
            <div className="relative inline-flex items-center shrink-0">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 dark:bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:peer-checked:after:bg-slate-950 after:shadow-xs after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-slate-900 dark:peer-checked:bg-white transition-colors"></div>
            </div>
        </label>
    );
}

function HomeSkeleton() {
    return (
        <div className="w-full h-full flex flex-col min-h-0 px-4 lg:px-10 pt-0 pb-0 select-none font-sans text-slate-800 dark:text-slate-100 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0 relative">

                {/* --- COLUMN 1: LEFT SIDEBAR (col-span-3) --- */}
                <div className="hidden xl:block xl:col-span-3 xl:col-start-1 h-full overflow-y-auto amazing-scrollbar space-y-6 px-4 pt-5 pb-4">
                    {/* Watchlist Skeleton */}
                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800/80 rounded-md mb-5" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800/80" />
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                            <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1.5 flex flex-col items-end">
                                        <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        <div className="h-2.5 w-8 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Skeleton */}
                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800/80 rounded-md mb-5" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <div className="w-12 h-8 rounded-xl bg-slate-200 dark:bg-slate-800/80 shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                            <div className="h-2.5 w-8 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        </div>
                                        <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Followers Stats Skeleton */}
                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="flex items-center mb-5 pl-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-white/5 bg-slate-200 dark:bg-slate-800/80 shadow-sm"
                                    style={{
                                        marginLeft: i > 1 ? '-12px' : '0px',
                                        zIndex: 4 - i
                                    }}
                                />
                            ))}
                        </div>
                        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800/80 rounded-md mb-1.5" />
                        <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800/80 rounded-md" />
                    </div>
                </div>

                {/* --- COLUMN 2: MIDDLE MAIN CONTENT (col-span-6) --- */}
                <div className="col-span-12 lg:col-span-8 xl:col-span-6 xl:col-start-4 h-full overflow-y-auto amazing-scrollbar space-y-8 px-4 pt-5 pb-6">


                    {/* Feeds Skeleton */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800/80 rounded-md" />
                            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800/80 rounded-[14px]" />
                        </div>

                        {[1, 2].map((i) => (
                            <div key={i} className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/80" />
                                        <div className="space-y-2">
                                            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                            <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800/80 rounded-[10px]" />
                                        <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800/80 rounded-[10px]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800/80 rounded" />
                                    <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                </div>
                                <div className="h-44 w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex gap-6">
                                        <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                    </div>
                                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- COLUMN 3: RIGHT SIDEBAR (col-span-3) --- */}
                <div className="hidden lg:block lg:col-span-4 xl:col-span-3 xl:col-start-10 h-full overflow-y-auto amazing-scrollbar space-y-6 px-4 pt-5 pb-4">
                    {/* Requests Skeleton */}
                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800/80 rounded-md mb-5" />
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/80" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggestions Skeleton */}
                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800/80 rounded-md mb-5" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/80" />
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                            <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800/80" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Winning Streaks Skeleton */}
                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800/80 rounded-md mb-5" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800/80" />
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                            <div className="h-2.5 w-12 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800/80 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- SMART WATCHLIST AUTO-DETECTION & ANIMATED LIVE TICKS ---
const detectSymbolDetails = (input: string): { symbol: string; type: 'crypto' | 'forex' | 'commodity' | 'index' | 'equity' } => {
    let clean = input.trim().toUpperCase().replace(/\s+/g, '').replace(/[-_]/g, '/');
    // Fix common typos & shorthands (e.g. XAU/UAD -> XAU/USD, GOLD -> XAU/USD)
    clean = clean.replace(/\/UAD$/, '/USD').replace(/UAD$/, 'USD');
    if (clean === 'GOLD' || clean === 'XAU') return { symbol: 'XAU/USD', type: 'commodity' };
    if (clean === 'SILVER' || clean === 'XAG') return { symbol: 'XAG/USD', type: 'commodity' };
    if (clean === 'NIFTY') return { symbol: 'NIFTY50', type: 'index' };

    const cryptoBases = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT', 'LINK', 'BNB', 'LTC', 'BCH', 'UNI', 'AVAX', 'MATIC', 'POL', 'SHIB', 'TRX', 'SUI', 'TON', 'PEPE', 'ARB', 'OP', 'NEAR', 'APT', 'ATOM', 'XLM', 'PAXG'];
    const cryptoQuotes = ['USDT', 'USDC', 'BUSD', 'DAI'];
    const commodityKeys = ['XAU', 'XAG', 'XPT', 'XPD', 'WTI', 'BRENT', 'USOIL', 'UKOIL', 'NATGAS'];
    const indexKeys = ['NAS100', 'NASDAQ', 'NDX', 'US100', 'US30', 'DJI', 'SPX500', 'US500', 'SPX', 'DXY', 'NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX'];
    const forexCurrencies = ['EUR', 'GBP', 'AUD', 'NZD', 'USD', 'CAD', 'CHF', 'JPY', 'SGD', 'HKD', 'CNY', 'INR', 'ZAR', 'MXN', 'TRY', 'SEK', 'NOK', 'DKK'];

    const compact = clean.replace(/\//g, '');
    if (indexKeys.includes(compact)) {
        return { symbol: compact, type: 'index' };
    }
    if (['WTI', 'BRENT', 'USOIL', 'UKOIL', 'NATGAS'].includes(compact)) {
        return { symbol: compact, type: 'commodity' };
    }

    // 1. If it already has a slash
    if (clean.includes('/')) {
        const [base, quote] = clean.split('/');
        if (commodityKeys.includes(base)) {
            return { symbol: `${base}/${quote || 'USD'}`, type: 'commodity' };
        }
        if (cryptoQuotes.includes(quote) || cryptoBases.includes(base)) {
            return { symbol: clean, type: 'crypto' };
        }
        if (forexCurrencies.includes(base) && forexCurrencies.includes(quote)) {
            return { symbol: clean, type: 'forex' };
        }
        return { symbol: clean, type: quote && quote.length > 3 ? 'crypto' : 'forex' };
    }

    // 2. If it does not have a slash: e.g. "EURUSD", "XAUUSD", "BTCUSDT"
    for (const quote of cryptoQuotes) {
        if (clean.endsWith(quote) && clean.length > quote.length) {
            const base = clean.slice(0, -quote.length);
            return { symbol: `${base}/${quote}`, type: 'crypto' };
        }
    }

    if (clean.length === 6) {
        const base = clean.substring(0, 3);
        const quote = clean.substring(3, 6);
        if (commodityKeys.includes(base)) {
            return { symbol: `${base}/${quote}`, type: 'commodity' };
        }
        if (forexCurrencies.includes(base) && forexCurrencies.includes(quote)) {
            return { symbol: `${base}/${quote}`, type: 'forex' };
        }
        if (cryptoBases.includes(base)) {
            return { symbol: `${base}/${quote}`, type: 'crypto' };
        }
    }

    if (clean.length > 6 && clean.endsWith('USD')) {
        const base = clean.slice(0, -3);
        if (cryptoBases.includes(base)) {
            return { symbol: `${base}/USD`, type: 'crypto' };
        }
    }

    if (cryptoBases.includes(clean)) {
        return { symbol: `${clean}/USD`, type: 'crypto' };
    }

    return { symbol: clean, type: 'equity' };
};

function WatchlistItem({ asset }: { asset: any }) {
    const prevPriceRef = useRef<string>("");
    const [blinkDirection, setBlinkDirection] = useState<'up' | 'down' | null>(null);

    const price = asset.price;
    const change = asset.change;
    const isPositive = asset.is_positive;
    const displaySymbol = asset.symbol;
    let displayName = asset.symbol_type === "forex" ? "Forex Spot" : "Crypto Spot";
    if (['XAU', 'XAG', 'WTI', 'BRENT', 'USOIL', 'UKOIL'].some(c => displaySymbol.includes(c))) {
        displayName = "Commodity Spot";
    }

    useEffect(() => {
        if (price === 'Loading...' || price === '...') return;
        if (!prevPriceRef.current) {
            prevPriceRef.current = price;
            return;
        }

        const prevNum = parseFloat(prevPriceRef.current.replace(/,/g, ''));
        const currNum = parseFloat(price.replace(/,/g, ''));

        if (!isNaN(prevNum) && !isNaN(currNum) && prevNum !== currNum) {
            if (currNum > prevNum) {
                setBlinkDirection('up');
            } else if (currNum < prevNum) {
                setBlinkDirection('down');
            }

            const timer = setTimeout(() => {
                setBlinkDirection(null);
            }, 600);
            return () => clearTimeout(timer);
        }

        prevPriceRef.current = price;
    }, [price]);

    return (
        <div className="flex items-center justify-between group hover:translate-x-0.5 transition-transform duration-200">
            <div className="flex items-center gap-2.5">
                <div>
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">{displaySymbol}</p>
                    <p className="text-[10px] font-medium text-slate-455 dark:text-slate-400 leading-none mt-0.5">{displayName}</p>
                </div>
            </div>

            <div className="text-right">
                <p className={`text-[13px] font-bold leading-tight transition-all duration-300 ${blinkDirection === 'up'
                    ? 'text-emerald-500 dark:text-emerald-450 scale-[1.05] transform origin-right duration-75'
                    : blinkDirection === 'down'
                        ? 'text-rose-500 dark:text-rose-455 scale-[1.05] transform origin-right duration-75'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                    {price}
                </p>
                <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded mt-0.5 leading-none transition-colors ${isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}>
                    {change}
                </span>
            </div>
        </div>
    );
}



export default function Home() {
    const [searchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'feed';
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(() => {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    const session = JSON.parse(localStorage.getItem(key) || '{}');
                    if (session && session.user && session.user.id) {
                        return session.user;
                    }
                }
            }
        } catch (_) {}
        return null;
    });
    const [authChecked, setAuthChecked] = useState<boolean>(() => {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    const session = JSON.parse(localStorage.getItem(key) || '{}');
                    if (session && session.user && session.user.id) {
                        return true;
                    }
                }
            }
        } catch (_) {}
        return false;
    });

    // Supabase Live Data Fetching
    const { feeds, watchlist, calendar, followers, suggestions, profileViews = [], winningStreaks, topDisciplined, loading, refetch, removePost } = useHomeData(user?.id ?? "");
    const { canAccess, isStarter, dailyPostLimit, watchlistLimit } = usePlan();

    // User social follow state
    const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});

    const { inShell, scrollContainerRef } = useCommunityShell();
    const [newPostsCount, setNewPostsCount] = useState(0);
    const middleColumnRef = useRef<HTMLDivElement>(null);

    // Show "New posts" pill ONLY when another trader publishes a new post in real time
    useEffect(() => {
        const channel = supabase
            .channel('home-new-posts-pill')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'social_posts' },
                (payload: any) => {
                    const insertedUserId = payload?.new?.user_id;
                    if (user?.id && insertedUserId && String(insertedUserId) === String(user.id)) {
                        return;
                    }
                    setNewPostsCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const [feedSearchQuery, setFeedSearchQuery] = useState("");
    const [searchedTraders, setSearchedTraders] = useState<any[]>([]);
    const [searchingTraders, setSearchingTraders] = useState(false);
    const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);

    // Live debounced trader search for the Home top search bar so ANY user (even with 0 posts) is searchable
    useEffect(() => {
        const cleanQ = feedSearchQuery.trim().replace(/^@+/, "");
        if (!cleanQ || cleanQ.startsWith("$") || cleanQ.startsWith("#")) {
            setSearchedTraders([]);
            setSearchingTraders(false);
            return;
        }
        let cancelled = false;
        const timer = setTimeout(async () => {
            setSearchingTraders(true);
            try {
                const words = cleanQ.split(/\s+/).filter(Boolean);
                const orFilter = [
                    `full_name.ilike.%${cleanQ}%`,
                    `display_name.ilike.%${cleanQ}%`,
                    `username.ilike.%${cleanQ}%`,
                    `first_name.ilike.%${cleanQ}%`,
                    `last_name.ilike.%${cleanQ}%`,
                    ...(words.length > 1 ? [`first_name.ilike.%${words[0]}%`, `last_name.ilike.%${words[words.length - 1]}%`] : [])
                ].join(',');

                const { data, error } = await supabase
                    .from("profiles")
                    .select("id, full_name, display_name, first_name, last_name, username, avatar_url, trading_style, xp_level")
                    .or(orFilter)
                    .order("created_at", { ascending: false })
                    .limit(8);
                if (!cancelled) {
                    setSearchedTraders(!error && Array.isArray(data) ? data : []);
                }
            } catch {
                if (!cancelled) setSearchedTraders([]);
            } finally {
                if (!cancelled) setSearchingTraders(false);
            }
        }, 220);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [feedSearchQuery]);

    const scrollToTop = () => {
        const scroller = inShell ? scrollContainerRef.current : middleColumnRef.current;
        if (scroller) {
            scroller.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleRefreshFeed = async () => {
        if (isRefreshingFeed) return;
        triggerHaptic("selection");
        setIsRefreshingFeed(true);
        setNewPostsCount(0);
        try {
            await Promise.resolve(refetch());
            scrollToTop();
        } finally {
            setTimeout(() => setIsRefreshingFeed(false), 500);
        }
    };

    const [homeLayoutPrefs] = useState<Record<string, boolean>>(() => {
        try {
            const raw = localStorage.getItem('home_layout_visibility_v1');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });
    const [showProfileCard, setShowProfileCard] = useState(() => homeLayoutPrefs.showProfileCard !== false);
    const [showWatchlist, setShowWatchlist] = useState(() => homeLayoutPrefs.showWatchlist !== false);
    const [showCalendar, setShowCalendar] = useState(() => homeLayoutPrefs.showCalendar !== false);
    const [showFollowers, setShowFollowers] = useState(() => homeLayoutPrefs.showFollowers !== false);
    const [showRequests, setShowRequests] = useState(() => homeLayoutPrefs.showRequests !== false);
    const [showSuggestions, setShowSuggestions] = useState(() => homeLayoutPrefs.showSuggestions !== false);
    const [showStreaks, setShowStreaks] = useState(() => homeLayoutPrefs.showStreaks !== false);
    const [showDisciplined, setShowDisciplined] = useState(() => homeLayoutPrefs.showDisciplined !== false);

    useEffect(() => {
        try {
            localStorage.setItem('home_layout_visibility_v1', JSON.stringify({
                showProfileCard,
                showWatchlist,
                showCalendar,
                showFollowers,
                showRequests,
                showSuggestions,
                showStreaks,
                showDisciplined,
            }));
        } catch {
            // ignore storage errors
        }
    }, [showProfileCard, showWatchlist, showCalendar, showFollowers, showRequests, showSuggestions, showStreaks, showDisciplined]);

    // Customize layout elements
    const [showCustomizeMenu, setShowCustomizeMenu] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const customizeMenuRef = useRef<HTMLDivElement>(null);

    const [customizeActiveTab, setCustomizeActiveTab] = useState<'layout' | 'watchlist' | 'calendar'>('layout');
    const [newSymbolName, setNewSymbolName] = useState("");
    const [newSymbolType, setNewSymbolType] = useState<'crypto' | 'forex' | 'commodity' | 'index' | 'equity'>('crypto');
    const [isAddingSymbol, setIsAddingSymbol] = useState(false);
    const [newsViewMode, setNewsViewMode] = useState<'today' | 'week'>('today');
    const [newsExpanded, setNewsExpanded] = useState(false);

    const [calendarFilters, setCalendarFilters] = useState<{ high: boolean; medium: boolean; low: boolean }>(() => {
        try {
            const cached = localStorage.getItem('home_news_filters_v2');
            if (cached) {
                const parsed = JSON.parse(cached);
                return { high: parsed.high !== false, medium: parsed.medium !== false, low: parsed.low === true };
            }
            return { high: true, medium: true, low: false };
        } catch (e) {
            return { high: true, medium: true, low: false };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('home_news_filters_v2', JSON.stringify(calendarFilters));
        } catch (e) {
            console.warn("localStorage not accessible");
        }
    }, [calendarFilters]);

    const handleAddSymbol = async (overrideSymbol?: string) => {
        const rawInput = typeof overrideSymbol === 'string' ? overrideSymbol : newSymbolName;
        if (!rawInput.trim()) return;
        if (!user?.id) {
            toast.error("Please sign in to customize your watchlist.");
            return;
        }
        if (isStarter && watchlist.length >= watchlistLimit) {
            toast.error(`Watchlist limit reached (${watchlistLimit}/${watchlistLimit})`, {
                description: "Standard plan includes up to 3 watchlist pairs. Upgrade to Pro for unlimited pairs.",
                action: { label: "Upgrade", onClick: () => navigate('/upgrade') },
            });
            return;
        }

        const { symbol: sym, type: detectedType } = detectSymbolDetails(rawInput);
        const resolvedType = detectedType || newSymbolType;

        // Check duplication
        const exists = watchlist.some((item: any) => {
            const normExisting = String(item.symbol || '').toUpperCase().replace(/\/UAD$/, '/USD').replace(/UAD$/, 'USD');
            return normExisting === sym.toUpperCase();
        });
        if (exists) {
            toast.warning(`${sym} is already in your watchlist!`);
            return;
        }

        setIsAddingSymbol(true);
        try {
            const { error } = await supabase.from('feed_watchlist').insert([{
                symbol: sym,
                symbol_type: resolvedType,
                is_pinned: false,
                sort_order: watchlist.length + 1,
                user_id: user.id
            }]);
            if (error) throw error;

            toast.success(`Added ${sym} to watchlist!`);
            if (!overrideSymbol) setNewSymbolName("");
            refetch();
        } catch (err: any) {
            console.error("Error adding symbol:", err);
            toast.error("Failed to add symbol.");
        } finally {
            setIsAddingSymbol(false);
        }
    };

    // Toggle backside page scaling & blur + Escape close (matches Suggest & Report bottom sheets)
    useEffect(() => {
        if (showCustomizeModal) {
            document.body.classList.add('tf-sheet-open');
            const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') setShowCustomizeModal(false);
            };
            window.addEventListener('keydown', onKeyDown);
            return () => {
                document.body.classList.remove('tf-sheet-open');
                window.removeEventListener('keydown', onKeyDown);
            };
        } else {
            document.body.classList.remove('tf-sheet-open');
        }
    }, [showCustomizeModal]);

    const handleDeleteSymbol = async (id: string) => {
        try {
            const { error } = await supabase.from('feed_watchlist').delete().eq('id', id);
            if (error) throw error;

            toast.success("Watchlist item removed!");
            refetch();
        } catch (err: any) {
            console.error("Error deleting symbol:", err);
            toast.error("Failed to remove item.");
        }
    };

    // Auth check on mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                navigate("/login");
            } else {
                setUser(session.user);
                setAuthChecked(true);
            }
        };
        checkUser();
    }, [navigate]);

    useEffect(() => {
        // Cleanup old Isabella mock posts
        try {
            const local = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
            const filtered = local.filter((p: any) => p.profiles?.username !== "IsabellaN");
            if (filtered.length !== local.length) {
                localStorage.setItem('fialgo_local_posts', JSON.stringify(filtered));
            }
        } catch (e) { }
    }, []);

    const { activeMarket } = useMarket();

    // User-dismissed suggestions state persisted in localStorage
    const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(() => {
        try {
            const raw = localStorage.getItem('tradifive_dismissed_suggestions');
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch (_) {
            return new Set();
        }
    });

    const handleDismissSuggestion = useCallback((idToDismiss: string) => {
        setDismissedSuggestions(prev => {
            const next = new Set(prev);
            next.add(idToDismiss);
            try {
                localStorage.setItem('tradifive_dismissed_suggestions', JSON.stringify(Array.from(next)));
            } catch (_) {}
            return next;
        });
    }, []);

    // Placeholder names to exclude
    const PLACEHOLDER_NAMES = useMemo(() => ['new trader', 'guest trader', 'demo trader', 'trader', 'guest'], []);

    // Suggestions for You: Community members to follow (Excluding self & already followed)
    const finalSuggestions = useMemo(() => {
        const myCachedUsername = (localStorage.getItem("tradifive_cached_username") || "").toLowerCase().trim();
        const myCachedDisplayName = (localStorage.getItem("tradifive_cached_display_name") || "").toLowerCase().trim();
        const myCurrentId = user?.id;

        const qualified: any[] = [];

        (suggestions || []).forEach((sug: any) => {
            if (!sug || !sug.id) return;
            if (myCurrentId && sug.id === myCurrentId) return; // Never suggest self
            const sugUser = (sug.username || "").toLowerCase().trim();
            const sugName = (sug.display_name || sug.full_name || "").toLowerCase().trim();
            if (myCachedUsername && (sugUser === myCachedUsername || sugName === myCachedUsername)) return; // Never suggest self
            if (myCachedDisplayName && (sugUser === myCachedDisplayName || sugName === myCachedDisplayName)) return; // Never suggest self
            if (followedUsers[sug.id]) return; // Never suggest users already followed (big-tech standard)
            if (dismissedSuggestions.has(sug.id)) return; // User dismissed this suggestion

            qualified.push(sug);
        });

        // Sort by newest community members
        qualified.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
        });

        return qualified.slice(0, 4);
    }, [suggestions, user?.id, followedUsers, dismissedSuggestions]);

    // Filter streak users (100% Real Database states)
    const finalStreaks = useMemo(() => {
        return winningStreaks.filter(
            u => u.full_name &&
                u.streak_days !== null &&
                u.streak_days > 0
        );
    }, [winningStreaks]);

    // Filter disciplined users (100% Real Database states)
    const finalDisciplined = useMemo(() => {
        return topDisciplined.filter(
            u => u.full_name &&
                u.win_rate !== null &&
                u.win_rate > 0
        );
    }, [topDisciplined]);



    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    useEffect(() => {
        if (!user?.id || currentTab !== 'saved') return;
        let isMounted = true;
        const fetchSavedPosts = async () => {
            setIsLoadingSaved(true);
            try {
                const { data, error } = await supabase
                    .from('social_post_bookmarks')
                    .select('post_id, social_posts(*)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!error && data && isMounted) {
                    const rawPosts = data.map((b: any) => b.social_posts).filter(Boolean);
                    const authorIds = Array.from(new Set(rawPosts.map((p: any) => p.user_id).filter(Boolean)));
                    let profMap: Record<string, any> = {};
                    if (authorIds.length > 0) {
                        const { data: profs } = await supabase
                            .from('profiles')
                            .select('id, full_name, username, avatar_url')
                            .in('id', authorIds);
                        if (profs) profs.forEach((pr: any) => { profMap[pr.id] = pr; });
                    }
                    const parsed = rawPosts.map((p: any) => ({
                        ...p,
                        profiles: profMap[p.user_id] || null
                    }));
                    setSavedPosts(parsed);
                }
            } catch (err) {
                console.error("Error fetching saved posts:", err);
            } finally {
                if (isMounted) setIsLoadingSaved(false);
            }
        };
        fetchSavedPosts();
        return () => { isMounted = false; };
    }, [user?.id, currentTab]);

    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [editPost, setEditPost] = useState<FeedPost | null>(null);
    const [quickPostText, setQuickPostText] = useState("");
    const [isQuickPosting, setIsQuickPosting] = useState(false);
    const [showQuickEmoji, setShowQuickEmoji] = useState(false);
    const [showInlineNotifications, setShowInlineNotifications] = useState(false);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    // Fetch unread notification count for the Home header bell badge
    useEffect(() => {
        if (!user?.id) return;
        let active = true;
        const loadUnreadCount = async () => {
            try {
                const [{ count: notifCount }, { count: reqCount }] = await Promise.all([
                    supabase
                        .from("notifications")
                        .select("id", { count: "exact", head: true })
                        .eq("user_id", user.id)
                        .eq("is_read", false),
                    supabase
                        .from("social_follow_requests")
                        .select("id", { count: "exact", head: true })
                        .eq("target_id", user.id),
                ]);
                if (active) {
                    setUnreadNotifCount((notifCount || 0) + (reqCount || 0));
                }
            } catch {
                // ignore
            }
        };
        loadUnreadCount();
        return () => { active = false; };
    }, [user?.id]);
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
    const [likesOffsets, setLikesOffsets] = useState<Record<string, number>>({});
    const [feedSort, setFeedSort] = useState<'popular' | 'latest'>('latest');
    const [feedMarketFilter, setFeedMarketFilter] = useState<'for_you' | 'following' | 'forex' | 'indian' | 'psychology'>('for_you');

    const handleQuickPost = async () => {
        const trimmed = quickPostText.trim();
        if (!trimmed || isQuickPosting) return;
        if (!user?.id) {
            toast.error("Please log in to post.");
            return;
        }
        setIsQuickPosting(true);
        try {
            if (isStarter && Number.isFinite(dailyPostLimit)) {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const { count } = await supabase
                    .from("social_posts")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", user.id)
                    .gte("created_at", startOfDay.toISOString());
                if ((count ?? 0) >= dailyPostLimit) {
                    toast.error("Daily post limit reached (1/day)", {
                        description: "Standard allows 1 post/day. Upgrade to Pro for unlimited posts.",
                        action: { label: "Upgrade", onClick: () => navigate("/upgrade") },
                    });
                    setIsQuickPosting(false);
                    return;
                }
            }
            const autoTags = Array.from(
                new Set(Array.from(trimmed.matchAll(/#([A-Za-z0-9_]+)/g)).map((m) => m[1]))
            );
            const { error } = await supabase.from("social_posts").insert([
                {
                    user_id: user.id,
                    content: trimmed,
                    media_url: null,
                    media_urls: null,
                    media_type: null,
                    post_type: "text",
                    tags: autoTags.length > 0 ? autoTags : null,
                    is_public: true,
                },
            ]);
            if (error) throw error;
            setQuickPostText("");
            setShowQuickEmoji(false);
            toast.success("Post published!");
            refetch();
        } catch (err: any) {
            console.error("Quick post failed:", err);
            toast.error(err?.message || "Failed to publish post.");
        } finally {
            setIsQuickPosting(false);
        }
    };

    const handleDeletePost = useCallback(async (postId: string) => {
        const postIdStr = String(postId);

        // 1. Immediately remove from state & optimistic UI
        playSound('delete');
        removePost(postId);

        // 2. Permanently clean from all local storage caches
        try {
            const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
            const updatedLocal = localPosts.filter((p: any) => String(p.id) !== postIdStr);
            localStorage.setItem('fialgo_local_posts', JSON.stringify(updatedLocal));
            localStorage.removeItem('home_cache_feeds');

            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('prof_cache_posts_')) {
                    try {
                        const arr = JSON.parse(localStorage.getItem(k) || '[]');
                        const filtered = arr.filter((p: any) => String(p.id) !== postIdStr);
                        localStorage.setItem(k, JSON.stringify(filtered));
                    } catch (_) {}
                }
            }

            const deletedIds = JSON.parse(localStorage.getItem('tradifive_deleted_post_ids') || '[]');
            if (!deletedIds.includes(postIdStr)) {
                deletedIds.push(postIdStr);
                localStorage.setItem('tradifive_deleted_post_ids', JSON.stringify(deletedIds.slice(-500)));
            }
        } catch (_) {}

        toast.success("Post deleted successfully!");

        // 3. Delete from Supabase with cascaded foreign rows
        try {
            if (!postIdStr.startsWith('local-')) {
                await Promise.allSettled([
                    supabase.from('social_post_likes').delete().eq('post_id', postId),
                    supabase.from('social_post_bookmarks').delete().eq('post_id', postId),
                    supabase.from('social_post_comments').delete().eq('post_id', postId),
                ]);
                const { error } = await supabase.from('social_posts').delete().eq('id', postId);
                if (error) {
                    console.error("Supabase post delete error:", error);
                }
            }
        } catch (err) {
            console.error("Error executing post delete on database:", err);
        }
    }, [removePost]);

    const handleVote = useCallback(async (postId: string, updatedMediaUrl: string) => {
        try {
            const { error } = await supabase
                .from('social_posts')
                .update({ media_url: updatedMediaUrl })
                .eq('id', postId);
            if (error) throw error;
            refetch();
        } catch (err: any) {
            console.error("Error updating vote:", err);
        }
    }, [refetch]);

    // Fetch follows and liked posts on user load
    useEffect(() => {
        const fetchFollows = async () => {
            if (!user?.id) return;
            const { data } = await supabase
                .from('social_follows')
                .select('following_id')
                .eq('follower_id', user.id);
            if (data) {
                const map: Record<string, boolean> = {};
                data.forEach(item => {
                    map[item.following_id] = true;
                });
                setFollowedUsers(map);
            }
        };

        const fetchLikedPosts = async () => {
            if (!user?.id) return;
            let map: Record<string, boolean> = {};
            try {
                map = JSON.parse(localStorage.getItem("fialgo_local_post_likes") || "{}");
            } catch (e) {
                console.warn("localStorage not accessible");
            }
            const { data } = await supabase
                .from('social_post_likes')
                .select('post_id')
                .eq('user_id', user.id);
            if (data) {
                data.forEach(item => {
                    map[item.post_id] = true;
                });
            }
            setLikedPosts(map);
        };

        fetchFollows();
        fetchLikedPosts();
    }, [user?.id]);

    const toggleFollowUser = useCallback(async (targetUserId: string, targetName: string) => {
        if (!user?.id) return;
        if (targetUserId === user.id) return;
        const isFollowing = followedUsers[targetUserId] || false;

        // Optimistic update
        setFollowedUsers(prev => ({ ...prev, [targetUserId]: !isFollowing }));

        try {
            if (isFollowing) {
                const { error } = await supabase
                    .from('social_follows')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', targetUserId);
                if (error) throw error;
                toast.info(`Unfollowed ${targetName}`);
            } else {
                const { error } = await supabase
                    .from('social_follows')
                    .insert([{ follower_id: user.id, following_id: targetUserId }]);
                if (error) throw error;
                toast.success(`Followed ${targetName}`);
            }
            // Don't refetch all data - optimistic UI update is sufficient
        } catch (err: any) {
            console.error("Error toggling follow:", err);
            toast.error("Failed to update follow state.");
            setFollowedUsers(prev => ({ ...prev, [targetUserId]: isFollowing }));
        }
    }, [user?.id, followedUsers]);

    const handleLikePost = useCallback(async (postId: string) => {
        if (!user?.id) return;
        const isCurrentlyLiked = likedPosts[postId] || false;
        const nextLiked = !isCurrentlyLiked;

        // Optimistic update
        setLikedPosts(prev => {
            const next = { ...prev, [postId]: nextLiked };
            try {
                localStorage.setItem("fialgo_local_post_likes", JSON.stringify(next));
            } catch (e) {
                console.warn("localStorage not accessible");
            }
            return next;
        });
        setLikesOffsets(prev => ({
            ...prev,
            [postId]: (prev[postId] || 0) + (nextLiked ? 1 : -1)
        }));

        if (postId.startsWith('local-')) {
            const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
            const idx = localPosts.findIndex((p: any) => p.id === postId);
            if (idx !== -1) {
                const currentCount = localPosts[idx].like_count || 0;
                localPosts[idx].like_count = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
                localStorage.setItem('fialgo_local_posts', JSON.stringify(localPosts));
            }
            return;
        }

        try {
            if (nextLiked) {
                await supabase.from('social_post_likes').insert([{ post_id: postId, user_id: user.id }]);
            } else {
                await supabase.from('social_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
            }
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    }, [user?.id, likedPosts]);

    const handleToggle = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        value: boolean
    ) => {
        setter(value);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (customizeMenuRef.current && !customizeMenuRef.current.contains(event.target as Node)) {
                setShowCustomizeMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const feedCardsList = useMemo(() => {
        if (feeds.length === 0) {
            return (
                <div className="p-8 rounded-[22px] text-center border-2 border-dashed border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-400 font-bold text-[14px]">
                    No social feeds available. Make a new post to get started!
                </div>
            );
        }
        const q = feedSearchQuery.trim().toLowerCase();
        const filteredFeeds = [...feeds].filter(feed => {
            if (q) {
                const contentText = String(feed.content || "").toLowerCase();
                const authorName = String(feed.profiles?.display_name || feed.profiles?.full_name || "").toLowerCase();
                const authorUser = String(feed.profiles?.username || "").toLowerCase();
                const cleanQ = q.replace(/^[@#$]/, "");
                const matchesSearch =
                    contentText.includes(q) ||
                    contentText.includes(cleanQ) ||
                    authorName.includes(cleanQ) ||
                    authorUser.includes(cleanQ);
                if (!matchesSearch) return false;
            }
            if (feedMarketFilter === 'for_you') return true;
            if (feedMarketFilter === 'following') {
                const authorId = typeof feed.user_id === 'object' ? feed.user_id?.id : (feed.user_id || feed.profiles?.id);
                return Boolean(authorId && followedUsers[authorId]);
            }

            // If the post has an explicit market set, use it
            if (feed.market) {
                // Map frontend filter IDs to backend market IDs
                if (feedMarketFilter === 'forex' && feed.market === 'global') return true;
                if (feedMarketFilter === 'indian' && feed.market === 'indian') return true;
                if (feedMarketFilter === 'psychology' && feed.market === 'psychology') return true;
                return false;
            }

            // Fallback keyword filtering for older posts
            const contentLower = feed.content?.toLowerCase() || '';
            if (feedMarketFilter === 'forex') return contentLower.includes('forex') || contentLower.includes('usd') || contentLower.includes('eur') || contentLower.includes('pip');
            if (feedMarketFilter === 'indian') return contentLower.includes('nifty') || contentLower.includes('banknifty') || contentLower.includes('sensex') || contentLower.includes('inr');
            if (feedMarketFilter === 'psychology') return contentLower.includes('mindset') || contentLower.includes('psychology') || contentLower.includes('discipline') || contentLower.includes('emotion');

            return false;
        });

        if (filteredFeeds.length === 0) {
            if (q) {
                return (
                    <div className="py-12 px-6 text-center flex flex-col items-center justify-center gap-2.5">
                        <p className="text-[14.5px] font-bold text-slate-900 dark:text-white">
                            No posts found for &ldquo;{feedSearchQuery.trim()}&rdquo;
                        </p>
                        <p className="text-[12.5px] text-slate-500 dark:text-neutral-400">
                            Try searching another $ticker, #tag, or trader handle.
                        </p>
                        <button
                            type="button"
                            onClick={() => setFeedSearchQuery("")}
                            className="mt-1 px-4 py-1.5 rounded-full tactile-white-pill text-[12px] font-semibold cursor-pointer"
                        >
                            Clear search
                        </button>
                    </div>
                );
            }
            if (feedMarketFilter === 'following') {
                return (
                    <div className="p-8 sm:p-10 rounded-[24px] bg-white dark:bg-[#1E1E1E] figma-card-shadow text-center flex flex-col items-center justify-center gap-3">
                        <p className="text-[15px] font-bold text-slate-900 dark:text-white">No posts from people you follow yet</p>
                        <p className="text-[12.5px] font-medium text-slate-500 dark:text-neutral-400 max-w-xs">
                            Follow traders you want to track and their latest posts and setups will appear here.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                triggerHaptic("selection");
                                setFeedMarketFilter('for_you');
                            }}
                            className="mt-1 px-5 py-2 rounded-full tactile-black-pill text-[13px] font-bold cursor-pointer select-none"
                        >
                            Explore For You
                        </button>
                    </div>
                );
            }
            return (
                <div className="p-8 rounded-[22px] text-center border-2 border-dashed border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-400 font-bold text-[14px]">
                    No posts in this feed yet.
                </div>
            );
        }

        return filteredFeeds.sort((a, b) => {
            if (feedSort === 'popular') {
                const likesA = a.like_count || a.likes_count || 0;
                const likesB = b.like_count || b.likes_count || 0;
                if (likesA === likesB) {
                    const timeA = new Date(a.created_at || 0).getTime();
                    const timeB = new Date(b.created_at || 0).getTime();
                    return timeB - timeA;
                }
                return likesB - likesA;
            } else {
                const timeA = new Date(a.created_at || 0).getTime();
                const timeB = new Date(b.created_at || 0).getTime();
                return timeB - timeA;
            }
        }).map(feed => (
            <FeedCard
                key={feed.id}
                feed={feed}
                currentUserId={user?.id ?? ""}
                followedUsers={followedUsers}
                onToggleFollow={toggleFollowUser}
                isLiked={likedPosts[feed.id] !== undefined ? likedPosts[feed.id] : (feed.has_liked || false)}
                likes={Math.max(0, (feed.likes ?? feed.like_count ?? feed.likes_count ?? 0) + (likesOffsets[feed.id] || 0))}
                onLike={handleLikePost}
                onEdit={setEditPost}
                onDelete={handleDeletePost}
                onVote={handleVote}
            />
        ));
    }, [feeds, feedSort, feedMarketFilter, feedSearchQuery, likedPosts, likesOffsets, followedUsers, user?.id, toggleFollowUser, handleLikePost, handleDeletePost, handleVote]);

    const suggestionsRender = useMemo(() => {
        const source = finalSuggestions;
        return source.map((sug: any) => {
            const rawName = (sug.display_name || sug.full_name || (sug.first_name ? `${sug.first_name} ${sug.last_name || ''}`.trim() : null) || '').trim();
            const displayName = rawName || sug.username || `Trader ${sug.id.slice(0, 4)}`;
            const displaySlug = sug.username || sug.id || "user";
            const displayAvatar = sug.avatar_url || sug.avatar || "/default-avatar.svg";
            const displayHandle = `@${displaySlug}`;

            return (
                <div
                    key={sug.id}
                    className="group flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-slate-50/80 dark:hover:bg-white/[0.04] transition-colors"
                >
                    <Link to={`/user/${displaySlug}`} className="flex items-center gap-3 min-w-0 flex-1 group/user">
                        <div className="relative shrink-0">
                            <img
                                src={displayAvatar}
                                alt={displayName}
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 object-cover ring-1 ring-slate-200/80 dark:ring-white/10 group-hover/user:scale-105 transition-transform"
                                onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white truncate group-hover/user:text-indigo-600 dark:group-hover/user:text-indigo-400 transition-colors">
                                    {displayName}
                                </span>
                                {sug.is_pro && (
                                    <span className="text-amber-500 text-[10px] font-bold" title="Pro Trader">★</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{displayHandle}</span>
                                {sug.trading_style && (
                                    <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 shrink-0 capitalize">
                                        · {sug.trading_style}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => toggleFollowUser(sug.id, displayName)}
                            className={`h-[29px] px-4 rounded-full text-[12px] font-bold flex items-center justify-center cursor-pointer transition-all shrink-0 select-none ${
                                followedUsers[sug.id]
                                    ? "tactile-white-pill text-emerald-600 dark:text-emerald-400"
                                    : "tactile-black-pill"
                            }`}
                        >
                            {followedUsers[sug.id] ? "Following" : "Follow"}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDismissSuggestion(sug.id);
                            }}
                            title="Dismiss suggestion"
                            className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                        >
                            <X size={13} strokeWidth={2.2} />
                        </button>
                    </div>
                </div>
            );
        });
    }, [finalSuggestions, followedUsers, toggleFollowUser, handleDismissSuggestion]);

    const streaksRender = useMemo(() => {
        const source = finalStreaks;
        return source.map((streak: any) => {
            const displayName = streak.full_name || streak.name || "Streak Pro";
            const displaySlug = streak.username || streak.name?.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || "user";
            const displayAvatar = streak.avatar_url || streak.avatar || "/default-avatar.svg";
            const displayStreak = streak.streak_days ? `${streak.streak_days} days` : streak.streak;
            const displayGain = streak.win_rate ? `+${streak.win_rate}% WR` : streak.gain;

            return (
                <div key={streak.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <Link to={`/user/${displaySlug}`} className="shrink-0 hover:opacity-85 transition-opacity">
                            <img src={displayAvatar} alt={displayName} className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-100 dark:border-[#33]" onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                        </Link>
                        <div>
                            <Link to={`/user/${displaySlug}`} className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5 leading-none hover:text-blue-500 transition-colors block">
                                {displayName}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-1 leading-none">
                                <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-0.5 leading-none">
                                    🔥 {displayStreak}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-455">{displayGain}</span>
                    </div>
                </div>
            );
        });
    }, [finalStreaks]);

    const disciplinedRender = useMemo(() => {
        const source = finalDisciplined;
        return source.map((disc: any) => {
            const displayName = disc.full_name || disc.name || "Disciplined Trader";
            const displaySlug = disc.username || disc.name?.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || "user";
            const displayAvatar = disc.avatar_url || disc.avatar || "/default-avatar.svg";
            const displayScore = disc.win_rate ? `${disc.win_rate}% Win Rate` : `${disc.score} Score`;
            const displayDescription = disc.total_trades !== undefined ? `${disc.total_trades} total trades` : disc.description;

            return (
                <div key={disc.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <Link to={`/user/${displaySlug}`} className="shrink-0 hover:opacity-85 transition-opacity">
                            <img src={displayAvatar} alt={displayName} className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-100 dark:border-[#33]" onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                        </Link>
                        <div>
                            <Link to={`/user/${displaySlug}`} className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5 leading-none hover:text-blue-500 transition-colors block">
                                {displayName}
                            </Link>
                            <p className="text-[11px] font-medium text-slate-455 leading-none mt-1">{displayDescription}</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 border border-emerald-500/20 leading-none">
                            {displayScore}
                        </span>
                    </div>
                </div>
            );
        });
    }, [finalDisciplined]);

    useEffect(() => {
        const handleScrollTopEvent = () => scrollToTop();
        window.addEventListener("community-scroll-top", handleScrollTopEvent);
        return () => window.removeEventListener("community-scroll-top", handleScrollTopEvent);
    }, []);

    if (!authChecked || loading) {
        return (
            <CommunityPageWrapper breadcrumbs={[{ label: "Home", path: "/home" }]} noScroll={true} noPadding={true}>
                <HomeSkeleton />
            </CommunityPageWrapper>
        );
    }

    const headerActions = (
        <div className="flex items-center gap-2 sm:gap-3">
            <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="hidden sm:flex items-center justify-center gap-2 px-4 sm:px-5 h-10 rounded-full font-bold text-[13px] cursor-pointer select-none transition-all duration-150 active:scale-[0.985] bg-white hover:bg-slate-50 text-slate-800 hover:text-blue-600 border border-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_3px_rgba(0,0,0,0.06)] dark:bg-gradient-to-r dark:from-[#1e293b] dark:to-[#0f172a] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] dark:border-none dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.25)]"
                title="Create New Post"
            >
                <Plus size={16} strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" /> <span className="hidden sm:inline">New Post</span>
            </button>
            <div className="relative hidden md:block" ref={customizeMenuRef}>
                <button
                    onClick={() => { setCustomizeActiveTab('layout'); setShowCustomizeModal(true); }}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border shadow-sm transition-all active:scale-95 select-none ${showCustomizeMenu ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-500/30' : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222] hover:text-slate-900 dark:hover:text-white'}`}
                    title="Customize Layout"
                >
                    <Sliders size={16} strokeWidth={2.5} />
                </button>

                <AnimatePresence>
                    {showCustomizeMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-3 w-[340px] p-5 rounded-2xl bg-white dark:bg-[#171719] border border-slate-200 dark:border-white/5 shadow-2xl z-50 text-slate-800 dark:text-slate-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Customize Dashboard</h4>
                            </div>

                            {/* Tabs Header */}
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-4 text-[10px] font-bold">
                                {(['layout', 'watchlist', 'calendar'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setCustomizeActiveTab(tab)}
                                        className={`flex-1 py-1.5 rounded-lg uppercase tracking-wider transition-all ${customizeActiveTab === tab
                                            ? 'bg-white dark:bg-[#222] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-white/5'
                                            : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-400'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab 1: Layout Toggles */}
                            {customizeActiveTab === 'layout' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-h-[300px] overflow-y-auto amazing-scrollbar pr-2 space-y-5"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Cards</span>
                                        <button
                                            onClick={() => {
                                                const anyVisible = showProfileCard || showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined;
                                                if (anyVisible) {
                                                    setShowProfileCard(false);
                                                    setShowWatchlist(false);
                                                    setShowCalendar(false);
                                                    setShowFollowers(false);
                                                    setShowRequests(false);
                                                    setShowSuggestions(false);
                                                    setShowStreaks(false);
                                                    setShowDisciplined(false);
                                                } else {
                                                    handleToggle(setShowProfileCard, true);
                                                    handleToggle(setShowWatchlist, true);
                                                    handleToggle(setShowCalendar, true);
                                                    handleToggle(setShowFollowers, true);
                                                    handleToggle(setShowRequests, true);
                                                    handleToggle(setShowSuggestions, true);
                                                    handleToggle(setShowStreaks, true);
                                                    handleToggle(setShowDisciplined, true);
                                                }
                                            }}
                                            className="text-[9px] font-bold text-blue-500 hover:text-blue-650 transition-colors uppercase tracking-wider"
                                        >
                                            {(showProfileCard || showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined) ? 'Hide All' : 'Show All'}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <ToggleRow label="Profile Card" checked={showProfileCard} onChange={(v) => handleToggle(setShowProfileCard, v)} />
                                        <ToggleRow label="My Watchlist" checked={showWatchlist} onChange={(v) => handleToggle(setShowWatchlist, v)} />
                                        <ToggleRow label="News" checked={showCalendar} onChange={(v) => handleToggle(setShowCalendar, v)} />
                                        <ToggleRow label="Followers Stats" checked={showFollowers} onChange={(v) => handleToggle(setShowFollowers, v)} />
                                    </div>

                                    <div>
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Community Cards</h5>
                                        <div className="space-y-3">
                                            <ToggleRow label="Requests" checked={showRequests} onChange={(v) => handleToggle(setShowRequests, v)} />
                                            <ToggleRow label="Suggestions" checked={showSuggestions} onChange={(v) => handleToggle(setShowSuggestions, v)} />
                                            <ToggleRow label="Winning Streaks" checked={showStreaks} onChange={(v) => handleToggle(setShowStreaks, v)} />
                                            <ToggleRow label="Top Disciplined" checked={showDisciplined} onChange={(v) => handleToggle(setShowDisciplined, v)} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab 2: Watchlist Symbol Manager */}
                            {customizeActiveTab === 'watchlist' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Add Watchlist Pair</h5>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder={activeMarket === 'indian' ? "e.g. RELIANCE, HDFCBANK" : "e.g. BTC/USDT, EUR/USD"}
                                                value={newSymbolName}
                                                onChange={(e) => setNewSymbolName(e.target.value)}
                                                className="w-full px-3 py-2 text-[12px] font-semibold bg-slate-50 dark:bg-[#1A1A1C] border border-slate-205 dark:border-white/5 rounded-xl outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg flex text-[10px] font-bold border border-slate-200/50 dark:border-white/5">
                                                    {(activeMarket === 'indian' ? ['index', 'equity'] : ['crypto', 'forex', 'commodity']).map((type) => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setNewSymbolType(type as any)}
                                                            className={`flex-1 py-1 rounded-md uppercase tracking-wider transition-all ${newSymbolType === type
                                                                ? 'bg-white dark:bg-[#222] text-slate-900 dark:text-white shadow-xs'
                                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => handleAddSymbol()}
                                                    disabled={isAddingSymbol || !newSymbolName.trim()}
                                                    className="px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 select-none flex items-center gap-1 shadow-sm"
                                                >
                                                    <Plus size={12} />
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Active Pairs ({watchlist.length})</h5>
                                        <div className="max-h-[160px] overflow-y-auto amazing-scrollbar pr-1 space-y-2">
                                            {watchlist.length === 0 ? (
                                                <p className="text-[11px] font-medium text-slate-405 dark:text-slate-400 text-center py-4 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200/60 dark:border-white/5">
                                                    No active watchlist pairs
                                                </p>
                                            ) : (
                                                watchlist.map((item: any) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.symbol}</span>
                                                            <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.symbol_type === 'commodity'
                                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/10"
                                                                : item.symbol_type === 'crypto'
                                                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-450 border border-purple-500/10"
                                                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/10"
                                                                }`}>
                                                                {item.symbol_type}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteSymbol(item.id)}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
                                                            title="Delete symbol"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab 3: Calendar Filters */}
                            {customizeActiveTab === 'calendar' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Filter Events Impact</h5>
                                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400 mb-4 leading-normal">
                                            Adjust calendar feed to only show events matching these risk levels.
                                        </p>
                                        <div className="space-y-3 bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl border border-slate-205/60 dark:border-white/5">
                                            <ToggleRow
                                                label="High Impact Risk"
                                                checked={calendarFilters.high}
                                                onChange={(v) => setCalendarFilters(prev => ({ ...prev, high: v }))}
                                            />
                                            <ToggleRow
                                                label="Medium Impact Risk"
                                                checked={calendarFilters.medium}
                                                onChange={(v) => setCalendarFilters(prev => ({ ...prev, medium: v }))}
                                            />
                                            <ToggleRow
                                                label="Low Impact Risk"
                                                checked={calendarFilters.low}
                                                onChange={(v) => setCalendarFilters(prev => ({ ...prev, low: v }))}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    // Blending state check helper (100% Real Database states)
    const followerCountText = followers?.count?.toLocaleString() || "0";
    const followersAvatarsList = followers?.avatars || [];

    return (
        <>
            <CommunityPageWrapper breadcrumbs={[{ label: "Home", path: "/home" }]} headerActions={null} noScroll={true} noPadding={true}>
                <div className="w-full min-h-full flex flex-col px-0 sm:px-4 lg:px-6 xl:px-8 pt-0 pb-0 select-none font-sans text-slate-800 dark:text-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-5 relative items-start min-h-full">

                        {/* --- COLUMN 1: LEFT SIDEBAR (col-span-3) --- */}
                        {currentTab !== 'calendar' && (showWatchlist || showCalendar || showFollowers) && (
                            <motion.div
                                variants={homeContainerVariants}
                                initial="hidden"
                                animate="visible"
                                className="hidden xl:block xl:col-span-3 xl:col-start-1 xl:sticky xl:top-4 xl:max-h-[calc(100vh-110px)] xl:overflow-y-auto amazing-scrollbar space-y-3.5 px-1 xl:px-2 pt-4 pb-4"
                            >

                                {/* A. My Watchlist / Market Segment */}
                                {showWatchlist && (
                                    <motion.div variants={homeCardVariants} className="p-4 rounded-[22px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.045)] dark:shadow-none">
                                        <div className="flex items-center justify-between mb-3.5">
                                            <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                                <IconlyGraph size={15} set="curved" primaryColor="currentColor" className="text-slate-700 dark:text-slate-300 shrink-0" />
                                                <span>My Watchlist</span>
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomizeActiveTab('watchlist');
                                                    setShowCustomizeModal(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full tactile-white-pill font-semibold text-[11.5px] cursor-pointer select-none"
                                                title="Add Pairs"
                                            >
                                                <Plus size={12} strokeWidth={2.4} />
                                                <span>Add Pair</span>
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {watchlist.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-center">
                                                    <IconlyGraph size={20} set="curved" primaryColor="currentColor" className="text-slate-400 mb-2" />
                                                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5">Watchlist Empty</h4>
                                                    <p className="text-[11.5px] text-slate-400 mb-3 max-w-[180px]">Track forex, crypto, and commodity assets live.</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCustomizeActiveTab('watchlist');
                                                            setShowCustomizeModal(true);
                                                        }}
                                                        className="px-4 py-1.5 rounded-full tactile-white-pill font-semibold text-[12px] inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                        <Plus size={12} strokeWidth={2.5} />
                                                        <span>Add Pair</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                watchlist.map((asset: any, i) => {
                                                    const rawSymbol = String(asset.symbol || '').toUpperCase();
                                                    const normalizedDisplay = rawSymbol.replace(/\/UAD$/, '/USD').replace(/UAD$/, 'USD');
                                                    let displayName =
                                                        asset.symbol_type === "forex"
                                                            ? "Forex Spot"
                                                            : asset.symbol_type === "commodity"
                                                                ? "Commodity Spot"
                                                                : asset.symbol_type === "crypto"
                                                                    ? "Crypto Spot"
                                                                    : asset.symbol_type === "index"
                                                                        ? "Index"
                                                                        : asset.symbol_type === "equity"
                                                                            ? "Stock"
                                                                            : (asset.symbol_type || "Market");
                                                    if (normalizedDisplay.startsWith('XAU')) {
                                                        displayName = "Gold Spot";
                                                    } else if (['XAG', 'WTI', 'BRENT', 'USOIL', 'UKOIL'].some(c => normalizedDisplay.includes(c))) {
                                                        displayName = "Commodity Spot";
                                                    }

                                                    const hasLivePrice = Boolean(asset.price && asset.price !== '—' && asset.price !== 'Unavailable');
                                                    const hasLiveChange = Boolean(asset.change && asset.change !== '—');
                                                    const isPositive = asset.is_positive !== undefined ? asset.is_positive : true;

                                                    return (
                                                        <div key={asset.id || i} className="flex items-center justify-between gap-2 group">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="min-w-0">
                                                                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                                                                        {normalizedDisplay}
                                                                    </p>
                                                                    <p className="text-[10.5px] font-medium text-slate-400 leading-none mt-0.5 capitalize truncate">
                                                                        {displayName}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <div className="text-right">
                                                                    <p className={`text-[13px] font-semibold leading-tight tabular-nums ${hasLivePrice ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                                                        {hasLivePrice ? asset.price : '···'}
                                                                    </p>
                                                                    <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 leading-none tabular-nums ${
                                                                        !hasLiveChange
                                                                            ? "bg-slate-100 dark:bg-white/[0.06] text-slate-400"
                                                                            : isPositive
                                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                                    }`}>
                                                                        {hasLiveChange ? asset.change : '—'}
                                                                    </span>
                                                                </div>
                                                                {asset.id && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteSymbol(asset.id)}
                                                                        title={`Remove ${normalizedDisplay}`}
                                                                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 -mr-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* B. Forex Factory Market News (Matches Dashboard UI) */}
                                {showCalendar && (
                                    <motion.div variants={homeCardVariants}>
                                        <DashboardNewsCard
                                            compact
                                            externalViewMode={newsViewMode === 'week' ? 'week' : 'day'}
                                            onExternalViewModeChange={(mode) => {
                                                setNewsViewMode(mode === 'week' ? 'week' : 'today');
                                                setNewsExpanded(false);
                                            }}
                                            externalImpacts={[
                                                ...(calendarFilters.high ? ['High'] : []),
                                                ...(calendarFilters.medium ? ['Medium'] : []),
                                                ...(calendarFilters.low ? ['Low'] : []),
                                            ]}
                                            onExternalImpactsChange={(impacts) => {
                                                setCalendarFilters({
                                                    high: impacts.some((i) => i.toLowerCase() === 'high'),
                                                    medium: impacts.some((i) => i.toLowerCase() === 'medium'),
                                                    low: impacts.some((i) => i.toLowerCase() === 'low'),
                                                });
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {/* C. Followers Stats Box */}
                                {showFollowers && (
                                    <motion.div
                                        variants={homeCardVariants}
                                        onClick={() => navigate('/profile')}
                                        className="p-4 rounded-[22px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.045)] dark:shadow-none cursor-pointer group hover:border-slate-300/90 dark:hover:border-white/15 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[12px] font-semibold text-slate-400 dark:text-neutral-500">
                                                Community reach
                                            </span>
                                            <IconlyGraph size={16} set="curved" primaryColor="currentColor" className="text-[#2563EB]" />
                                        </div>

                                        {followersAvatarsList.length > 0 && (
                                            <div className="flex items-center mb-3 pl-3">
                                                {followersAvatarsList.map((url, i) => (
                                                    <img
                                                        key={i}
                                                        src={url || "/default-avatar.svg"}
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/default-avatar.svg";
                                                        }}
                                                        className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-[#17171A] bg-slate-200 object-cover"
                                                        style={{
                                                            zIndex: followersAvatarsList.length - i,
                                                            marginLeft: '-10px'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-baseline gap-1.5">
                                            <h4 className="text-[24px] font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
                                                <AnimatedNumber
                                                    value={followers?.count || 0}
                                                    duration={900}
                                                    format={(v) => Math.round(v).toLocaleString()}
                                                />
                                            </h4>
                                            <span className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wider">
                                                Followers
                                            </span>
                                        </div>
                                        <p className="text-[11.5px] font-medium text-slate-400 mt-1.5">
                                            Active now on your profile
                                        </p>
                                    </motion.div>
                                )}

                            </motion.div>
                        )}
                        {/* --- COLUMN 2: MIDDLE MAIN CONTENT (consistent centered width regardless of hidden sidebars) --- */}
                        <div
                            className={`relative flex flex-col min-h-[calc(100vh-80px)] ${
                                currentTab === 'calendar'
                                    ? 'col-span-12 px-4 sm:px-8'
                                    : `col-span-12 lg:col-span-8 ${
                                        !(showProfileCard || showRequests || showSuggestions || showStreaks || showDisciplined)
                                            ? 'lg:col-start-3'
                                            : ''
                                    } xl:col-span-6 xl:col-start-4 md:border-x md:border-slate-200/85 dark:md:border-white/[0.09]`
                            }`}
                        >
                            {/* Dead-center top floating pill — appears ONLY when someone posts a new post */}
                            <div className="sticky top-3 z-50 h-0 flex justify-center pointer-events-none">
                                <AnimatePresence>
                                    {newPostsCount > 0 && currentTab === 'feed' && (
                                        <motion.button
                                            type="button"
                                            initial={{ y: -16, opacity: 0, scale: 0.94 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            exit={{ y: -16, opacity: 0, scale: 0.94 }}
                                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                            onClick={() => {
                                                setNewPostsCount(0);
                                                refetch();
                                                scrollToTop();
                                            }}
                                            className="pointer-events-auto h-9 px-4 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white shadow-[0_6px_20px_rgba(37,99,235,0.32)] font-semibold tracking-tight text-[13px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <ArrowUp size={14} strokeWidth={2.5} />
                                            <span>{newPostsCount === 1 ? "New post" : `${newPostsCount} new posts`}</span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="space-y-0 px-0 pt-0 pb-24 md:pb-8" ref={middleColumnRef}>


                                {/* Feeds Section */}
                                {currentTab === 'feed' && (
                                <div>
                                    {/* Desktop Top Bar: Home + Pill Search + Circular Refresh */}
                                    <div className="hidden md:flex items-center gap-3.5 px-5 py-3 border-b border-slate-200/85 dark:border-white/[0.09] sticky top-0 z-30 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md">
                                        <h1 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight shrink-0">
                                            Home
                                        </h1>

                                        <div className="flex-1 flex items-center gap-2.5 h-10 px-4 rounded-full bg-slate-100/90 dark:bg-white/[0.06] border border-transparent focus-within:border-slate-300/80 dark:focus-within:border-white/15 transition-colors relative">
                                            <Search size={16} strokeWidth={2} className="text-slate-400 dark:text-neutral-500 shrink-0" />
                                            <input
                                                type="text"
                                                value={feedSearchQuery}
                                                onChange={(e) => setFeedSearchQuery(e.target.value)}
                                                placeholder="Search $tickers, #tags or traders"
                                                className="w-full bg-transparent text-[13.5px] font-normal text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none"
                                            />
                                            {feedSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFeedSearchQuery("");
                                                        setSearchedTraders([]);
                                                    }}
                                                    className="w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0 cursor-pointer"
                                                    aria-label="Clear search"
                                                >
                                                    <X size={11} strokeWidth={2.5} />
                                                </button>
                                            )}

                                            {/* Live Search Popup when typing a trader or query */}
                                            {feedSearchQuery.trim() && !feedSearchQuery.startsWith("$") && !feedSearchQuery.startsWith("#") && (
                                                <div className="absolute left-0 right-0 top-12 z-50 p-2 bg-white dark:bg-[#1A1A1E] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_36px_rgba(15,23,42,0.14)] dark:shadow-none animate-in fade-in duration-150">
                                                    <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                                        <span>Matching Traders</span>
                                                        {searchingTraders && <Loader2 size={12} className="animate-spin text-slate-400" />}
                                                    </div>
                                                    {searchedTraders.length > 0 ? (
                                                        <div className="space-y-1 mt-1">
                                                            {searchedTraders.map((t) => {
                                                                const displaySlug = t.username || t.id;
                                                                const displayName = t.display_name || t.full_name || t.username || "Trader";
                                                                return (
                                                                    <div
                                                                        key={t.id}
                                                                        onClick={() => {
                                                                            navigate(`/user/${displaySlug}`);
                                                                            setFeedSearchQuery("");
                                                                            setSearchedTraders([]);
                                                                        }}
                                                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
                                                                    >
                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                            <img
                                                                                src={t.avatar_url || "/default-avatar.svg"}
                                                                                alt={displayName}
                                                                                className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-neutral-800 shrink-0 border border-slate-200/50 dark:border-white/10"
                                                                                onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                                                                            />
                                                                            <div className="min-w-0">
                                                                                <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                                                                                    {displayName}
                                                                                </p>
                                                                                <p className="text-[11px] text-slate-400 truncate">
                                                                                    @{displaySlug}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-1 shrink-0">
                                                                            View profile →
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : !searchingTraders ? (
                                                        <p className="px-2.5 py-2 text-[12px] text-slate-400">
                                                            No traders found matching &ldquo;{feedSearchQuery.trim()}&rdquo;
                                                        </p>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleRefreshFeed}
                                            disabled={isRefreshingFeed}
                                            className="w-10 h-10 rounded-full bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
                                            title="Refresh feed"
                                            aria-label="Refresh feed"
                                        >
                                            <RotateCw
                                                size={16}
                                                strokeWidth={2}
                                                className={isRefreshingFeed ? "animate-spin text-[#2563EB]" : ""}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCustomizeActiveTab('layout');
                                                setShowCustomizeModal(true);
                                            }}
                                            className="hidden lg:flex relative w-10 h-10 rounded-full bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] text-slate-700 dark:text-slate-200 items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
                                            title="Home Layout & Widgets"
                                            aria-label="Home Layout & Widgets"
                                        >
                                            <Sliders size={15.5} strokeWidth={2} />
                                            {!(showProfileCard && showWatchlist && showCalendar && showFollowers && showRequests && showSuggestions && showStreaks && showDisciplined) && (
                                                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Full-Width "For You" & "Following" Tabs */}
                                    <div className="bg-white dark:bg-[#121212]">
                                        <div className="flex items-center w-full border-b border-slate-200/80 dark:border-white/10">
                                            {[
                                                { id: 'for_you', label: 'For You' },
                                                { id: 'following', label: 'Following' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => {
                                                        triggerHaptic("selection");
                                                        setFeedMarketFilter(tab.id as 'for_you' | 'following');
                                                    }}
                                                    className={`flex-1 flex items-center justify-center py-3 text-[15px] sm:text-[15.5px] tracking-tight cursor-pointer transition-all relative select-none ${
                                                        feedMarketFilter === tab.id
                                                            ? "font-bold text-slate-900 dark:text-white"
                                                            : "font-semibold text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white"
                                                    }`}
                                                >
                                                    {tab.label}
                                                    {feedMarketFilter === tab.id && (
                                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-[3px] bg-blue-600 rounded-full" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inline Quick Post Composer (Matching Reference) */}
                                    <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200/85 dark:border-white/[0.09]">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg"}
                                                alt="Your avatar"
                                                onClick={() => navigate('/profile')}
                                                className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 shrink-0 cursor-pointer"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg";
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <textarea
                                                    rows={quickPostText.includes('\n') ? Math.min(4, quickPostText.split('\n').length) : 1}
                                                    value={quickPostText}
                                                    onChange={(e) => setQuickPostText(e.target.value.slice(0, 2000))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                            e.preventDefault();
                                                            handleQuickPost();
                                                        }
                                                    }}
                                                    placeholder="Share a trade, a lesson, a theme..."
                                                    className="w-full bg-transparent pt-2 text-[15.5px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none resize-none leading-relaxed font-normal"
                                                />

                                                {showQuickEmoji && (
                                                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pt-2 pb-1">
                                                        {["📈", "📉", "🚀", "💎", "🔥", "🎯", "💰", "🐂", "🐻", "👏", "🫡", "⚡"].map((emoji) => (
                                                            <button
                                                                key={emoji}
                                                                type="button"
                                                                onClick={() => setQuickPostText((prev) => (prev + emoji).slice(0, 2000))}
                                                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center text-base shrink-0 active:scale-90 transition-transform cursor-pointer"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                triggerHaptic("selection");
                                                                setShowQuickEmoji((prev) => !prev);
                                                            }}
                                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                                                showQuickEmoji
                                                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                                                    : "bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200"
                                                            }`}
                                                            title="Emoji"
                                                            aria-label="Add emoji"
                                                        >
                                                            <Smile size={18} strokeWidth={1.9} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                triggerHaptic("selection");
                                                                setIsCreatePostModalOpen(true);
                                                            }}
                                                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-800 dark:text-slate-100 text-[11px] font-black tracking-tight flex items-center justify-center transition-colors cursor-pointer"
                                                            title="GIF & Full Post"
                                                            aria-label="Add GIF"
                                                        >
                                                            GIF
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                triggerHaptic("selection");
                                                                setIsCreatePostModalOpen(true);
                                                            }}
                                                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                                                            title="Add Photo"
                                                            aria-label="Add photo"
                                                        >
                                                            <IconlyImage set="curved" stroke="bold" primaryColor="currentColor" size={19} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                triggerHaptic("selection");
                                                                setIsCreatePostModalOpen(true);
                                                            }}
                                                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                                                            title="Add Video (up to 60s)"
                                                            aria-label="Add video"
                                                        >
                                                            <IconlyVideo set="curved" stroke="bold" primaryColor="currentColor" size={19} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={!quickPostText.trim() || isQuickPosting}
                                                        onClick={handleQuickPost}
                                                        className={`px-5 py-2 rounded-full text-[13.5px] font-bold transition-all select-none flex items-center justify-center ${
                                                            quickPostText.trim() && !isQuickPosting
                                                                ? "tactile-black-pill cursor-pointer"
                                                                : "bg-slate-400/75 dark:bg-white/15 text-white dark:text-neutral-500 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        {isQuickPosting ? <Loader2 size={15} className="animate-spin" /> : "Post"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feed List */}
                                    <div>
                                        {feedCardsList}
                                    </div>

                                    {Array.isArray(feedCardsList) && feedCardsList.length > 0 && (
                                        <div className="py-8 text-center select-none">
                                            <p className="text-[14px] font-medium text-slate-400 dark:text-zinc-500">
                                                You&apos;re all caught up.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                )}
                                
                                
                                {currentTab === 'saved' && (
                                    <motion.div
                                        variants={homeCardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex flex-col"
                                    >
                                        {/* Sticky Column Header matching Feed Header */}
                                        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200/85 dark:border-white/[0.09] sticky top-0 z-30 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md">
                                            <div>
                                                <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                                                    Saved Posts
                                                </h2>
                                                <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                                    Bookmarked chart setups &amp; market notes
                                                </p>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-600 dark:text-zinc-300 text-[11.5px] font-semibold tabular-nums shrink-0">
                                                {savedPosts.length} {savedPosts.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>

                                        {isLoadingSaved ? (
                                            <div className="p-4 sm:p-5 space-y-4">
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] animate-pulse space-y-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10" />
                                                            <div className="space-y-1.5">
                                                                <div className="h-3 w-28 bg-slate-200 dark:bg-white/10 rounded" />
                                                                <div className="h-2.5 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                                                            </div>
                                                        </div>
                                                        <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-white/10 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : savedPosts.length === 0 ? (
                                            <div className="px-4 sm:px-6 py-10 sm:py-14">
                                                <div className="flex flex-col items-center justify-center py-14 px-6 text-center rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/75 dark:border-white/[0.07]">
                                                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 flex items-center justify-center shadow-2xs mb-4">
                                                        <Bookmark className="w-5 h-5" strokeWidth={2} />
                                                    </div>
                                                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                                                        No saved posts yet
                                                    </h3>
                                                    <p className="text-[12.5px] text-slate-500 dark:text-zinc-400 max-w-[290px] mb-5 leading-relaxed">
                                                        Bookmark trading insights, chart setups, or market discussions from the feed to view them here anytime.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/home')}
                                                        className="px-5 h-9 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[12.5px] font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                                                    >
                                                        Browse Community Feed
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
                                                {savedPosts.map((post: any) => (
                                                    <FeedCard
                                                        key={post.id}
                                                        feed={post}
                                                        currentUserId={user?.id ?? ""}
                                                        followedUsers={followedUsers}
                                                        onToggleFollow={toggleFollowUser}
                                                        isLiked={likedPosts[post.id] !== undefined ? likedPosts[post.id] : (post.has_liked || false)}
                                                        likes={Math.max(0, (post.likes ?? post.like_count ?? post.likes_count ?? 0) + (likesOffsets[post.id] || 0))}
                                                        onLike={handleLikePost}
                                                        onEdit={setEditPost}
                                                        onDelete={handleDeletePost}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}


                                {currentTab === 'calendar' && (
                                    <div className="space-y-6">
                                        <div className="w-full">
                                            <MajorsWidget />
                                        </div>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[800px]">
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">Economic News</h2>
                                                </div>
                                                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex-1">
                                                    <CustomEconomicCalendar />
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">Market News</h2>
                                                </div>
                                                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex-1">
                                                    <NewsWidget />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}


                            </div>
                        </div>

                        {/* --- COLUMN 3: RIGHT SIDEBAR (Profile Card + Optional Community Widgets) --- */}
                        {currentTab !== 'calendar' && (showProfileCard || showRequests || showSuggestions || showStreaks || showDisciplined) && (
                            <motion.div
                                variants={homeContainerVariants}
                                initial="hidden"
                                animate="visible"
                                className="hidden lg:block lg:col-span-4 xl:col-span-3 xl:col-start-10 lg:sticky lg:top-4 lg:max-h-[calc(100vh-110px)] lg:overflow-y-auto amazing-scrollbar space-y-3.5 px-1 xl:px-2 pt-4 pb-4"
                            >
                                {/* Compact User Profile Card */}
                                {showProfileCard && (
                                    <motion.div variants={homeCardVariants}>
                                        <HomeProfileCard userId={user?.id} />
                                    </motion.div>
                                )}

                                {/* Requests Section */}
                                {showRequests && (
                                    <motion.div variants={homeCardVariants} className="p-4 rounded-[22px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.045)] dark:shadow-none">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">Follow Requests</h3>
                                            <span className="bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-200 text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                                                0
                                            </span>
                                        </div>
                                        <div className="text-center py-4">
                                            <p className="text-[12.5px] font-medium text-slate-400">No pending requests</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Suggestions Section */}
                                {showSuggestions && (
                                    <motion.div variants={homeCardVariants} className="p-4 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:shadow-none">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Suggestions for you</h3>
                                            {finalSuggestions.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/discover')}
                                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                                                >
                                                    View all
                                                </button>
                                            )}
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                                            {suggestionsRender}
                                        </div>
                                        {finalSuggestions.length === 0 && (
                                            <div className="py-5 text-center px-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02]">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-2 text-slate-400">
                                                    <UserCheck size={15} strokeWidth={2.2} />
                                                </div>
                                                <p className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">All caught up</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">New signups and profile visitors will appear here.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Top Winning Streaks Section */}
                                {showStreaks && (
                                    <motion.div variants={homeCardVariants} className="p-4 rounded-[22px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.045)] dark:shadow-none">
                                        <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-3.5">
                                            <IconlyActivity size={15} set="curved" primaryColor="currentColor" className="text-orange-500 shrink-0" />
                                            <span>Top Winning Streaks</span>
                                        </h3>
                                        <div className="space-y-3">
                                            {streaksRender}
                                            {finalStreaks.length === 0 && (
                                                <div className="text-center py-4">
                                                    <p className="text-[12px] font-medium text-slate-400">No streaks yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Top Disciplined Section */}
                                {showDisciplined && (
                                    <motion.div variants={homeCardVariants} className="p-4 rounded-[22px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.045)] dark:shadow-none">
                                        <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-3.5">
                                            <IconlyShieldDone size={15} set="curved" primaryColor="currentColor" className="text-emerald-500 shrink-0" />
                                            <span>Top Disciplined</span>
                                        </h3>
                                        <div className="space-y-3">
                                            {disciplinedRender}
                                            {finalDisciplined.length === 0 && (
                                                <div className="text-center py-4">
                                                    <p className="text-[12px] font-medium text-slate-400">No data available</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                .amazing-scrollbar::-webkit-scrollbar {
                  width: 4px;
                  height: 4px;
                }
                .amazing-scrollbar::-webkit-scrollbar-button {
                  display: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
                .amazing-scrollbar::-webkit-scrollbar-track {
                  background: transparent !important;
                }
                .amazing-scrollbar::-webkit-scrollbar-thumb {
                  background: transparent !important;
                  border-radius: 9999px;
                  transition: background 0.15s ease-in-out;
                }
                .amazing-scrollbar:hover::-webkit-scrollbar-thumb {
                  background: rgba(148, 163, 184, 0.2) !important;
                }
                .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(148, 163, 184, 0.35) !important;
                }
                .dark .amazing-scrollbar:hover::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.05) !important;
                }
                .dark .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(255, 255, 255, 0.12) !important;
                }
            `}} />
                <CreatePostModal
                    isOpen={isCreatePostModalOpen || editPost !== null}
                    onClose={() => {
                        setIsCreatePostModalOpen(false);
                        setEditPost(null);
                    }}
                    userId={user?.id || ""}
                    onSuccess={refetch}
                    mode={editPost ? "edit" : "create"}
                    postId={editPost?.id}
                    initialContent={editPost?.content}
                    initialTags={editPost?.tags || []}
                    initialMediaUrl={editPost?.media_url}
                    initialMediaUrls={editPost?.media_urls}
                    initialMediaType={editPost?.media_type as any}
                />


            
            {/* Bottom Sheet Drawer matching Suggest & Report (with backside page scale & blur) */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showCustomizeModal && (
                        <div className="fixed inset-0 z-[99999] flex flex-col justify-end items-center pointer-events-auto">
                            {/* Backdrop (Darkens and complements tf-sheet-open backside scale & blur) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCustomizeModal(false)}
                                className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer"
                            />

                            {/* Bottom Sheet Drawer (Exact match to SuggestFeatureModal / ReportProblemModal) */}
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 32, stiffness: 320 }}
                                drag="y"
                                dragConstraints={{ top: 0 }}
                                dragElastic={{ top: 0, bottom: 0.6 }}
                                onDragEnd={(_, info) => {
                                    if (info.offset.y > 100 || info.velocity.y > 400) {
                                        setShowCustomizeModal(false);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-[820px] rounded-t-[28px] sm:rounded-t-[32px] bg-white dark:bg-[#121214] border-t border-x border-slate-200/90 dark:border-white/10 shadow-[0_-15px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.85)] max-h-[88vh] overflow-y-auto amazing-scrollbar text-slate-900 dark:text-white font-sans z-10"
                            >
                                {/* Top Pull Handle */}
                                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mt-3 mb-1 cursor-grab active:cursor-grabbing hover:bg-slate-400 dark:hover:bg-white/40 transition-colors" />

                                {/* Circular Close Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowCustomizeModal(false)}
                                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <X size={14} strokeWidth={2.4} />
                                </button>

                                {/* 2-Column Content Grid matching Suggest & Report */}
                                <div className="p-6 sm:p-8 pt-3 sm:pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-9 items-start">
                                        {/* Left Column: Title + Subtitle + Navigation */}
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                                                    {customizeActiveTab === 'watchlist'
                                                        ? 'My Watchlist'
                                                        : customizeActiveTab === 'calendar'
                                                            ? 'News'
                                                            : 'Home Layout'}
                                                </h2>
                                                <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                                                    {customizeActiveTab === 'watchlist'
                                                        ? 'Track live prices across crypto, forex, gold, indices & stocks.'
                                                        : customizeActiveTab === 'calendar'
                                                            ? 'Choose which scheduled market releases show in your sidebar.'
                                                            : 'Toggle sidebar panels on or off for your workspace.'}
                                                </p>
                                            </div>

                                            {/* Consistent Monochrome Tab Switcher */}
                                            <div className="grid grid-cols-3 md:grid-cols-1 gap-1 bg-[#f4f5f7] dark:bg-[#1a1b20] p-1 rounded-xl">
                                                {([
                                                    { id: 'watchlist', label: 'Watchlist' },
                                                    { id: 'calendar', label: 'News' },
                                                    { id: 'layout', label: 'Layout' },
                                                ] as const).map((tab) => (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setCustomizeActiveTab(tab.id)}
                                                        className={`px-3 py-2 rounded-lg text-[12px] font-medium text-center md:text-left transition-colors cursor-pointer ${
                                                            customizeActiveTab === tab.id
                                                                ? 'bg-white dark:bg-[#26272e] text-slate-900 dark:text-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                                                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Column: Active Tab Panel */}
                                        <div className="min-w-0">
                                            {/* Tab 1: Layout Toggles */}
                                            {customizeActiveTab === 'layout' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[12px] font-medium text-slate-500 dark:text-zinc-400">Sidebar widgets</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (!canAccess('home_customize')) {
                                                                    toast.error("Pro Feature: Upgrade to Pro to customize your Home layout.");
                                                                    return;
                                                                }
                                                                const anyVisible = showProfileCard || showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined;
                                                                if (anyVisible) {
                                                                    setShowProfileCard(false);
                                                                    setShowWatchlist(false);
                                                                    setShowCalendar(false);
                                                                    setShowFollowers(false);
                                                                    setShowRequests(false);
                                                                    setShowSuggestions(false);
                                                                    setShowStreaks(false);
                                                                    setShowDisciplined(false);
                                                                } else {
                                                                    handleToggle(setShowProfileCard, true);
                                                                    handleToggle(setShowWatchlist, true);
                                                                    handleToggle(setShowCalendar, true);
                                                                    handleToggle(setShowFollowers, true);
                                                                    handleToggle(setShowRequests, true);
                                                                    handleToggle(setShowSuggestions, true);
                                                                    handleToggle(setShowStreaks, true);
                                                                    handleToggle(setShowDisciplined, true);
                                                                }
                                                            }}
                                                            className={`h-7 px-3 rounded-full tactile-white-pill text-[11.5px] font-semibold cursor-pointer ${!canAccess('home_customize') ? 'opacity-60' : ''}`}
                                                        >
                                                            {(showProfileCard || showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined) ? 'Hide all' : 'Show all'}
                                                        </button>
                                                    </div>

                                                    <div className="relative rounded-xl overflow-hidden">
                                                        <div className={`rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] px-4 py-1.5 divide-y divide-slate-200/70 dark:divide-white/[0.06] ${!canAccess('home_customize') ? 'blur-[2px] select-none pointer-events-none opacity-75' : ''}`}>
                                                            <div className="py-2.5"><ToggleRow label="Profile Card" checked={showProfileCard} onChange={(v) => handleToggle(setShowProfileCard, v)} /></div>
                                                            <div className="py-2.5"><ToggleRow label="My Watchlist" checked={showWatchlist} onChange={(v) => handleToggle(setShowWatchlist, v)} /></div>
                                                            <div className="py-2.5"><ToggleRow label="News" checked={showCalendar} onChange={(v) => handleToggle(setShowCalendar, v)} /></div>
                                                            <div className="py-2.5"><ToggleRow label="Community Reach" checked={showFollowers} onChange={(v) => handleToggle(setShowFollowers, v)} /></div>
                                                            <div className="py-2.5"><ToggleRow label="Follow Requests" checked={showRequests} onChange={(v) => handleToggle(setShowRequests, v)} /></div>
                                                            <div className="py-2.5"><ToggleRow label="Suggestions" checked={showSuggestions} onChange={(v) => handleToggle(setShowSuggestions, v)} /></div>
                                                            <div className="py-2.5"><ToggleRow label="Top Winning Streaks" checked={showStreaks} onChange={(v) => handleToggle(setShowStreaks, v)} /></div>
                                                            <div className="py-2.5"><ToggleRow label="Top Disciplined" checked={showDisciplined} onChange={(v) => handleToggle(setShowDisciplined, v)} /></div>
                                                        </div>

                                                        {!canAccess('home_customize') && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 pointer-events-auto">
                                                                <div className="backdrop-blur-md bg-white/95 dark:bg-[#1A1A1E]/95 border border-slate-200/80 dark:border-white/15 px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 max-w-[340px] w-full">
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                                                                            <Lock size={14} strokeWidth={2.4} />
                                                                        </div>
                                                                        <div className="min-w-0 flex flex-col justify-center">
                                                                            <span className="btn-shine text-[13px] font-bold leading-tight">
                                                                                Customize Layout
                                                                            </span>
                                                                            <p className="text-[10px] font-semibold text-slate-400 dark:text-neutral-400 mt-0.5">
                                                                                Pro &amp; Elite
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setShowCustomizeModal(false); navigate('/upgrade'); }}
                                                                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11.5px] font-bold shrink-0 shadow-sm cursor-pointer active:scale-95 transition-all"
                                                                    >
                                                                        Upgrade
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab 2: Watchlist Manager */}
                                            {customizeActiveTab === 'watchlist' && (() => {
                                                const detectedPreview = newSymbolName.trim() ? detectSymbolDetails(newSymbolName) : null;
                                                const quickPairs = activeMarket === 'indian'
                                                    ? ['NIFTY50', 'BANKNIFTY', 'SENSEX', 'RELIANCE', 'HDFCBANK', 'TCS']
                                                    : ['XAU/USD', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'ETH/USD', 'NAS100', 'US30', 'USOIL'];
                                                const existingSet = new Set(
                                                    watchlist.map((w: any) => String(w.symbol || '').toUpperCase().replace(/\/UAD$/, '/USD').replace(/UAD$/, 'USD'))
                                                );

                                                return (
                                                    <div className="space-y-4">
                                                        {/* Inline Add Input */}
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="relative flex-1">
                                                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                                <input
                                                                    type="text"
                                                                    placeholder={activeMarket === 'indian' ? "NIFTY50, RELIANCE, TCS" : "XAU/USD, BTC/USD, EUR/USD"}
                                                                    value={newSymbolName}
                                                                    onChange={(e) => setNewSymbolName(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleAddSymbol();
                                                                    }}
                                                                    className="w-full h-10 pl-9 pr-20 text-[12.5px] font-medium bg-[#f4f5f7] dark:bg-[#1a1b20] border border-transparent dark:border-white/5 rounded-xl outline-none focus:border-slate-300 dark:focus:border-white/25 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                                                    autoFocus
                                                                />
                                                                {detectedPreview && (
                                                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-white/10 text-slate-600 dark:text-zinc-300 capitalize pointer-events-none">
                                                                        {detectedPreview.type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddSymbol()}
                                                                disabled={isAddingSymbol || !newSymbolName.trim()}
                                                                className="h-10 px-5 rounded-full tactile-white-pill font-semibold text-[12.5px] disabled:opacity-45 disabled:cursor-not-allowed select-none inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                                                            >
                                                                {isAddingSymbol ? (
                                                                    <Loader2 size={13} className="animate-spin" />
                                                                ) : (
                                                                    <Plus size={13.5} strokeWidth={2.3} />
                                                                )}
                                                                <span>Add</span>
                                                            </button>
                                                        </div>

                                                        {/* 1-Click Quick Add Popular Pairs */}
                                                        <div>
                                                            <span className="block text-[11.5px] font-medium text-slate-500 dark:text-zinc-400 mb-2">
                                                                Quick add
                                                            </span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {quickPairs.map((sym) => {
                                                                    const alreadyAdded = existingSet.has(sym);
                                                                    return (
                                                                        <button
                                                                            key={sym}
                                                                            type="button"
                                                                            disabled={alreadyAdded || isAddingSymbol}
                                                                            onClick={() => handleAddSymbol(sym)}
                                                                            className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[11.5px] font-semibold select-none ${
                                                                                alreadyAdded
                                                                                    ? 'bg-[#f4f5f7] dark:bg-[#1a1b20] text-slate-400 dark:text-zinc-500 cursor-default'
                                                                                    : 'tactile-white-pill cursor-pointer'
                                                                            }`}
                                                                        >
                                                                            {alreadyAdded ? (
                                                                                <Check size={11} strokeWidth={2.2} />
                                                                            ) : (
                                                                                <Plus size={11} strokeWidth={2} />
                                                                            )}
                                                                            <span>{sym}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Active Watchlist Pairs */}
                                                        <div>
                                                            <span className="block text-[11.5px] font-medium text-slate-500 dark:text-zinc-400 mb-2">
                                                                Your pairs ({watchlist.length})
                                                            </span>
                                                            <div className="max-h-[190px] overflow-y-auto amazing-scrollbar pr-0.5 space-y-1.5">
                                                                {watchlist.length === 0 ? (
                                                                    <div className="py-5 px-4 rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] text-center">
                                                                        <p className="text-[12px] text-slate-400 dark:text-zinc-500">
                                                                            No pairs added yet — pick one above or type a symbol
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    watchlist.map((item: any) => {
                                                                        const cleanSym = String(item.symbol || '').toUpperCase().replace(/\/UAD$/, '/USD').replace(/UAD$/, 'USD');
                                                                        const hasPrice = Boolean(item.price && item.price !== '—' && item.price !== 'Unavailable');
                                                                        const hasChange = Boolean(item.change && item.change !== '—');
                                                                        return (
                                                                            <div
                                                                                key={item.id}
                                                                                className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] transition-colors"
                                                                            >
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <span className="text-[12.5px] font-semibold text-slate-900 dark:text-white">{cleanSym}</span>
                                                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white dark:bg-white/[0.08] text-slate-500 dark:text-zinc-300 capitalize">
                                                                                        {item.symbol_type || 'market'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2.5 shrink-0">
                                                                                    {hasPrice && (
                                                                                        <div className="text-right tabular-nums">
                                                                                            <span className="text-[12px] font-medium text-slate-800 dark:text-slate-100 mr-1.5">{item.price}</span>
                                                                                            {hasChange && (
                                                                                                <span className={`text-[10.5px] font-medium ${item.is_positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                                                                    {item.change}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteSymbol(item.id)}
                                                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                                                        title={`Remove ${cleanSym}`}
                                                                                    >
                                                                                        <Trash2 size={13} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Tab 3: News Preferences */}
                                            {customizeActiveTab === 'calendar' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="block text-[11.5px] font-medium text-slate-500 dark:text-zinc-400 mb-2">
                                                            Time window
                                                        </span>
                                                        <div className="grid grid-cols-2 gap-2.5">
                                                            {([
                                                                { id: 'today', label: "Today's news", desc: 'Events scheduled today' },
                                                                { id: 'week', label: 'This week', desc: 'Full weekly schedule' },
                                                            ] as const).map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => setNewsViewMode(opt.id)}
                                                                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                                                                        newsViewMode === opt.id
                                                                            ? 'bg-white dark:bg-[#22232a] border-slate-900 dark:border-white/75 text-slate-900 dark:text-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]'
                                                                            : 'bg-[#f4f5f7] dark:bg-[#1a1b20] border-transparent text-slate-600 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-white/15'
                                                                    }`}
                                                                >
                                                                    <p className="text-[12.5px] font-semibold leading-tight">{opt.label}</p>
                                                                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{opt.desc}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="block text-[11.5px] font-medium text-slate-500 dark:text-zinc-400 mb-2">
                                                            Impact filter
                                                        </span>
                                                        <div className="rounded-xl bg-[#f4f5f7] dark:bg-[#1a1b20] px-4 py-1.5 divide-y divide-slate-200/70 dark:divide-white/[0.06]">
                                                            <div className="py-2.5">
                                                                <ToggleRow
                                                                    label="High impact"
                                                                    dotClass="bg-rose-500"
                                                                    checked={calendarFilters.high}
                                                                    onChange={(v) => setCalendarFilters(prev => ({ ...prev, high: v }))}
                                                                />
                                                            </div>
                                                            <div className="py-2.5">
                                                                <ToggleRow
                                                                    label="Medium impact"
                                                                    dotClass="bg-orange-500"
                                                                    checked={calendarFilters.medium}
                                                                    onChange={(v) => setCalendarFilters(prev => ({ ...prev, medium: v }))}
                                                                />
                                                            </div>
                                                            <div className="py-2.5">
                                                                <ToggleRow
                                                                    label="Low impact"
                                                                    dotClass="bg-amber-400"
                                                                    checked={calendarFilters.low}
                                                                    onChange={(v) => setCalendarFilters(prev => ({ ...prev, low: v }))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer Done Button */}
                                            <div className="flex items-center justify-end gap-3 pt-5">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomizeModal(false)}
                                                    className="h-9 px-5 rounded-full tactile-white-pill text-[12.5px] font-semibold cursor-pointer"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Mobile Floating Action Button: Create Post (Black Tactile Style from Reference Image) */}
            <button
                type="button"
                onClick={() => {
                    triggerHaptic("medium");
                    setIsCreatePostModalOpen(true);
                }}
                style={{
                    background: "linear-gradient(180deg, #38383A 0%, #1E1E20 50%, #080808 100%)",
                    boxShadow: "0 6px 16px -2px rgba(0, 0, 0, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.85), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.28)",
                }}
                className="sm:hidden fixed right-5 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5.25rem)] z-40 w-[52px] h-[52px] rounded-full text-white flex items-center justify-center active:scale-95 active:brightness-90 hover:scale-105 transition-all duration-150 cursor-pointer touch-manipulation select-none"
                title="Create New Post"
                aria-label="Create New Post"
            >
                <Plus size={24} strokeWidth={2.8} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
            </button>

        </CommunityPageWrapper>
        </>
    );
}
