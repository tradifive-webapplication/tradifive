import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { CommunityPageWrapper } from "@/components/CommunityShell";
import { Cpu, Camera, X, Upload, Image as ImageIcon, Check, ArrowRight, ShieldCheck, Zap, Copy, QrCode, Sparkles, Star, TrendingUp, KeyRound, ExternalLink, Eye, Info, Download, CheckCircle2, AlertCircle, HelpCircle, Smartphone, Landmark, Bookmark, Globe, UserPlus } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Search as IconlySearch, Lock as IconlyLock, AddUser as IconlyAddUser, Discovery as IconlyDiscovery, CloseSquare as IconlyCloseSquare, TicketStar as IconlyTicketStar, Bag as IconlyBag } from "react-iconly";
import { supabase } from "@/lib/supabase";
import { useDiscoverData } from "@/hooks/useDiscoverData";
import { getMergedSocialLinks } from "@/components/ProfileSocialIcons";

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
        badge: "Flagship EA",
        version: "v1.0.4 Live",
        timeframe: "1 Min (M1) / M15",
        pairs: ["XAUUSD (Gold)"],
        winRate: "73%",
        drawdown: "3.2%",
        monthlyReturn: "+18–42%",
        description: "The official Tradifive Expert Advisor for MetaTrader 5. Fully automated XAUUSD trading with 8 built-in risk modules, tick-by-tick breakout logic, real-time economic news filter (FOMC, CPI, NFP), and sub-3ms direct MT5 execution. Includes 3-Day Risk-Free Trial & 100% Profit Money-Back Guarantee.",
        price: 10000,
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
            "₹10,000 one-time setup fee + Daily 50/50% profit share"
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

// Bespoke visual badge generator for algorithms and quantitative trading strategies
const getAlgoVisual = (algo: MarketplaceProduct) => {
    const isFiAlgo = algo.id === "algo-fialgo-v1" || algo.name?.includes("FiAlgo");
    if (isFiAlgo || algo.thumbnailUrl) {
        return (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-amber-500/15 to-amber-500/5 dark:from-amber-400/10 dark:to-transparent border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
                <img src={algo.thumbnailUrl || "/fialgo-v1-box.png"} alt={algo.name} className="w-full h-full object-contain drop-shadow" />
            </div>
        );
    }

    if (algo.name?.includes("Alpha Momentum") || algo.category === "Algo") {
        return (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-cyan-500/15 to-blue-600/10 dark:from-cyan-400/15 dark:to-blue-500/5 border border-cyan-500/30 dark:border-cyan-400/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Cpu size={20} strokeWidth={2.2} />
            </div>
        );
    }

    if (algo.name?.includes("London Breakout") || algo.pairs?.includes("GBP/USD")) {
        return (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-emerald-500/15 to-teal-600/10 dark:from-emerald-400/15 dark:to-teal-500/5 border border-emerald-500/30 dark:border-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
                <TrendingUp size={20} strokeWidth={2.2} />
            </div>
        );
    }

    return (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-purple-500/15 to-indigo-600/10 dark:from-purple-400/15 dark:to-indigo-500/5 border border-purple-500/30 dark:border-purple-400/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck size={20} strokeWidth={2.2} />
        </div>
    );
};

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

    // Pull real store listings created via Creator MyStore and pre-populate with official algos at 10,000
    const [storeListings, setStoreListings] = useState<MarketplaceProduct[]>(EXISTING_OFFICIAL_ALGOS);
    const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("tradifive_purchased_algos");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [addedUsers, setAddedUsers] = useState<string[]>([]);
    const [joinedChannels, setJoinedChannels] = useState<string[]>([]);
    const [followDeltas, setFollowDeltas] = useState<Record<string, number>>({});
    const [showInlineNotifications, setShowInlineNotifications] = useState(false);
    const [savedTraders, setSavedTraders] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("tradifive_saved_traders");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const handleToggleSaveTrader = (e: React.MouseEvent, traderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedTraders(prev => {
            const next = prev.includes(traderId) ? prev.filter(id => id !== traderId) : [...prev, traderId];
            try {
                localStorage.setItem("tradifive_saved_traders", JSON.stringify(next));
            } catch {
                // Ignore storage quota errors
            }
            if (next.includes(traderId)) {
                toast.success("Trader saved to bookmarks");
            } else {
                toast("Removed from bookmarks");
            }
            return next;
        });
    };

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
    const [qrDisplayMode, setQrDisplayMode] = useState<"dynamic" | "official">("dynamic");
    const [showUtrHelp, setShowUtrHelp] = useState(false);
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [copiedAcc, setCopiedAcc] = useState(false);
    const [copiedIfsc, setCopiedIfsc] = useState(false);

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
                        price: p.price || 10000,
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

    const handleInstantActivate = async (product: any) => {
        if (paymentMethod !== "instant") {
            if (!utrNumber || utrNumber.trim().length < 6) {
                toast.error("Please enter your 12-digit UPI UTR or Bank Reference number to confirm payment.");
                return;
            }
        }
        const isFiAlgo = product.name?.includes("FiAlgo") || product.id?.includes("fialgo");
        const prefix = isFiAlgo ? "FIALGO-V1" : product.name?.includes("Scalper") ? "SCALP" : product.name?.includes("Swing") ? "SWING" : product.name?.includes("HFT") ? "HFT" : "GRID";
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const key = isFiAlgo 
            ? `FIALGO-V1-${randomHex}-${Date.now().toString().slice(-4)}`
            : `TRDF-${prefix}-${randomHex}-${Date.now().toString().slice(-4)}`;
        setGeneratedLicenseKey(key);
        setPurchasedItems(prev => {
            const updated = Array.from(new Set([...prev, product.id]));
            try {
                localStorage.setItem("tradifive_purchased_algos", JSON.stringify(updated));
                localStorage.setItem(`tradifive_license_${product.id}`, key);
                localStorage.setItem(`tradifive_license_utr_${product.id}`, utrNumber.trim());
            } catch {
                // Ignore storage errors
            }
            return updated;
        });

        // Record order in Supabase
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                await supabase.from('creator_orders').insert({
                    product_id: product.id,
                    buyer_id: currentUser.id,
                    amount: product.price || 10000,
                    status: 'completed',
                    payment_method: paymentMethod,
                    utr_number: utrNumber.trim() || 'DEV_SANDBOX_KEY',
                    license_key: key
                });
            }
        } catch (dbErr) {
            console.warn("Order recording fallback:", dbErr);
        }

        setPurchaseStep("activated");
        toast.success(`🎉 ${product.name} license successfully activated! Key: ${key}`);
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
        } catch {
            // Proof upload fallback when storage bucket unavailable
        }
        
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
        if (!user?.id) {
            toast.error("Please log in to follow traders");
            return;
        }

        const isCurrentlyFollowing = addedUsers.includes(id);

        if (isCurrentlyFollowing) {
            // Unfollow
            setAddedUsers(prev => prev.filter(uId => uId !== id));
            setFollowDeltas(prev => ({
                ...prev,
                [id]: (prev[id] || 0) - 1,
            }));
            const { error } = await supabase
                .from('social_follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', id);
            if (error) {
                console.error("Unfollow error:", error);
            } else {
                toast.info("Unfollowed trader");
            }
        } else {
            // Follow
            setAddedUsers(prev => [...prev, id]);
            setFollowDeltas(prev => ({
                ...prev,
                [id]: (prev[id] || 0) + 1,
            }));
            const { error } = await supabase
                .from('social_follows')
                .insert([{ follower_id: user.id, following_id: id }]);
            if (error) {
                console.error("Follow error:", error);
            } else {
                toast.success("Following trader");
                // Trigger real-time follower notification
                const myName = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'A trader';
                const myUsername = user.user_metadata?.username || user.email?.split('@')[0];
                const myAvatar = user.user_metadata?.avatar_url || null;

                supabase.from('notifications').insert([{
                    user_id: id,
                    type: 'FOLLOW',
                    title: 'New Follower',
                    message: `${myName} started following you!`,
                    priority: 'normal',
                    is_read: false,
                    metadata: {
                        sender_id: user.id,
                        sender_username: myUsername,
                        sender_name: myName,
                        sender_avatar: myAvatar,
                        action: 'follow_back'
                    }
                }]).then(() => {});
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
            onlineCount: 0,
            memberCount: (c as any).memberCount || c.member_count || 1,
            description: c.description || "Official Tradifive communication channel.",
            icon: c.icon || "C",
            avatar_url: (c as any).avatar_url || c.avatar_url || null,
            cover_url: (c as any).cover_url || c.cover_url || fallbackCovers[charCodeSum % fallbackCovers.length],
            locked: c.channel_type === "private" || c.channel_type === "premium"
        };
    }), [channels]);

    const finalTraders = useMemo(() => traders
        .filter(t => {
            const name = ((t as any).display_name || t.full_name || t.username || '').trim().toLowerCase();
            return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
        })
        .map((t, idx) => {
            const name = (t as any).display_name || t.full_name || t.username || "Active Trader";
            const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return {
                id: t.id,
                name: name,
                username: t.username || t.id,
                avatar: t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
                winRate: t.win_rate ? `${t.win_rate}%` : "-",
                profit: t.roi_all_time ? `${t.roi_all_time >= 0 ? '+' : ''}${t.roi_all_time}%` : "-",
                onlineCount: (charCodeSum * 17) % 300 + 5,
                memberCount: (charCodeSum * 31) % 1500 + 50,
                rank: idx + 1
            };
        }), [traders]);

    const finalPeople = useMemo(() => people
        .filter(p => p && p.id)
        .map((p) => {
            const rawName = ((p as any).display_name || p.full_name || (p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : null) || '').trim();
            const isPlaceholder = !rawName || PLACEHOLDER_NAMES.includes(rawName.toLowerCase());
            const name = isPlaceholder ? (p.username || "Trader " + p.id.slice(0, 4)) : rawName;
            const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            const joinedDate = p.created_at ? new Date(p.created_at) : null;
            const joinedFormatted = joinedDate
                ? `Joined ${joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                : 'Community Trader';

            const rawWinRate = p.win_rate;
            const rawRoi = p.roi_all_time;
            const hasRealStats = Boolean((rawWinRate && rawWinRate > 0) || (rawRoi !== null && rawRoi !== undefined && rawRoi !== 0));

            // Community social stats: Following & Followers (real DB counts from social_follows)
            const baseFollowers = Number((p as any).followers_count ?? 0);
            const baseFollowing = Number((p as any).following_count ?? 0);
            const delta = followDeltas[p.id] || 0;
            const followersCount = Math.max(0, baseFollowers + delta);
            const followingCount = Math.max(0, baseFollowing);

            const formatStatNum = (n: number) => {
                if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
                return `${n}`;
            };

            const followersFormatted = formatStatNum(followersCount);
            const followingFormatted = formatStatNum(followingCount);

            const rawStyle = (p as any).trading_style;
            let userTags: string[] = [];
            if (rawStyle && rawStyle !== 'Discipline Trader') {
                const parts = String(rawStyle).split(',').map((s: string) => s.trim()).filter(Boolean);
                if (parts.length > 0) {
                    userTags = parts;
                }
            }
            if (userTags.length === 0) {
                const fallbackStyles = ['Day trading', 'SMC', 'Price Action', 'Swing trading', 'Scalping'];
                userTags = [fallbackStyles[charCodeSum % fallbackStyles.length]];
            }
            const cleanTradingStyle = userTags[0];

            const displaySubtitle = p.username ? `@${p.username} · ${cleanTradingStyle}` : cleanTradingStyle;

            const rawSocial = getMergedSocialLinks(p as any);
            const normalizedSocial = {
                instagram: rawSocial.instagram ? (rawSocial.instagram.startsWith('http') ? rawSocial.instagram : `https://instagram.com/${rawSocial.instagram.replace(/^@/, '')}`) : '',
                youtube: rawSocial.youtube ? (rawSocial.youtube.startsWith('http') ? rawSocial.youtube : `https://youtube.com/@${rawSocial.youtube.replace(/^@/, '')}`) : '',
                twitter: rawSocial.twitter ? (rawSocial.twitter.startsWith('http') ? rawSocial.twitter : `https://x.com/${rawSocial.twitter.replace(/^@/, '')}`) : '',
                website: rawSocial.website ? (rawSocial.website.startsWith('http') ? rawSocial.website : `https://${rawSocial.website}`) : '',
                discord: rawSocial.discord || '',
            };
            const hasSocials = Boolean(normalizedSocial.instagram || normalizedSocial.youtube || normalizedSocial.twitter || normalizedSocial.website || normalizedSocial.discord);

            const cleanSlug = (p.username ? String(p.username).trim().replace(/^@+/, '') : '') || p.id;

            return {
                id: p.id,
                name: name,
                username: p.username || p.id,
                userSlug: cleanSlug,
                handle: p.username ? `@${p.username}` : `@${name.replace(/\s+/g, '').toLowerCase()}`,
                avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
                cover_url: p.banner_url || (p as any).cover_url || '',
                followingFormatted,
                followersFormatted,
                tradingStyle: cleanTradingStyle,
                userTags,
                displaySubtitle,
                socialLinks: normalizedSocial,
                hasSocials,
                joinedFormatted,
                is_pro: Boolean(p.is_pro),
                total_trades: (p as any).total_trades || 0,
                onlineCount: (charCodeSum * 19) % 200 + 1,
                memberCount: 0,
                mutual: (charCodeSum * 7) % 15
            };
        }), [people, followDeltas]);

    function DiscoverCardsSkeleton() {
        return (
            <div className="space-y-4">
                <div className="h-6 w-36 bg-slate-200/80 dark:bg-white/[0.08] rounded-md animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div 
                            key={i} 
                            className="bg-white dark:bg-[#1A1A1E] rounded-[20px] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden animate-pulse h-[260px]"
                        >
                            {/* Shimmer cover */}
                            <div className="w-full h-24 sm:h-26 bg-slate-200/70 dark:bg-white/[0.04] relative shrink-0" />
                            <div className="px-4 pb-4 pt-0 flex-1 flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="flex items-end justify-between -mt-6 mb-2.5">
                                        <div className="w-11 h-11 rounded-full ring-[3px] ring-white dark:ring-[#1A1A1E] bg-slate-300 dark:bg-white/[0.08] shrink-0" />
                                    </div>
                                    <div className="h-4 w-3/4 bg-slate-200/80 dark:bg-white/[0.08] rounded-md mb-2" />
                                    <div className="h-3 w-1/2 bg-slate-200/60 dark:bg-white/[0.05] rounded-md" />
                                </div>
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                                    <div className="h-3 w-1/3 bg-slate-200/60 dark:bg-white/[0.05] rounded" />
                                    <div className="h-7 w-20 ml-auto bg-slate-200/80 dark:bg-white/[0.08] rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const renderAlgoCard = (algo: MarketplaceProduct, isFlagshipOverride?: boolean) => {
        const isPurchased = purchasedItems.includes(algo.id);
        const isFlagship = isFlagshipOverride ?? (algo.id === "algo-fialgo-v1" || algo.name === "FiAlgo V1");

        return (
            <div
                key={algo.id}
                className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative group min-h-[440px] bg-white dark:bg-[#151518] border ${
                    isFlagship
                        ? "border-amber-500/35 dark:border-amber-400/30 shadow-[0_2px_16px_rgba(245,158,11,0.06)] hover:border-amber-500/60 dark:hover:border-amber-400/50"
                        : "border-slate-200/90 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:hover:border-white/20"
                } hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5`}
            >
                <div>
                    {/* Top Row: Refined Single Flagship Badge & Star Rating */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-1.5">
                            {isFlagship ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                                    <Sparkles size={11} className="text-amber-500 fill-amber-500" />
                                    Flagship EA
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/10">
                                    {algo.badge || algo.category}
                                </span>
                            )}
                        </div>
                        {algo.rating && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                                <Star size={11.5} className="text-amber-400 fill-amber-400" />
                                <span className="font-bold text-slate-900 dark:text-white">{algo.rating}</span>
                                {algo.reviewsCount && (
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">({algo.reviewsCount})</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Product Box Art & Title */}
                    <div className="flex items-start gap-3 mb-3.5">
                        {getAlgoVisual(algo)}
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {algo.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-zinc-400 mt-1 flex-wrap">
                                <span className="font-medium text-slate-700 dark:text-zinc-300">by {algo.creatorName}</span>
                                <VerifiedBadge />
                                {algo.version && (
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">· {algo.version}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Instrument & Timeframe Specs Strip */}
                    {algo.pairs && (
                        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] mb-3">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                {algo.pairs.map(p => (
                                    <span key={p} className="inline-flex items-center gap-1 text-[10.5px] font-mono font-medium text-slate-700 dark:text-zinc-300 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {p}
                                    </span>
                                ))}
                            </div>
                            {algo.timeframe && (
                                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 shrink-0 uppercase tracking-tight">
                                    {algo.timeframe}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Metrics 3-tile Row (Institutional Segmented Box) */}
                    <div className="grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-white/[0.06] rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.05] mb-3 text-center overflow-hidden">
                        <div className="py-2 px-1">
                            <div className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 mb-0.5">
                                WIN RATE
                            </div>
                            <div className="text-[13px] font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {algo.winRate || "—"}
                            </div>
                        </div>
                        <div className="py-2 px-1">
                            <div className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 mb-0.5">
                                AVG RETURN
                            </div>
                            <div className="text-[13px] font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                                {algo.monthlyReturn || "—"}
                            </div>
                        </div>
                        <div className="py-2 px-1">
                            <div className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 mb-0.5">
                                MAX DD
                            </div>
                            <div className="text-[13px] font-bold font-mono text-slate-600 dark:text-zinc-400 tabular-nums">
                                {algo.drawdown || "—"}
                            </div>
                        </div>
                    </div>

                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[36px]">
                        {algo.description}
                    </p>
                </div>

                {/* Price & Action Footer */}
                <div className="pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between mt-auto gap-2">
                    <div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block leading-none mb-1">
                            Lifetime License
                        </span>
                        <div className="text-[17px] font-bold font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline gap-0.5">
                            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">{algo.currency || "₹"}</span>
                            <span>{Number(algo.price || 10000).toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setDetailsModalProduct(algo)}
                            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] text-slate-700 dark:text-zinc-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                            title="Inspect algorithm details"
                        >
                            <Eye size={12.5} />
                            <span>Details</span>
                        </button>

                        {isPurchased ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setPurchaseModalProduct(algo);
                                    setPurchaseStep("activated");
                                    const isFiAlgo = algo.name?.includes("FiAlgo") || algo.id?.includes("fialgo");
                                    const prefix = isFiAlgo ? "FIALGO-V1" : algo.name?.includes("Scalper") ? "SCALP" : algo.name?.includes("Swing") ? "SWING" : algo.name?.includes("HFT") ? "HFT" : "GRID";
                                    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
                                    setGeneratedLicenseKey(isFiAlgo ? `FIALGO-V1-${randomHex}-${Date.now().toString().slice(-4)}` : `TRDF-${prefix}-${randomHex}-${Date.now().toString().slice(-4)}`);
                                }}
                                className="h-8 px-3.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 select-none"
                            >
                                <Check size={13} strokeWidth={2.5} />
                                <span>Active</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handlePurchase(algo)}
                                className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-950 text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border border-transparent select-none"
                            >
                                <span>Buy</span>
                                <ArrowRight size={12.5} strokeWidth={2.2} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const isColdLoading = loading && finalPeople.length === 0 && finalMentors.length === 0 && channels.length === 0 && finalTraders.length === 0;

    return (
        <CommunityPageWrapper breadcrumbs={[{ label: "Discover", path: "/discover" }]} noPadding={true} noScroll={true}>
            <div className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 relative">
                {/* 1. DISCORD TOP BAR NAVIGATION (STICKY) */}
                <div className="w-full flex justify-center sticky top-0 z-50 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-[#1C1C21]/80 backdrop-blur-md">
                    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row md:items-stretch justify-between gap-4">
                        {/* Left side category tabs */}
                        <div className="flex items-stretch gap-6 overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-base shrink-0 select-none py-3 pr-2">
                                <IconlyDiscovery set="curved" primaryColor="currentColor" size={20} className="text-slate-800 dark:text-slate-200" stroke="bold" />
                                <span className="tracking-tight text-[16px] font-black" >Discover</span>
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
                <div className="w-full bg-gradient-to-br from-[#ECEDF2] to-[#E2E4FB] dark:bg-none dark:bg-[#1E1E1E] relative overflow-hidden border-b border-slate-200/60 dark:border-white/5">
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
                                        Find your trading circle <br />on TradiFive
                                    </h1>
                                    <p className="text-base md:text-[17px] text-[#4E5058] dark:text-[#B5BAC1] max-w-xl leading-relaxed font-medium">
                                        From forex, commodities, and index scalping to verified MQL5 systems — explore active traders, trusted channels, and expert mentors across TradiFive.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mt-4 space-y-8">

                    {/* Search Results Section */}
                    <AnimatePresence>
                        {searchQuery.trim() && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-4"
                            >
                                {/* Clean Unboxed Header */}
                                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.07] pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">
                                            Search Results
                                        </h2>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 text-[11.5px] font-medium tabular-nums">
                                            {searching ? "Searching..." : `${searchResults.length} found`}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="text-[12px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                </div>

                                {searching ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.07] flex items-center gap-3 animate-pulse">
                                                <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-3.5 w-28 bg-slate-200 dark:bg-white/10 rounded" />
                                                    <div className="h-2.5 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="py-12 px-6 text-center rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/75 dark:border-white/[0.07]">
                                        <p className="text-[14px] font-semibold text-slate-800 dark:text-zinc-200">
                                            No traders found for &ldquo;{searchQuery.trim()}&rdquo;
                                        </p>
                                        <p className="text-[12px] text-slate-400 dark:text-zinc-500 mt-1">
                                            Try searching by a different name or @username.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {searchResults.map(profile => {
                                            const displayName = (profile as any).display_name || profile.full_name || profile.username || "Active User";
                                            const displaySlug = profile.username || profile.id;
                                            const displayHandle = profile.username ? `@${profile.username}` : "Trader";
                                            return (
                                                <Link
                                                    key={profile.id}
                                                    to={`/user/${displaySlug}`}
                                                    className="bg-white dark:bg-[#17171A] p-3.5 rounded-2xl border border-slate-200/85 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/60 dark:hover:bg-white/[0.03] shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:shadow-none transition-all flex items-center justify-between gap-3 group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <img
                                                            src={profile.avatar_url || "/default-avatar.svg"}
                                                            alt={displayName}
                                                            className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-zinc-800"
                                                            onError={handleImageError}
                                                        />
                                                        <div className="min-w-0">
                                                            <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate leading-snug">
                                                                {displayName}
                                                            </h3>
                                                            <p className="text-[12px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                                                                {displayHandle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[11.5px] font-medium text-slate-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200 transition-colors shrink-0 pr-1">
                                                        View →
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Cold Loading Updated Skeleton (Only if data is taking time on very first cold fetch) */}
                    {isColdLoading && !searchQuery && (
                        <div className="py-2">
                            <DiscoverCardsSkeleton />
                        </div>
                    )}

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
                    {!isColdLoading && (activeTab === "All" || activeTab === "People") && !searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        People
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                        Active traders and community members across TradiFive
                                    </p>
                                </div>
                                {activeTab === "All" && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("People")}
                                        className="h-8 px-3.5 rounded-full tactile-white-pill text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                                    >
                                        <span>View all people</span>
                                        <ArrowRight size={13} strokeWidth={2.2} className="shrink-0" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {finalPeople.map((person) => {
                                    const userSlug = person.userSlug || person.username || person.id;
                                    return (
                                        <div
                                            key={person.id}
                                            onClick={() => navigate(`/user/${userSlug}`)}
                                            className="group bg-white dark:bg-[#1A1A1E] rounded-[20px] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                                        >
                                            {/* Cover Banner (User-uploaded cover photo only, or clean empty surface) */}
                                            <div className={`relative w-full h-24 sm:h-26 overflow-hidden shrink-0 rounded-t-[20px] ${
                                                person.cover_url
                                                    ? 'bg-slate-900'
                                                    : 'bg-slate-100/90 dark:bg-white/[0.04] border-b border-slate-200/50 dark:border-white/[0.05]'
                                            }`}>
                                                {person.cover_url && (
                                                    <>
                                                        <img
                                                            src={person.cover_url}
                                                            alt={person.name}
                                                            className="w-full h-full object-cover select-none"
                                                        />
                                                        {/* Soft bottom gradient fog scrim seamlessly blending into card body */}
                                                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-[#1A1A1E] dark:via-[#1A1A1E]/60 dark:to-transparent pointer-events-none" />
                                                    </>
                                                )}

                                                {/* Floating Frosted Bookmark Button (Slightly smaller, refined & tactile) */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleToggleSaveTrader(e, person.id)}
                                                    className={`absolute top-2.5 right-2.5 w-[34px] h-[34px] rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow hover:scale-105 active:scale-90 ${
                                                        savedTraders.includes(person.id)
                                                            ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-300 shadow-md scale-105'
                                                            : person.cover_url
                                                            ? 'bg-black/35 hover:bg-black/55 text-white border-white/40'
                                                            : 'bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-slate-700 dark:text-zinc-200 border-slate-200/80 dark:border-white/10'
                                                    }`}
                                                    title={savedTraders.includes(person.id) ? "Saved trader" : "Bookmark trader"}
                                                >
                                                    <Bookmark
                                                        size={15}
                                                        strokeWidth={2.2}
                                                        className={
                                                            savedTraders.includes(person.id)
                                                                ? "fill-white text-white"
                                                                : person.cover_url
                                                                ? "fill-transparent text-white"
                                                                : "fill-transparent text-slate-600 dark:text-zinc-300"
                                                        }
                                                    />
                                                </button>
                                            </div>

                                            {/* Card Body (Compact & Elegant) */}
                                            <div className="px-4 pt-0 pb-3.5 flex-1 flex flex-col justify-between relative z-10">
                                                <div>
                                                    {/* Top Row: Overlapping Avatar + Social Links (Moved higher & smaller) */}
                                                    <div className="flex items-end justify-between -mt-7 mb-2">
                                                        <div className="relative shrink-0 block group/avatar">
                                                            <img
                                                                src={person.avatar || '/default-avatar.svg'}
                                                                alt={person.name}
                                                                className="w-11 h-11 rounded-full object-cover ring-[3px] ring-white dark:ring-[#1A1A1E] bg-slate-100 dark:bg-white/10 shadow-md group-hover/avatar:ring-blue-200 dark:group-hover/avatar:ring-blue-900/40 transition-all"
                                                                onError={handleImageError}
                                                            />
                                                            {person.is_pro && (
                                                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[8px] font-black shadow-xs ring-1.5 ring-white dark:ring-[#1A1A1E]" title="Verified Pro Trader">
                                                                    ★
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Right side: User Social Links (Instagram, YouTube, Twitter/X, Website) if present */}
                                                        {person.hasSocials && (
                                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-slate-200/60 dark:border-white/10 transition-colors shadow-2xs">
                                                                {person.socialLinks.instagram && (
                                                                    <a
                                                                        href={person.socialLinks.instagram}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-white/20 text-slate-700 dark:text-zinc-200 hover:text-pink-600 dark:hover:text-pink-400 flex items-center justify-center transition-all"
                                                                        title="Instagram"
                                                                    >
                                                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                                                                            <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                                                                            <circle cx="12" cy="12" r="4.2" />
                                                                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                                                        </svg>
                                                                    </a>
                                                                )}
                                                                {person.socialLinks.youtube && (
                                                                    <a
                                                                        href={person.socialLinks.youtube}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-white/20 text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all"
                                                                        title="YouTube"
                                                                    >
                                                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                                        </svg>
                                                                    </a>
                                                                )}
                                                                {person.socialLinks.twitter && (
                                                                    <a
                                                                        href={person.socialLinks.twitter}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-white/20 text-slate-700 dark:text-zinc-200 hover:text-black dark:hover:text-white flex items-center justify-center transition-all"
                                                                        title="Twitter / X"
                                                                    >
                                                                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                                                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                                        </svg>
                                                                    </a>
                                                                )}
                                                                {person.socialLinks.website && (
                                                                    <a
                                                                        href={person.socialLinks.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="w-6 h-6 rounded-full hover:bg-white dark:hover:bg-white/20 text-slate-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all"
                                                                        title="Website"
                                                                    >
                                                                        <Globe size={14} strokeWidth={2.2} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Trader Name & Badges */}
                                                    <div className="mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="text-[14.5px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                                {person.name}
                                                            </div>
                                                            {person.is_pro && <VerifiedBadge />}
                                                        </div>

                                                        {/* Username + Signup Tags (Trading style / Edge tags selected at signup or updated in Settings) */}
                                                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                            <span className="text-[11.5px] font-medium text-slate-400 dark:text-zinc-400">
                                                                {person.handle}
                                                            </span>
                                                            {person.userTags && person.userTags.slice(0, 2).map((tag: string, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-medium bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-zinc-300 border border-slate-200/60 dark:border-white/10"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Following & Followers on left + Follow Pill Button on right */}
                                                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] mt-auto">
                                                    {/* Following & Followers counts with subtle vertical divider */}
                                                    <div className="flex items-center gap-2.5 shrink-0">
                                                        {/* Following */}
                                                        <div className="text-left">
                                                            <div className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                                                                {person.followingFormatted}
                                                            </div>
                                                            <span className="text-[9.5px] text-slate-400 dark:text-zinc-400 lowercase block mt-1 leading-none">
                                                                following
                                                            </span>
                                                        </div>

                                                        <div className="w-[1px] h-4.5 bg-slate-200/80 dark:bg-white/10 shrink-0 mx-0.5" />

                                                        {/* Followers */}
                                                        <div className="text-left">
                                                            <div className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums leading-none">
                                                                {person.followersFormatted}
                                                            </div>
                                                            <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 lowercase block mt-1 leading-none">
                                                                followers
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right side: Follow / Following Black Tactile Pill Button (Matching user design) */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleAddUser(e, person.id);
                                                        }}
                                                        className={`h-8 px-3.5 rounded-full text-[12px] font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap active:scale-95 ${
                                                            addedUsers.includes(person.id)
                                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-slate-200/90 dark:border-white/15 shadow-2xs'
                                                                : 'bg-[#121214] hover:bg-black text-white dark:bg-white dark:text-[#121214] dark:hover:bg-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-white/10 dark:border-transparent'
                                                        }`}
                                                        title={addedUsers.includes(person.id) ? "Following trader" : "Follow trader"}
                                                    >
                                                        {addedUsers.includes(person.id) ? (
                                                            <>
                                                                <Check size={13} strokeWidth={2.4} className="text-emerald-500 shrink-0" />
                                                                <span>Following</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus size={13} strokeWidth={2.4} className="shrink-0" />
                                                                <span>Follow</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Featured Trading Algorithms & Strategies (Preview on All tab) */}
                    {(activeTab === "All") && !searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/10">
                                            Institutional Algos & Strategies
                                        </span>
                                        <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-zinc-400">
                                            MT5 Certified · Lifetime License
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        Featured Trading Algorithms & Strategies
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("Marketplace")}
                                    className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] text-slate-700 dark:text-zinc-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto shrink-0 shadow-xs select-none"
                                >
                                    <span>Browse Marketplace</span>
                                    <ArrowRight size={13} strokeWidth={2.2} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {EXISTING_OFFICIAL_ALGOS.map((algo) => renderAlgoCard(algo))}
                            </div>
                        </motion.div>
                    )}

                    {/* Featured Channels heading / Mentors */}
                    {(activeTab === "All" || activeTab === "Mentors") && !searchQuery && finalMentors.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        Featured Mentors
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                        Verified trading educators and top signal providers
                                    </p>
                                </div>
                                {activeTab === "All" && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("Mentors")}
                                        className="h-8 px-3.5 rounded-full tactile-white-pill text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                                    >
                                        <span>View all mentors</span>
                                        <ArrowRight size={13} strokeWidth={2.2} className="shrink-0" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {finalMentors.slice(0, 8).map((mentor) => {
                                    const userSlug = mentor.username;
                                    return (
                                        <div
                                            key={mentor.id}
                                            className="group bg-white dark:bg-[#1A1A1E] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-[320px] relative"
                                        >
                                            {(!mentor.cover_url || mentor.cover_url === '/default-cover.png') ? (
                                                <div className="h-[110px] w-full relative shrink-0 bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 dark:text-zinc-500 border-b border-slate-200/70 dark:border-white/[0.06]">
                                                    <Camera size={24} className="opacity-40" />
                                                </div>
                                            ) : (
                                                <div
                                                    className="h-[110px] w-full relative shrink-0 border-b border-slate-200/70 dark:border-white/[0.06]"
                                                    style={{ background: `url(${mentor.cover_url}) center/cover no-repeat` }}
                                                />
                                            )}

                                            {/* Circular Overlapping Avatar */}
                                            <div className="absolute left-4 top-[86px] w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-[#1A1A1E] ring-4 ring-white dark:ring-[#1A1A1E] shadow-xs z-20">
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
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {mentor.name}
                                                        </span>
                                                        {mentor.verified && <VerifiedBadge />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                        {mentor.title}
                                                    </p>
                                                </div>

                                                {/* Stats Footer Row */}
                                                <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                                                    <FollowButton
                                                        isFollowing={addedUsers.includes(mentor.id)}
                                                        onToggleFollow={(e) => handleAddUser(e, mentor.id)}
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
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12 pt-2 sm:pt-4">
                            {/* Marketplace Filters Dock (Consistent Tactile Segmented Style, No Clipping) */}
                            <div className="pt-2 pb-1">
                                <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-white/[0.04] rounded-2xl border border-slate-200/70 dark:border-white/5 overflow-x-auto no-scrollbar max-w-full shadow-2xs">
                                    {['All', 'Algo', 'Strategy', 'Indicator', 'Mentorship'].map(cat => {
                                        const count = cat === 'All' ? storeListings.length : storeListings.filter(l => l.category === cat).length;
                                        const isSel = marketplaceFilter === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setMarketplaceFilter(cat)}
                                                className={`h-[34px] px-3.5 sm:px-4 rounded-xl text-xs font-semibold select-none inline-flex items-center gap-2 transition-all shrink-0 cursor-pointer active:scale-95 ${
                                                    isSel
                                                        ? 'bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-xs font-bold'
                                                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <span>{cat}</span>
                                                {count > 0 && (
                                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold tabular-nums ${
                                                        isSel 
                                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                                                            : 'bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-zinc-300'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Algos Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {storeListings.filter(l => marketplaceFilter === 'All' || l.category === marketplaceFilter).length === 0 ? (
                                    <div className="py-14 px-6 max-w-md mx-auto my-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] shadow-2xs text-center col-span-full">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white mx-auto mb-3 shadow-2xs">
                                            <Cpu size={20} className="text-slate-500 dark:text-zinc-400" />
                                        </div>
                                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                                            No {marketplaceFilter} Listed Yet
                                        </h3>
                                        <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                                            There are currently no verified community items under this category.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setMarketplaceFilter('All')}
                                            className="mt-4 h-8 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                                        >
                                            <span>View All Products</span>
                                        </button>
                                    </div>
                                ) : (
                                    storeListings.filter(l => marketplaceFilter === 'All' || l.category === marketplaceFilter).map((product) => renderAlgoCard(product))
                                )}
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
                                    {getAlgoVisual(detailsModalProduct)}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/10">
                                                {detailsModalProduct.category || "Algo"}
                                            </span>
                                            {detailsModalProduct.badge && (
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                    {detailsModalProduct.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
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
                                <h4 className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                    Verified Metrics & Specs
                                </h4>
                                <div className="grid grid-cols-3 gap-2.5">
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">WIN RATE</div>
                                        <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                                            {detailsModalProduct.winRate || "73%"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">AVG MONTHLY</div>
                                        <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 tabular-nums">
                                            {detailsModalProduct.monthlyReturn || "+18–42%"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">MAX DRAWDOWN</div>
                                        <div className="text-base font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5 tabular-nums">
                                            {detailsModalProduct.drawdown || "3.2%"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">PAIRS</div>
                                        <div className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-1">
                                            {detailsModalProduct.pairs ? (Array.isArray(detailsModalProduct.pairs) ? detailsModalProduct.pairs.join(", ") : detailsModalProduct.pairs) : "XAUUSD"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">TIMEFRAME</div>
                                        <div className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-1">
                                            {detailsModalProduct.timeframe || "M15 / H1"}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-center">
                                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">PLATFORM</div>
                                        <div className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-1">
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
                                        {detailsModalProduct.currency || "₹"}{Number(detailsModalProduct.price || 10000).toLocaleString("en-IN")}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDetailsModalProduct(null)}
                                        className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
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
                                                setGeneratedLicenseKey(isFiAlgo ? `FIALGO-V1-${randomHex}-${Date.now().toString().slice(-4)}` : `TRDF-${prefix}-${randomHex}-${Date.now().toString().slice(-4)}`);
                                            }}
                                            className="h-10 px-5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
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
                                            className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-950 text-xs font-bold shadow-sm transition-all active:scale-[0.985] flex items-center gap-2 cursor-pointer border-none"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setPurchaseModalProduct(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-white dark:bg-[#121215] rounded-[28px] p-5 sm:p-7 w-full max-w-lg shadow-[0_25px_70px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-white/10 flex flex-col gap-5 z-10 max-h-[92vh] overflow-y-auto"
                        >
                            {purchaseStep === "activated" ? (
                                /* Activation Success Screen */
                                <div className="space-y-5 text-center py-3">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                        <Check size={32} strokeWidth={3} />
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                            ✓ License Provisioned & Verified
                                        </span>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                                            {purchaseModalProduct.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                                            Your master license for 1 MT5 Live Terminal and unlimited demo accounts is now active.
                                        </p>
                                    </div>

                                    {/* Generated License Key Box */}
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-left space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">YOUR MASTER LICENSE KEY</span>
                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <code className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400 font-mono tracking-wider select-all">
                                                {generatedLicenseKey}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedLicenseKey);
                                                    setCopiedKey(true);
                                                    toast.success("License key copied!");
                                                    setTimeout(() => setCopiedKey(false), 2000);
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                                            >
                                                {copiedKey ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                                                <span>{copiedKey ? "Copied" : "Copy"}</span>
                                            </button>
                                        </div>
                                        {utrNumber && (
                                            <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                                                <span>UTR Reference:</span>
                                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-300">{utrNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons for Activated State */}
                                    <div className="flex flex-col gap-2.5 pt-1">
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <a
                                                href="/FIALGO_V1.ex5"
                                                download="FIALGO_V1.ex5"
                                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                            >
                                                <Download size={14} />
                                                <span>Download EA (.ex5)</span>
                                            </a>
                                            <button
                                                onClick={() => {
                                                    const receiptText = `TRADIFIVE ALGO LICENSE CERTIFICATE\n===================================\nProduct: ${purchaseModalProduct.name}\nLicense Key: ${generatedLicenseKey}\nStatus: ACTIVE / PROVISIONED\nEntitlement: 1 Live MT5 Terminal + Unlimited Demo\nIssued To: ${user?.email || 'Registered User'}\nUTR / Ref: ${utrNumber || 'INSTANT_PROVISION'}\nIssued At: ${new Date().toLocaleString()}\nGateway: London LD4 Ultra-Low Latency\n===================================\nMT5 Installation: Copy .ex5 to MQL5/Experts folder, attach to XAUUSD chart, and paste Master License Key in EA inputs.`;
                                                    const element = document.createElement("a");
                                                    const file = new Blob([receiptText], { type: 'text/plain' });
                                                    element.href = URL.createObjectURL(file);
                                                    element.download = `TRADIFIVE_${purchaseModalProduct.name.replace(/\s+/g, '_')}_LICENSE.txt`;
                                                    document.body.appendChild(element);
                                                    element.click();
                                                    document.body.removeChild(element);
                                                    toast.success("License Certificate downloaded!");
                                                }}
                                                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                            >
                                                <Download size={14} />
                                                <span>Download Certificate</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <button
                                                onClick={() => {
                                                    setPurchaseModalProduct(null);
                                                    navigate('/auto-trade/license');
                                                }}
                                                className="w-full py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <KeyRound size={13} />
                                                <span>EA Setup Guide</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPurchaseModalProduct(null);
                                                    navigate('/order-history');
                                                }}
                                                className="w-full py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <span>View Order History</span>
                                            </button>
                                        </div>
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
                                            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{purchaseModalProduct.name}</h3>
                                        </div>
                                        <button onClick={() => setPurchaseModalProduct(null)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
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
                                            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                                {purchaseModalProduct.currency || "₹"}{Number(purchaseModalProduct.price || 10000).toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Includes 18% GST</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-blue-500/15 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                                            <ShieldCheck size={14} className="shrink-0 text-blue-500" />
                                            <span>Entitles 1 Live MT5 Account + Unlimited Demo + London LD4 VPS Gateway</span>
                                        </div>
                                    </div>

                                    {/* Payment Method Tabs */}
                                    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10">
                                        <button
                                            onClick={() => setPaymentMethod("upi")}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === "upi" ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
                                        >
                                            <QrCode size={13} className={paymentMethod === "upi" ? "text-blue-500" : ""} />
                                            <span>UPI / QR (Instant)</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("bank")}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === "bank" ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
                                        >
                                            <Landmark size={13} className={paymentMethod === "bank" ? "text-blue-500" : ""} />
                                            <span>Bank Transfer</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("instant")}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === "instant" ? "bg-white dark:bg-[#1E1E22] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"}`}
                                        >
                                            <Sparkles size={13} className={paymentMethod === "instant" ? "text-amber-500" : ""} />
                                            <span>Instant Test Key</span>
                                        </button>
                                    </div>

                                    {/* Payment Content based on method */}
                                    {paymentMethod === "upi" && (
                                        <div className="space-y-4">
                                            {/* UPI QR Code Container with Real Scanner Box */}
                                            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                                                
                                                {/* QR View Mode Selector */}
                                                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-black/40 rounded-full border border-slate-200 dark:border-white/10 mb-4 shadow-2xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => setQrDisplayMode("dynamic")}
                                                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                                            qrDisplayMode === "dynamic"
                                                            ? "bg-blue-600 text-white shadow-2xs"
                                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                        }`}
                                                    >
                                                        ⚡ Auto-Fill ₹{Number(purchaseModalProduct.price || 10000).toLocaleString("en-IN")} QR
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQrDisplayMode("official")}
                                                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                                            qrDisplayMode === "official"
                                                            ? "bg-blue-600 text-white shadow-2xs"
                                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                        }`}
                                                    >
                                                        Official Axis Merchant QR
                                                    </button>
                                                </div>

                                                {/* Real Scanner Viewfinder Frame */}
                                                <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 mb-3 group">
                                                    {/* Scanner Viewfinder Reticle Brackets */}
                                                    <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-blue-600 rounded-tl-md pointer-events-none" />
                                                    <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-blue-600 rounded-tr-md pointer-events-none" />
                                                    <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-blue-600 rounded-bl-md pointer-events-none" />
                                                    <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-blue-600 rounded-br-md pointer-events-none" />

                                                    {qrDisplayMode === "dynamic" ? (
                                                        <QRCodeSVG
                                                            value={`upi://pay?pa=9731980756@axisbank&pn=Nikhil%20Ravindra%20Harake&am=${Number(purchaseModalProduct.price || 10000)}&cu=INR&tn=${encodeURIComponent((purchaseModalProduct.name || 'FiAlgo V1') + ' License')}`}
                                                            size={175}
                                                            level="H"
                                                            includeMargin={true}
                                                            imageSettings={{
                                                                src: "/favicon.png",
                                                                x: undefined,
                                                                y: undefined,
                                                                height: 28,
                                                                width: 28,
                                                                excavate: true
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-[175px] h-[175px] flex items-center justify-center overflow-hidden rounded-xl">
                                                            <img
                                                                src="/upi-qr-code.png?v=2"
                                                                alt="Axis Bank UPI QR Code"
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Verified Merchant Badge */}
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-2.5">
                                                    <ShieldCheck size={14} className="text-emerald-500" />
                                                    <span>NPCI Verified Merchant Account · Zero Surcharge</span>
                                                </div>

                                                {/* Direct Pay via UPI App button (Mobile Friendly) */}
                                                <a
                                                    href={`upi://pay?pa=9731980756@axisbank&pn=Nikhil%20Ravindra%20Harake&am=${Number(purchaseModalProduct.price || 10000)}&cu=INR&tn=${encodeURIComponent((purchaseModalProduct.name || 'FiAlgo V1') + ' License')}`}
                                                    className="w-full max-w-sm py-2 px-3.5 mb-3 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                                                >
                                                    <Smartphone size={14} />
                                                    <span>Pay via UPI App (GPay / PhonePe / Paytm)</span>
                                                </a>

                                                {/* Supported Apps Badges */}
                                                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 mb-3">
                                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/20">PhonePe</span>
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/20">Google Pay</span>
                                                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/20">Paytm</span>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20">BHIM / CRED</span>
                                                </div>

                                                {/* Official UPI ID Copy Box */}
                                                <div className="flex items-center justify-between w-full max-w-sm bg-white dark:bg-[#161618] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
                                                    <div className="text-left">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">TradiFive Official UPI ID</span>
                                                        <code className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                                                            9731980756@axisbank
                                                        </code>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText("9731980756@axisbank");
                                                            setCopiedUpi(true);
                                                            toast.success("UPI ID copied: 9731980756@axisbank");
                                                            setTimeout(() => setCopiedUpi(false), 2000);
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all ml-3 shrink-0"
                                                    >
                                                        {copiedUpi ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                                                        <span>{copiedUpi ? "Copied" : "Copy"}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* UTR Input Form with Real-time Validation */}
                                            <div className="space-y-1.5 text-left">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                                        <span>UPI UTR / Reference Number</span>
                                                        <span className="text-rose-500">*</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowUtrHelp(!showUtrHelp)}
                                                        className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <HelpCircle size={12} />
                                                        <span>Where is UTR?</span>
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={utrNumber}
                                                        onChange={e => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                                                        placeholder="e.g. 429184920192 (12-digit UTR)"
                                                        maxLength={22}
                                                        className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border ${
                                                            utrNumber.trim().length >= 12 
                                                            ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20' 
                                                            : utrNumber.trim().length > 0 
                                                            ? 'border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/20' 
                                                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                                                        } text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20`}
                                                    />
                                                    {utrNumber.trim().length >= 12 && (
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 text-[11px] font-bold">
                                                            <CheckCircle2 size={14} /> 12-Digit Valid
                                                        </span>
                                                    )}
                                                </div>

                                                {showUtrHelp && (
                                                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-500/20 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                                                        <p className="font-bold text-blue-700 dark:text-blue-300">How to find your 12-digit UTR:</p>
                                                        <p>• <strong>PhonePe:</strong> Open History → Tap transaction → Look for <strong>"UTR: 429184920192"</strong></p>
                                                        <p>• <strong>Google Pay:</strong> Tap transaction → Look for <strong>"UPI transaction ID"</strong></p>
                                                        <p>• <strong>Paytm:</strong> Tap transaction → Look for <strong>"UPI Ref No"</strong></p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === "bank" && (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3 text-xs">
                                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                                                    <span className="text-slate-400">Account Name:</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">Nikhil Ravindra Harake</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                                                    <span className="text-slate-400">Bank Name:</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">Axis Bank Limited</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                                                    <span className="text-slate-400">Account Number:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-slate-900 dark:text-white">924010072811588</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText("924010072811588");
                                                                setCopiedAcc(true);
                                                                toast.success("Account number copied!");
                                                                setTimeout(() => setCopiedAcc(false), 2000);
                                                            }}
                                                            className="text-blue-500 hover:text-blue-600 text-[11px] font-bold cursor-pointer"
                                                        >
                                                            {copiedAcc ? "Copied" : "Copy"}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">IFSC Code:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">UTIB0001690</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText("UTIB0001690");
                                                                setCopiedIfsc(true);
                                                                toast.success("IFSC Code copied!");
                                                                setTimeout(() => setCopiedIfsc(false), 2000);
                                                            }}
                                                            className="text-blue-500 hover:text-blue-600 text-[11px] font-bold cursor-pointer"
                                                        >
                                                            {copiedIfsc ? "Copied" : "Copy"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bank Reference Number Input */}
                                            <div className="space-y-1.5 text-left">
                                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                                    <span>Bank Transfer Reference / UTR Number</span>
                                                    <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={utrNumber}
                                                    onChange={e => setUtrNumber(e.target.value)}
                                                    placeholder="e.g. AXIS004829182 / UTR from receipt"
                                                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === "instant" && (
                                        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 space-y-2 text-center">
                                            <Sparkles size={24} className="text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Developer Sandbox Activation</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                                                Provision a test master key for {purchaseModalProduct.name} immediately without payment processing to test EA integration on MT5 demo accounts.
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
        </CommunityPageWrapper>
    )
}
