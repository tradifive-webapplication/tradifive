import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
  DeviceEventEmitter,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  ShoppingBag,
  Star,
  TrendingUp,
  BookOpen,
  Bot,
  Users,
  Tag,
  PackageOpen,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Filter,
  Check,
  UserPlus,
  Trophy,
  Award,
  Medal,
  Activity,
  Cpu,
  Bell,
  ArrowLeft,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';
import { useStore } from '../store';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const hSelect = () => {
  try {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  } catch (e) {}
};

const hSuccess = () => {
  try {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {}
};

// CATEGORIES matching Web App Discover.tsx exactly
const CATEGORIES = ['All', 'Marketplace', 'Mentors', 'People', 'Leaderboard'];

// Verified Badge matching Web App
const VerifiedBadge = () => (
  <View style={styles.verifiedBadgeCircle}>
    <Check size={8} color="#ffffff" strokeWidth={3} />
  </View>
);

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
  creatorName: string;
  isOfficial?: boolean;
  rating?: number;
  reviewsCount?: number;
  activeTraders?: number;
  features?: string[];
}

// Existing official flagship algorithms matching web app
export const EXISTING_OFFICIAL_ALGOS: MarketplaceProduct[] = [
  {
    id: 'algo-fialgo-v1',
    name: 'FiAlgo V1',
    category: 'Algo',
    badge: '⭐ Official Flagship EA',
    version: 'v1.0.4 Live',
    timeframe: '1 Min (M1) / M15',
    pairs: ['XAUUSD (Gold)'],
    winRate: '73%',
    drawdown: '3.2%',
    monthlyReturn: '+18–42%',
    description: 'The official Tradifive Expert Advisor for MetaTrader 5. Fully automated XAUUSD trading with 8 built-in risk modules, tick-by-tick breakout logic, real-time economic news filter, and sub-3ms direct MT5 execution. Includes 3-Day Risk-Free Trial & 100% Profit Money-Back Guarantee.',
    price: 10000,
    currency: '₹',
    creatorName: 'TradiFive Official',
    isOfficial: true,
    rating: 4.95,
    reviewsCount: 520,
    activeTraders: 2840,
    features: [
      '8 built-in institutional risk & safety modules',
      'Tick-by-tick breakout & dynamic basket tracking',
      'Automated economic news filter (FOMC, CPI, NFP)',
      '₹10,000 Setup Fee + Daily 50/50% Profit Share',
    ],
  },
  {
    id: 'algo-gold-scalper-pro',
    name: 'Gold Scalper Pro (M1)',
    category: 'EAs',
    badge: '🔥 High Frequency Module',
    version: 'v2.1',
    timeframe: 'M1',
    pairs: ['XAUUSD', 'EURUSD'],
    winRate: '71%',
    drawdown: '4.1%',
    monthlyReturn: '+22–38%',
    description: 'Optimized high-frequency scalp module tailored for tight spreads on Exness, IC Markets & Prop challenge accounts.',
    price: 24999,
    currency: '₹',
    creatorName: 'Tradifive Systems',
    isOfficial: true,
    rating: 4.88,
    reviewsCount: 164,
    activeTraders: 1120,
    features: [
      'Ultra low-latency spread protection',
      'Prop Firm challenge auto-pause guard',
    ],
  },
  {
    id: 'tool-drawdown-guard',
    name: 'Dynamic Basket & Drawdown Guard',
    category: 'Tools',
    badge: '🛡️ Equity Protection',
    version: 'v1.2',
    timeframe: 'All Timeframes',
    pairs: ['Multi-Asset'],
    winRate: 'N/A',
    drawdown: '1.0% Hard Cap',
    monthlyReturn: 'Risk Defense',
    description: 'Autonomous risk manager that monitors open float across all symbols and cuts basket if daily drawdown threshold is triggered.',
    price: 9999,
    currency: '₹',
    creatorName: 'RiskGuard Quant',
    isOfficial: false,
    rating: 4.85,
    reviewsCount: 92,
    activeTraders: 850,
  },
  {
    id: 'signals-vip-desk',
    name: 'Tradifive VIP Institutional Signals',
    category: 'Signals',
    badge: '⚡ Verified VIP Channel',
    version: 'Live Feed',
    timeframe: 'Intraday & Swing',
    pairs: ['Gold', 'Forex Majors'],
    winRate: '76%',
    drawdown: '2.5%',
    monthlyReturn: '+300–600 Pips/mo',
    description: 'Direct trade calls streamed from institutional desks with exact Entry, Stop Loss, TP1, and TP2 targets.',
    price: 4999,
    currency: '₹/mo',
    creatorName: 'Elite Desk',
    isOfficial: true,
    rating: 4.92,
    reviewsCount: 310,
    activeTraders: 3400,
  },
];

// Sample Mentors matching Web App Discover
const SAMPLE_MENTORS = [
  {
    id: 'mentor-1',
    name: 'Vikram Singhania',
    username: 'vikramquant',
    title: 'Senior Gold & Macro Scalper · 9 Yrs Exp',
    members: '1,840',
    winRate: '74%',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    verified: true,
  },
  {
    id: 'mentor-2',
    name: 'Rajesh Mehta',
    username: 'rajeshpriceaction',
    title: 'Price Action & Breakout Specialist',
    members: '2,420',
    winRate: '71%',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verified: true,
  },
  {
    id: 'mentor-3',
    name: 'Ananya Patel',
    username: 'ananyaprop',
    title: 'Prop Firm Risk & Execution Architect',
    members: '3,150',
    winRate: '77%',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    verified: true,
  },
  {
    id: 'mentor-4',
    name: 'TradiFive Core Desk',
    username: 'tradifiveofficial',
    title: 'Institutional MQL5 Algo Engineering Desk',
    members: '4,280',
    winRate: '78%',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    verified: true,
  },
];

// Sample People / Traders
const SAMPLE_PEOPLE = [
  { id: 'p-1', name: 'Alex Rivera', handle: '@arivera_fx', winRate: '76%', profit: '+342%', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { id: 'p-2', name: 'Sarah Chen', handle: '@schen_trades', winRate: '72%', profit: '+289%', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'p-3', name: 'Rahul Verma', handle: '@rahul_gold', winRate: '69%', profit: '+214%', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { id: 'p-4', name: 'Michael Krause', handle: '@mkrause_algo', winRate: '70%', profit: '+184%', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150' },
];

// Sample Leaderboard
const SAMPLE_LEADERBOARD = [
  { rank: 1, name: 'Alex Rivera', handle: '@arivera_fx', roi: '+342.8%', winRate: '78%', trades: 142 },
  { rank: 2, name: 'Sarah Chen', handle: '@schen_trades', roi: '+289.4%', winRate: '74%', trades: 118 },
  { rank: 3, name: 'Rahul Verma', handle: '@rahul_gold', roi: '+214.2%', winRate: '71%', trades: 96 },
  { rank: 4, name: 'Michael Krause', handle: '@mkrause_algo', roi: '+184.6%', winRate: '69%', trades: 84 },
  { rank: 5, name: 'Elena Rostov', handle: '@erostov_scalp', roi: '+156.0%', winRate: '68%', trades: 72 },
];

export default function DiscoverMarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('top_glow');

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  // Scroll animations matching other pages
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 72;
  const clampedScroll = Animated.diffClamp(
    scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' }),
    0,
    headerHeight
  );
  const headerTranslateY = clampedScroll.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [140, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    setHeaderStyle(getHeaderStyle());
    const sub = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => sub.remove();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    hSelect();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleFollow = (id: string) => {
    hSuccess();
    setFollowing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAlgos = useMemo(() => {
    if (!searchQuery.trim()) return EXISTING_OFFICIAL_ALGOS;
    const q = searchQuery.toLowerCase();
    return EXISTING_OFFICIAL_ALGOS.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.creatorName.toLowerCase().includes(q) ||
        (a.pairs && a.pairs.some(p => p.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  const filteredMentors = useMemo(() => {
    if (!searchQuery.trim()) return SAMPLE_MENTORS;
    const q = searchQuery.toLowerCase();
    return SAMPLE_MENTORS.filter(
      m => m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return SAMPLE_PEOPLE;
    const q = searchQuery.toLowerCase();
    return SAMPLE_PEOPLE.filter(
      p => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#f4f4f6') : '#000' }]}>
      <StatusBar barStyle={headerStyle === 'simple' && !isDark ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />

      {/* ── TOP BACKSIDE GLOW / ARTWORK IMAGE ── */}
      {headerStyle !== 'simple' && (
        <Image
          source={require('../../assets/images/top-glow.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: insets.top + 160,
            zIndex: 0,
            opacity: 0.95,
          }}
          resizeMode="stretch"
          pointerEvents="none"
        />
      )}

      {/* ── SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            backgroundColor: '#000',
            zIndex: 2000,
            paddingTop: insets.top + 8,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            overflow: 'hidden',
          }}
        >
          <Image
            source={require('../../assets/images/top-glow.png')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 80, opacity: 0.8 }}
            resizeMode="stretch"
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 56 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>
                Discover
              </Text>
              <View style={styles.liveBadgeMini}>
                <Text style={styles.liveBadgeMiniText}>COMMUNITY</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                hSelect();
                router.push('/notifications' as any);
              }}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Bell size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── COLLAPSIBLE HEADER (Matching Web App Discover Heading) ── */}
      <Animated.View
        style={{
          height: headerStyle === 'simple' ? insets.top + 74 : insets.top + 104,
          backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#ffffff') : 'transparent',
          borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
          borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0',
          position: 'relative',
          transform: headerStyle === 'simple' ? [] : [
            {
              scale: scrollY.interpolate({
                inputRange: [0, 80],
                outputRange: [1, 0.85],
                extrapolate: 'clamp',
              }),
            },
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 80],
                outputRange: [0, -60],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        {headerStyle !== 'simple' && (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        )}

        <Animated.View
          style={{
            position: 'absolute',
            bottom: headerStyle === 'simple' ? 16 : 38,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({
              inputRange: [0, 140],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          }}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff', letterSpacing: -0.5 }}>
                Discover Hub
              </Text>
              <View style={styles.liveBadgeMini}>
                <Text style={styles.liveBadgeMiniText}>COMMUNITY</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: headerStyle === 'simple' ? '#64748b' : 'rgba(255,255,255,0.7)', marginTop: 1 }}>
              Marketplace · Mentors · Top Traders &amp; Algos
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hSelect();
              router.push('/(tabs)/order-history' as any);
            }}
            style={styles.orderHistoryShortcutBtn}
          >
            <ShoppingBag size={13} color="#38bdf8" />
            <Text style={styles.orderHistoryShortcutText}>My Orders</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD (Slides up naturally with scroll) ── */}
      <Animated.View
        style={[
          styles.mainCard,
          {
            marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({
              inputRange: [0, 150],
              outputRange: [-34, -184],
              extrapolate: 'clamp',
            }),
            borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
            borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
            backgroundColor: isDark ? theme.background : '#f8fafc',
          },
        ]}
      >
        {/* Scrollable Content Area */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 130 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        >
          <Animated.View
            style={{
              transform: headerStyle === 'simple' ? [] : [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, 150],
                  extrapolate: 'clamp',
                }),
              }],
            }}
          >
            {/* Search Bar matching Web App Discover */}
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
              <View
                style={[
                  styles.searchBarContainer,
                  {
                    backgroundColor: isDark ? '#11131a' : '#ffffff',
                    borderColor: isDark ? '#1e2433' : '#e2e8f0',
                  },
                ]}
              >
                <Search size={16} color={isDark ? '#64748b' : '#94a3b8'} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search algorithms, mentors, traders..."
                  placeholderTextColor="#94a3b8"
                  style={[styles.searchInput, { color: isDark ? '#ffffff' : '#0f172a' }]}
                />
              </View>
            </View>

            {/* Categories Tab Selector matching Web App Discover.tsx */}
            <View style={{ paddingVertical: 6 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
              >
                {CATEGORIES.map(cat => {
                  const isActive = activeTab === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isActive
                            ? (isDark ? '#38bdf8' : '#0f172a')
                            : (isDark ? '#11131a' : '#ffffff'),
                          borderColor: isActive
                            ? (isDark ? '#38bdf8' : '#0f172a')
                            : (isDark ? '#1e2433' : '#e2e8f0'),
                        },
                      ]}
                      onPress={() => {
                        hSelect();
                        setActiveTab(cat);
                      }}
                    >
                      <Text
                        style={[
                          styles.catTxt,
                          {
                            color: isActive
                              ? (isDark ? '#0f172a' : '#ffffff')
                              : (isDark ? '#94a3b8' : '#64748b'),
                            fontFamily: isActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
          {/* ══════════════════════════════════════════════════════════════
              TAB: ALL or MARKETPLACE (Algorithmic Engines)
             ══════════════════════════════════════════════════════════════ */}
          {(activeTab === 'All' || activeTab === 'Marketplace') && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    Institutional Algorithms
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                    Verified MetaTrader 5 expert advisors &amp; tools
                  </Text>
                </View>
                <View style={styles.verifiedCountPill}>
                  <Text style={styles.verifiedCountText}>{filteredAlgos.length} VERIFIED</Text>
                </View>
              </View>

              {filteredAlgos.map(algo => {
                const isFlagship = algo.id === 'algo-fialgo-v1';
                return (
                  <View
                    key={algo.id}
                    style={[
                      styles.productCard,
                      {
                        backgroundColor: isDark ? '#11131a' : '#ffffff',
                        borderColor: isFlagship
                          ? (isDark ? 'rgba(56,189,248,0.4)' : 'rgba(56,189,248,0.45)')
                          : (isDark ? '#1e2433' : '#e2e8f0'),
                      },
                    ]}
                  >
                    {/* Top Row: Badge & Rating */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      {algo.badge && (
                        <View style={[styles.badgePill, { backgroundColor: isFlagship ? 'rgba(56,189,248,0.12)' : 'rgba(16,185,129,0.12)' }]}>
                          <Sparkles size={10} color={isFlagship ? '#38bdf8' : '#10b981'} />
                          <Text style={[styles.badgeText, { color: isFlagship ? '#38bdf8' : '#10b981' }]}>
                            {algo.badge}
                          </Text>
                        </View>
                      )}

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                          {algo.rating}
                        </Text>
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                          ({algo.reviewsCount})
                        </Text>
                      </View>
                    </View>

                    {/* Product Header Row with Box Image */}
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                      {isFlagship ? (
                        <View style={styles.flagshipThumbBox}>
                          <Image
                            source={require('../../assets/images/fialgo-v1-box.png')}
                            style={{ width: 48, height: 48 }}
                            resizeMode="contain"
                          />
                        </View>
                      ) : (
                        <View style={[styles.algoIconBox, { backgroundColor: isDark ? '#1e2433' : '#f1f5f9' }]}>
                          <Cpu size={22} color="#38bdf8" />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.productTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                          {algo.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            by {algo.creatorName}
                          </Text>
                          {algo.isOfficial && <VerifiedBadge />}
                        </View>
                      </View>
                    </View>

                    {/* Pairs & Timeframe Tags */}
                    {algo.pairs && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                        {algo.pairs.map(p => (
                          <View key={p} style={[styles.pairTag, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                            <Text style={styles.pairTagText}>{p}</Text>
                          </View>
                        ))}
                        {algo.timeframe && (
                          <View style={[styles.pairTag, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                            <Text style={styles.pairTagText}>{algo.timeframe}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* 3 Metric Tiles (Matching Web App) */}
                    <View style={[styles.metricGrid, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>WIN RATE</Text>
                        <Text style={[styles.metricVal, { color: '#10b981' }]}>{algo.winRate}</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>AVG RETURN</Text>
                        <Text style={[styles.metricVal, { color: '#38bdf8' }]}>{algo.monthlyReturn}</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>MAX DD</Text>
                        <Text style={[styles.metricVal, { color: '#a855f7' }]}>{algo.drawdown}</Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text style={[styles.productDesc, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={2}>
                      {algo.description}
                    </Text>

                    {/* Price & Action Button */}
                    <View style={styles.productFooter}>
                      <View>
                        <Text style={{ fontSize: 9.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase' }}>
                          Setup Fee
                        </Text>
                        <Text style={[styles.productPrice, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                          {algo.currency} {algo.price.toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          hSuccess();
                          router.push('/(tabs)/auto-trade-setup' as any);
                        }}
                        style={[styles.setupAlgoBtn, { backgroundColor: isFlagship ? '#10b981' : (isDark ? '#38bdf8' : '#0f172a') }]}
                      >
                        <Zap size={14} color="#ffffff" />
                        <Text style={styles.setupAlgoBtnText}>
                          {isFlagship ? 'Setup & Connect MT5' : 'View Details'}
                        </Text>
                        <ArrowRight size={13} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: MENTORS (Matching Web App Discover)
             ══════════════════════════════════════════════════════════════ */}
          {(activeTab === 'All' || activeTab === 'Mentors') && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Featured Mentors
                </Text>
                <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#38bdf8' }}>
                  {filteredMentors.length} Mentors
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                {filteredMentors.map(mentor => {
                  const isFollowed = !!following[mentor.id];
                  return (
                    <View
                      key={mentor.id}
                      style={[
                        styles.mentorCard,
                        {
                          backgroundColor: isDark ? '#11131a' : '#ffffff',
                          borderColor: isDark ? '#1e2433' : '#e2e8f0',
                        },
                      ]}
                    >
                      <Image source={{ uri: mentor.avatar }} style={styles.mentorAvatar} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.mentorName, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                            {mentor.name}
                          </Text>
                          {mentor.verified && <VerifiedBadge />}
                        </View>
                        <Text style={styles.mentorTitle} numberOfLines={1}>
                          {mentor.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                          <Text style={styles.mentorMeta}>{mentor.members} members</Text>
                          <Text style={[styles.mentorMeta, { color: '#10b981', fontFamily: 'Inter_700Bold' }]}>
                            {mentor.winRate} Win Rate
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleFollow(mentor.id)}
                        style={[
                          styles.followBtn,
                          {
                            backgroundColor: isFollowed
                              ? (isDark ? '#1e2433' : '#f1f5f9')
                              : (isDark ? '#38bdf8' : '#0f172a'),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.followBtnText,
                            {
                              color: isFollowed
                                ? (isDark ? '#cbd5e1' : '#475569')
                                : (isDark ? '#0f172a' : '#ffffff'),
                            },
                          ]}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: PEOPLE (Matching Web App Discover)
             ══════════════════════════════════════════════════════════════ */}
          {(activeTab === 'All' || activeTab === 'People') && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Community Traders
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                {filteredPeople.map(p => {
                  const isFollowed = !!following[p.id];
                  return (
                    <View
                      key={p.id}
                      style={[
                        styles.peopleCard,
                        {
                          backgroundColor: isDark ? '#11131a' : '#ffffff',
                          borderColor: isDark ? '#1e2433' : '#e2e8f0',
                        },
                      ]}
                    >
                      <Image source={{ uri: p.avatar }} style={styles.peopleAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.peopleName, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                          {p.name}
                        </Text>
                        <Text style={styles.peopleHandle}>{p.handle}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                            {p.profit}
                          </Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            {p.winRate} Win
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleFollow(p.id)}
                        style={[
                          styles.followBtn,
                          {
                            backgroundColor: isFollowed
                              ? (isDark ? '#1e2433' : '#f1f5f9')
                              : (isDark ? '#38bdf8' : '#0f172a'),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.followBtnText,
                            {
                              color: isFollowed
                                ? (isDark ? '#cbd5e1' : '#475569')
                                : (isDark ? '#0f172a' : '#ffffff'),
                            },
                          ]}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB: LEADERBOARD (Matching Web App Discover)
             ══════════════════════════════════════════════════════════════ */}
          {(activeTab === 'All' || activeTab === 'Leaderboard') && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Top Performers Leaderboard
                </Text>
                <Trophy size={16} color="#f59e0b" />
              </View>

              <View
                style={[
                  styles.leaderboardBox,
                  {
                    backgroundColor: isDark ? '#11131a' : '#ffffff',
                    borderColor: isDark ? '#1e2433' : '#e2e8f0',
                  },
                ]}
              >
                {SAMPLE_LEADERBOARD.map((trader, i) => (
                  <View
                    key={trader.rank}
                    style={[
                      styles.leaderboardRow,
                      {
                        borderBottomWidth: i === SAMPLE_LEADERBOARD.length - 1 ? 0 : 1,
                        borderBottomColor: isDark ? '#1e2433' : '#f1f5f9',
                      },
                    ]}
                  >
                    <View style={styles.rankBadge}>
                      {trader.rank === 1 ? (
                        <Text style={{ fontSize: 14 }}>🥇</Text>
                      ) : trader.rank === 2 ? (
                        <Text style={{ fontSize: 14 }}>🥈</Text>
                      ) : trader.rank === 3 ? (
                        <Text style={{ fontSize: 14 }}>🥉</Text>
                      ) : (
                        <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#94a3b8' }}>
                          #{trader.rank}
                        </Text>
                      )}
                    </View>

                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.leaderName, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                        {trader.name}
                      </Text>
                      <Text style={styles.leaderHandle}>{trader.handle}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 13.5, fontFamily: 'Inter_800ExtraBold', color: '#10b981' }}>
                        {trader.roi}
                      </Text>
                      <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                        {trader.winRate} ({trader.trades} trades)
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
            </View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  liveBadgeMini: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(56,189,248,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  liveBadgeMiniText: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  verifiedBadgeCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderHistoryShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
  },
  orderHistoryShortcutText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#38bdf8',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    padding: 0,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  catTxt: {
    fontSize: 12,
  },
  verifiedCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  verifiedCountText: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  productCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.4,
  },
  flagshipThumbBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  algoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
  },
  pairTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  pairTagText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  metricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#94a3b8',
    opacity: 0.2,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 13,
    fontFamily: 'Inter_800ExtraBold',
  },
  productDesc: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16.5,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.15)',
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    marginTop: 1,
  },
  setupAlgoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  setupAlgoBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  mentorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  mentorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#cbd5e1',
  },
  mentorName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  mentorTitle: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
  mentorMeta: {
    fontSize: 10.5,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
  peopleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  peopleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#cbd5e1',
  },
  peopleName: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  peopleHandle: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  followBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  leaderboardBox: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderName: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  leaderHandle: {
    fontSize: 10.5,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
});
