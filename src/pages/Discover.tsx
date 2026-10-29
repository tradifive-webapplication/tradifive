import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Cpu, Camera, X, Upload, Image as ImageIcon, Check, ArrowRight, ShieldCheck, Zap, Copy, QrCode, Sparkles, Star, TrendingUp, KeyRound, ExternalLink, Eye, Info } from "lucide-react";
import { toast } from 'sonner';
import { Search as IconlySearch, Lock as IconlyLock, AddUser as IconlyAddUser, Discovery as IconlyDiscovery, CloseSquare as IconlyCloseSquare, TicketStar as IconlyTicketStar, Bag as IconlyBag } from "react-iconly";
import { supabase } from "@/lib/supabase";
import { useDiscoverData } from "@/hooks/useDiscoverData";

import { motion, AnimatePresence } from "framer-motion";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import { FollowButton } from "@/components/ui/FollowButton";
// --- STATIC CONSTANTS ---
const CATEGORIES = ["All", "Marketplace", "Mentors", "People", "Leaderboard"];
const PLACEHOLDER_NAMES = ['new trader', 'guest trader', 'demo trader', 'trader', 'guest'];

export interface MarketplaceProduct {
    id: string;
    name: string;
    category: string;
    badge?: string;
    version?: string;
    timeframe?: string;
    pairs?: string[];
    winRate?: string;
    drawdown?: string;
    monthlyReturn?: string;
    description: string;
    price: number;
    currency: string;
    thumbnailUrl?: string;
    creatorId: string;
    creatorName: string;
    isOfficial?: boolean;
    rating?: number;
    reviewsCount?: number;
    activeTraders?: number;
    features?: string[];
}

export const EXISTING_OFFICIAL_ALGOS: MarketplaceProduct[] = [
    {
        id: "algo-fialgo-v1",
        name: "FiAlgo V1",
        category: "Algo",
        badge: "⭐ Official Flagship EA · Gold Specialist",
        version: "v1.0.4 Live",
        timeframe: "1 Min (M1) / M15",
        pairs: ["XAUUSD (Gold)"],
        winRate: "73%",
        drawdown: "3.2%",
        monthlyReturn: "+18–42%",
        description: "The official Tradifive Expert Advisor for MetaTrader 5. Fully automated XAUUSD trading with 8 built-in risk modules, tick-by-tick breakout logic, real-time economic news filter (FOMC, CPI, NFP), and sub-3ms direct MT5 execution. Includes 3-Day Risk-Free Trial & 100% Profit Money-Back Guarantee.",
        price: 99999,
        currency: "₹",
        thumbnailUrl: "/fialgo-v1-box.png",
        creatorId: "tradifive-core",
        creatorName: "TradiFive Official",
        isOfficial: true,
        rating: 4.95,
        reviewsCount: 520,
        activeTraders: 2840,
        features: [
            "8 built-in institutional risk & safety modules",
            "Tick-by-tick breakout & dynamic basket tracking",
            "Automated economic news filter (FOMC, CPI, NFP)",
            "3-Day Risk-Free Trial & 100% Profit Money-Back Guarantee",
            "Sub-3ms execution speed with zero-lag socket streaming",
            "Lifetime license · One account · Unlimited MT5 updates"
        ]
    }
];

const CARD_COVERS = [
    "linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)", // Vibrant orange/pink
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Cool blue
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Fresh green
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Sunset
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Deep purple
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", // Turquoise to purple
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", // Pastel purple
    "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"  // Mint blue
];

// Verified Badge matching Discord's green badge exactly
const VerifiedBadge = () => (
    <span className="inline-flex items-center justify-center bg-[#23A55A] text-white rounded-full w-4 h-4 shrink-0 select-none" title="Verified TradiFive Official">
        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current">
            <path d="M4.5 9L1.5 6l1.2-1.2L4.5 6.6l4.8-4.8L10.5 3z" />
        </svg>
    </span>
);

export default function Discover() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const isMarketplaceRoute = location.pathname.startsWith('/marketplace') || location.pathname === '/store';
    const initialTab = (searchParams.get("tab") === "Marketplace" || isMarketplaceRoute) ? "Marketplace" : (searchParams.get("tab") || "All");

    const [user, setUser] = useState<any>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [marketplaceFilter, setMarketplaceFilter] = useState("All");

    // Pull real store listings created via Creator MyStore and pre-populate with official algos at 99,999
    const [storeListings, setStoreListings] = useState<MarketplaceProduct[]>(EXISTING_OFFICIAL_ALGOS);
    const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("tradifive_purchased_algos");
            return saved ? JSON.parse(saved) : ["algo-scalper-ai"];
        } catch (e) {
            return ["algo-scalper-ai"];
        }
    });
    const [addedUsers, setAddedUsers] = useState<string[]>([]);
    const [joinedChannels, setJoinedChannels] = useState<string[]>([]);

    const [detailsModalProduct, setDetailsModalProduct] = useState<MarketplaceProduct | null>(null);
    const [purchaseModalProduct, setPurchaseModalProduct] = useState<any>(null);
    const [purchaseStep, setPurchaseStep] = useState<"checkout" | "activated">("checkout");
    const [generatedLicenseKey, setGeneratedLicenseKey] = useState<string>("");
    const [copiedKey, setCopiedKey] = useState(false);
    const [creatorPaymentDetails, setCreatorPaymentDetails] = useState<any>(null);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [submittingPurchase, setSubmittingPurchase] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank" | "instant">("upi");
    const [utrNumber, setUtrNumber] = useState("");

    // Sync tab with URL
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam && CATEGORIES.includes(tabParam)) {
            setActiveTab(tabParam);
        } else if (
            location.pathname.startsWith('/marketplace') ||
            location.pathname === '/store' ||
            location.pathname.startsWith('/auto-trade/marketplace')
        ) {
            setActiveTab("Marketplace");
        } else if (location.pathname === "/discover" && !tabParam) {
            setActiveTab("All");
        }
    }, [searchParams, location.pathname]);

    const handleTabChange = (category: string) => {
        setActiveTab(category);
        if (location.pathname.startsWith("/auto-trade")) {
            if (category === "Marketplace") {
                navigate("/auto-trade/marketplace");
            } else if (category === "All") {
                navigate("/discover");
            } else {
                navigate(`/discover?tab=${category}`);
            }
        } else {
            if (category === "Marketplace") {
                setSearchParams({ tab: "Marketplace" });
            } else if (category === "All") {
                setSearchParams({});
            } else {
                setSearchParams({ tab: category });
            }
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    setAuthChecked(true);

                    // Fetch follows
                    const { data: followsData } = await supabase
                        .from('social_follows')
                        .select('following_id')
                        .eq('follower_id', session.user.id);
                    if (followsData) setAddedUsers(followsData.map(f => f.following_id));

                    // Fetch joined channels
                    const { data: channelsData } = await supabase
                        .from('channel_members')
                        .select('channel_id')
                        .eq('user_id', session.user.id);
                    if (channelsData) setJoinedChannels(channelsData.map(c => c.channel_id!));
                } else {
                    setUser(null);
                    setAuthChecked(true);
                }
            } catch (err) {
                console.error("Error checking user in Discover:", err);
                setUser(null);
                setAuthChecked(true);
            }
        };
        checkUser();

        const fetchStoreData = async (userId: string) => {
            try {
                // 1. Official creator products
                const { data: products } = await supabase.from('creator_products').select('*, creator:creator_id(display_name, full_name, username)').eq('status', 'active');
                const customListings: MarketplaceProduct[] = products && products.length > 0
                    ? products.map(p => ({
                        id: p.id,
                        name: p.title,
                        category: p.product_type || 'Algo',
                        description: p.description,
                        price: p.price || 99999,
                        currency: p.currency || '₹',
                        thumbnailUrl: p.thumbnail_url,
                        creatorId: p.creator_id,
                        creatorName: p.creator?.display_name || p.creator?.username || 'Creator',
                        isOfficial: false,
                        rating: 4.8,
                        reviewsCount: 38
                    }))
                    : [];

                // 2. Admin-posted algos from marketplace_items
                const { data: adminAlgos } = await supabase
                    .from('marketplace_items')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });
                const adminListings: MarketplaceProduct[] = adminAlgos && adminAlgos.length > 0
                    ? adminAlgos.map(a => ({
                        id: `admin-${a.id}`,
                        name: a.name,
                        category: a.type || 'Algo',
                        badge: a.badge || undefined,
                        version: a.version || undefined,
                        timeframe: a.timeframe || undefined,
                        pairs: a.pairs ? (typeof a.pairs === 'string' ? a.pairs.split(',').map((s: string) => s.trim()) : a.pairs) : undefined,
                        winRate: a.win_rate || undefined,
                        drawdown: a.drawdown || undefined,
                        monthlyReturn: a.monthly_return || undefined,
                        description: a.description || '',
                        price: Number(a.price) || 9999,
                        currency: '₹',
                        creatorId: 'tradifive-core',
                        creatorName: 'TradiFive Official',
                        isOfficial: true,
                        rating: a.rating || 4.8,
                        reviewsCount: a.reviews_count || 0,
                    }))
                    : [];

                setStoreListings([...EXISTING_OFFICIAL_ALGOS, ...adminListings, ...customListings]);

                const { data: orders } = await supabase.from('creator_orders').select('product_id').eq('buyer_id', userId).in('status', ['pending', 'completed']);
                if (orders) {
                    setPurchasedItems(prev => Array.from(new Set([...prev, ...orders.map(o => o.product_id)])));
                }
            } catch (e) {
                console.error("Store error:", e);
                setStoreListings(EXISTING_OFFICIAL_ALGOS);
            }
        };
        
        supabase.auth.getUser().then(({data}) => {
            if(data.user) fetchStoreData(data.user.id);
        });
    }, [navigate]);

    const handlePurchase = async (product: any) => {
        setPurchaseModalProduct(product);
        setPurchaseStep("checkout");
        setGeneratedLicenseKey("");
        setCopiedKey(false);
        setPaymentProofFile(null);
        setCreatorPaymentDetails(null);
        setUtrNumber("");
        if (!product.isOfficial && product.creatorId !== 'tradifive-core') {
            const { data } = await supabase.from('profiles').select('payment_qr_url, payment_details').eq('id', product.creatorId).single();
            if(data) setCreatorPaymentDetails(data);
        }
    };

    const handleInstantActivate = (product: any) => {
        const isFiAlgo = product.name?.includes("FiAlgo") || product.id?.includes("fialgo");
        const prefix = isFiAlgo ? "FIALGO-V1" : product.name?.includes("Scalper") ? "SCALP" : product.name?.includes("Swing") ? "SWING" : product.name?.includes("HFT") ? "HFT" : "GRID";
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const key = isFiAlgo 
            ? `FIALGO-V1-99K-${randomHex}-${Date.now().toString().slice(-4)}`
            : `TRDF-${prefix}-${randomHex}-${Date.now().toString().slice(-4)}`;
        setGeneratedLicenseKey(key);
        setPurchasedItems(prev => {
            const updated = Array.from(new Set([...prev, product.id]));
            try {
                localStorage.setItem("tradifive_purchased_algos", JSON.stringify(updated));
            } catch (e) {}
            return updated;
        });
        setPurchaseStep("activated");
        toast.success(`🎉 ${product.name} license activated! Key: ${key}`);
    };

    const submitPurchaseProof = async () => {
        if(!purchaseModalProduct || !user) return;
        if(!paymentProofFile) { toast.error("Please upload payment proof"); return; }
        setSubmittingPurchase(true);
        
        let fileUrl = '';
        try {
            const fileExt = paymentProofFile.name.split('.').pop();
            const fileName = `${user.id}-proof-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('creator_assets').upload(fileName, paymentProofFile);
            if(!uploadError) {
                const { data: publicData } = supabase.storage.from('creator_assets').getPublicUrl(fileName);
                fileUrl = publicData.publicUrl;
            }
        } catch(e) {}
        
        const { error } = await supabase.from('creator_orders').insert({
            product_id: purchaseModalProduct.id,
            buyer_id: user.id,
            seller_id: purchaseModalProduct.creatorId,
            amount: purchaseModalProduct.price,
            payment_proof_url: fileUrl,
            status: 'pending'
        } as any);

        setSubmittingPurchase(false);
        if(error) {
            toast.error("Failed to submit order");
        } else {
            toast.success("Order submitted! Waiting for creator approval.");
            setPurchasedItems(prev => [...prev, purchaseModalProduct.id]);
            setPurchaseModalProduct(null);
        }
    };

    const handleAddUser = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!addedUsers.includes(id)) {
            setAddedUsers(prev => [...prev, id]);
            if (user?.id) {
                await supabase.from('social_follows').insert([{ follower_id: user.id, following_id: id }]);
            }
        }
    };

    const handleJoinChannel = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!joinedChannels.includes(id)) {
            setJoinedChannels(prev => [...prev, id]);
            if (user?.id) {
                await supabase.from('channel_members').insert([{ channel_id: id, user_id: user.id, role: 'member' }]);
            }
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = "/default-avatar.svg";
    };

    const { mentors, channels, traders, people, searchResults, loading, searching } = useDiscoverData(user?.id ?? "", searchQuery);

    const finalMentors = useMemo(() => mentors.map(m => {
        const name = m.full_name || m.username || "Active Mentor";
        const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            id: m.id,
            name: name,
            username: m.username || name.replace(/\s+/g, '').toLowerCase(),
            title: m.trading_style || "Professional Mentor",
            avatar: m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
            onlineCount: (charCodeSum * 13) % 400 + 10,
            memberCount: (charCodeSum * 47) % 2000 + 100,
            verified: m.is_verified || false,
            tags: [m.preferred_market, m.trading_style].filter(Boolean) as string[]
        };
    }), [mentors]);

    const finalChannels = useMemo(() => channels.map(c => {
        const charCodeSum = c.name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;

        const fallbackCovers = [
            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
            'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
            'https://images.unsplash.com/photo-1605792657660-596af9009e82',
            'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            'https://images.unsplash.com/photo-1642543492481-44e81e3914a7'
        ];

        return {
            id: c.id,
            name: c.name,
            onlineCount: (charCodeSum * 7) % 300 + 15,
            memberCount: (c as any).memberCount || c.member_count || ((charCodeSum * 19) % 2000 + 500),
            description: c.description || "Official Tradifive communication channel.",
            icon: c.icon || "C",
            avatar_url: (c as any).avatar_url || c.avatar_url || `https://i.pravatar.cc/150?img=${charCodeSum % 70}`,
            cover_url: (c as any).cover_url || c.cover_url || fallbackCovers[charCodeSum % fallbackCovers.length],
            locked: c.channel_type === "private" || c.channel_type === "premium"
        };
    }), [channels]);

    const finalTraders = useMemo(() => traders
        .filter(t => {
            const name = (t.full_name || t.username || '').trim().toLowerCase();
            return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
        })
        .map((t, idx) => {
            const name = t.full_name || t.username || "Active Trader";
            const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return {
                id: t.id,
                name: name,
                avatar: t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
                winRate: t.win_rate ? `${t.win_rate}%` : "-",
                profit: t.roi_all_time ? `${t.roi_all_time >= 0 ? '+' : ''}${t.roi_all_time}%` : "-",
                onlineCount: (charCodeSum * 17) % 300 + 5,
                memberCount: (charCodeSum * 31) % 1500 + 50,
                rank: idx + 1
            };
        }), [traders]);

    const finalPeople = useMemo(() => people
        .filter(p => {
            const name = (p.full_name || p.username || '').trim().toLowerCase();
            return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
        })
        .map((p) => {
            const name = p.full_name || p.username || "Active User";
            const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            const fallbackCovers = [
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
                'https://images.unsplash.com/photo-1642543492481-44e81e3914a7',
                'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf',
                'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
                'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
                'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74'
            ];

            return {
                id: p.id,
                name: name,
                username: p.username || name.replace(/\s+/g, '').toLowerCase(),
                handle: p.username ? `@${p.username}` : "@user",
                avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
                cover_url: (p as any).cover_url || fallbackCovers[charCodeSum % fallbackCovers.length],
                winRate: p.win_rate ? `${p.win_rate}%` : "-",
                profit: p.roi_all_time ? `${p.roi_all_time >= 0 ? '+' : ''}${p.roi_all_time}%` : "-",
                onlineCount: (charCodeSum * 19) % 200 + 1,
                memberCount: 0,
                mutual: (charCodeSum * 7) % 15
            };
        }), [people]);

    function DiscoverSkeleton() {
        return (
            <div className="w-full font-sans pb-32 bg-[#F8FAFC] dark:bg-[#000000] text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide select-none animate-pulse">
                {/* Hero Section Skeleton */}
                <div className="w-full relative overflow-hidden h-[240px] sm:h-[300px]">
                     <div className="absolute inset-0 bg-slate-200/60 dark:bg-[#1E1E1E]" />
                     <div className="relative z-10 pt-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
                        <div className="h-10 sm:h-12 w-64 sm:w-96 bg-slate-300 dark:bg-slate-700 rounded-xl" />
                        <div className="h-5 sm:h-6 w-full max-w-2xl bg-slate-300 dark:bg-slate-700/60 rounded-md" />
                        <div className="h-5 sm:h-6 w-3/4 max-w-xl bg-slate-300 dark:bg-slate-700/60 rounded-md" />
                     </div>
                </div>
                
                {/* Tabs Skeleton */}
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-8 mb-6 flex gap-3 overflow-x-auto scrollbar-hide">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-28 bg-slate-200 dark:bg-[#1E1E1E] rounded-full shrink-0" />
                    ))}
                </div>

                {/* Grid Skeleton */}
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 flex flex-col h-[340px] relative">
                            {/* Cover */}
                            <div className="h-[143px] w-full bg-slate-200 dark:bg-[#222] relative shrink-0" />
                            {/* Avatar */}
                            <div className="absolute left-4 top-[115px] w-12 h-12 rounded-full border-[4px] border-white dark:border-[#1A1A1A] bg-slate-300 dark:bg-slate-700 z-20" />
                            {/* Body */}
                            <div className="pt-10 px-4 pb-4 flex flex-col gap-3 flex-grow">
                                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800/60 rounded" />
                                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800/40 rounded" />
                                <div className="mt-auto grid grid-cols-2 gap-3">
                                    <div className="h-10 bg-slate-100 dark:bg-[#1E1E1E] rounded-xl" />
                                    <div className="h-10 bg-slate-100 dark:bg-[#1E1E1E] rounded-xl" />
                                </div>
                                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800/50 rounded-xl mt-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!authChecked || loading) {
        return (
            <DashboardLayout breadcrumbs={[{ label: "Discover", path: "/discover" }]} noPadding={true} noScroll={true}>
                <div className="h-full overflow-y-auto w-full scrollbar-hide">
                    <DiscoverSkeleton />
                </div>
            </DashboardLayout>
        );
    }









    return (
        <DashboardLayout breadcrumbs={[{ label: "Discover", path: "/discover" }]} noPadding={true} noScroll={true}>
            <div className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide">

                {/* 1. DISCORD TOP BAR NAVIGATION (STICKY) */}
                <div className="w-full flex justify-center sticky top-0 z-50 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-[#1C1C21]/80 backdrop-blur-md">
                    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row md:items-stretch justify-between gap-4">
                        {/* Left side category tabs */}
                        <div className="flex items-stretch gap-6 overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-base shrink-0 select-none py-3 pr-2">
                                <IconlyDiscovery set="curved" primaryColor="currentColor" size={20} className="text-slate-800 dark:text-slate-200" stroke="bold" />
                                <span className="tracking-tight text-[16px] font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Discover</span>
                            </div>
                            <div className="flex items-stretch gap-1 select-none pt-1">
                                {CATEGORIES.map(category => {
                                    const isAll = category === "All";
                                    const label = isAll ? "Home" : category;
                                    const isActive = activeTab === category;
                                    const isLocked = category === "Competitions";
                                    const isLeaderboard = category === "Leaderboard";
                                    const isMarketplace = category === "Marketplace";

                                    return (
                                        <button
                                            key={category}
                                            onClick={() => handleTabChange(category)}
                                            className={`relative px-3 flex items-center gap-1.5 text-sm font-semibold transition-all shrink-0 ${isActive
                                                    ? "text-slate-900 dark:text-white font-bold"
                                                    : "text-[#5C5E66] hover:text-slate-900 dark:text-[#B5BAC1] dark:hover:text-white"
                                                }`}
                                        >
                                            {isLeaderboard && <IconlyTicketStar set="curved" primaryColor="currentColor" size={13} className={isActive ? "text-amber-500" : "text-slate-400"} stroke="bold" />}
                                            {isMarketplace && <IconlyBag set="curved" primaryColor="currentColor" size={14} className={isActive ? "text-blue-500" : "text-slate-400"} stroke="bold" />}
                                            {label}
                                            {isLocked && (
                                                <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 px-1.5 py-[2px] rounded-full shrink-0 shadow-sm">
                                                    <IconlyLock set="curved" primaryColor="currentColor" size={8} className="text-indigo-500 shrink-0" />
                                                    <span className="text-[7.5px] font-black uppercase tracking-[0.1em] text-indigo-600 dark:text-indigo-400 leading-none">Soon</span>
                                                </div>
                                            )}
                                            {isActive && (
                                                <div className="absolute bottom-[-1px] left-3 right-3 h-[3px] bg-slate-900 dark:bg-white rounded-t-md z-10" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right side search bar */}
                        <div className="relative w-full md:w-64 shrink-0 py-2 flex items-center">
                            <div className="relative flex w-full items-center bg-slate-100 dark:bg-[#1A1A1C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30 dark:focus-within:ring-indigo-500/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                                <IconlySearch set="curved" primaryColor="currentColor" size={15} className="text-slate-400 dark:text-slate-400 mr-2.5 shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search communities..."
                                    className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-[13px] font-medium outline-none"
                                />
                                {searchQuery ? (
                                    <button onClick={() => setSearchQuery('')} className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors shrink-0">
                                        <IconlyCloseSquare set="curved" primaryColor="currentColor" size={12} />
                                    </button>
                                ) : (
                                    <div className="hidden sm:flex items-center ml-2 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-[10px] font-bold text-slate-400 dark:text-slate-400 shrink-0 select-none">
                                        ⌘K
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unified Gradient Wrapper for Hero */}
                <div className="w-full bg-gradient-to-br from-[#ECEDF2] to-[#E2E4FB] dark:bg-none dark:bg-[#1E1E1E] relative overflow-hidden">
                    {/* Faded Discord Blurple Blobs (Unified) */}
                    <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 10% 0%, rgba(88, 101, 242, 0.08), transparent 60%), 
                                radial-gradient(circle at 90% 0%, rgba(88, 101, 242, 0.08), transparent 60%)
                            `
                        }}
                    />

                    {/* Search Bar & Hero */}
                    {!searchQuery && (
                        <div className="w-full flex justify-center relative select-none">
                            <style>
                                {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}
                            </style>
                            {activeTab === "Marketplace" ? (
                                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 relative z-10">
                                    <h1 className="capitalize text-[32px] md:text-[48px] text-[#060607] dark:text-[#F2F3F5] leading-[1.05] mb-4 tracking-[-0.03em]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>
                                        Algorithm <br />Marketplace
                                    </h1>
                                    <p className="text-base md:text-[17px] text-[#4E5058] dark:text-[#B5BAC1] max-w-xl leading-relaxed font-medium">
                                        Institutional MQL5 expert advisors with live server sync, low-latency execution, and verified track records.
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 relative z-10">
                                    <h1 className="capitalize text-[32px] md:text-[48px] text-[#060607] dark:text-[#F2F3F5] leading-[1.05] mb-4 tracking-[-0.03em]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>
                                        Find your community <br />on Tradifive
                                    </h1>
                                    <p className="text-base md:text-[17px] text-[#4E5058] dark:text-[#B5BAC1] max-w-xl leading-relaxed font-medium">
                                        Discover top trading circles. Share alpha, debate market trends, and level up your financial journey together.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mt-4 space-y-8">

                    {/* Search Results Drawer */}
                    <AnimatePresence>
                        {searchQuery.trim() && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-slate-200 dark:border-white/5">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                        Search Results ({searching ? "Searching..." : `${searchResults.length} found`})
                                    </h2>
                                    {searchResults.length === 0 && !searching ? (
                                        <p className="text-sm text-slate-500 py-6 text-center">No results found.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {searchResults.map(profile => {
                                                const displayName = profile.full_name || profile.username || "Active User";
                                                const displaySlug = profile.username || "user";
                                                return (
                                                    <Link key={profile.id} to={`/user/${displaySlug}`} className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:shadow-md transition-all flex items-center gap-3 group">
                                                        <img src={profile.avatar_url || "/default-avatar.svg"} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                                                        <div>
                                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{displayName}</h3>
                                                            <p className="text-xs text-slate-500">@{displaySlug}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* ── LEADERBOARD TAB ──────────────────────────────────────────────── */}
                    {activeTab === "Leaderboard" && !searchQuery && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <LeaderboardPanel currentUserId={user?.id} />
                        </motion.div>
                    )}

                    {/* People */}
                    {(activeTab === "All" || activeTab === "People") && !searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <h2 className="text-xl font-bold text-[#060607] dark:text-[#F2F3F5]">
                                People
                            </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {finalPeople.map((person, index) => {
                                    const userSlug = person.username;
                                    return (
                                        <div
                                            key={person.id}
                                            className="relative group bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-[136px]"
                                        >
                                            {/* Top Row: Avatar + Name + Follow Button */}
                                            <div className="flex items-center gap-3 w-full z-10">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                                                    <img
                                                        src={person.avatar || '/default-avatar.svg'}
                                                        alt={person.name}
                                                        className="w-full h-full object-cover"
                                                        onError={handleImageError}
                                                    />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <span className="text-sm font-extrabold text-[#060607] dark:text-[#F2F3F5] leading-tight line-clamp-1 group-hover:text-blue-500 transition-colors">
                                                        {person.name}
                                                    </span>
                                                    <p className="text-[11px] font-semibold text-[#4E5058] dark:text-[#B5BAC1] truncate">
                                                        {person.handle}
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    <FollowButton
                                                        isFollowing={addedUsers.includes(person.id)}
                                                        onToggleFollow={(e) => handleAddUser(e, person.id)}
                                                        disabled={addedUsers.includes(person.id)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bottom Row: Stats & Mutual Connections */}
                                            <div className="space-y-1.5 z-10">
                                                {/* Stats grid */}
                                                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#4E5058] dark:text-[#B5BAC1]">
                                                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg px-2.5 py-1 border border-slate-100 dark:border-white/5 flex justify-between items-center">
                                                        <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold">Win Rate</span>
                                                        <span className="text-emerald-500 dark:text-emerald-400 font-bold">{person.winRate}</span>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-white/5 rounded-lg px-2.5 py-1 border border-slate-100 dark:border-white/5 flex justify-between items-center">
                                                        <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold">Est. ROI</span>
                                                        <span className="text-indigo-500 dark:text-indigo-400 font-bold">{person.profit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to={`/user/${userSlug}`} className="absolute inset-0 z-0" />
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Featured Trading Algorithms (Preview on All tab) */}
                    {(activeTab === "All") && !searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                            Institutional Algos
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                            MT5 Compatible · Lifetime License
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-[#F2F3F5] tracking-tight">
                                        Featured Trading Algorithms
                                    </h2>
                                </div>
                                <button
                                    onClick={() => handleTabChange("Marketplace")}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 transition-colors group cursor-pointer"
                                >
                                    <span>Browse Marketplace</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {EXISTING_OFFICIAL_ALGOS.map((algo) => {
                                    const isPurchased = purchasedItems.includes(algo.id);
                                    return (
                                        <div
                                            key={algo.id}
                                            className="rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative group"
                                        >
                                            <div>
                                                {/* Badges + Rating */}
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                            {algo.category}
                                                        </span>
                                                        {algo.badge && (
                                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                                                                {algo.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                        <span>★</span>
                                                        <span>{algo.rating}</span>
                                                    </div>
                                                </div>

                                                {/* Title & Creator */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    {(algo.thumbnailUrl || algo.name.includes("FiAlgo")) ? (
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                                            <img src={algo.thumbnailUrl || "/fialgo-v1-box.png"} alt={algo.name} className="w-full h-full object-contain drop-shadow" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                                                            <Cpu size={20} strokeWidth={2.2} />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {algo.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                            <span>by {algo.creatorName}</span>
                                                            <VerifiedBadge />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pairs & Timeframe */}
                                                {algo.pairs && (
                                                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                                        {algo.pairs.map(p => (
                                                            <span key={p} className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                                                                {p}
                                                            </span>
                                                        ))}
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-auto uppercase">
                                                            {algo.timeframe}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Metrics 3-tile Row */}
                                                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 mb-3 text-center">
                                                    <div>
                                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">WIN RATE</div>
                                                        <div className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">{algo.winRate}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">AVG RETURN</div>
                                                        <div className="text-[13px] font-black text-blue-600 dark:text-blue-400">{algo.monthlyReturn}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">MAX DD</div>
                                                        <div className="text-[13px] font-black text-slate-700 dark:text-slate-300">{algo.drawdown}</div>
                                                    </div>
                                                </div>

                                                <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                                                    {algo.description}
                                                </p>
                                            </div>

                                            {/* Price & Action Footer */}
                                            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-auto">
                                                <div>
                                                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block leading-none mb-1">
                                                        ONE-TIME LICENSE
                                                    </span>
                                                    <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                        {algo.currency}{algo.price.toLocaleString("en-IN")}
                                                    </div>
                                                </div>

                                                {isPurchased ? (
                                                    <button
                                                        onClick={() => navigate('/order-history')}
                                                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-black hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        <Check size={13} strokeWidth={3} />
                                                        <span>Active EA</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePurchase(algo)}
                                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black shadow-md shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <span>Buy License</span>
                                                        <ArrowRight size={13} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Featured Channels heading / Mentors */}
                    {(activeTab === "All" || activeTab === "Mentors") && !searchQuery && finalMentors.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-6">
                            <h2 className="text-xl font-bold text-[#060607] dark:text-[#F2F3F5]">
                                Featured Mentors
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {finalMentors.slice(0, 8).map((mentor, index) => {
                                    const userSlug = mentor.username;
                                    return (
                                        <div
                                            key={mentor.id}
                                            className="relative group bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-[340px]"
                                        >
                                            {(!mentor.cover_url || mentor.cover_url === '/default-cover.png') ? (
                                                <div className="h-[143px] w-full relative shrink-0 bg-slate-100 dark:bg-[#1A1A1A] flex items-center justify-center text-slate-400 dark:text-slate-700 border-b border-slate-200 dark:border-white/5">
                                                    <Camera size={28} className="opacity-40" />
                                                </div>
                                            ) : (
                                                <div
                                                    className="h-[143px] w-full relative shrink-0"
                                                    style={{ background: `url(${mentor.cover_url}) center/cover no-repeat` }}
                                                ></div>
                                            )}

                                            {/* Circular Overlapping Avatar */}
                                            <div className="absolute left-4 top-[115px] w-12 h-12 rounded-full overflow-hidden bg-white border-[4px] border-white dark:border-[#1E1E1E] shadow-sm z-20">
                                                <img
                                                    src={mentor.avatar || '/default-avatar.svg'}
                                                    alt={mentor.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => handleImageError(e, mentor.name)}
                                                />
                                            </div>

                                            {/* Card Content body */}
                                            <div className="pt-8 px-4 pb-4 flex flex-col flex-grow justify-between relative z-10">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <span className="text-sm font-extrabold text-[#060607] dark:text-[#F2F3F5] leading-tight line-clamp-1 group-hover:text-blue-500 transition-colors">
                                                            {mentor.name}
                                                        </span>
                                                        {mentor.verified && <VerifiedBadge />}
                                                    </div>
                                                    <p className="text-xs font-semibold text-[#4E5058] dark:text-[#B5BAC1] line-clamp-2 leading-relaxed">
                                                        {mentor.title}
                                                    </p>
                                                </div>

                                                {/* Stats Footer Row */}
                                                <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    <FollowButton
                                                        isFollowing={addedUsers.includes(mentor.id)}
                                                        onToggleFollow={(e) => handleAddUser(e, mentor.id)}
                                                        disabled={addedUsers.includes(mentor.id)}
                                                        className="relative z-30"
                                                    />
                                                </div>
                                            </div>

                                            <Link to={`/user/${userSlug}`} className="absolute inset-0 z-0" />
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}


                    {/* ── ALGO MARKETPLACE TAB ────────────────────────────────────────── */}
                    {(activeTab === "Marketplace") && !searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
                            {/* Marketplace Filters */}
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                                {['All', 'Algo', 'Strategy', 'Indicator', 'Mentorship'].map(cat => {
                                    const count = cat === 'All' ? storeListings.length : storeListings.filter(l => l.category === cat).length;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setMarketplaceFilter(cat)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 border ${marketplaceFilter === cat
                                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                                                    : 'bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-[#B5BAC1] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                        >
                                            {cat} {count > 0 ? `(${count})` : ''}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Algos Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {storeListings.filter(l => marketplaceFilter === 'All' || l.category === marketplaceFilter).map((product) => {
                                    const isPurchased = purchasedItems.includes(product.id);
                                    const isFlagship = product.id === "algo-fialgo-v1" || product.name === "FiAlgo V1";

                                    return (
                                        <div
                                            key={product.id}
                                            className={`rounded-[22px] p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative group min-h-[400px] ${
                                                isFlagship
                                                    ? 'border-2 border-blue-400/80 bg-gradient-to-b from-blue-500/[0.04] to-white dark:bg-none dark:bg-[#1E1E1E] dark:border-blue-500/40 shadow-sm'
                                                    : 'border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none'
                                            }`}
                                        >
                                            <div>
                                                {/* Top Row: Category Badge + Star Rating */}
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                                                            isFlagship
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                        }`}>
                                                            {isFlagship ? 'MAIN EA' : product.category}
                                                        </span>
                                                        {product.badge && (
                                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                                                                {product.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {product.rating && (
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                            <span>★</span>
                                                            <span>{product.rating}</span>
                                                            {product.reviewsCount && (
                                                                <span className="text-slate-400 dark:text-slate-500 text-[10px]">({product.reviewsCount})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bot Title & Verified Creator */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    {(product.thumbnailUrl || product.name.includes("FiAlgo")) ? (
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                                            <img src={product.thumbnailUrl || "/fialgo-v1-box.png"} alt={product.name} className="w-full h-full object-contain drop-shadow" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                                                            <Cpu size={20} strokeWidth={2.2} />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {product.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                            <span>by {product.creatorName}</span>
                                                            <VerifiedBadge />
                                                            {product.version && (
                                                                <span className="text-[10px] font-semibold text-slate-400">· {product.version}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pairs & Timeframe chips */}
                                                {product.pairs && (
                                                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                                        {product.pairs.map(p => (
                                                            <span key={p} className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                                                                {p}
                                                            </span>
                                                        ))}
                                                        {product.timeframe && (
                                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-auto uppercase tracking-wider">
                                                                {product.timeframe}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Key Metrics 3-tile Row */}
                                                {product.winRate && (
                                                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 mb-3 text-center">
                                                        <div>
                                                            <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">WIN RATE</div>
                                                            <div className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">{product.winRate}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">AVG RETURN</div>
                                                            <div className="text-[13px] font-black text-blue-600 dark:text-blue-400">{product.monthlyReturn}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">MAX DD</div>
                                                            <div className="text-[13px] font-black text-slate-700 dark:text-slate-300">{product.drawdown}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Description */}
                                                <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                                                    {product.description}
                                                </p>
                                            </div>

                                            {/* Price & Action Row */}
                                            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-auto">
                                                <div>
                                                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block leading-none mb-1">
                                                        ONE-TIME LICENSE
                                                    </span>
                                                    <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-0.5">
                                                        <span className="text-base text-slate-500 font-bold">{product.currency || "₹"}</span>
                                                        <span>{Number(product.price || 99999).toLocaleString("en-IN")}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setDetailsModalProduct(product)}
                                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                                    >
                                                        <Eye size={13} />
                                                        <span>Details</span>
                                                    </button>

                                                    {isPurchased ? (
                                                        <button
                                                            onClick={() => {
                                                                setPurchaseModalProduct(product);
                                                                setPurchaseStep("activated");
                                                                const isFiAlgo = product.name?.includes("FiAlgo") || product.id?.includes("fialgo");
                                                                const prefix = isFiAlgo ? "FIALGO-V1" : product.name?.includes("Scalper") ? "SCALP" : product.name?.includes("Swing") ? "SWING" : product.name?.includes("HFT") ? "HFT" : "GRID";
                                                                const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
                                                                setGeneratedLicenseKey(isFiAlgo ? `FIALGO-V1-99K-${randomHex}-${Date.now().toString().slice(-4)}` : `TRDF-${prefix}-${randomHex}-${Date.now().toString().slice(-4)}`);
                                                            }}
                                                            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                                        >
                                                            <Check size={13} strokeWidth={3} />
                                                            <span>Active</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePurchase(product)}
                                                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <span>Buy</span>
                                                            <ArrowRight size={13} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Algorithm Details Modal */}
            <AnimatePresence>
                {detailsModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailsModalProduct(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-5 z-10 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/10 pb-4">
                                <div className="flex items-center gap-3.5">
                                    {(detailsModalProduct.thumbnailUrl || detailsModalProduct.name?.includes("FiAlgo")) ? (
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-1.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                            <img src={detailsModalProduct.thumbnailUrl || "/fialgo-v1-box.png"} alt={detailsModalProduct.name} className="w-full h-full object-contain drop-shadow" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                                            <Cpu size={24} strokeWidth={2.2} />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                {detailsModalProduct.category || "Algo"}
                                            </span>
                                            {detailsModalProduct.badge && (
                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                                                    {detailsModalProduct.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                            {detailsModalProduct.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            <span>by {detailsModalProduct.creatorName}</span>
                                            <VerifiedBadge />
                                            {detailsModalProduct.version && (
                                                <span className="text-slate-400 font-mono text-[11px]">· {detailsModalProduct.version}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDetailsModalProduct(null)}
                                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Performance Grid */}
                            <div>
                                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                                    Verified Metrics & Specs
                                </h4>
                                <div className="grid grid-cols-3 gap-2.5">
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">WIN RATE</div>
                                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            {detailsModalProduct.winRate || "73%"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">AVG MONTHLY</div>
                                        <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">
                                            {detailsModalProduct.monthlyReturn || "+18–42%"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">MAX DRAWDOWN</div>
                                        <div className="text-base font-black text-slate-700 dark:text-slate-300 mt-0.5">
                                            {detailsModalProduct.drawdown || "3.2%"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">PAIRS</div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                                            {detailsModalProduct.pairs ? (Array.isArray(detailsModalProduct.pairs) ? detailsModalProduct.pairs.join(", ") : detailsModalProduct.pairs) : "XAUUSD"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">TIMEFRAME</div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                                            {detailsModalProduct.timeframe || "M15 / H1"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">PLATFORM</div>
                                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                                            MetaTrader 5
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Full Description */}
                            <div>
                                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                                    Strategy & Overview
                                </h4>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                    {detailsModalProduct.description}
                                </div>
                            </div>

                            {/* Features / Safeguards List */}
                            <div>
                                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                                    Key Features & Risk Controls
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(detailsModalProduct.features && detailsModalProduct.features.length > 0 ? detailsModalProduct.features : [
                                        "8 built-in risk & safety modules",
                                        "Real-time basket & spread monitoring",
                                        "Automated news event filter (FOMC, CPI, NFP)",
                                        "Lifetime license · Unlimited MT5 updates",
                                        "London LD4 sub-millisecond execution",
                                        "Prop-firm challenge compliant"
                                    ]).map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                                <Check size={11} strokeWidth={3} />
                                            </div>
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Action Footer */}
                            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between mt-1">
                                <div>
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block leading-none mb-1">
                                        LIFETIME ACCESS
                                    </span>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                                        {detailsModalProduct.currency || "₹"}{Number(detailsModalProduct.price || 99999).toLocaleString("en-IN")}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDetailsModalProduct(null)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Close
                                    </button>
                                    {purchasedItems.includes(detailsModalProduct.id) ? (
                                        <button
                                            onClick={() => {
                                                const prod = detailsModalProduct;
                                                setDetailsModalProduct(null);
                                                setPurchaseModalProduct(prod);
                                                setPurchaseStep("activated");
                                                const isFiAlgo = prod.name?.includes("FiAlgo") || prod.id?.includes("fialgo");
                                                const prefix = isFiAlgo ? "FIALGO-V1" : prod.name?.includes("Scalper") ? "SCALP" : prod.name?.includes("Swing") ? "SWING" : prod.name?.includes("HFT") ? "HFT" : "GRID";
                                                const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
                                                setGeneratedLicenseKey(isFiAlgo ? `FIALGO-V1-99K-${randomHex}-${Date.now().toString().slice(-4)}` : `TRDF-${prefix}-${randomHex}-${Date.now().toString().slice(-4)}`);
                                            }}
                                            className="px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                            <span>Active License</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const prod = detailsModalProduct;
                                                setDetailsModalProduct(null);
                                                handlePurchase(prod);
                                            }}
                                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                                        >
                                            <span>Buy License Now</span>
                                            <ArrowRight size={14} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Purchase & Checkout Modal */}
            <AnimatePresence>
                {purchaseModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPurchaseModalProduct(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5 z-10 max-h-[90vh] overflow-y-auto"
                        >
                            {purchaseStep === "activated" ? (
                                /* Activation Success Screen */
                                <div className="space-y-5 text-center py-4">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                        <Check size={32} strokeWidth={3} />
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                            License Issued & Synced
                                        </span>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                                            {purchaseModalProduct.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                            Your lifetime license for 1 MT5 Live Terminal and unlimited demo accounts has been provisioned.
                                        </p>
                                    </div>

                                    {/* Generated License Key Box */}
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-left">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">YOUR MASTER LICENSE KEY</span>
                                            <span className="text-[10px] font-bold text-emerald-500">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <code className="text-base font-black text-blue-600 dark:text-blue-400 font-mono tracking-wider">
                                                {generatedLicenseKey}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedLicenseKey);
                                                    setCopiedKey(true);
                                                    toast.success("License key copied!");
                                                    setTimeout(() => setCopiedKey(false), 2000);
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                {copiedKey ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                                                <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={() => {
                                                setPurchaseModalProduct(null);
                                                navigate('/auto-trade/license');
                                            }}
                                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <KeyRound size={14} />
                                            <span>EA Setup Guide</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPurchaseModalProduct(null);
                                                navigate('/order-history');
                                            }}
                                            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <span>View Order History</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Checkout Screen */
                                <>
                                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                    Checkout
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">TradiFive Algo License</span>
                                            </div>
                                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{purchaseModalProduct.name}</h3>
                                        </div>
                                        <button onClick={() => setPurchaseModalProduct(null)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Price Card */}
                                    <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">Total Due (One-Time)</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Lifetime License</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                                {purchaseModalProduct.currency || "₹"}{Number(purchaseModalProduct.price || 99999).toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Includes 18% GST</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-blue-500/15 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                                            <ShieldCheck size={14} className="shrink-0" />
                                            <span>Entitles 1 Live MT5 Account + Unlimited Demo + London LD4 VPS Gateway</span>
                                        </div>
                                    </div>

                                    {/* Payment Method Tabs */}
                                    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10">
                                        <button
                                            onClick={() => setPaymentMethod("upi")}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${paymentMethod === "upi" ? "bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
                                        >
                                            UPI / QR (Instant)
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("bank")}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${paymentMethod === "bank" ? "bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
                                        >
                                            Bank Transfer
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("instant")}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${paymentMethod === "instant" ? "bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
                                        >
                                            Instant Test Key
                                        </button>
                                    </div>

                                    {/* Payment Content based on method */}
                                    {paymentMethod === "upi" && (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
                                                <div className="w-36 h-36 rounded-xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center mb-3">
                                                    {/* Clean SVG QR Representation */}
                                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                                        <rect width="100" height="100" fill="white" />
                                                        <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                                                        <rect x="14" y="14" width="17" height="17" fill="white" />
                                                        <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                                                        <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                                                        <rect x="69" y="14" width="17" height="17" fill="white" />
                                                        <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                                                        <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                                                        <rect x="14" y="69" width="17" height="17" fill="white" />
                                                        <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                                                        <rect x="42" y="15" width="16" height="6" fill="#0f172a" />
                                                        <rect x="45" y="45" width="12" height="12" fill="#2563eb" />
                                                        <rect x="42" y="70" width="16" height="8" fill="#0f172a" />
                                                        <rect x="68" y="45" width="20" height="8" fill="#0f172a" />
                                                        <rect x="68" y="70" width="8" height="18" fill="#0f172a" />
                                                        <rect x="80" y="80" width="8" height="8" fill="#0f172a" />
                                                    </svg>
                                                </div>
                                                <div className="text-xs text-slate-500 mb-1">TradiFive Official Merchant UPI</div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-black/30 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                                                    <code className="text-xs font-mono font-bold text-slate-900 dark:text-white">tradifive.algo@icici</code>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText("tradifive.algo@icici");
                                                            toast.success("UPI ID copied!");
                                                        }}
                                                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                                    UPI UTR / Reference Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={utrNumber}
                                                    onChange={e => setUtrNumber(e.target.value)}
                                                    placeholder="e.g. 429184920192"
                                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === "bank" && (
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2.5 text-xs">
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                                                <span className="text-slate-400">Account Name:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">TradiFive Tech Private Limited</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                                                <span className="text-slate-400">Bank:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">ICICI Bank Limited</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                                                <span className="text-slate-400">Account Number:</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">000405019824</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">IFSC Code:</span>
                                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">ICIC0000004</span>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === "instant" && (
                                        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 space-y-2 text-center">
                                            <Sparkles size={24} className="text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instant Provisioning</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                                                Activate {purchaseModalProduct.name} immediately to generate your license key and start testing on MetaTrader 5 right away.
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            onClick={() => handleInstantActivate(purchaseModalProduct)}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                        >
                                            <KeyRound size={15} />
                                            <span>Confirm & Generate MT5 License Key</span>
                                        </button>
                                        <button
                                            onClick={() => setPurchaseModalProduct(null)}
                                            className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </DashboardLayout>
    )
}
