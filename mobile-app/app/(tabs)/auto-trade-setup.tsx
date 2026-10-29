import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Platform,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Bell,
  Zap,
  Activity,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
  Power,
  CheckCircle2,
  AlertCircle,
  Settings,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useStore } from '../store';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';

const hSelect = () => {
  try {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  } catch (e) {}
};

export default function AutoTradeSetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const mt5Account = useStore((state) => state.mt5Account);
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  const [refreshing, setRefreshing] = useState(false);
  const [botActive, setBotActive] = useState(true);

  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => sub.remove();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const isConnected = !!mt5Account?.account_number;

  return (
    <View style={{ flex: 1, backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#f4f4f6') : '#000' }}>
      <StatusBar barStyle={headerStyle === 'simple' && !isDark ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />

      {/* Top Backside Glow / Artwork Image */}
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

      {/* ── STATIC HEADER (Matching Inbox) ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#ffffff') : 'transparent',
            borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
            borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0',
            paddingBottom: headerStyle === 'simple' ? 16 : 28,
          },
        ]}
      >
        {headerStyle !== 'simple' && (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
        )}
        {/* Spacer so header has height */}
        <View style={{ height: headerStyle === 'simple' ? 44 : 48, marginTop: headerStyle === 'simple' ? insets.top + 18 : insets.top + 30 }} />

        {/* Content Row */}
        <View style={[styles.headerRow, { bottom: headerStyle === 'simple' ? 16 : 38 }]}>
          <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff', letterSpacing: -0.5 }}>
            Auto Trade
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity
              onPress={() => {
                hSelect();
                router.push('/notifications' as any);
              }}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000') : 'white'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── MAIN CARD ── */}
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" />}
        >
          {/* ═══ LIVE BOT STATUS HERO CARD ═══ */}
          <View style={[styles.heroCard, { backgroundColor: isDark ? '#10141f' : '#ffffff', borderColor: isDark ? 'rgba(56,189,248,0.25)' : 'rgba(56,189,248,0.3)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.iconPill, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                  <Zap size={20} color="#38bdf8" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    FiAlgo V1 Live Engine
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                    Gold Specialist · Dynamic Basket
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  hSelect();
                  setBotActive(!botActive);
                }}
                style={[styles.statusToggle, { backgroundColor: botActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }]}
              >
                <View style={[styles.statusDot, { backgroundColor: botActive ? '#10b981' : '#ef4444' }]} />
                <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: botActive ? '#10b981' : '#ef4444' }}>
                  {botActive ? 'ACTIVE' : 'PAUSED'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Performance Stats Row */}
            <View style={[styles.statsRow, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>TARGET / DAY</Text>
                <Text style={[styles.statVal, { color: '#10b981' }]}>2.0% - 5.0%</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>RISK GUARD</Text>
                <Text style={[styles.statVal, { color: '#38bdf8' }]}>Dynamic Limit</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>LATENCY</Text>
                <Text style={[styles.statVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>&lt; 5ms</Text>
              </View>
            </View>
          </View>

          {/* ═══ BROKER CONNECTION CARD ═══ */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="#38bdf8" />
                <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Broker Account (MetaTrader 5)
                </Text>
              </View>
              {isConnected ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#10b981' }}>Connected</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={14} color="#f59e0b" />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#f59e0b' }}>Not Connected</Text>
                </View>
              )}
            </View>

            {isConnected ? (
              <View style={{ paddingVertical: 8 }}>
                <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Account Number</Text>
                <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 8 }}>
                  {mt5Account?.account_number}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Server: {mt5Account?.server || 'Default'}</Text>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                    Balance: ${mt5Account?.balance?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ paddingVertical: 8 }}>
                <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#94a3b8', lineHeight: 18, marginBottom: 14 }}>
                  Connect your live or demo MT5 broker account to start automatic low-risk algorithm trading.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    hSelect();
                    router.push('/broker-connect' as any);
                  }}
                  style={styles.connectBtn}
                >
                  <Text style={styles.connectBtnText}>Connect MT5 Account</Text>
                  <ArrowUpRight size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ═══ ACTIVE PAIRS & EXECUTION ═══ */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0', marginTop: 12 }]}>
            <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 12 }}>
              Supported Trading Assets
            </Text>

            <View style={{ gap: 10 }}>
              <View style={[styles.pairRow, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.pairBadge, { backgroundColor: 'rgba(234,179,8,0.15)' }]}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#eab308' }}>XAU</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>XAU/USD (Gold)</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>High liquidity specialist strategy</Text>
                  </View>
                </View>
                <View style={[styles.tagPill, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>ACTIVE</Text>
                </View>
              </View>

              <View style={[styles.pairRow, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.pairBadge, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#38bdf8' }}>EUR</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>EUR/USD (Euro)</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Session basket breakout</Text>
                  </View>
                </View>
                <View style={[styles.tagPill, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>ACTIVE</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    zIndex: 5,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 4,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148,163,184,0.2)',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  statVal: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  connectBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  pairBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
