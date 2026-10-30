import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Clipboard,
  Alert,
  Dimensions,
  Linking,
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
  Key,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCode,
  Sliders,
  Coins,
  Receipt,
  Send,
  RefreshCw,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useStore } from '../store';
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

// Cryptographic Key Generator matching Tradifive.mq5 FNV-1a algorithm & TF_SALT
export const generateTradifiveLicenseKey = (mt5AccountNumber?: string | number, expDays: number = 10000): string => {
  const salt = 'TFv1-Zk39xQ-7mLpA2';
  const numClean = String(mt5AccountNumber || '').replace(/\D/g, '') || '8392019';
  try {
    const login = BigInt(numClean);
    let h = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;
    const mask64 = 0xffffffffffffffffn;
    const str = `${salt}:${login}:${expDays}`;
    for (let i = 0; i < str.length; i++) {
      h = ((h ^ BigInt(str.charCodeAt(i))) * prime) & mask64;
    }
    h = h ^ (h >> 32n);
    const chk = h & 0xffffffffffn;

    const lgHex = login.toString(16).toUpperCase().padStart(8, '0');
    const expHex = expDays.toString(16).toUpperCase().padStart(4, '0');
    const chkHex = chk.toString(16).toUpperCase().padStart(10, '0');
    return `TF-${lgHex}-${expHex}-${chkHex}`;
  } catch (e) {
    const hexAcc = Math.abs(Number(numClean) || 8392019).toString(16).toUpperCase().padStart(8, '0').slice(-8);
    return `TF-${hexAcc.slice(0, 4)}-${hexAcc.slice(4, 8)}-94A1C8B204`;
  }
};

export default function OrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const currentUser = useStore((state) => state.currentUser);
  const mt5Account = useStore((state) => state.mt5Account);

  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  const [refreshing, setRefreshing] = useState(false);

  const accountNumber = mt5Account?.account_number || '8392019';
  const server = mt5Account?.server || 'Vantage-Live 2';

  const [copiedKey, setCopiedKey] = useState(false);
  const [downloadedEA, setDownloadedEA] = useState(false);
  const [downloadedPreset, setDownloadedPreset] = useState(false);
  const [downloadedManual, setDownloadedManual] = useState(false);

  const dynamicLicenseKey = useMemo(() => {
    return generateTradifiveLicenseKey(accountNumber);
  }, [accountNumber]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => sub.remove();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    hSuccess();
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#090d16' : '#f8fafc' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── HEADER ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#ffffff') : 'transparent',
            borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
            borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0',
            paddingBottom: headerStyle === 'simple' ? 16 : 28,
            height: headerStyle === 'simple' ? insets.top + 74 : insets.top + 104,
          },
        ]}
      >
        {headerStyle !== 'simple' && (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
        )}

        <View style={[styles.headerRow, { bottom: headerStyle === 'simple' ? 16 : 38 }]}>
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
              <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: headerStyle === 'simple' ? '#64748b' : 'rgba(255,255,255,0.7)', marginTop: 1 }}>
                Purchased Algorithms &amp; License Key Vault
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
        </View>
      </View>

      {/* ── MAIN CONTENT CARD ── */}
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
                    Purchased Licenses
                  </Text>
                  <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                    Review your algorithmic engines, MT5 bindings, and software keys
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
                    Licensee
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {currentUser?.first_name || 'Alex'} {currentUser?.last_name || 'Morgan'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase' }}>
                    License Status
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                      1 Active License
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Featured Order Card: FiAlgo V1 */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? '#11131a' : '#ffffff',
                  borderColor: isDark ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.35)',
                  shadowColor: '#38bdf8',
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
                    style={{ width: 52, height: 52, borderRadius: 12 }}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      FiAlgo V1 Institutional
                    </Text>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                      Gold Scalp Engine · Dynamic Basket (M1)
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(56,189,248,0.12)' }]}>
                        <Sparkles size={10} color="#38bdf8" />
                        <Text style={[styles.verifiedText, { color: '#38bdf8' }]}>VIP Lifetime</Text>
                      </View>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                        ₹99,999
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.verifiedBadge}>
                  <View style={styles.greenPulse} />
                  <Text style={styles.verifiedText}>ACTIVE</Text>
                </View>
              </View>

              {/* Order Details Grid */}
              <View
                style={{
                  backgroundColor: isDark ? '#0c0e14' : '#f8fafc',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isDark ? '#1e2433' : '#e2e8f0',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginBottom: 14,
                }}
              >
                <View style={[styles.orderDetailRow, { borderBottomColor: isDark ? '#1a202c' : '#edf2f7' }]}>
                  <Text style={styles.orderDetailLabel}>Order Reference</Text>
                  <Text style={[styles.orderDetailValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>#ORD-2026-98124</Text>
                </View>

                <View style={[styles.orderDetailRow, { borderBottomColor: isDark ? '#1a202c' : '#edf2f7' }]}>
                  <Text style={styles.orderDetailLabel}>Transaction UTR</Text>
                  <Text style={[styles.orderDetailValue, { color: '#38bdf8' }]}>429381029481</Text>
                </View>

                <View style={[styles.orderDetailRow, { borderBottomColor: isDark ? '#1a202c' : '#edf2f7' }]}>
                  <Text style={styles.orderDetailLabel}>Payment Method</Text>
                  <Text style={[styles.orderDetailValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>PhonePe / UPI</Text>
                </View>

                <View style={[styles.orderDetailRow, { borderBottomColor: isDark ? '#1a202c' : '#edf2f7' }]}>
                  <Text style={styles.orderDetailLabel}>Bound MT5 Account</Text>
                  <Text style={[styles.orderDetailValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    #{accountNumber} ({server})
                  </Text>
                </View>

                <View style={[styles.orderDetailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.orderDetailLabel}>License Expiration</Text>
                  <Text style={[styles.orderDetailValue, { color: '#10b981' }]}>Lifetime (10,000 Days)</Text>
                </View>
              </View>

              {/* ═══ PERMANENT LICENSE KEY VAULT ═══ */}
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(56,189,248,0.06)' : 'rgba(56,189,248,0.08)',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#38bdf8',
                  padding: 14,
                  marginBottom: 14,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Key size={15} color="#38bdf8" />
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Permanent License Key Vault
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={13} color="#10b981" />
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#10b981' }}>Secured</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginBottom: 10, lineHeight: 16 }}>
                  If you reinstall MetaTrader 5 or configure a new VPS server, copy your active personal license key below:
                </Text>

                <View
                  style={{
                    backgroundColor: isDark ? '#0c0e14' : '#ffffff',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isDark ? '#1e2433' : '#cbd5e1',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    selectable={true}
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter_800ExtraBold',
                      color: isDark ? '#38bdf8' : '#0284c7',
                      letterSpacing: 0.8,
                      textAlign: 'center',
                    }}
                  >
                    {dynamicLicenseKey}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => copyToClipboard(dynamicLicenseKey)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: copiedKey ? '#10b981' : '#38bdf8',
                    paddingVertical: 11,
                    borderRadius: 10,
                  }}
                >
                  {copiedKey ? <Check size={16} color="#ffffff" strokeWidth={2.5} /> : <Copy size={16} color="#0f172a" />}
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: copiedKey ? '#ffffff' : '#0f172a' }}>
                    {copiedKey ? 'License Key Copied to Clipboard!' : 'Copy License Key'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Downloads & Presets */}
              <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                Algorithm Files &amp; Settings
              </Text>

              {/* EA */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hSuccess();
                  setDownloadedEA(true);
                  Alert.alert('FiAlgo V1 Downloaded', 'FiAlgo_v1.0.4.ex5 has been downloaded.');
                }}
                style={[styles.downloadRowBtn, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.stepIconWrap, { backgroundColor: 'rgba(56,189,248,0.12)' }]}>
                    <FileCode size={16} color="#38bdf8" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      FiAlgo_v1.0.4.ex5
                    </Text>
                    <Text style={{ fontSize: 10.5, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>
                      MetaTrader 5 Expert Advisor (2.4 MB)
                    </Text>
                  </View>
                </View>
                <View style={[styles.downloadPill, { backgroundColor: downloadedEA ? 'rgba(16,185,129,0.15)' : '#38bdf8' }]}>
                  {downloadedEA ? <Check size={14} color="#10b981" /> : <Download size={14} color="#0f172a" />}
                  <Text style={{ fontSize: 10.5, fontFamily: 'Inter_700Bold', color: downloadedEA ? '#10b981' : '#0f172a' }}>
                    {downloadedEA ? 'Downloaded' : 'Download'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Preset */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hSuccess();
                  setDownloadedPreset(true);
                  Alert.alert('Gold Scalper Preset Downloaded', 'XAUUSD_M1_Preset.set has been saved.');
                }}
                style={[styles.downloadRowBtn, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.stepIconWrap, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <Sliders size={16} color="#10b981" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      XAUUSD_M1_Preset.set
                    </Text>
                    <Text style={{ fontSize: 10.5, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>
                      Institutional Gold Scalp Strategy Config
                    </Text>
                  </View>
                </View>
                <View style={[styles.downloadPill, { backgroundColor: downloadedPreset ? 'rgba(16,185,129,0.15)' : '#38bdf8' }]}>
                  {downloadedPreset ? <Check size={14} color="#10b981" /> : <Download size={14} color="#0f172a" />}
                  <Text style={{ fontSize: 10.5, fontFamily: 'Inter_700Bold', color: downloadedPreset ? '#10b981' : '#0f172a' }}>
                    {downloadedPreset ? 'Downloaded' : 'Download'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* PDF Manual */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hSuccess();
                  setDownloadedManual(true);
                  Alert.alert('PDF Guide Downloaded', 'FiAlgo_MT5_Setup_Guide.pdf opened.');
                }}
                style={[styles.downloadRowBtn, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.stepIconWrap, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                    <HelpCircle size={16} color="#f59e0b" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      FiAlgo_MT5_Setup_Guide.pdf
                    </Text>
                    <Text style={{ fontSize: 10.5, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>
                      Step-by-step MT5 activation guide
                    </Text>
                  </View>
                </View>
                <View style={[styles.downloadPill, { backgroundColor: downloadedManual ? 'rgba(16,185,129,0.15)' : '#38bdf8' }]}>
                  {downloadedManual ? <Check size={14} color="#10b981" /> : <Download size={14} color="#0f172a" />}
                  <Text style={{ fontSize: 10.5, fontFamily: 'Inter_700Bold', color: downloadedManual ? '#10b981' : '#0f172a' }}>
                    {downloadedManual ? 'Downloaded' : 'Download'}
                  </Text>
                </View>
              </TouchableOpacity>

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
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginTop: 14,
                }}
              >
                <RefreshCw size={15} color={isDark ? '#cbd5e1' : '#475569'} />
                <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Reconfigure MT5 Account / Run Setup
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add-On 1: Gold Scalper Pro */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? '#11131a' : '#ffffff',
                  borderColor: isDark ? '#1e2433' : '#e2e8f0',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.stepIconWrap, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                    <Coins size={18} color="#f59e0b" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Gold Scalper Pro (M1 Module)
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>
                      High-frequency liquidity scalper with spread guard
                    </Text>
                  </View>
                </View>
                <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                  <Text style={[styles.verifiedText, { color: '#10b981' }]}>INCLUDED</Text>
                </View>
              </View>
            </View>

            {/* Add-On 2: Dynamic Basket & Drawdown Guard */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? '#11131a' : '#ffffff',
                  borderColor: isDark ? '#1e2433' : '#e2e8f0',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.stepIconWrap, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <ShieldCheck size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Dynamic Basket &amp; Drawdown Guard
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>
                      1.5% maximum daily capital equity protection
                    </Text>
                  </View>
                </View>
                <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                  <Text style={[styles.verifiedText, { color: '#10b981' }]}>ACTIVE</Text>
                </View>
              </View>
            </View>

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
  downloadRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  stepIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});

