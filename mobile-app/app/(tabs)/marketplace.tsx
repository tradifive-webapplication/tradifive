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
  Search,
  Star,
  Check,
  Zap,
  Cpu,
  Bell,
  Sparkles,
  ArrowRight,
  Users,
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

const CATEGORIES = ['All', 'People', 'Algos'];

// Verified Badge
const VerifiedBadge = () => (
  <View style={styles.verifiedBadgeCircle}>
    <Check size={8} color="#ffffff" strokeWidth={3} />
  </View>
);

// Real Avatar Resolver (handles Google, Supabase Storage, and fallback initials)
const resolveAvatar = (avatarUrl?: string | null, seed?: string | null) => {
  if (avatarUrl && avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  const name = seed || 'Trader';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38bdf8&color=ffffff&size=150&bold=true`;
};

export interface TraderProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  win_rate?: number | null;
  total_trades?: number | null;
  roi_all_time?: number | null;
  is_verified?: boolean | null;
  is_pro?: boolean | null;
  trading_style?: string | null;
  created_at?: string;
}

// Official Flagship Algorithm
export const OFFICIAL_ALGO = {
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
  description:
    'The official Tradifive Expert Advisor for MetaTrader 5. Automated XAUUSD breakout trading with 8 built-in risk modules, tick-by-tick dynamic basket execution, and real-time economic news filter.',
  price: 10000,
  currency: '₹',
  profitShare: '50/50% Daily',
  creatorName: 'TradiFive Official',
  isOfficial: true,
  rating: 4.95,
  reviewsCount: 520,
  activeTraders: 2840,
  features: [
    'Sub-3ms direct MT5 execution engine',
    '8 built-in institutional risk & safety modules',
    'Tick-by-tick breakout & dynamic basket tracking',
    'Automated economic news filter (FOMC, CPI, NFP)',
  ],
};

export default function DiscoverMarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('top_glow');

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profiles, setProfiles] = useState<TraderProfile[]>([]);

  const { followingIds, followUser, unfollowUser, currentUser } = useStore();

  // Scroll animations
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

  // Fetch real users from Supabase profiles
  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, win_rate, total_trades, roi_all_time, is_verified, is_pro, trading_style, created_at')
        .not('username', 'is', null)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Exclude current user from the discover list if logged in
        const filtered = currentUser?.id ? data.filter(p => p.id !== currentUser.id) : data;
        setProfiles(filtered);
      }
    } catch (e) {
      console.error('Error fetching real profiles:', e);
    } finally {
      setLoadingProfiles(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    setHeaderStyle(getHeaderStyle());
    const sub = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    fetchProfiles();
    return () => sub.remove();
  }, [fetchProfiles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hSelect();
    await fetchProfiles();
    setRefreshing(false);
  }, [fetchProfiles]);

  const toggleFollow = async (targetId: string) => {
    hSuccess();
    const isCurrentlyFollowed = followingIds.includes(targetId);
    if (isCurrentlyFollowed) {
      await unfollowUser(targetId);
    } else {
      await followUser(targetId);
    }
  };

  // Filtered real profiles based on search
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      p =>
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.trading_style && p.trading_style.toLowerCase().includes(q))
    );
  }, [profiles, searchQuery]);

  // Filtered algo
  const showAlgo = useMemo(() => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      OFFICIAL_ALGO.name.toLowerCase().includes(q) ||
      OFFICIAL_ALGO.description.toLowerCase().includes(q) ||
      OFFICIAL_ALGO.pairs.some(p => p.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#f4f4f6') : '#000' }]}>
      <StatusBar barStyle={headerStyle === 'simple' && !isDark ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />

      {/* ── TOP BACKSIDE GLOW ARTWORK ── */}
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

      {/* ── SMART-REVEAL COMPACT HEADER ── */}
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
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>
              Discover
            </Text>
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

      {/* ── MAIN COLLAPSIBLE HEADER ── */}
      <Animated.View
        style={{
          height: headerStyle === 'simple' ? insets.top + 64 : insets.top + 88,
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
            bottom: headerStyle === 'simple' ? 12 : 24,
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
          <Text style={{ fontSize: 26, fontFamily: 'Inter_800ExtraBold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff', letterSpacing: -0.5 }}>
            Discover
          </Text>

          <TouchableOpacity
            onPress={() => {
              hSelect();
              router.push('/notifications' as any);
            }}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={22} color={headerStyle === 'simple' ? (isDark ? '#fff' : '#000') : '#fff'} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD ── */}
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
                  placeholder="Search traders, algorithms..."
                  placeholderTextColor="#94a3b8"
                  style={[styles.searchInput, { color: isDark ? '#ffffff' : '#0f172a' }]}
                />
              </View>
            </View>

            {/* Categories Pills */}
            <View style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
              </View>
            </View>

            <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
              {/* ══════════════════════════════════════════════════════════════════
                  SECTION 1: PEOPLE (FIRST! Real Data from Supabase profiles)
                 ══════════════════════════════════════════════════════════════════ */}
              {(activeTab === 'All' || activeTab === 'People') && (
                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 17, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      People
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>
                      {filteredProfiles.length} Traders
                    </Text>
                  </View>

                  {loadingProfiles ? (
                    <View style={{ paddingVertical: 30, alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="small" color="#38bdf8" />
                    </View>
                  ) : filteredProfiles.length === 0 ? (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                        No traders found
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: 10 }}>
                      {filteredProfiles.map(p => {
                        const isFollowed = followingIds.includes(p.id);
                        const displayName = p.full_name || p.username || 'Trader';
                        const avatarUri = resolveAvatar(p.avatar_url, displayName);

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
                            <Image
                              source={{ uri: avatarUri }}
                              style={styles.peopleAvatar}
                            />

                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={[styles.peopleName, { color: isDark ? '#ffffff' : '#0f172a' }]} numberOfLines={1}>
                                  {displayName}
                                </Text>
                                {(p.is_verified || p.is_pro) && <VerifiedBadge />}
                              </View>
                              <Text style={styles.peopleHandle} numberOfLines={1}>
                                @{p.username || 'trader'}
                              </Text>

                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                {p.win_rate && p.win_rate > 0 ? (
                                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                                    {p.win_rate}% Win Rate
                                  </Text>
                                ) : (
                                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                                    {p.trading_style || 'Active Trader'}
                                  </Text>
                                )}
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
                                  borderColor: isFollowed
                                    ? (isDark ? '#2e384d' : '#e2e8f0')
                                    : 'transparent',
                                  borderWidth: isFollowed ? 1 : 0,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.followBtnText,
                                  {
                                    color: isFollowed
                                      ? (isDark ? '#94a3b8' : '#64748b')
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
                  )}
                </View>
              )}

              {/* ══════════════════════════════════════════════════════════════════
                  SECTION 2: ALGOS (DOWN / SECOND! Clean & consistent official EA)
                 ══════════════════════════════════════════════════════════════════ */}
              {(activeTab === 'All' || activeTab === 'Algos') && showAlgo && (
                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 17, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Algos
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.productCard,
                      {
                        backgroundColor: isDark ? '#11131a' : '#ffffff',
                        borderColor: isDark ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.40)',
                      },
                    ]}
                  >
                    {/* Top Row: Badge & Rating */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View style={[styles.badgePill, { backgroundColor: 'rgba(56,189,248,0.12)' }]}>
                        <Sparkles size={11} color="#38bdf8" />
                        <Text style={[styles.badgeText, { color: '#38bdf8' }]}>
                          {OFFICIAL_ALGO.badge}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                          {OFFICIAL_ALGO.rating}
                        </Text>
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                          ({OFFICIAL_ALGO.reviewsCount})
                        </Text>
                      </View>
                    </View>

                    {/* Product Header Row with Box Image */}
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                      <View style={styles.flagshipThumbBox}>
                        <Image
                          source={require('../../assets/images/fialgo-v1-box.png')}
                          style={{ width: 50, height: 50 }}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.productTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                          {OFFICIAL_ALGO.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            by {OFFICIAL_ALGO.creatorName}
                          </Text>
                          <VerifiedBadge />
                        </View>
                      </View>
                    </View>

                    {/* Pairs & Timeframe Tags */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {OFFICIAL_ALGO.pairs.map(p => (
                        <View key={p} style={[styles.pairTag, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                          <Text style={styles.pairTagText}>{p}</Text>
                        </View>
                      ))}
                      <View style={[styles.pairTag, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                        <Text style={styles.pairTagText}>{OFFICIAL_ALGO.timeframe}</Text>
                      </View>
                      <View style={[styles.pairTag, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                        <Text style={styles.pairTagText}>MetaTrader 5</Text>
                      </View>
                    </View>

                    {/* 3 Metric Tiles with consistent theme colors */}
                    <View style={[styles.metricGrid, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>WIN RATE</Text>
                        <Text style={[styles.metricVal, { color: '#10b981' }]}>{OFFICIAL_ALGO.winRate}</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>AVG RETURN</Text>
                        <Text style={[styles.metricVal, { color: '#38bdf8' }]}>{OFFICIAL_ALGO.monthlyReturn}</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricCol}>
                        <Text style={styles.metricLabel}>MAX DD</Text>
                        <Text style={[styles.metricVal, { color: '#38bdf8' }]}>{OFFICIAL_ALGO.drawdown}</Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text style={[styles.productDesc, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={3}>
                      {OFFICIAL_ALGO.description}
                    </Text>

                    {/* Feature Bullets */}
                    <View style={{ gap: 6, marginBottom: 14 }}>
                      {OFFICIAL_ALGO.features.map(f => (
                        <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Check size={12} color="#10b981" strokeWidth={2.5} />
                          <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: isDark ? '#cbd5e1' : '#475569' }}>
                            {f}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Price & Action Button */}
                    <View style={styles.productFooter}>
                      <View>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase' }}>
                          Setup Fee
                        </Text>
                        <Text style={[styles.productPrice, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                          {OFFICIAL_ALGO.currency} {OFFICIAL_ALGO.price.toLocaleString('en-IN')}
                        </Text>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#10b981', marginTop: 1 }}>
                          {OFFICIAL_ALGO.profitShare}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          hSuccess();
                          router.push('/(tabs)/auto-trade-setup' as any);
                        }}
                        style={[styles.setupAlgoBtn, { backgroundColor: isDark ? '#38bdf8' : '#0f172a' }]}
                      >
                        <Zap size={14} color={isDark ? '#0f172a' : '#ffffff'} />
                        <Text style={[styles.setupAlgoBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>
                          Setup &amp; Connect MT5
                        </Text>
                        <ArrowRight size={13} color={isDark ? '#0f172a' : '#ffffff'} />
                      </TouchableOpacity>
                    </View>
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
  mainCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  // People Card Styling
  peopleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  peopleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
  },
  peopleName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  peopleHandle: {
    fontSize: 11.5,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
    marginTop: 1,
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnText: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
  },
  // Product Card Styling
  productCard: {
    borderRadius: 20,
    borderWidth: 1.5,
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
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
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
    borderRadius: 12,
    backgroundColor: 'rgba(56,189,248,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 17,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.2,
  },
  pairTag: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  pairTagText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
  },
  metricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  metricCol: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 13.5,
    fontFamily: 'Inter_800ExtraBold',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148,163,184,0.2)',
  },
  productDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.15)',
  },
  productPrice: {
    fontSize: 18,
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  setupAlgoBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  verifiedBadgeCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
