import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Platform,
  RefreshControl,
  DeviceEventEmitter,
  Clipboard,
  Alert,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Bell,
  ArrowLeft,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCode,
  Sliders,
  Receipt,
  Send,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useStore } from '../store';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { supabase } from '../utils/supabase';

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

interface RealOrder {
  id: string;
  product_id?: string;
  amount: number;
  status: string;
  created_at: string;
  product?: {
    title: string;
    description?: string;
    product_type?: string;
    thumbnail_url?: string;
  };
}

export default function OrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const currentUser = useStore((state) => state.currentUser);
  const mt5Account = useStore((state) => state.mt5Account);

  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  const [refreshing, setRefreshing] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [realOrders, setRealOrders] = useState<RealOrder[]>([]);

  // Smooth GPU-only scroll animations with ZERO layout thrashing (prevents Android glitching)
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

  const [downloadedEA, setDownloadedEA] = useState(false);
  const [downloadedPreset, setDownloadedPreset] = useState(false);
  const [downloadedManual, setDownloadedManual] = useState(false);

  // Fetch real order records from database
  const fetchRealOrders = useCallback(async () => {
    if (!currentUser?.id) {
      setLoadingOrders(false);
      return;
    }
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('creator_orders')
        .select('*, product:creator_products(*)')
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRealOrders(data as RealOrder[]);
      }
    } catch (e) {
      console.log('Error fetching user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchRealOrders();
  }, [fetchRealOrders]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => sub.remove();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchRealOrders();
    setRefreshing(false);
  }, [fetchRealOrders]);

  // Check if user has real MT5 binding
  const hasRealMT5Binding = Boolean(mt5Account && mt5Account.account_number);
  const hasAnyData = hasRealMT5Binding || realOrders.length > 0;

  const licenseeName = useMemo(() => {
    const full = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim();
    return full || currentUser?.email || 'TradiFive Trader';
  }, [currentUser]);

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
            height: insets.top + 180,
            zIndex: 0,
            opacity: 1,
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hSelect();
                  router.back();
                }}
                style={styles.backBtn}
              >
                <ArrowLeft size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>
                Order History
              </Text>
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

      {/* ── COLLAPSIBLE HEADER ── */}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hSelect();
                router.back();
              }}
              style={styles.backBtn}
            >
              <ArrowLeft size={20} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff'} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff', letterSpacing: -0.5 }}>
                Order History
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              hSelect();
              router.push('/notifications' as any);
            }}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000') : 'white'} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* ── MAIN CONTENT CARD (Static layout position: NO marginTop animation, completely prevents Android jitter!) ── */}
      <View
        style={[
          styles.card,
          {
            marginTop: headerStyle === 'simple' ? 0 : -34,
            borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
            borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
            backgroundColor: isDark ? theme.background : '#f8fafc',
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 130 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" />}
        >
          <View style={{ gap: 14 }}>
            {/* Overview / User Header Card */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? '#11131a' : '#ffffff',
                  borderColor: isDark ? '#1e2433' : '#e2e8f0',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <View style={[styles.iconPill, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                  <Receipt size={20} color="#38bdf8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    Order History &amp; Billing
                  </Text>
                  <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                    Official receipts, algorithm authorizations, and MT5 telemetry records
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isDark ? '#0c0e14' : '#f8fafc',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#1e2433' : '#e2e8f0',
                  marginTop: 6,
                }}
              >
                <View>
                  <Text style={{ fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Account Holder
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {licenseeName}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Account Status
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: hasRealMT5Binding ? '#10b981' : '#38bdf8' }} />
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: hasRealMT5Binding ? '#10b981' : '#38bdf8' }}>
                      {hasRealMT5Binding ? 'Live MT5 Connected' : 'Standard Member'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {loadingOrders ? (
              <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color="#38bdf8" />
                <Text style={{ marginTop: 10, color: '#94a3b8', fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                  Loading order history...
                </Text>
              </View>
            ) : !hasAnyData ? (
              /* ── ZERO MOCK DATA: Clean Authentic Empty State ── */
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDark ? '#11131a' : '#ffffff',
                    borderColor: isDark ? '#1e2433' : '#e2e8f0',
                    alignItems: 'center',
                    paddingVertical: 36,
                    paddingHorizontal: 20,
                  },
                ]}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: isDark ? 'rgba(56,189,248,0.1)' : '#f0f9ff',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(56,189,248,0.2)' : '#bae6fd',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <ShoppingBag size={26} color="#0284c7" />
                </View>
                <Text style={{ fontSize: 17, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 6 }}>
                  No Orders Yet
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8', textAlign: 'center', lineHeight: 18, marginBottom: 20, maxWidth: 310 }}>
                  You haven't placed any algorithmic orders or license purchases yet. When you activate an algorithm from the Armory, your official receipts and transaction details will appear here.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    hSelect();
                    router.push('/(tabs)/auto-trade-setup' as any);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: isDark ? '#38bdf8' : '#0f172a',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 14,
                  }}
                >
                  <Sparkles size={14} color={isDark ? '#0f172a' : '#ffffff'} />
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#0f172a' : '#ffffff' }}>
                    Browse AutoTrade Licenses
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── REAL DATA DISPLAY ── */
              <>
                {/* Real MT5 Active License Card */}
                {hasRealMT5Binding && (
                  <View
                    style={[
                      styles.sectionCard,
                      {
                        backgroundColor: isDark ? '#11131a' : '#ffffff',
                        borderColor: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.35)',
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0.08 : 0.04,
                        shadowRadius: 8,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                        <Image
                          source={require('../../assets/images/fialgo-v1-box.png')}
                          style={{ width: 48, height: 48, borderRadius: 12 }}
                          resizeMode="contain"
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            FiAlgo V1 Institutional
                          </Text>
                          <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            Gold Scalp Engine · Dynamic Basket (M1)
                          </Text>
                        </View>
                      </View>

                      <View style={styles.verifiedBadge}>
                        <View style={styles.greenPulse} />
                        <Text style={styles.verifiedText}>ACTIVE</Text>
                      </View>
                    </View>

                    {/* Real Bound Account Details */}
                    <View
                      style={{
                        backgroundColor: isDark ? '#0c0e14' : '#f8fafc',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isDark ? '#1e2433' : '#e2e8f0',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginBottom: 10,
                      }}
                    >
                      <View style={[styles.orderDetailRow, { borderBottomColor: isDark ? '#1a202c' : '#edf2f7' }]}>
                        <Text style={styles.orderDetailLabel}>Bound MT5 Account</Text>
                        <Text style={[styles.orderDetailValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                          #{mt5Account?.account_number}
                        </Text>
                      </View>

                      <View style={[styles.orderDetailRow, { borderBottomColor: isDark ? '#1a202c' : '#edf2f7' }]}>
                        <Text style={styles.orderDetailLabel}>Broker Server</Text>
                        <Text style={[styles.orderDetailValue, { color: '#38bdf8' }]}>
                          {mt5Account?.server || 'Regulated MT5 Terminal'}
                        </Text>
                      </View>

                      <View style={[styles.orderDetailRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.orderDetailLabel}>Live Execution Engine</Text>
                        <Text style={[styles.orderDetailValue, { color: '#10b981' }]}>
                          {mt5Account?.algo_status ? 'Algorithm Running' : 'Standby / Paused'}
                        </Text>
                      </View>
                    </View>

                    {/* Re-bind Account CTA */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSelect();
                        router.push('/(tabs)/auto-trade-setup' as any);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: isDark ? '#1a202c' : '#f1f5f9',
                        borderWidth: 1,
                        borderColor: isDark ? '#2d3748' : '#cbd5e1',
                        paddingVertical: 11,
                        borderRadius: 12,
                      }}
                    >
                      <RefreshCw size={14} color={isDark ? '#cbd5e1' : '#475569'} />
                      <Text style={{ fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                        Reconfigure MT5 / Manage Setup
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Real Creator Store Orders (if any) */}
                {realOrders.map((order) => (
                  <View
                    key={order.id}
                    style={[
                      styles.sectionCard,
                      {
                        backgroundColor: isDark ? '#11131a' : '#ffffff',
                        borderColor: isDark ? '#1e2433' : '#e2e8f0',
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontSize: 14.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                          {order.product?.title || 'Algorithm Purchase'}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: order.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)' }}>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: order.status === 'completed' ? '#10b981' : '#f59e0b', textTransform: 'uppercase' }}>
                          {order.status}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: isDark ? '#1e2433' : '#f1f5f9' }}>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                        ₹{Number(order.amount || 0).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* VIP Concierge Support Banner */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? '#0c0e14' : '#f8fafc',
                  borderColor: isDark ? '#1e2433' : '#e2e8f0',
                  alignItems: 'center',
                  paddingVertical: 18,
                },
              ]}
            >
              <HelpCircle size={24} color="#38bdf8" style={{ marginBottom: 6 }} />
              <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 4 }}>
                Need VIP Installation Assistance?
              </Text>
              <Text style={{ fontSize: 11.5, fontFamily: 'Inter_400Regular', color: '#94a3b8', textAlign: 'center', lineHeight: 17, marginBottom: 14, maxWidth: 300 }}>
                Our institutional desk can guide you through remote MT5 setup or VPS installation 24/7.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Linking.openURL('https://t.me/TradifiveSupport')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#38bdf8',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Send size={14} color="#0f172a" />
                <Text style={{ fontSize: 12.5, fontFamily: 'Inter_700Bold', color: '#0f172a' }}>
                  Open Institutional Support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    paddingBottom: 28,
    position: 'relative',
  },
  headerRow: {
    position: 'absolute',
    bottom: 38,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  card: {
    flex: 1,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  verifiedText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#10b981',
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  orderDetailLabel: {
    fontSize: 11.5,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
  },
  orderDetailValue: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
