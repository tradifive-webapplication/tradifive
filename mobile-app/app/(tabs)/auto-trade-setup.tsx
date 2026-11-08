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
  TextInput,
  Clipboard,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
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
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Upload,
  Key,
  QrCode,
  Lock,
  Layers,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Mail,
  FileCode,
  Clock,
  Shield,
  Coins,
  Sliders,
  CreditCard,
  Wallet,
  Send,
  RefreshCw,
  Package,
  Receipt,
  ShieldAlert,
  Play,
  Pause,
  Calendar,
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

// Official Institutional Partner Brokers
const BROKERS = [
  {
    id: 'vantage',
    name: 'Vantage Markets',
    url: 'https://vigco.co/la-com-inv/MCTDw2R6',
    supportEmail: 'support@vantagemarkets.com',
    tagline: 'Raw ECN · Low Spreads',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
  },
  {
    id: 'exness',
    name: 'Exness',
    url: 'https://exness.com/ib',
    supportEmail: 'support@exness.com',
    tagline: 'Instant Withdrawals · Zero Swap',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
  },
  {
    id: 'xm',
    name: 'XM Global',
    url: 'https://xm.com/ib',
    supportEmail: 'support@xm.com',
    tagline: 'Ultra Low Spread',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
  },
  {
    id: 'fusion',
    name: 'Fusion Markets',
    url: 'https://fusionmarkets.com/ib',
    supportEmail: 'help@fusionmarkets.com',
    tagline: 'Lowest Commission',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
  },
  {
    id: 'blackbull',
    name: 'BlackBull',
    url: 'https://blackbull.com/ib',
    supportEmail: 'support@blackbullmarkets.com',
    tagline: 'Institutional Execution',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
  },
];

// Cryptographic Key Generator matching Tradifive.mq5 FNV-1a algorithm & TF_SALT
export const generateTradifiveLicenseKey = (mt5AccountNumber?: string | number, expDays: number = 10000): string => {
  const salt = 'TFv1-Zk39xQ-7mLpA2';
  const numClean = String(mt5AccountNumber || '').replace(/\D/g, '');
  if (!numClean) return 'TF-PENDING-ACTIVATION';
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
    const hexAcc = Math.abs(Number(numClean) || 0).toString(16).toUpperCase().padStart(8, '0').slice(-8);
    return `TF-${hexAcc.slice(0, 4)}-${hexAcc.slice(4, 8)}-94A1C8B204`;
  }
};

export default function AutoTradeSetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const currentUser = useStore((state) => state.currentUser);
  const mt5Account = useStore((state) => state.mt5Account);

  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  const [refreshing, setRefreshing] = useState(false);

  // Mode: 'dashboard' (Live Engine) vs 'setup' (4-Step Wizard)
  const [activeMode, setActiveMode] = useState<'setup' | 'dashboard' | 'orders'>('setup');
  const [isLicenseUnlocked, setIsLicenseUnlocked] = useState(false);
  const [copiedOrderKey, setCopiedOrderKey] = useState(false);
  const [downloadedManual, setDownloadedManual] = useState(false);

  // Wizard active step: 1 (Connect), 2 (Download), 3 (Payment), 4 (Activate)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Linear native scroll translation — zero diffClamp jitter on slow drags
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 72;
  const maxHeaderScroll = Math.max(0, (headerStyle === 'simple' ? insets.top + 74 : insets.top + 104) - insets.top);
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, maxHeaderScroll],
    outputRange: [0, -maxHeaderScroll],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [140, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const lastScrollY = useRef(0);
  const isTabBarVisible = useRef(true);

  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY <= 15) {
      if (!isTabBarVisible.current) {
        isTabBarVisible.current = true;
        DeviceEventEmitter.emit('toggleTabBar', { show: true });
      }
    } else if (diff > 8 && currentY > 40) {
      if (isTabBarVisible.current) {
        isTabBarVisible.current = false;
        DeviceEventEmitter.emit('toggleTabBar', { show: false });
      }
    } else if (diff < -8) {
      if (!isTabBarVisible.current) {
        isTabBarVisible.current = true;
        DeviceEventEmitter.emit('toggleTabBar', { show: true });
      }
    }
    lastScrollY.current = currentY;
  };

  // Setup Form State
  const [setupPath, setSetupPath] = useState<'new' | 'transfer'>('new');
  const [selectedBroker, setSelectedBroker] = useState<string>('vantage');
  const [accountNumber, setAccountNumber] = useState(mt5Account?.account_number || '');
  const [server, setServer] = useState(mt5Account?.server || '');
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'none' | 'pending' | 'approved'>(mt5Account?.account_number ? 'approved' : 'none');

  // Step 3 Payment State
  const [selectedTier, setSelectedTier] = useState<'three_years' | 'profit_share'>('three_years');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending' | 'approved'>((currentUser as any)?.subscription_status === 'active' ? 'approved' : 'none');

  // Live Bot Execution State
  const [botActive, setBotActive] = useState(Boolean(mt5Account?.algo_status));
  const [viewMode, setViewMode] = useState<'setup' | 'dashboard'>('setup');
  const [downloadedEA, setDownloadedEA] = useState(false);

  // Clipboard Copied States
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const currentBroker = useMemo(() => {
    return BROKERS.find((b) => b.id === selectedBroker) || BROKERS[0];
  }, [selectedBroker]);

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

  // Pick verification screenshot proof
  const handlePickProof = async () => {
    hSelect();
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setProofUri(res.assets[0].uri);
        hSuccess();
      }
    } catch (e) {
      Alert.alert('Notice', 'Unable to open photos. You can still submit your account number.');
    }
  };

  // Pick payment receipt proof
  const handlePickPaymentProof = async () => {
    hSelect();
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPaymentProofUri(res.assets[0].uri);
        hSuccess();
      }
    } catch (e) {
      Alert.alert('Notice', 'Unable to open photos. Please enter your 12-digit UPI UTR number.');
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'code' | 'upi' | 'webhook' | 'orderKey') => {
    Clipboard.setString(text);
    hSuccess();
    if (type === 'orderKey') {
      setCopiedOrderKey(true);
      setTimeout(() => setCopiedOrderKey(false), 2000);
    } else if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'upi') {
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    } else if (type === 'webhook') {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  // Submit Step 1 Proof
  const handleSubmitProof = () => {
    if (!accountNumber.trim()) {
      Alert.alert('Required', 'Please enter your MT5 Account Number.');
      return;
    }
    setIsSubmittingProof(true);
    setTimeout(() => {
      setIsSubmittingProof(false);
      setTransferStatus('pending');
      hSuccess();
      Alert.alert(
        'Account Submitted',
        `Account #${accountNumber} is being verified with ${currentBroker.name}. Review completes within 1–2 hours.`,
        [
          {
            text: 'Continue to Step 2',
            onPress: () => setActiveStep(2),
          },
        ]
      );
    }, 900);
  };

  // Submit Step 3 Payment
  const handleSubmitPayment = () => {
    if (!utrNumber.trim()) {
      Alert.alert('Required', 'Please enter your 12-digit UPI UTR or Reference Number.');
      return;
    }
    setIsSubmittingPayment(true);
    setTimeout(() => {
      setIsSubmittingPayment(false);
      setPaymentStatus('pending');
      hSuccess();
      Alert.alert(
        'Payment Submitted',
        `UTR #${utrNumber} submitted for verification. Your license key will unlock in Step 4 within 2 hours.`,
        [
          {
            text: 'View Step 4 (License)',
            onPress: () => setActiveStep(4),
          },
        ]
      );
    }, 900);
  };

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
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>
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
                <Bell size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── COLLAPSIBLE HEADER (Matching Other Pages) ── */}
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

        {/* Content Row */}
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
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff', letterSpacing: -0.5 }}>
              Auto Trade
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
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
        </Animated.View>
      </Animated.View>

      {/* ── MAIN CONTENT CARD (Smooth unified whole-page scroll) ── */}
      <Animated.View
        style={[
          styles.card,
          {
            marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }),
            borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
            borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
            backgroundColor: isDark ? theme.background : '#f8fafc',
            transform: [],
          },
        ]}
      >
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          bounces={true}
          alwaysBounceVertical={true}
          overScrollMode="always"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 220 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" />}
        >
          <Animated.View style={headerStyle === 'simple' ? [] : { transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            <View style={{ gap: 14 }}>
                        {/* Mode Switcher: Live Dashboard vs Setup Wizard */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: isDark ? '#141724' : '#e2e8f0',
                borderRadius: 14,
                padding: 3,
                marginBottom: 2,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hSelect();
                  setViewMode('dashboard');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 11,
                  backgroundColor: viewMode === 'dashboard' ? (isDark ? '#38bdf8' : '#0f172a') : 'transparent',
                  flexDirection: 'row',
                  gap: 6,
                }}
              >
                <Activity size={13} color={viewMode === 'dashboard' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b')} />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter_700Bold',
                    color: viewMode === 'dashboard' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                  }}
                >
                  Live Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  hSelect();
                  setViewMode('setup');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 11,
                  backgroundColor: viewMode === 'setup' ? (isDark ? '#38bdf8' : '#0f172a') : 'transparent',
                  flexDirection: 'row',
                  gap: 6,
                }}
              >
                <Key size={13} color={viewMode === 'setup' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b')} />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter_700Bold',
                    color: viewMode === 'setup' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                  }}
                >
                  Setup & Key ({activeStep}/4)
                </Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'dashboard' ? (
              <View style={{ gap: 14 }}>
                {/* ── LIVE TELEMETRY STATUS BAR ── */}
                <View
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    backgroundColor: isDark ? '#11131a' : '#ffffff',
                    borderWidth: 1,
                    borderColor: isDark ? '#1e2433' : '#e2e8f0',
                    gap: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                        FiAlgo MT5 #{accountNumber || 'Pending'}
                      </Text>
                      <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7' }}>
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_700Bold', color: '#d97706' }}>
                          USC Cent
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        hSelect();
                        setBotActive(!botActive);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: botActive ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') : (isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2'),
                        borderWidth: 1,
                        borderColor: botActive ? '#10b981' : '#ef4444',
                      }}
                    >
                      {botActive ? <Play size={11} color="#10b981" fill="#10b981" /> : <Pause size={11} color="#ef4444" fill="#ef4444" />}
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: botActive ? '#10b981' : '#ef4444' }}>
                        {botActive ? 'Bot Active' : 'Bot Paused'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: isDark ? '#1e2433' : '#f1f5f9', paddingTop: 8 }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                      Server: <Text style={{ fontFamily: 'Inter_700Bold', color: isDark ? '#cbd5e1' : '#475569' }}>{server || 'Vantage-Live 2'}</Text>
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#d97706' }}>
                      XAUUSD (M1)
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                      1.8ms Latency
                    </Text>
                  </View>
                </View>

                {/* ── 1. ACCOUNT BALANCE (USC) ── */}
                <View
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    backgroundColor: isDark ? '#11131a' : '#ffffff',
                    borderWidth: 1,
                    borderColor: isDark ? '#1e2433' : '#e2e8f0',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Account Balance
                    </Text>
                    <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: isDark ? 'rgba(56,189,248,0.15)' : '#e0f2fe', alignItems: 'center', justifyContent: 'center' }}>
                      <Wallet size={15} color="#0284c7" />
                    </View>
                  </View>
                  <Text style={{ fontSize: 24, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a', letterSpacing: -0.5 }}>
                    USC 14,866.24
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDark ? '#1e2433' : '#f1f5f9' }}>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                      Equity: <Text style={{ fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>USC 14,866.24</Text>
                    </Text>
                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: isDark ? '#1e2433' : '#f1f5f9' }}>
                      <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#64748b' }}>
                        Lvl 0%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* ── 2 & 3. NET PROFIT + TODAY'S PROFIT GRID ── */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#11131a' : '#ffffff',
                      borderWidth: 1,
                      borderColor: isDark ? '#1e2433' : '#e2e8f0',
                    }}
                  >
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Net Profit
                    </Text>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#10b981', marginVertical: 4 }}>
                      +USC 4,866.24
                    </Text>
                    <Text style={{ fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#10b981' }}>
                      +32.7% All Time
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#11131a' : '#ffffff',
                      borderWidth: 1,
                      borderColor: isDark ? '#1e2433' : '#e2e8f0',
                    }}
                  >
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Today's Profit
                    </Text>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#10b981', marginVertical: 4 }}>
                      +USC 412.50
                    </Text>
                    <Text style={{ fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#38bdf8' }}>
                      Goal: USC 222.99 ✓
                    </Text>
                  </View>
                </View>

                {/* ── 4 & 5. TOTAL DEPOSITS + WITHDRAWALS GRID ── */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#11131a' : '#ffffff',
                      borderWidth: 1,
                      borderColor: isDark ? '#1e2433' : '#e2e8f0',
                    }}
                  >
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Total Deposits
                    </Text>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a', marginVertical: 4 }}>
                      USC 14,866.24
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_500Medium', color: '#64748b' }}>
                      Funded Capital
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#11131a' : '#ffffff',
                      borderWidth: 1,
                      borderColor: isDark ? '#1e2433' : '#e2e8f0',
                    }}
                  >
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Withdrawals
                    </Text>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a', marginVertical: 4 }}>
                      USC 0.00
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_500Medium', color: '#64748b' }}>
                      Processed Payouts
                    </Text>
                  </View>
                </View>

                {/* ── WEEKLY 50/50 SETTLEMENT (IN INR) ── */}
                <View
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    backgroundColor: isDark ? '#0f172a' : '#eff6ff',
                    borderWidth: 1,
                    borderColor: isDark ? '#1e293b' : '#bfdbfe',
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <QrCode size={14} color="#0284c7" />
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_800ExtraBold', color: '#0369a1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Platform Share (50%)
                      </Text>
                    </View>
                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: isDark ? '#1e293b' : '#dbeafe' }}>
                      <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#0284c7' }}>
                        Weekly Settlement
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 26, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a', letterSpacing: -0.5 }}>
                    ₹386.42
                  </Text>

                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 15 }}>
                    Settled weekly on your designated cohort day (Every Monday). Managed systematically by Tradifive Finance Desk.
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSelect();
                        Alert.alert('Withdrawal Request', 'Your weekly withdrawal request has been submitted to your broker.');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#0284c7',
                        paddingVertical: 10,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#ffffff' }}>
                        Request Withdrawal
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSelect();
                        Alert.alert('Remit Platform Share', 'Scan UPI QR code or transfer to Tradifive corporate UPI ID: tradifive@icici');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: isDark ? '#1e2433' : '#ffffff',
                        borderWidth: 1,
                        borderColor: isDark ? '#2e384d' : '#cbd5e1',
                        paddingVertical: 10,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                        Remit Share (UPI)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── FIALGO V1 ENGINE STATUS CARD ── */}
                <View
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    backgroundColor: isDark ? '#11131a' : '#ffffff',
                    borderWidth: 1,
                    borderColor: isDark ? '#1e2433' : '#e2e8f0',
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Cpu size={14} color="#38bdf8" />
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                        FiAlgo V1 Institutional Engine
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                      <Text style={{ fontSize: 10.5, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                        Execution Live
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748b', lineHeight: 15 }}>
                    Scanning XAUUSD M1 chart for volatility breakout baskets. Protected by hardware-bound cryptographic key #{accountNumber || 'Pending'}.
                  </Text>
                </View>

                {/* ── OPTION TO VIEW SETUP GUIDE & KEY ── */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    hSelect();
                    setViewMode('setup');
                    setActiveStep(4);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: isDark ? '#1e2433' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: isDark ? '#2e384d' : '#e2e8f0',
                  }}
                >
                  <Key size={14} color={isDark ? '#38bdf8' : '#0284c7'} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#38bdf8' : '#0284c7' }}>
                    View License Key & MT5 Setup Instructions &rarr;
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
              {/* ── 4-STEP PROGRESSOR HEADER ── */}
              <View style={[styles.processorCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                {/* Step header title */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 12.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    Step {activeStep} of 4: {activeStep === 1 ? 'Connect MT5' : activeStep === 2 ? 'Download FiAlgo' : activeStep === 3 ? 'License Payment' : 'Activate License'}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_800ExtraBold', color: '#38bdf8' }}>
                    {activeStep === 1 ? '25%' : activeStep === 2 ? '50%' : activeStep === 3 ? '75%' : '100%'}
                  </Text>
                </View>

                {/* Progress bar track */}
                <View style={[styles.progressTrack, { backgroundColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: activeStep === 1 ? '25%' : activeStep === 2 ? '50%' : activeStep === 3 ? '75%' : '100%',
                      },
                    ]}
                  />
                </View>

                {/* 4 Interactive Step Buttons */}
                <View style={styles.milestoneGrid}>
                  {[
                    { step: 1, label: '1. Connect', shortLabel: 'Connect', isDone: transferStatus === 'approved' },
                    { step: 2, label: '2. Download', shortLabel: 'Download', isDone: downloadedEA },
                    { step: 3, label: '3. License', shortLabel: 'License', isDone: paymentStatus === 'approved' },
                    { step: 4, label: '4. Activate', shortLabel: 'Activate', isDone: paymentStatus === 'approved' && transferStatus === 'approved' },
                  ].map((m) => {
                    const isActive = activeStep === m.step;
                    return (
                      <TouchableOpacity
                        key={m.step}
                        activeOpacity={0.8}
                        onPress={() => {
                          hSelect();
                          setActiveStep(m.step);
                        }}
                        style={[
                          styles.milestoneBtn,
                          isActive && [styles.milestoneBtnActive, { backgroundColor: isDark ? '#ffffff' : '#0f172a' }],
                          !isActive && m.isDone && { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', borderColor: '#10b981' },
                          !isActive && !m.isDone && { backgroundColor: isDark ? '#0c0e14' : '#f1f5f9', borderColor: isDark ? '#1e2433' : '#e2e8f0' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.milestoneBtnText,
                            isActive && { color: isDark ? '#0f172a' : '#ffffff', fontFamily: 'Inter_700Bold' },
                            !isActive && m.isDone && { color: '#10b981', fontFamily: 'Inter_700Bold' },
                            !isActive && !m.isDone && { color: '#94a3b8' },
                          ]}
                          numberOfLines={1}
                        >
                          {m.isDone && !isActive ? `✓ ${m.shortLabel}` : m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* ══════════════════════════════════════════════════════════════
                  STEP 1: CONNECT MT5 BROKER ACCOUNT
                 ══════════════════════════════════════════════════════════════ */}
              {activeStep === 1 && (
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={[styles.formTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                      Connect MT5 Account
                    </Text>
                    {transferStatus === 'approved' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                        <CheckCircle2 size={12} color="#10b981" />
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>Connected</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.formDesc}>
                    Complete these steps to connect your broker and unlock your FiAlgo V1 license.
                  </Text>

                  {/* Path Switch: Open New vs Transfer Existing */}
                  <View style={[styles.pathToggleRow, { backgroundColor: isDark ? '#0c0e14' : '#f1f5f9' }]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        hSelect();
                        setSetupPath('new');
                      }}
                      style={[
                        styles.pathToggleBtn,
                        setupPath === 'new' && [styles.pathToggleBtnActive, { backgroundColor: isDark ? '#1e2433' : '#ffffff' }],
                      ]}
                    >
                      <Text style={[styles.pathToggleText, { color: setupPath === 'new' ? (isDark ? '#38bdf8' : '#0f172a') : '#94a3b8' }]}>
                        Open New Account
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        hSelect();
                        setSetupPath('transfer');
                      }}
                      style={[
                        styles.pathToggleBtn,
                        setupPath === 'transfer' && [styles.pathToggleBtnActive, { backgroundColor: isDark ? '#1e2433' : '#ffffff' }],
                      ]}
                    >
                      <Text style={[styles.pathToggleText, { color: setupPath === 'transfer' ? (isDark ? '#38bdf8' : '#0f172a') : '#94a3b8' }]}>
                        Transfer Existing
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* PATH A: OPEN NEW ACCOUNT */}
                  {setupPath === 'new' && (
                    <View style={{ gap: 10, marginTop: 10 }}>
                      {/* Step 1.1: Register Link */}
                      <View style={[styles.instructionCard, { backgroundColor: isDark ? '#0c0e14' : '#f0f9ff', borderColor: 'rgba(56,189,248,0.3)' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.stepNumCircle}><Text style={styles.stepNumText}>1</Text></View>
                            <Text style={[styles.instructionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                              Open Vantage MT5 Account
                            </Text>
                          </View>
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#0284c7' }}>OFFICIAL PARTNER</Text>
                        </View>
                        <Text style={styles.instructionDesc}>
                          Register using our official partner link. Partner code <Text style={{ fontFamily: 'Inter_700Bold' }}>MCTDw2R6</Text> applies automatically.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => Linking.openURL('https://vigco.co/la-com-inv/MCTDw2R6')}
                            style={[styles.partnerActionBtn, { flex: 1, backgroundColor: '#0284c7' }]}
                          >
                            <ExternalLink size={14} color="#fff" />
                            <Text style={styles.partnerActionBtnText} numberOfLines={1}>Open Vantage Account</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => copyToClipboard('MCTDw2R6', 'code')}
                            style={[styles.codeCopyBtn, { borderColor: isDark ? '#2e3547' : '#cbd5e1' }]}
                          >
                            {copiedCode ? <Check size={13} color="#10b981" /> : <Copy size={13} color={isDark ? '#cbd5e1' : '#475569'} />}
                            <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: copiedCode ? '#10b981' : (isDark ? '#cbd5e1' : '#475569') }}>
                              {copiedCode ? 'Copied' : 'Copy Code'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Step 1.2: Minimum Deposit Callout */}
                      <View style={[styles.instructionCard, { backgroundColor: isDark ? '#0c0e14' : '#fffbeb', borderColor: 'rgba(245,158,11,0.3)' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={[styles.stepNumCircle, { backgroundColor: '#f59e0b' }]}><Text style={styles.stepNumText}>2</Text></View>
                          <Text style={[styles.instructionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                            Complete KYC &amp; Fund $500+ USD
                          </Text>
                        </View>
                        <Text style={styles.instructionDesc}>
                          Complete ID verification and deposit at least <Text style={{ fontFamily: 'Inter_700Bold' }}>$500 USD</Text> into your trading account.
                        </Text>
                      </View>

                      {/* Step 1.3: Submit Account Number */}
                      <View style={[styles.instructionCard, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={styles.stepNumCircle}><Text style={styles.stepNumText}>3</Text></View>
                          <Text style={[styles.instructionTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                            Submit MT5 Account Number
                          </Text>
                        </View>

                        <View style={{ gap: 8, marginTop: 6 }}>
                          <TextInput
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            placeholder="e.g. 8492015"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            style={[styles.inputBox, { backgroundColor: isDark ? '#11131a' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                          />

                          {/* Min Deposit Confirmation Checkbox */}
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setDepositConfirmed(!depositConfirmed)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
                          >
                            <View style={[styles.checkbox, depositConfirmed && { backgroundColor: '#38bdf8', borderColor: '#38bdf8' }]}>
                              {depositConfirmed && <Check size={11} color="#000" strokeWidth={3} />}
                            </View>
                            <Text style={{ flex: 1, fontSize: 11.5, fontFamily: 'Inter_500Medium', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 16 }}>
                              I confirm this account has a minimum balance of $500 USD.
                            </Text>
                          </TouchableOpacity>

                          {/* Screenshot Proof Picker */}
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handlePickProof}
                            style={[styles.uploadBox, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: proofUri ? '#10b981' : (isDark ? '#1e2433' : '#e2e8f0') }]}
                          >
                            <Upload size={16} color={proofUri ? '#10b981' : '#38bdf8'} />
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: proofUri ? '#10b981' : (isDark ? '#38bdf8' : '#0284c7') }}>
                              {proofUri ? 'Deposit Screenshot Attached ✓' : 'Attach Deposit Screenshot Proof'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* PATH B: TRANSFER EXISTING ACCOUNT */}
                  {setupPath === 'transfer' && (
                    <View style={{ gap: 10, marginTop: 10 }}>
                      {/* Step B.1: Broker Selector */}
                      <View style={[styles.instructionCard, { backgroundColor: isDark ? '#0c0e14' : '#f0f9ff', borderColor: 'rgba(56,189,248,0.3)' }]}>
                        <Text style={[styles.instructionTitle, { color: isDark ? '#ffffff' : '#0f172a', marginBottom: 4 }]}>
                          Select Existing Broker:
                        </Text>
                        <View style={styles.brokerGrid}>
                          {BROKERS.map((b) => (
                            <TouchableOpacity
                              key={b.id}
                              activeOpacity={0.8}
                              onPress={() => {
                                hSelect();
                                setSelectedBroker(b.id);
                              }}
                              style={[
                                styles.brokerPill,
                                selectedBroker === b.id && styles.brokerPillActive,
                                { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: selectedBroker === b.id ? '#38bdf8' : (isDark ? '#1e2433' : '#e2e8f0') },
                              ]}
                            >
                              <Text style={[styles.brokerPillText, { color: selectedBroker === b.id ? '#38bdf8' : (isDark ? '#ffffff' : '#0f172a') }]}>
                                {b.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <Text style={[styles.instructionDesc, { marginTop: 6 }]}>
                          Email support at <Text style={{ fontFamily: 'Inter_700Bold' }}>{currentBroker.supportEmail}</Text> with Partner IB <Text style={{ fontFamily: 'Inter_700Bold' }}>{currentBroker.ibNumber}</Text>.
                        </Text>
                      </View>

                      {/* Step B.2: Submit Account Number */}
                      <View style={[styles.instructionCard, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                        <TextInput
                          value={accountNumber}
                          onChangeText={setAccountNumber}
                          placeholder="MT5 Account Number (e.g. 8492015)"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          style={[styles.inputBox, { backgroundColor: isDark ? '#11131a' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                        />
                      </View>
                    </View>
                  )}

                  {/* Navigation Button */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleSubmitProof}
                      style={[styles.stepActionBtn, { flex: 1, backgroundColor: isDark ? '#38bdf8' : '#0f172a' }]}
                    >
                      {isSubmittingProof ? (
                        <RefreshCw size={15} color={isDark ? '#0f172a' : '#ffffff'} />
                      ) : (
                        <Text style={[styles.stepActionBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>
                          Submit &amp; Continue to Step 2 (Download)
                        </Text>
                      )}
                      <ArrowRight size={16} color={isDark ? '#0f172a' : '#ffffff'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 2: DOWNLOAD FIALGO V1 & PRESETS
                 ══════════════════════════════════════════════════════════════ */}
              {activeStep === 2 && (
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  {/* Hero Showcase with 3D Product Box */}
                  <View style={styles.downloadHeroRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Shield size={12} color="#10b981" />
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                          Official Flagship EA · MT5 Build
                        </Text>
                      </View>
                      <Text style={[styles.formTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                        FiAlgo V1 (MetaTrader 5)
                      </Text>
                      <Text style={styles.formDesc}>
                        Precision Gold (XAUUSD) algorithm with automated dynamic basket and capital protection.
                      </Text>
                    </View>
                    <Image
                      source={require('../../assets/images/fialgo-v1-box.png')}
                      style={{ width: 70, height: 70, resizeMode: 'contain' }}
                    />
                  </View>

                  {/* 4 Specifications Grid Tiles */}
                  <View style={styles.specGrid}>
                    <View style={[styles.specTile, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <Text style={styles.specTileLabel}>ASSET PAIR</Text>
                      <Text style={[styles.specTileVal, { color: isDark ? '#ffffff' : '#0f172a' }]} numberOfLines={1}>XAUUSD (Gold)</Text>
                    </View>
                    <View style={[styles.specTile, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <Text style={styles.specTileLabel}>TIMEFRAME</Text>
                      <Text style={[styles.specTileVal, { color: isDark ? '#ffffff' : '#0f172a' }]} numberOfLines={1}>1-Min (M1)</Text>
                    </View>
                    <View style={[styles.specTile, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <Text style={styles.specTileLabel}>EXECUTION</Text>
                      <Text style={[styles.specTileVal, { color: '#10b981' }]} numberOfLines={1}>&lt; 3ms Direct</Text>
                    </View>
                    <View style={[styles.specTile, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <Text style={styles.specTileLabel}>ENGINE</Text>
                      <Text style={[styles.specTileVal, { color: '#38bdf8' }]} numberOfLines={1}>Dynamic Basket</Text>
                    </View>
                  </View>

                  {/* Downloads Cards */}
                  <View style={{ gap: 8, marginVertical: 10 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSuccess();
                        setDownloadedEA(true);
                        Alert.alert('Download Started', 'FiAlgo_v1.0.4.ex5 binary has been saved. Copy into your MT5 MQL5/Experts folder.');
                      }}
                      style={[styles.downloadCard, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                        <View style={[styles.fileIconBox, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                          <Cpu size={18} color="#38bdf8" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            FiAlgo_v1.0.4.ex5 (248 KB)
                          </Text>
                          <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            Real compiled MetaTrader 5 Expert Advisor
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.downloadPill, { backgroundColor: downloadedEA ? '#10b981' : '#38bdf8' }]}>
                        {downloadedEA ? <Check size={13} color="#fff" /> : <Download size={13} color="#0f172a" />}
                        <Text style={[styles.downloadPillText, { color: downloadedEA ? '#fff' : '#0f172a' }]}>
                          {downloadedEA ? 'Saved' : 'Download'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                  </View>

                  {/* MT5 WebRequest Setup Callout */}
                  <View style={[styles.webrequestBox, { backgroundColor: isDark ? 'rgba(56,189,248,0.06)' : '#f0f9ff', borderColor: 'rgba(56,189,248,0.3)' }]}>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: isDark ? '#7dd3fc' : '#0284c7', marginBottom: 4 }}>
                      REQUIRED MT5 WEBREQUEST SETUP:
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748b', lineHeight: 16 }}>
                      In MT5 → Tools → Options → Experts, check "Allow WebRequest" and add:
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, backgroundColor: isDark ? '#0c0e14' : '#ffffff', padding: 8, borderRadius: 8 }}>
                      <Text style={{ flex: 1, fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#38bdf8', marginRight: 8 }} numberOfLines={1}>
                        https://hcgylvdvlandtiuudefu.supabase.co
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => copyToClipboard('https://hcgylvdvlandtiuudefu.supabase.co', 'webhook')}
                        style={styles.webhookCopyBtn}
                      >
                        {copiedWebhook ? <Check size={12} color="#10b981" /> : <Copy size={12} color="#38bdf8" />}
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_700Bold', color: copiedWebhook ? '#10b981' : '#38bdf8' }}>
                          {copiedWebhook ? 'Copied' : 'Copy'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Navigation Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setActiveStep(1)}
                      style={[styles.backStepBtn, { borderColor: isDark ? '#2e3547' : '#e2e8f0' }]}
                    >
                      <ArrowLeft size={14} color={isDark ? '#cbd5e1' : '#475569'} />
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#cbd5e1' : '#475569' }}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setActiveStep(3)}
                      style={[styles.stepActionBtn, { flex: 1, backgroundColor: isDark ? '#38bdf8' : '#0f172a' }]}
                    >
                      <Text style={[styles.stepActionBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>
                        Continue to Step 3
                      </Text>
                      <ArrowRight size={16} color={isDark ? '#0f172a' : '#ffffff'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 3: BUY ALGO & LICENSE PAYMENT
                 ══════════════════════════════════════════════════════════════ */}
              {activeStep === 3 && (
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <Text style={[styles.formTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    Buy Algo &amp; License Payment
                  </Text>
                  <Text style={styles.formDesc}>
                    Complete payment via PhonePe / UPI or Bank Transfer to request your personal license key.
                  </Text>

                  {/* Two Official Plans */}
                  <View style={{ gap: 10, marginVertical: 10 }}>
                    {/* Option 1: 3-Year Enterprise Pass */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setSelectedTier('three_years')}
                      style={[
                        styles.tierCard,
                        selectedTier === 'three_years' && styles.tierCardActive,
                        {
                          backgroundColor: selectedTier === 'three_years' ? (isDark ? '#141724' : '#f0fdf4') : (isDark ? '#0c0e14' : '#f8fafc'),
                          borderColor: selectedTier === 'three_years' ? '#10b981' : (isDark ? '#1e2433' : '#e2e8f0'),
                          borderWidth: selectedTier === 'three_years' ? 1.5 : 1,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                              3-Year Enterprise Pass
                            </Text>
                            <View style={[styles.popularBadge, { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' }]}>
                              <Text style={[styles.popularText, { color: '#10b981', fontSize: 9 }]}>0% PROFIT SHARE</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 4, lineHeight: 15 }}>
                            ₹1,00,000 One-time · 3-Year validity · Keep 100% of profits · 50% discount renewal after 3 years (₹49,999)
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: selectedTier === 'three_years' ? '#10b981' : (isDark ? '#ffffff' : '#0f172a') }}>
                            ₹1,00,000
                          </Text>
                          <Text style={{ fontSize: 9.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>
                            3-Yr License
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Option 2: Performance Partner */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setSelectedTier('profit_share')}
                      style={[
                        styles.tierCard,
                        selectedTier === 'profit_share' && styles.tierCardActive,
                        {
                          backgroundColor: selectedTier === 'profit_share' ? (isDark ? '#141724' : '#eff6ff') : (isDark ? '#0c0e14' : '#f8fafc'),
                          borderColor: selectedTier === 'profit_share' ? '#3b82f6' : (isDark ? '#1e2433' : '#e2e8f0'),
                          borderWidth: selectedTier === 'profit_share' ? 1.5 : 1,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                              Performance Partner
                            </Text>
                            <View style={[styles.popularBadge, { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)' }]}>
                              <Text style={[styles.popularText, { color: '#3b82f6', fontSize: 9 }]}>WEEKLY 50% SPLIT</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 4, lineHeight: 15 }}>
                            ₹10,000 Setup Fee · Weekly 50/50% split on net green weeks · ₹0 fee on flat or red weeks
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: selectedTier === 'profit_share' ? '#3b82f6' : (isDark ? '#ffffff' : '#0f172a') }}>
                            ₹10,000
                          </Text>
                          <Text style={{ fontSize: 9.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>
                            Setup Fee
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Payment Details Box */}
                  <View style={[styles.payDetailsBox, { backgroundColor: isDark ? '#0c0e14' : '#f0fdf4', borderColor: isDark ? '#1e2433' : '#bbf7d0' }]}>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>
                      UPI / PHONEPE PAYMENT DETAILS (PAY ₹{selectedTier === 'three_years' ? '1,00,000' : '10,000'}):
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ flex: 1, fontSize: 14.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginRight: 8 }} numberOfLines={1}>
                        9731980756@axisbank
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => copyToClipboard('9731980756@axisbank', 'upi')}
                        style={styles.upiCopyBtn}
                      >
                        {copiedUPI ? <Check size={12} color="#16a34a" /> : <Copy size={12} color="#16a34a" />}
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#16a34a' }}>
                          {copiedUPI ? 'Copied' : 'Copy UPI'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748b' }}>
                      Bank: Axis Bank · A/C: 924010072811588 · IFSC: UTIB0002148
                    </Text>
                  </View>

                  {/* Form Inputs */}
                  <View style={{ gap: 8, marginTop: 6 }}>
                    <TextInput
                      value={utrNumber}
                      onChangeText={setUtrNumber}
                      placeholder="Enter 12-Digit Transaction UTR Number *"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      style={[styles.inputBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', color: isDark ? '#ffffff' : '#0f172a', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                    />

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handlePickPaymentProof}
                      style={[styles.uploadBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: paymentProofUri ? '#10b981' : (isDark ? '#1e2433' : '#e2e8f0') }]}
                    >
                      <Upload size={16} color={paymentProofUri ? '#10b981' : '#38bdf8'} />
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: paymentProofUri ? '#10b981' : (isDark ? '#38bdf8' : '#0284c7') }}>
                        {paymentProofUri ? 'Payment Screenshot Attached ✓' : 'Upload Payment Receipt Screenshot'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* WhatsApp Fast Track Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`Hello TradiFive Team! I have completed payment of ₹${selectedTier === 'three_years' ? '1,00,000 (3-Year Pass)' : '10,000 (Performance Partner)'} for FiAlgo V1 (UTR: ${utrNumber || 'Submitted'}). Please expedite and issue my license key.`)}`)}
                    style={styles.fastTrackBtn}
                  >
                    <MessageCircle size={15} color="#10b981" />
                    <Text style={styles.fastTrackText}>15-Min Priority Review on WhatsApp</Text>
                  </TouchableOpacity>

                  {/* Navigation Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setActiveStep(2)}
                      style={[styles.backStepBtn, { borderColor: isDark ? '#2e3547' : '#e2e8f0' }]}
                    >
                      <ArrowLeft size={14} color={isDark ? '#cbd5e1' : '#475569'} />
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#cbd5e1' : '#475569' }}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleSubmitPayment}
                      style={[styles.stepActionBtn, { flex: 1, backgroundColor: '#10b981' }]}
                    >
                      {isSubmittingPayment ? (
                        <RefreshCw size={15} color="#fff" />
                      ) : (
                        <Text style={[styles.stepActionBtnText, { color: '#ffffff', flexShrink: 1 }]} numberOfLines={1}>
                          Submit &amp; View License Key →
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 4: ACTIVATE & COPY LICENSE KEY
                 ══════════════════════════════════════════════════════════════ */}
              {activeStep === 4 && (
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  {/* Status Header */}
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <View style={styles.successIconCircle}>
                      <ShieldCheck size={26} color="#10b981" strokeWidth={2.5} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Active &amp; Cryptographically Bound
                      </Text>
                    </View>
                    <Text style={[styles.formTitle, { textAlign: 'center', color: isDark ? '#ffffff' : '#0f172a', fontSize: 18 }]}>
                      FiAlgo V1 License Active
                    </Text>
                    <Text style={[styles.formDesc, { textAlign: 'center', marginTop: 2 }]}>
                      Your personal cryptographic license key is bound and ready to trade on MT5 Account #{accountNumber || 'Pending'}.
                    </Text>
                  </View>

                  {/* Master License Key Box */}
                  <View style={[styles.keyBoxLarge, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0', borderWidth: 1 }]}>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                      MT5 LICENSE KEY (#{accountNumber || 'Pending'})
                    </Text>
                    <Text style={[styles.keyTextLarge, { color: isDark ? '#38bdf8' : '#0284c7', paddingHorizontal: 6, fontSize: 15 }]}>
                      {dynamicLicenseKey}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSuccess();
                        copyToClipboard(dynamicLicenseKey, 'key');
                      }}
                      style={[styles.largeCopyBtn, { backgroundColor: copiedKey ? '#10b981' : (isDark ? '#ffffff' : '#0f172a') }]}
                    >
                      {copiedKey ? <Check size={16} color={isDark ? '#000' : '#fff'} /> : <Copy size={16} color={isDark ? '#000' : '#fff'} />}
                      <Text style={[styles.largeCopyBtnText, { color: copiedKey ? (isDark ? '#000' : '#fff') : (isDark ? '#000' : '#fff') }]}>
                        {copiedKey ? 'License Key Copied!' : 'Copy License Key'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 2 Symmetric Setup Step Cards */}
                  <View style={{ gap: 8, marginVertical: 8 }}>
                    {/* Step 1: WebRequest */}
                    <View style={[styles.guideBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0', padding: 12 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff' }}>1</Text>
                          </View>
                          <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            Allow MT5 WebRequest
                          </Text>
                        </View>
                        <View style={{ backgroundColor: isDark ? '#1e2433' : '#e2e8f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 9.5, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Ctrl+O</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748b', lineHeight: 15 }}>
                        In MT5: Tools &rarr; Options &rarr; Experts. Check "Allow WebRequest" and add:
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, backgroundColor: isDark ? '#141724' : '#ffffff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#1e2433' : '#e2e8f0' }}>
                        <Text style={{ flex: 1, fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#38bdf8', marginRight: 6 }} numberOfLines={1}>
                          https://hcgylvdvlandtiuudefu.supabase.co
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            hSelect();
                            copyToClipboard('https://hcgylvdvlandtiuudefu.supabase.co', 'webhook');
                          }}
                          style={{ backgroundColor: '#0284c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                        >
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff' }}>
                            {copiedWebhook ? 'Copied' : 'Copy'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Step 2: Attach to Chart */}
                    <View style={[styles.guideBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0', padding: 12 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff' }}>2</Text>
                          </View>
                          <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            Attach to XAUUSD (M1)
                          </Text>
                        </View>
                        <View style={{ backgroundColor: isDark ? '#1e2433' : '#e2e8f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 9.5, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Press F7</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748b', lineHeight: 15 }}>
                        Drag FiAlgo onto an M1 (1-Min) Gold chart. Press F7 &rarr; Inputs &rarr; paste your key &rarr; click OK.
                      </Text>
                    </View>
                  </View>

                  {/* Downloads Row */}
                  <View style={{ marginVertical: 4 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSuccess();
                        Alert.alert('Download EA', 'FiAlgo_v1.0.4.ex5 saved to device.');
                      }}
                      style={[styles.downloadPill, { backgroundColor: isDark ? '#1e2433' : '#f1f5f9', borderWidth: 1, borderColor: isDark ? '#2e3547' : '#cbd5e1', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                    >
                      <Download size={13} color={isDark ? '#fff' : '#0f172a'} />
                      <Text style={[styles.downloadPillText, { color: isDark ? '#fff' : '#0f172a', fontSize: 11 }]}>
                        Download EA (.ex5)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Convert to Live Dashboard Button (Matches Web App "Open AutoTrade Dashboard") */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSuccess();
                      setViewMode('dashboard');
                    }}
                    style={[styles.launchDashboardBtn, { backgroundColor: isDark ? '#38bdf8' : '#0f172a' }]}
                  >
                    <Zap size={16} color={isDark ? '#0f172a' : '#ffffff'} fill={isDark ? '#0f172a' : '#ffffff'} />
                    <Text style={[styles.launchDashboardBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>
                      Open AutoTrade Dashboard
                    </Text>
                    <ArrowRight size={16} color={isDark ? '#0f172a' : '#ffffff'} />
                  </TouchableOpacity>
                </View>
              )}
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
    backgroundColor: '#fff',
    marginTop: -34,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 4,
    borderRadius: 16,
  },
  modeSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modeSegmentActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  modeSegmentText: {
    fontSize: 12.5,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
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
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#94a3b8',
    opacity: 0.2,
  },
  statLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#94a3b8',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  kpiLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  kpiBigVal: {
    fontSize: 19,
    fontFamily: 'Inter_800ExtraBold',
    marginVertical: 2,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
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
  keyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  keyText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 8,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyPillText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  tradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  closedTradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  wizardSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  processorCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 3,
  },
  milestoneGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  milestoneBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneBtnActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneBtnText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  formDesc: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 16,
  },
  pathToggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginVertical: 10,
  },
  pathToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  pathToggleBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  pathToggleText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  instructionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  stepNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  instructionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  instructionDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginTop: 3,
    lineHeight: 15,
  },
  partnerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  partnerActionBtnText: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  codeCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputBox: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  brokerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  brokerPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  brokerPillActive: {
    borderWidth: 1.5,
  },
  brokerPillText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  stepActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  stepActionBtnText: {
    fontSize: 12.5,
    fontFamily: 'Inter_700Bold',
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  downloadHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  specTile: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  specTileLabel: {
    fontSize: 8.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#94a3b8',
    marginBottom: 2,
  },
  specTileVal: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
  },
  downloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  fileIconBox: {
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
  downloadPillText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  webrequestBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  webhookCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
  },
  tierCardActive: {
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularText: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: '#f59e0b',
  },
  payDetailsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginVertical: 4,
  },
  upiCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fastTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 12,
    paddingVertical: 9,
    marginTop: 8,
  },
  fastTrackText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#10b981',
  },
  successIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  keyBoxLarge: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    marginVertical: 6,
  },
  keyTextLarge: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  largeCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  largeCopyBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  guideBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  guideStepText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginBottom: 4,
    lineHeight: 16,
  },
  launchDashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  launchDashboardBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
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
});
