import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Cpu, Camera, X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from 'sonner';
import { Search as IconlySearch, Lock as IconlyLock, AddUser as IconlyAddUser, Discovery as IconlyDiscovery, CloseSquare as IconlyCloseSquare, TicketStar as IconlyTicketStar } from "react-iconly";
import { supabase } from "@/lib/supabase";
import { useDiscoverData } from "@/hooks/useDiscoverData";

import { motion, AnimatePresence } from "framer-motion";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import { FollowButton } from "@/components/ui/FollowButton";
// --- STATIC CONSTANTS ---
const CATEGORIES = ["All", "Mentors", "People", "Marketplace", "Leaderboard"];
const PLACEHOLDER_NAMES = ['new trader', 'guest trader', 'demo trader', 'trader', 'guest'];

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
    <span className="inline-flex items-center justify-center bg-[#23A55A] text-white rounded-full w-4 h-4 shrink-0 select-none">
        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current">
            <path d="M4.5 9L1.5 6l1.2-1.2L4.5 6.6l4.8-4.8L10.5 3z" />
        </svg>
    </span>
);

export default function Discover() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [marketplaceFilter, setMarketplaceFilter] = useState("All");

    // Pull real store listings created via Creator MyStore
    const [storeListings, setStoreListings] = useState<any[]>([]);
    const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
    const [addedUsers, setAddedUsers] = useState<string[]>([]);
    const [joinedChannels, setJoinedChannels] = useState<string[]>([]);

    const [purchaseModalProduct, setPurchaseModalProduct] = useState<any>(null);
    const [creatorPaymentDetails, setCreatorPaymentDetails] = useState<any>(null);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [submittingPurchase, setSubmittingPurchase] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                navigate("/login");
            } else {
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
            }
        };
        checkUser();

        const fetchStoreData = async (userId: string) => {
            try {


                const { data: products } = await supabase.from('creator_products').select('*, creator:creator_id(display_name, full_name, username)').eq('status', 'active');
                if (products) {
                    setStoreListings(products.map(p => ({
                        id: p.id,
                        name: p.title,
                        category: p.product_type,
                        description: p.description,
                        price: p.price,
                        currency: p.currency || '$',
                        thumbnailUrl: p.thumbnail_url,
                        creatorId: p.creator_id,
                        creatorName: p.creator?.display_name || p.creator?.username || 'Creator'
                    })));
                }

                const { data: orders } = await supabase.from('creator_orders').select('product_id').eq('buyer_id', userId).in('status', ['pending', 'completed']);
                if (orders) setPurchasedItems(orders.map(o => o.product_id));
            } catch (e) {
                console.error("Store error:", e);
            }
        };
        
        supabase.auth.getUser().then(({data}) => {
            if(data.user) fetchStoreData(data.user.id);
        });
    }, [navigate]);

    const handlePurchase = async (product: any) => {
        setPurchaseModalProduct(product);
        setPaymentProofFile(null);
        setCreatorPaymentDetails(null);
        const { data } = await supabase.from('profiles').select('payment_qr_url, payment_details').eq('id', product.creatorId).single();
        if(data) setCreatorPaymentDetails(data);
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

                                    return (
                                        <button
                                            key={category}
                                            onClick={() => setActiveTab(category)}
                                            className={`relative px-3 flex items-center gap-1.5 text-sm font-semibold transition-all shrink-0 ${isActive
                                                    ? "text-slate-900 dark:text-white font-bold"
                                                    : "text-[#5C5E66] hover:text-slate-900 dark:text-[#B5BAC1] dark:hover:text-white"
                                                }`}
                                        >
                                            {isLeaderboard && <IconlyTicketStar set="curved" primaryColor="currentColor" size={13} className={isActive ? "text-amber-500" : "text-slate-400"} stroke="bold" />}
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
                            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 relative z-10">
                                <style>
                                    {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}
                                </style>
                                <h1 className="capitalize text-[32px] md:text-[48px] text-[#060607] dark:text-[#F2F3F5] leading-[1.05] mb-4 tracking-[-0.03em]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>
                                    Find your community <br />on Tradifive
                                </h1>
                                <p className="text-base md:text-[17px] text-[#4E5058] dark:text-[#B5BAC1] max-w-xl leading-relaxed font-medium">
                                    Discover top trading circles. Share alpha, debate market trends, and level up your financial journey together.
                                </p>
                            </div>
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


                    {/* Marketplace */}
                    {(activeTab === "Marketplace") && !searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
                            <div>
                                <h2 className="text-xl font-bold text-[#060607] dark:text-[#F2F3F5] mb-1">Creator Marketplace</h2>
                                <p className="text-[#4E5058] dark:text-[#B5BAC1] text-sm max-w-2xl">Browse premium content, custom bots, indicators, and mentorship programs from top creators.</p>
                            </div>

                            {/* Marketplace Filters */}
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                                {['All', 'Algo', 'Strategy', 'Indicator', 'Course', 'Mentorship', 'Subscription'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setMarketplaceFilter(cat)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${marketplaceFilter === cat
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                                                : 'bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-[#B5BAC1] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {storeListings.length === 0 ? (
                                <div className="relative w-full h-[280px] rounded-lg overflow-hidden bg-slate-900 border border-slate-700 dark:border-slate-800 shadow-sm flex items-center justify-center group mt-4">
                                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center group-hover:scale-[1.02] transition-transform duration-700"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                                    <div className="relative z-10 flex flex-col items-center text-center p-8">
                                        <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-5 text-white shadow-2xl">
                                            <IconlyLock set="curved" primaryColor="currentColor" size={24} />
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">Marketplace is Empty</h3>
                                        <p className="text-slate-300 font-semibold text-xs md:text-sm max-w-lg">Creators haven't listed any products yet. Be the first to list an item in Creator Hub!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {storeListings.filter(l => marketplaceFilter === 'All' || l.category === marketplaceFilter).map((product, idx) => {
                                        const isPurchased = purchasedItems.includes(product.id);

                                        return (
                                            <div key={product.id} className="relative group bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                                {/* Thumbnail */}
                                                <div className="h-[140px] w-full relative shrink-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
                                                    {product.thumbnailUrl ? (
                                                        <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <Cpu size={32} className="text-slate-400 opacity-50" />
                                                    )}

                                                    {/* Category Badge Floating */}
                                                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                                                        {product.category}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="p-4 flex flex-col flex-grow">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3 className="text-sm font-extrabold text-[#060607] dark:text-[#F2F3F5] line-clamp-2 leading-tight">
                                                            {product.name}
                                                        </h3>
                                                    </div>

                                                    <p className="text-xs text-[#4E5058] dark:text-[#B5BAC1] font-medium mb-3">
                                                        By <span className="text-blue-500 hover:underline cursor-pointer">@{product.creatorName}</span>
                                                    </p>

                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-grow">
                                                        {product.description}
                                                    </p>

                                                    {/* Price & Action Row */}
                                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                        <div className="text-sm font-black text-[#060607] dark:text-[#F2F3F5]">
                                                            {product.currency}{product.price.toFixed(2)}
                                                        </div>

                                                        {isPurchased ? (
                                                            <button disabled className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold cursor-default">
                                                                ✓ Purchased
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handlePurchase(product)}
                                                                className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-bold transition-colors shadow-sm shadow-blue-500/20"
                                                            >
                                                                Buy Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Purchase Modal */}
            <AnimatePresence>
                {purchaseModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPurchaseModalProduct(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Checkout</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{purchaseModalProduct.name}</p>
                                </div>
                                <button onClick={() => setPurchaseModalProduct(null)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">Total Due: {purchaseModalProduct.currency}{purchaseModalProduct.price}</p>
                                <p className="text-xs text-blue-500/80">Please pay the creator directly using the details below, then upload a screenshot of your payment.</p>
                            </div>

                            <div className="space-y-4">
                                {creatorPaymentDetails?.payment_qr_url && (
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scan to Pay</p>
                                        <img src={creatorPaymentDetails.payment_qr_url} alt="QR Code" className="w-48 h-48 rounded-xl border border-slate-200 dark:border-white/10" />
                                    </div>
                                )}

                                {creatorPaymentDetails?.payment_details && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Instructions</p>
                                        <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg text-sm text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10 whitespace-pre-wrap">
                                            {creatorPaymentDetails.payment_details}
                                        </div>
                                    </div>
                                )}

                                {(!creatorPaymentDetails?.payment_qr_url && !creatorPaymentDetails?.payment_details) && (
                                    <div className="text-center text-sm text-rose-500 bg-rose-500/10 p-4 rounded-xl">
                                        This creator hasn't set up payment details yet.
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 dark:border-white/10 pt-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Payment Screenshot</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setPaymentProofFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-500/10 dark:file:text-blue-400 text-slate-500"
                                />
                            </div>

                            <button
                                onClick={submitPurchaseProof}
                                disabled={submittingPurchase || (!creatorPaymentDetails?.payment_qr_url && !creatorPaymentDetails?.payment_details)}
                                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 mt-2"
                            >
                                {submittingPurchase ? 'Submitting...' : 'Submit Payment Proof'}
                            </button>
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
