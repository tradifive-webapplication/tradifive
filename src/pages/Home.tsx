import { Search, Plus, X, MoreHorizontal, Heart, MessageCircle, Bookmark, UserPlus, UserCheck, Flame, ShieldCheck, TrendingUp, Layers, Eye, Calendar, Sliders, Trash2, Check, ArrowUp, Globe } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useHomeData, FeedPost } from "@/hooks/useHomeData";
import { useMarket } from "@/contexts/MarketContext";
import CreatePostModal from "@/components/CreatePostModal";
import FeedCard from "@/components/FeedCard";
import { Star as IconlyStar, Discovery as IconlyDiscovery, Wallet as IconlyWallet, Activity as IconlyActivity, Graph as IconlyGraph, AddUser as IconlyAddUser, ShieldDone as IconlyShieldDone, Calendar as IconlyCalendar } from "react-iconly";
import EconomicCalendarWidget from "@/components/EconomicCalendarWidget";
import NewsWidget from "@/components/NewsWidget";
import MajorsWidget from "@/components/MajorsWidget";
import CustomEconomicCalendar from "@/components/CustomEconomicCalendar";
import ForexFactoryDashboard from "@/components/ForexFactoryDashboard";
import TickersWidget from "@/components/TickersWidget";



function ToggleRow({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
            <div className="relative inline-flex items-center">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 dark:bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
            </div>
        </label>
    );
}

function HomeSkeleton() {
    return (
        <div className="w-full h-full flex flex-col min-h-0 px-4 lg:px-10 pt-0 pb-0 select-none font-sans text-slate-800 dark:text-slate-100 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0 relative">

                {/* --- COLUMN 1: LEFT SIDEBAR (col-span-3) --- */}
                <div className="hidden lg:block lg:col-span-3 lg:col-start-1 h-full overflow-y-auto amazing-scrollbar space-y-6 px-4 pt-5 pb-4">
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
                <div className="lg:col-span-6 lg:col-start-4 h-full overflow-y-auto amazing-scrollbar space-y-8 px-4 pt-5 pb-6">


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
                <div className="lg:col-span-3 lg:col-start-10 h-full overflow-y-auto amazing-scrollbar space-y-6 px-4 pt-5 pb-4">
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
const detectSymbolDetails = (input: string): { symbol: string; type: 'crypto' | 'forex' } => {
    const clean = input.trim().toUpperCase().replace(/[-_]/g, '/');

    // Common crypto base tokens
    const cryptoBases = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT', 'LINK', 'BNB', 'LTC', 'BCH', 'UNI', 'AVAX', 'MATIC', 'SHIB', 'TRX'];
    // Common crypto quotes
    const cryptoQuotes = ['USDT', 'USDC', 'BUSD', 'DAI'];

    // Common forex currencies
    const forexCurrencies = ['EUR', 'GBP', 'AUD', 'NZD', 'USD', 'CAD', 'CHF', 'JPY', 'SGD', 'HKD', 'CNY', 'INR', 'ZAR', 'MXN', 'TRY', 'SEK', 'NOK', 'DKK'];

    // 1. If it already has a slash
    if (clean.includes('/')) {
        const [base, quote] = clean.split('/');
        if (cryptoQuotes.includes(quote) || cryptoBases.includes(base)) {
            return { symbol: clean, type: 'crypto' };
        }
        if (forexCurrencies.includes(base) && forexCurrencies.includes(quote)) {
            return { symbol: clean, type: 'forex' };
        }
        return { symbol: clean, type: quote.length > 3 ? 'crypto' : 'forex' };
    }

    // 2. If it does not have a slash: e.g. "EURUSD" or "BTCUSDT"
    for (const quote of cryptoQuotes) {
        if (clean.endsWith(quote)) {
            const base = clean.slice(0, -quote.length);
            return { symbol: `${base}/${quote}`, type: 'crypto' };
        }
    }

    if (clean.length === 6) {
        const base = clean.substring(0, 3);
        const quote = clean.substring(3, 6);
        if (forexCurrencies.includes(base) && forexCurrencies.includes(quote)) {
            return { symbol: `${base}/${quote}`, type: 'forex' };
        }
        if (cryptoBases.includes(base)) {
            return { symbol: `${base}/${quote}`, type: 'crypto' };
        }
        return { symbol: `${base}/${quote}`, type: 'forex' };
    }

    if (clean.length > 6) {
        if (clean.endsWith('USD')) {
            return { symbol: `${clean.slice(0, -3)}/USD`, type: 'crypto' };
        }
        return { symbol: `${clean.substring(0, 4)}/${clean.substring(4)}`, type: 'crypto' };
    }

    return { symbol: clean, type: 'crypto' };
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
    const [user, setUser] = useState<any>(null);
    const [authChecked, setAuthChecked] = useState(false);

    const [showNewPosts, setShowNewPosts] = useState(false);
    const middleColumnRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        if (!middleColumnRef.current) return;
        if (middleColumnRef.current.scrollTop > 800) {
            setShowNewPosts(true);
        } else {
            setShowNewPosts(false);
        }
    }, []);

    const scrollToTop = () => {
        if (middleColumnRef.current) {
            middleColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            setShowNewPosts(false);
        }
    };

    const [showWatchlist, setShowWatchlist] = useState(true);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showFollowers, setShowFollowers] = useState(true);
    const [showRequests, setShowRequests] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showStreaks, setShowStreaks] = useState(true);
    const [showDisciplined, setShowDisciplined] = useState(true);

    // Customize layout elements
    const [showCustomizeMenu, setShowCustomizeMenu] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const customizeMenuRef = useRef<HTMLDivElement>(null);

    const [customizeActiveTab, setCustomizeActiveTab] = useState<'layout' | 'watchlist' | 'calendar'>('layout');
    const [newSymbolName, setNewSymbolName] = useState("");
    const [newSymbolType, setNewSymbolType] = useState<'crypto' | 'forex' | 'commodity'>('crypto');
    const [isAddingSymbol, setIsAddingSymbol] = useState(false);

    const [calendarFilters, setCalendarFilters] = useState<{ high: boolean; medium: boolean; low: boolean }>(() => {
        try {
            const cached = localStorage.getItem('home_calendar_filters');
            return cached ? JSON.parse(cached) : { high: true, medium: true, low: true };
        } catch (e) {
            return { high: true, medium: true, low: true };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('home_calendar_filters', JSON.stringify(calendarFilters));
        } catch (e) {
            console.warn("localStorage not accessible");
        }
    }, [calendarFilters]);

    const handleAddSymbol = async () => {
        if (!newSymbolName.trim()) return;
        if (!user?.id) {
            toast.error("Please sign in to customize your watchlist.");
            return;
        }

        const { symbol: sym } = detectSymbolDetails(newSymbolName);

        // Check duplication
        const exists = watchlist.some((item: any) => item.symbol.toUpperCase() === sym.toUpperCase());
        if (exists) {
            toast.warning(`${sym} is already in your watchlist!`);
            return;
        }

        setIsAddingSymbol(true);
        try {
            const { error } = await supabase.from('feed_watchlist').insert([{
                symbol: sym,
                symbol_type: newSymbolType,
                is_pinned: false,
                sort_order: watchlist.length + 1,
                user_id: user.id
            }]);
            if (error) throw error;

            toast.success(`Added ${sym} to watchlist!`);
            setNewSymbolName("");
            refetch();
        } catch (err: any) {
            console.error("Error adding symbol:", err);
            toast.error("Failed to add symbol.");
        } finally {
            setIsAddingSymbol(false);
        }
    };

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

    // Supabase Live Data Fetching
    const { feeds, watchlist, calendar, followers, suggestions, winningStreaks, topDisciplined, loading, refetch, removePost } = useHomeData(user?.id ?? "");

    // Placeholder names to exclude from suggestions
    const PLACEHOLDER_NAMES = useMemo(() => ['new trader', 'guest trader', 'demo trader', 'trader', 'guest'], []);
    // Include all suggestions from the database except the current user and placeholders
    const finalSuggestions = useMemo(() => {
        return suggestions.filter(
            sug => sug.id !== user?.id &&
                sug.full_name &&
                sug.full_name.trim().length > 0 &&
                !PLACEHOLDER_NAMES.includes(sug.full_name.trim().toLowerCase())
        );
    }, [suggestions, user?.id, PLACEHOLDER_NAMES]);

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
                    .select('post_id, social_posts(*, profiles:profiles!social_posts_user_id_fkey(full_name, username, avatar_url))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!error && data && isMounted) {
                    const parsed = data.map((b: any) => b.social_posts).filter((p: any) => p !== null);
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
    const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});
    const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
    const [likesOffsets, setLikesOffsets] = useState<Record<string, number>>({});
    const [feedSort, setFeedSort] = useState<'popular' | 'latest'>('latest');
    const [feedMarketFilter, setFeedMarketFilter] = useState<'for_you' | 'forex' | 'indian' | 'psychology'>('for_you');

    const handleDeletePost = useCallback(async (postId: string) => {
        const postIdStr = String(postId);

        // 1. Immediately remove from state & optimistic UI
        removePost(postId);

        // 2. Permanently clean from all local storage caches
        try {
            const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]');
            const updatedLocal = localPosts.filter((p: any) => String(p.id) !== postIdStr);
            localStorage.setItem('fialgo_local_posts', JSON.stringify(updatedLocal));

            const cachedFeeds = JSON.parse(localStorage.getItem('home_cache_feeds') || '[]');
            const updatedCache = cachedFeeds.filter((p: any) => String(p.id) !== postIdStr);
            localStorage.setItem('home_cache_feeds', JSON.stringify(updatedCache));

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
        return [...feeds].filter(feed => {
            if (feedMarketFilter === 'for_you') return true;

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
        }).sort((a, b) => {
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
    }, [feeds, feedSort, feedMarketFilter, likedPosts, likesOffsets, followedUsers, user?.id, toggleFollowUser, handleLikePost, handleDeletePost, handleVote]);



    const calendarRender = useMemo(() => {
        const filteredCalendar = calendar.filter(news => {
            const impact = (news.impact || 'low').toLowerCase();
            if (impact === 'high' && !calendarFilters.high) return false;
            if (impact === 'medium' && !calendarFilters.medium) return false;
            if (impact === 'low' && !calendarFilters.low) return false;
            return true;
        });

        if (filteredCalendar.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center my-1">
                    <Calendar size={24} className="text-slate-400 dark:text-slate-400 mb-3" />
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">Schedule Quiet</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-[180px]">No major events match your filters.</p>
                </div>
            );
        }

        return filteredCalendar.map((news, i) => {
            const dateObj = new Date(news.event_time);
            const displayTime = dateObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            const displayImpact = news.impact?.toUpperCase() || "LOW";

            return (
                <div key={i} className="flex gap-3 items-center group">
                    <div className="shrink-0 px-2 py-1.5 min-w-[54px] text-center bg-slate-150/40 dark:bg-[#1A1F2B] border border-slate-200/50 dark:border-white/5 rounded-xl flex flex-col justify-center items-center shadow-3xs">
                        <span className="text-[9px] font-bold text-slate-850 dark:text-slate-250 leading-none tracking-tight">{displayTime}</span>
                        <span className="text-[7.5px] font-bold text-slate-455 uppercase mt-1 tracking-wider">{news.currency || "USD"}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white truncate leading-snug">
                                {news.event_title}
                            </h4>
                            <span className={`shrink-0 text-[7.5px] font-bold px-1.5 py-0.5 rounded leading-none ${displayImpact === "HIGH"
                                ? "bg-rose-500/15 text-rose-650 dark:text-rose-400 border border-rose-500/10"
                                : displayImpact === "MEDIUM"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/10"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-500/10"
                                }`}>
                                {displayImpact}
                            </span>
                        </div>

                        <div className="flex gap-3 mt-1.5 text-[10px] font-semibold text-slate-455 dark:text-slate-400 leading-none">
                            <span>Forecast: <strong className="text-slate-655 dark:text-slate-400 font-bold">{news.forecast || "--"}</strong></span>
                            <span>Previous: <strong className="text-slate-655 dark:text-slate-400 font-bold">{news.previous || "--"}</strong></span>
                        </div>
                    </div>
                </div>
            );
        });
    }, [calendar, calendarFilters]);

    const suggestionsRender = useMemo(() => {
        const source = finalSuggestions;
        return source.map((sug: any) => {
            const displayName = sug.display_name || sug.full_name || sug.username || sug.name || "Trader";
            const displaySlug = sug.username || sug.id || "user";
            const displayAvatar = sug.avatar_url || sug.avatar || "/default-avatar.svg";
            const displayHandle = `@${displaySlug}`;

            return (
                <div key={sug.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <Link to={`/user/${displaySlug}`} className="shrink-0 hover:opacity-85 transition-opacity">
                            <img src={displayAvatar} alt={displayName} className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-100 dark:border-[#33]" onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }} />
                        </Link>
                        <div>
                            <Link to={`/user/${displaySlug}`} className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5 leading-none hover:text-blue-500 transition-colors block">
                                {displayName}
                            </Link>
                            <p className="text-[11px] font-medium text-slate-455 dark:text-slate-400 leading-none mt-0.5">{displayHandle}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleFollowUser(sug.id, displayName)}
                        className={`p-2 rounded-full transition-colors ${followedUsers[sug.id]
                            ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                            }`}
                    >
                        {followedUsers[sug.id] ? <IconlyAddUser size={16} set="bold" primaryColor="currentColor" /> : <IconlyAddUser size={16} set="curved" primaryColor="currentColor" />}
                    </button>
                </div>
            );
        });
    }, [finalSuggestions, followedUsers, toggleFollowUser]);

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

    if (!authChecked || loading) {
        return (
            <DashboardLayout breadcrumbs={[{ label: "Home", path: "/home" }]} noScroll={true} noPadding={true}>
                <HomeSkeleton />
            </DashboardLayout>
        );
    }

    const headerActions = (
        <div className="flex items-center gap-2 sm:gap-3">
            <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center justify-center gap-2 px-3.5 sm:px-5 h-10 rounded-full bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 font-bold text-[13px] hover:bg-slate-50 dark:hover:bg-[#252528] transition-all shadow-sm active:scale-95 select-none"
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
                                                const anyVisible = showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined;
                                                if (anyVisible) {
                                                    setShowWatchlist(false);
                                                    setShowCalendar(false);
                                                    setShowFollowers(false);
                                                    setShowRequests(false);
                                                    setShowSuggestions(false);
                                                    setShowStreaks(false);
                                                    setShowDisciplined(false);
                                                } else {
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
                                            {(showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined) ? 'Hide All' : 'Show All'}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <ToggleRow label="My Watchlist" checked={showWatchlist} onChange={(v) => handleToggle(setShowWatchlist, v)} />
                                        <ToggleRow label="Economic Calendar" checked={showCalendar} onChange={(v) => handleToggle(setShowCalendar, v)} />
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
                                                            onClick={() => setNewSymbolType(type)}
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
                                                    onClick={handleAddSymbol}
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
            <DashboardLayout breadcrumbs={[{ label: "Home", path: "/home" }]} headerActions={headerActions} noScroll={true} noPadding={true}>
                <div className="w-full h-full flex flex-col min-h-0 px-2 sm:px-4 lg:px-10 pt-0 pb-0 select-none font-sans text-slate-800 dark:text-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0 relative">

                        {/* --- COLUMN 1: LEFT SIDEBAR (col-span-3) --- */}
                        {currentTab !== 'calendar' && (showWatchlist || showCalendar || showFollowers) && (
                            <div className="hidden lg:block lg:col-span-3 lg:col-start-1 h-full overflow-y-auto amazing-scrollbar space-y-4 px-4 pt-5 pb-4">

                                {/* A. My Watchlist / Market Segment */}
                                {showWatchlist && (
                                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                                <IconlyGraph size={16} set="curved" primaryColor="currentColor" className="text-blue-500 shrink-0" />
                                                <span>My Watchlist</span>
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomizeActiveTab('watchlist');
                                                    setShowCustomizeModal(true);
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[11px] transition-all cursor-pointer select-none"
                                                title="Add Pairs"
                                            >
                                                <Plus size={12} strokeWidth={2.5} />
                                                <span>Add Pair</span>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {watchlist.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center">
                                                    <IconlyGraph size={24} set="curved" primaryColor="currentColor" className="text-slate-400 dark:text-slate-400 mb-3" />
                                                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">Watchlist Empty</h4>
                                                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4 max-w-[180px]">Track forex, crypto, and commodity assets live.</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCustomizeActiveTab('watchlist');
                                                            setShowCustomizeModal(true);
                                                        }}
                                                        className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[11px] uppercase tracking-wider transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer select-none"
                                                    >
                                                        <Plus size={13} strokeWidth={2.5} />
                                                        <span>+ ADD</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                watchlist.map((asset: any, i) => {
                                                    const isPositive = asset.is_positive !== undefined ? asset.is_positive : (asset.symbol_type === "crypto" || asset.is_pinned);
                                                    const displaySymbol = asset.symbol;
                                                    let displayName = asset.symbol_type === "forex" ? "Forex Spot" : asset.symbol_type === "commodity" ? "Commodity Spot" : asset.symbol_type === "crypto" ? "Crypto Spot" : asset.symbol_type;
                                                    if (['XAU', 'XAG', 'WTI', 'BRENT', 'USOIL', 'UKOIL'].some(c => displaySymbol.includes(c))) {
                                                        displayName = "Commodity Spot";
                                                    }
                                                    const price = asset.price && asset.price !== '—' ? asset.price : '—';
                                                    const change = asset.change && asset.change !== '—' ? asset.change : '—';

                                                    const logoUrl = null;

                                                    return (
                                                        <div key={i} className="flex items-center justify-between group hover:translate-x-0.5 transition-transform duration-200">
                                                            <div className="flex items-center gap-2.5">
                                                                <div>
                                                                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">{displaySymbol}</p>
                                                                    <p className="text-[10px] font-medium text-slate-455 dark:text-slate-400 leading-none mt-0.5 capitalize">{displayName}</p>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">{price}</p>
                                                                <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded mt-0.5 leading-none ${isPositive
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-455"
                                                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                                    }`}>
                                                                    {change}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* B. Economic Calendar News */}
                                {showCalendar && (
                                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-5">
                                            <IconlyDiscovery size={16} set="curved" primaryColor="currentColor" className="text-slate-400 dark:text-slate-400 shrink-0" />
                                            <span>Economic Calendar</span>
                                        </h3>
                                        <div className="space-y-4">
                                            {calendarRender}
                                        </div>
                                    </div>
                                )}

                                {/* C. Followers Stats Box */}
                                {showFollowers && (
                                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group cursor-pointer">

                                        {/* Beautiful Colorful Top-Right Design */}
                                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-indigo-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none z-0"></div>
                                        <div className="absolute top-2 right-2 w-16 h-16 bg-blue-400/20 rounded-full blur-xl group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-700 pointer-events-none z-0"></div>

                                        <div className="absolute top-5 right-5 text-indigo-500/80 dark:text-indigo-400/80 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 z-0">
                                            <IconlyGraph size={22} set="bold" primaryColor="currentColor" />
                                        </div>

                                        <div className="flex items-center mb-5 pl-3 relative z-10">
                                            {followersAvatarsList.map((url, i) => (
                                                <img
                                                    key={i}
                                                    src={url || "/default-avatar.svg"}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/default-avatar.svg";
                                                    }}
                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-white/5 bg-slate-200 shadow-sm"
                                                    style={{
                                                        zIndex: followersAvatarsList.length - i,
                                                        marginLeft: '-12px'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <h4 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight mb-1 relative z-10">
                                            {followerCountText} <span className="text-[13px] font-bold text-slate-455 uppercase tracking-widest ml-1">Followers</span>
                                        </h4>
                                        <p className="text-[12px] font-medium text-slate-505 leading-none relative z-10">Active now on your profile</p>
                                    </div>
                                )}

                            </div>
                        )}
                        {/* --- COLUMN 2: MIDDLE MAIN CONTENT --- */}
                        <div className={`h-full relative overflow-hidden flex flex-col ${currentTab === 'calendar' ? 'lg:col-span-12 lg:col-start-1 px-8' : 'lg:col-span-6 lg:col-start-4'}`}>
                            <AnimatePresence>
                                {showNewPosts && (
                                    <motion.button
                                        initial={{ y: -20, opacity: 0, scale: 0.9 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        exit={{ y: -20, opacity: 0, scale: 0.9 }}
                                        onClick={scrollToTop}
                                        className="absolute top-6 left-1/2 -translate-x-1/2 -ml-4 z-50 bg-white/95 backdrop-blur-md dark:bg-[#2C2C2E]/95 border border-slate-200 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:shadow-[0_4px_25px_rgb(0,0,0,0.12)] text-slate-700 dark:text-slate-200 px-5 py-2 rounded-full font-medium tracking-tight text-[14px] flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                                    >
                                        <ArrowUp size={16} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
                                        New posts
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            <div className="flex-1 overflow-y-auto amazing-scrollbar space-y-5 sm:space-y-6 px-1 sm:px-4 pt-3 sm:pt-5 pb-24 md:pb-6" onScroll={handleScroll} ref={middleColumnRef}>


                                {/* Feeds Section */}
                                {currentTab === 'feed' && (
                                <div className="space-y-4 sm:space-y-5">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1">
                                            <h2 className="text-[22px] sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight shrink-0">Feeds</h2>

                                            <div className="flex items-center overflow-x-auto no-scrollbar py-0.5">
                                                <div className="flex items-center bg-slate-100/90 dark:bg-[#1A1A1C] p-1 rounded-full shrink-0">
                                                    {[
                                                        { id: 'for_you', label: 'For You' },
                                                        { id: 'forex', label: 'Global' },
                                                        { id: 'indian', label: 'Indian' },
                                                        { id: 'psychology', label: 'Psychology' }
                                                    ].map(tab => (
                                                        <button
                                                            key={tab.id}
                                                            onClick={() => setFeedMarketFilter(tab.id as any)}
                                                            className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[12px] sm:text-[13px] rounded-full transition-all duration-200 ease-out whitespace-nowrap font-medium ${feedMarketFilter === tab.id
                                                                ? "bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                                                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                                }`}
                                                        >
                                                            {tab.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feed List */}
                                    <div className="space-y-3">
                                        {feedCardsList}
                                    </div>
                                </div>
                                )}
                                
                                
                                {currentTab === 'saved' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">Saved Posts</h2>
                                            <div className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-full text-sm font-medium">
                                                {savedPosts.length} {savedPosts.length === 1 ? 'Item' : 'Items'}
                                            </div>
                                        </div>

                                        {isLoadingSaved ? (
                                            <div className="space-y-4">
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/5 animate-pulse space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                                                            <div className="space-y-2">
                                                                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                                                                <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                                                            </div>
                                                        </div>
                                                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : savedPosts.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-sm">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                                    <Bookmark className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">No saved posts yet</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5 leading-relaxed">
                                                    Bookmark trading insights, chart setups, or market discussions from the feed to view them here anytime.
                                                </p>
                                                <button
                                                    onClick={() => navigate('/home')}
                                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                                                >
                                                    Browse Community Feed
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
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
                                    </div>
                                )}


                                {currentTab === 'calendar' && (
                                    <div className="space-y-6">
                                        <div className="w-full">
                                            <MajorsWidget />
                                        </div>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[800px]">
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">Economic Calendar</h2>
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

                        {/* --- COLUMN 3: RIGHT SIDEBAR (col-span-3) --- */}
                        {currentTab !== 'calendar' && (showRequests || showSuggestions || showStreaks || showDisciplined) && (
                            <div className="hidden lg:block lg:col-span-3 lg:col-start-10 h-full overflow-y-auto amazing-scrollbar space-y-4 px-4 pt-5 pb-4">

                                {/* Requests Section */}
                                {showRequests && (
                                    <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1A1C] border border-slate-200/50 dark:border-[#222] shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Follow Requests</h3>
                                            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                0
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-center py-6">
                                                <p className="text-[13px] font-medium text-slate-400">No pending requests</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions Section */}
                                {showSuggestions && (
                                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight mb-5">Suggestions for you</h3>
                                        <div className="space-y-4">
                                            {suggestionsRender}
                                            {finalSuggestions.length === 0 && (
                                                <div className="text-center py-4">
                                                    <p className="text-[12px] font-medium text-slate-400 dark:text-slate-400">No suggestions right now</p>
                                                </div>
                                            )}
                                        </div>
                                        {finalSuggestions.length > 0 && (
                                            <button onClick={() => navigate('/discover')} className="w-full text-center text-[12px] font-bold text-blue-600 pt-3 hover:underline transition-all active:scale-95">View All</button>
                                        )}
                                    </div>
                                )}

                                {/* Top Winning Streaks Section */}
                                {showStreaks && (
                                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-5">
                                            <IconlyActivity size={16} set="curved" primaryColor="currentColor" className="text-orange-500 animate-pulse shrink-0" />
                                            <span>Top Winning Streaks</span>
                                        </h3>
                                        <div className="space-y-4">
                                            {streaksRender}
                                            {finalStreaks.length === 0 && (
                                                <div className="text-center py-4">
                                                    <p className="text-[12px] font-medium text-slate-400 dark:text-slate-400">No streaks yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Top Disciplined Section */}
                                {showDisciplined && (
                                    <div className="p-5 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-5">
                                            <IconlyShieldDone size={16} set="curved" primaryColor="currentColor" className="text-emerald-500 shrink-0" />
                                            <span>Top Disciplined</span>
                                        </h3>
                                        <div className="space-y-4">
                                            {disciplinedRender}
                                            {finalDisciplined.length === 0 && (
                                                <div className="text-center py-4">
                                                    <p className="text-[12px] font-medium text-slate-400 dark:text-slate-400">No data available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}



                            </div>
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


            
            {/* Modal Dialog for Customize Dashboard / Watchlist Manager (Image 2) */}
            <AnimatePresence>
                {showCustomizeModal && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCustomizeModal(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        />

                        {/* Modal Dialog Content (Exact 1:1 match of Image 2) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-[360px] p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#171719] border border-slate-200 dark:border-white/10 shadow-2xl z-10 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto amazing-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Customize Dashboard</h4>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomizeModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Tabs Header */}
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-4 text-[10px] font-bold">
                                {(['layout', 'watchlist', 'calendar'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setCustomizeActiveTab(tab)}
                                        className={`flex-1 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${customizeActiveTab === tab
                                            ? 'bg-white dark:bg-[#222] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-white/5'
                                            : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
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
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Toggle Sections</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const anyVisible = showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined;
                                                if (anyVisible) {
                                                    setShowWatchlist(false);
                                                    setShowCalendar(false);
                                                    setShowFollowers(false);
                                                    setShowRequests(false);
                                                    setShowSuggestions(false);
                                                    setShowStreaks(false);
                                                    setShowDisciplined(false);
                                                } else {
                                                    handleToggle(setShowWatchlist, true);
                                                    handleToggle(setShowCalendar, true);
                                                    handleToggle(setShowFollowers, true);
                                                    handleToggle(setShowRequests, true);
                                                    handleToggle(setShowSuggestions, true);
                                                    handleToggle(setShowStreaks, true);
                                                    handleToggle(setShowDisciplined, true);
                                                }
                                            }}
                                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {(showWatchlist || showCalendar || showFollowers || showRequests || showSuggestions || showStreaks || showDisciplined) ? 'Hide All' : 'Show All'}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <ToggleRow label="Watchlist" checked={showWatchlist} onChange={(v) => handleToggle(setShowWatchlist, v)} />
                                        <ToggleRow label="Economic Calendar" checked={showCalendar} onChange={(v) => handleToggle(setShowCalendar, v)} />
                                        <ToggleRow label="Followers Stats" checked={showFollowers} onChange={(v) => handleToggle(setShowFollowers, v)} />
                                        <ToggleRow label="Requests" checked={showRequests} onChange={(v) => handleToggle(setShowRequests, v)} />
                                        <ToggleRow label="Suggestions" checked={showSuggestions} onChange={(v) => handleToggle(setShowSuggestions, v)} />
                                        <ToggleRow label="Winning Streaks" checked={showStreaks} onChange={(v) => handleToggle(setShowStreaks, v)} />
                                        <ToggleRow label="Top Disciplined" checked={showDisciplined} onChange={(v) => handleToggle(setShowDisciplined, v)} />
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab 2: Watchlist Manager (Image 2) */}
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
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddSymbol();
                                                }}
                                                className="w-full px-3 py-2 text-[12px] font-semibold bg-slate-50 dark:bg-[#1A1A1C] border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-blue-500 transition-colors text-slate-800 dark:text-white placeholder:text-slate-400"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg flex text-[10px] font-bold border border-slate-200/50 dark:border-white/5">
                                                    {(activeMarket === 'indian' ? ['index', 'equity'] : ['crypto', 'forex', 'commodity']).map((type) => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setNewSymbolType(type as any)}
                                                            className={`flex-1 py-1 rounded-md uppercase tracking-wider transition-all cursor-pointer ${newSymbolType === type
                                                                ? 'bg-white dark:bg-[#222] text-slate-900 dark:text-white shadow-xs'
                                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddSymbol}
                                                    disabled={isAddingSymbol || !newSymbolName.trim()}
                                                    className="px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 select-none flex items-center gap-1 shadow-sm cursor-pointer"
                                                >
                                                    <Plus size={12} strokeWidth={2.5} />
                                                    <span>+ ADD</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Active Pairs ({watchlist.length})</h5>
                                        <div className="max-h-[160px] overflow-y-auto amazing-scrollbar pr-1 space-y-2">
                                            {watchlist.length === 0 ? (
                                                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 text-center py-4 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200/60 dark:border-white/5">
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
                                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10"
                                                                : item.symbol_type === 'crypto'
                                                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10"
                                                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                                                                }`}>
                                                                {item.symbol_type}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteSymbol(item.id)}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95 cursor-pointer"
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
                                        <div className="space-y-3 bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/60 dark:border-white/5">
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
                    </div>
                )}
            </AnimatePresence>

        </DashboardLayout>
        </>
    );
}
