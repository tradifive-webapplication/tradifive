import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, RefreshControl, Platform, DeviceEventEmitter, ScrollView, StatusBar } from 'react-native';
import { Bell, ShoppingBag, Plus, DollarSign, TrendingUp, ChevronLeft, ArrowUpRight, ArrowDownRight, Package, Users, Eye } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';

import { useAppTheme } from '../../hooks/useAppTheme';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const STORE_STATS = [
  { label: 'Total Revenue', value: '$0.00', delta: null, up: null },
  { label: 'Orders (30d)', value: '0', delta: null, up: null },
  { label: 'Conversion', value: '0.0%', delta: null, up: null },
  { label: 'Active Subs', value: '0', delta: null, up: null },
];

const MOCK_ORDERS: any[] = [];

const LISTINGS: any[] = [];

const CATEGORY_COLORS: Record<string, string> = {
  Algo: '#3b82f6',
  Course: '#f43f5e',
  Indicator: '#f59e0b',
};

const CATEGORY_BG: Record<string, string> = {
  Algo: '#eff6ff',
  Course: '#fff1f2',
  Indicator: '#fffbeb',
};

export default function MyStoreScreen() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => { subscription.remove(); };
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    h();
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 64;
  const clampedScroll = Animated.diffClamp(scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' }), 0, headerHeight);
  const headerTranslateY = clampedScroll.interpolate({ inputRange: [0, headerHeight], outputRange: [0, -headerHeight], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={headerStyle === 'simple' ? "dark-content" : "light-content"} />

      <Image source={require('../../assets/images/top-glow.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 150, opacity: headerStyle === 'simple' ? 0 : 0.8 }} resizeMode="stretch" />

      {/* ── SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight, backgroundColor: '#000', zIndex: 2000, paddingTop: insets.top, opacity: headerOpacity, transform: [{ translateY: headerTranslateY }], borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>My Store</Text>
            </View>
            <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92, backgroundColor: headerStyle === 'simple' ? '#ffffff' : 'transparent', borderBottomWidth: headerStyle === 'simple' ? 1 : 0, borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0', position: 'relative', transform: headerStyle === 'simple' ? [] : [{ scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }] }}>
        <Animated.View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 12 : 38, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: headerStyle === 'simple' ? '#000000' : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>My Store</Text>
          </View>
          <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} color={headerStyle === 'simple' ? '#000000' : 'white'} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD ── */}
      <Animated.View style={[styles.card, { marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40, borderTopRightRadius: headerStyle === 'simple' ? 0 : 40 }]}>
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 260, paddingTop: 24 }} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" progressViewOffset={10} />}>
          <Animated.View style={{ transform: headerStyle === 'simple' ? [] : [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            <View style={{ paddingHorizontal: 20 }}>

              {/* Action Bar */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                <TouchableOpacity style={[styles.metricCard, { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 0 }]} onPress={() => h()}>
                  <Plus size={22} color="#a855f7" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>New Listing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.metricCard, { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 0 }]} onPress={() => h()}>
                  <Package size={22} color="#10b981" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.metricCard, { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 0 }]} onPress={() => h()}>
                  <Users size={22} color="#3b82f6" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Customers</Text>
                </TouchableOpacity>
              </View>

              {/* Store Stats */}
              <Text style={[styles.sectionTitle, { fontSize: 16, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }]}>STORE PERFORMANCE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 28 }}>
                {STORE_STATS.map((stat, i) => (
                  <View key={i} style={[styles.metricCard, { width: (SCREEN_WIDTH - 52) / 2, padding: 14, marginBottom: 0, minHeight: 0 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Text style={styles.metricLabel}>{stat.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[styles.metricValue, { fontSize: 20, marginTop: 0 }]}>{stat.value}</Text>
                      {stat.delta && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          {stat.up === true ? <ArrowUpRight size={10} color="#10b981" /> : stat.up === false ? <ArrowDownRight size={10} color="#ef4444" /> : null}
                          <Text style={[styles.metricSub, { fontSize: 10, fontFamily: 'Inter_600SemiBold', marginTop: 0, color: stat.up === true ? '#10b981' : stat.up === false ? '#ef4444' : '#94a3b8' }]}>{stat.delta}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Active Listings */}
              <Text style={[styles.sectionTitle, { fontSize: 16, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }]}>ACTIVE LISTINGS</Text>
              {LISTINGS.map((item) => (
                <View key={item.id} style={styles.listingCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{item.title}</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>{item.price}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: CATEGORY_BG[item.category] || '#f1f5f9' }]}>
                      <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: CATEGORY_COLORS[item.category] || '#64748b' }}>{item.category}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Eye size={12} color="#94a3b8" />
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>{item.sales} Sales</Text>
                  </View>
                </View>
              ))}

              {/* Recent Orders */}
              <Text style={[styles.sectionTitle, { fontSize: 16, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 16 }]}>RECENT ORDERS</Text>
              <View style={styles.ordersTable}>
                {MOCK_ORDERS.map((order, i) => (
                  <View key={order.id} style={[styles.orderRow, i < MOCK_ORDERS.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{order.buyer}</Text>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>{order.product}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: '#10b981' }}>+${order.amount}</Text>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 2 }}>{order.date}</Text>
                    </View>
                  </View>
                ))}
              </View>

            </View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  card: { flex: 1, backgroundColor: '#f8fafc', zIndex: 5 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 12 },
  metricCard: {
    backgroundColor: '#fafafa', borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 2, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  metricLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
  metricValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#0f172a', marginTop: 2, fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  metricSub: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 },
  listingCard: {
    backgroundColor: '#fafafa', borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 2, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ordersTable: {
    backgroundColor: '#fafafa', borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2
  },
  orderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
});
