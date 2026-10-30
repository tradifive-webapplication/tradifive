import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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

const CATEGORIES = ['All', 'Algos', 'Signals', 'EAs', 'Tools', 'Courses'];

interface MarketplaceItem {
  id: string;
  category: string;
  title: string;
  provider: string;
  description?: string;
  rating: number;
  reviews_count: number;
  price: string;
  is_featured: boolean;
  badge?: string;
  actionRoute?: string;
  actionLabel?: string;
}

const DEFAULT_FEATURED_ALGOS: MarketplaceItem[] = [
  {
    id: 'fialgo-v1-featured',
    category: 'Algos',
    title: 'FiAlgo V1 Institutional Engine',
    provider: 'TradiFive Quant Labs',
    description: 'Gold (XAUUSD M1) automated scalper with dynamic basket & institutional drawdown guard.',
    rating: 5.0,
    reviews_count: 142,
    price: '₹99,999',
    is_featured: true,
    badge: 'FLAGSHIP ALGO',
    actionRoute: '/(tabs)/auto-trade-setup',
    actionLabel: 'Setup & Buy',
  },
  {
    id: 'gold-scalper-pro',
    category: 'EAs',
    title: 'Gold Scalper Pro (M1 Module)',
    provider: 'Tradifive Systems',
    description: 'High-frequency M1 execution tailored for Exness, IC Markets & Prop Firm MT5 accounts.',
    rating: 4.9,
    reviews_count: 88,
    price: '₹24,999',
    is_featured: true,
    badge: 'POPULAR EA',
    actionRoute: '/(tabs)/auto-trade-setup',
    actionLabel: 'View Details',
  },
  {
    id: 'dynamic-drawdown-guard',
    category: 'Tools',
    title: 'Dynamic Basket & Drawdown Guard',
    provider: 'RiskGuard Quant',
    description: 'Autonomous equity defense that stops trades if daily loss reaches threshold.',
    rating: 4.8,
    reviews_count: 64,
    price: '₹9,999',
    is_featured: false,
    badge: 'RISK TOOL',
    actionRoute: '/(tabs)/risk-guard',
    actionLabel: 'Explore Tool',
  },
  {
    id: 'institutional-signals-vip',
    category: 'Signals',
    title: 'Tradifive VIP Gold & FX Signals',
    provider: 'Elite Desk',
    description: 'High-probability signals with precise entry, SL, TP1, TP2 and live position management.',
    rating: 4.9,
    reviews_count: 215,
    price: '₹4,999/mo',
    is_featured: false,
    badge: 'LIVE SIGNALS',
    actionRoute: '/(tabs)/channels',
    actionLabel: 'Join Channel',
  },
  {
    id: 'algo-masterclass',
    category: 'Courses',
    title: 'Institutional Algo Trading Mastery',
    provider: 'TradiFive Academy',
    description: 'Complete blueprint on configuring MT5 EAs, risk sizing, VPS setup, and pass prop challenges.',
    rating: 4.9,
    reviews_count: 110,
    price: '₹14,999',
    is_featured: false,
    badge: 'COURSE',
    actionRoute: '/(tabs)/learning',
    actionLabel: 'View Course',
  },
];

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('top_glow');

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [dbItems, setDbItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getHeaderStyle().then(setHeaderStyle);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setDbItems(data);
      } else {
        setDbItems([]);
      }
    } catch {
      setDbItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  // Combine default algorithms with DB items
  const allListings = useMemo(() => {
    const combined = [...DEFAULT_FEATURED_ALGOS];
    for (const d of dbItems) {
      if (!combined.some(c => c.id === d.id)) {
        combined.push(d);
      }
    }
    return combined;
  }, [dbItems]);

  const filteredItems = useMemo(() => {
    return allListings.filter(item => {
      const matchCat = category === 'All' || item.category.toLowerCase() === category.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [allListings, category, searchQuery]);

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

      {/* ── HEADER ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (headerStyle === 'simple' ? 12 : 18),
            paddingBottom: 22,
          },
        ]}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#ffffff', letterSpacing: -0.5 }}>
                  Discover Marketplace
                </Text>
                <View style={styles.livePill}>
                  <Text style={styles.livePillText}>LIVE</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                Explore Algorithms, EAs, Signals &amp; Trading Tools
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/order-history' as any)}
              style={styles.orderHistoryShortcutBtn}
            >
              <ShoppingBag size={14} color="#38bdf8" />
              <Text style={styles.orderHistoryShortcutText}>My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── MAIN CONTENT CARD ── */}
      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: isDark ? theme.background : '#f8fafc',
          },
        ]}
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
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
              placeholder="Search algorithms, EAs, signals..."
              placeholderTextColor="#94a3b8"
              style={[styles.searchInput, { color: isDark ? '#ffffff' : '#0f172a' }]}
            />
          </View>
        </View>

        {/* Categories Pills */}
        <View style={{ paddingVertical: 6 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            {CATEGORIES.map(c => {
              const isActive = category === c;
              return (
                <TouchableOpacity
                  key={c}
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
                    setCategory(c);
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
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Listings ScrollView */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        >
          {loading ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#38bdf8" />
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={{ paddingVertical: 60, alignItems: 'center', gap: 10 }}>
              <PackageOpen size={40} color="#94a3b8" />
              <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#cbd5e1' : '#475569' }}>
                No listings found
              </Text>
              <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                Try adjusting your search query or category filter.
              </Text>
            </View>
          ) : (
            filteredItems.map(item => (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: isDark ? '#11131a' : '#ffffff',
                    borderColor: item.is_featured
                      ? (isDark ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.4)')
                      : (isDark ? '#1e2433' : '#e2e8f0'),
                  },
                ]}
              >
                {/* Top Badge & Rating Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {item.badge && (
                      <View style={[styles.badgePill, { backgroundColor: item.is_featured ? 'rgba(56,189,248,0.12)' : 'rgba(16,185,129,0.12)' }]}>
                        {item.is_featured && <Sparkles size={10} color="#38bdf8" />}
                        <Text style={[styles.badgeText, { color: item.is_featured ? '#38bdf8' : '#10b981' }]}>
                          {item.badge}
                        </Text>
                      </View>
                    )}
                    <View style={styles.catMiniBadge}>
                      <Text style={styles.catMiniText}>{item.category}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      {item.rating.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                      ({item.reviews_count})
                    </Text>
                  </View>
                </View>

                {/* Title & Description */}
                <Text style={[styles.itemTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginBottom: 6 }}>
                  By {item.provider}
                </Text>
                {item.description ? (
                  <Text style={[styles.itemDesc, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                {/* Price & Action Row */}
                <View style={styles.actionRow}>
                  <View>
                    <Text style={{ fontSize: 9.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase' }}>
                      Price
                    </Text>
                    <Text style={[styles.itemPrice, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                      {item.price}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSelect();
                      if (item.actionRoute) {
                        router.push(item.actionRoute as any);
                      }
                    }}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: item.is_featured
                          ? (isDark ? '#38bdf8' : '#0f172a')
                          : (isDark ? '#1e2433' : '#f1f5f9'),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        {
                          color: item.is_featured
                            ? (isDark ? '#0f172a' : '#ffffff')
                            : (isDark ? '#cbd5e1' : '#334155'),
                        },
                      ]}
                    >
                      {item.actionLabel || 'View Algo'}
                    </Text>
                    <ArrowRight
                      size={13}
                      color={
                        item.is_featured
                          ? (isDark ? '#0f172a' : '#ffffff')
                          : (isDark ? '#cbd5e1' : '#334155')
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  livePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  livePillText: {
    fontSize: 9.5,
    fontFamily: 'Inter_800ExtraBold',
    color: '#10b981',
    letterSpacing: 0.5,
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
  itemCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9.5,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.5,
  },
  catMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(148,163,184,0.12)',
  },
  catMiniText: {
    fontSize: 9.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#94a3b8',
  },
  itemTitle: {
    fontSize: 15.5,
    fontFamily: 'Inter_700Bold',
  },
  itemDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.15)',
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: 'Inter_800ExtraBold',
    marginTop: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
});
