import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Receipt,
  ShieldAlert,
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

  // Setup Form State
  const [setupPath, setSetupPath] = useState<'new' | 'transfer'>('new');
  const [selectedBroker, setSelectedBroker] = useState<string>('vantage');
  const [accountNumber, setAccountNumber] = useState(mt5Account?.account_number || '8392019');
  const [server, setServer] = useState(mt5Account?.server || 'Vantage-Live 2');
  const [depositConfirmed, setDepositConfirmed] = useState(true);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'none' | 'pending' | 'approved'>('approved');

  // Step 3 Payment State
  const [selectedTier, setSelectedTier] = useState<'lifetime' | 'profit_share'>('lifetime');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending' | 'approved'>('approved');

  // Live Bot Execution State
  const [botActive, setBotActive] = useState(true);
  const [downloadedEA, setDownloadedEA] = useState(false);
  const [downloadedPreset, setDownloadedPreset] = useState(false);

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

      {/* ── STATIC HEADER (Matching Inbox and Journal) ── */}
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

        {/* Content Row */}
        <View style={[styles.headerRow, { bottom: headerStyle === 'simple' ? 16 : 38 }]}>
          <View>
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff', letterSpacing: -0.5 }}>
              Auto Trade
            </Text>
            <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: headerStyle === 'simple' ? '#64748b' : 'rgba(255,255,255,0.7)', marginTop: 1 }}>
              FiAlgo V1 Institutional Engine · Gold Specialist
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
        {/* ═══ TOP SEGMENT SWITCHER: [🛠️ 4-Step Setup] | [⚡ Live Dashboard] | [📜 Order History] ═══ */}
        <View style={[styles.modeSwitcherContainer, { backgroundColor: isDark ? '#11131a' : '#eef2f6' }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hSelect();
              setActiveMode('setup');
            }}
            style={[
              styles.modeSegment,
              activeMode === 'setup' && [
                styles.modeSegmentActive,
                { backgroundColor: isDark ? '#1e2230' : '#ffffff', shadowColor: '#000' },
              ],
            ]}
          >
            <Layers size={13.5} color={activeMode === 'setup' ? (isDark ? '#38bdf8' : '#0f172a') : '#94a3b8'} strokeWidth={2.4} />
            <Text
              numberOfLines={1}
              style={[
                styles.modeSegmentText,
                { color: activeMode === 'setup' ? (isDark ? '#ffffff' : '#0f172a') : '#94a3b8', fontFamily: activeMode === 'setup' ? 'Inter_700Bold' : 'Inter_600SemiBold' },
              ]}
            >
              4-Step Setup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hSelect();
              setActiveMode('dashboard');
            }}
            style={[
              styles.modeSegment,
              activeMode === 'dashboard' && [
                styles.modeSegmentActive,
                { backgroundColor: isDark ? '#1e2230' : '#ffffff', shadowColor: '#000' },
              ],
            ]}
          >
            <Activity size={13.5} color={activeMode === 'dashboard' ? (isDark ? '#38bdf8' : '#0f172a') : '#94a3b8'} strokeWidth={2.4} />
            <Text
              numberOfLines={1}
              style={[
                styles.modeSegmentText,
                { color: activeMode === 'dashboard' ? (isDark ? '#ffffff' : '#0f172a') : '#94a3b8', fontFamily: activeMode === 'dashboard' ? 'Inter_700Bold' : 'Inter_600SemiBold' },
              ]}
            >
              Live Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hSelect();
              setActiveMode('orders');
            }}
            style={[
              styles.modeSegment,
              activeMode === 'orders' && [
                styles.modeSegmentActive,
                { backgroundColor: isDark ? '#1e2230' : '#ffffff', shadowColor: '#000' },
              ],
            ]}
          >
            <FileCode size={13.5} color={activeMode === 'orders' ? (isDark ? '#38bdf8' : '#0f172a') : '#94a3b8'} strokeWidth={2.4} />
            <Text
              numberOfLines={1}
              style={[
                styles.modeSegmentText,
                { color: activeMode === 'orders' ? (isDark ? '#ffffff' : '#0f172a') : '#94a3b8', fontFamily: activeMode === 'orders' ? 'Inter_700Bold' : 'Inter_600SemiBold' },
              ]}
            >
              Order History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 130 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" />}
        >
          {/* ══════════════════════════════════════════════════════════════════════
              MODE 1: LIVE AUTO TRADE DASHBOARD (Quant Fintech Architecture)
             ══════════════════════════════════════════════════════════════════════ */}
          {activeMode === 'dashboard' && !isLicenseUnlocked && (
            <View style={{ gap: 14 }}>
              {/* Locked Engine Card */}
              <View
                style={[
                  styles.heroCard,
                  {
                    backgroundColor: isDark ? '#10141f' : '#ffffff',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.4)',
                    paddingVertical: 32,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                  },
                ]}
              >
                <View
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    borderWidth: 1.5,
                    borderColor: 'rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <Lock size={32} color="#f59e0b" strokeWidth={2.2} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#f59e0b' }} />
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', textAlign: 'center' }}>
                    Live Engine Dashboard Locked
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'Inter_400Regular',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: 20,
                    marginBottom: 22,
                    maxWidth: 320,
                  }}
                >
                  Complete the 4-step setup and activate your personal license key to unlock real-time bot telemetry, live execution logs, MT5 server heartbeat, and automated risk guard.
                </Text>

                {/* Primary CTA: Start 4-Step Setup */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    hSelect();
                    setActiveMode('setup');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: '#38bdf8',
                    width: '100%',
                    paddingVertical: 14,
                    borderRadius: 14,
                    marginBottom: 10,
                  }}
                >
                  <Layers size={17} color="#0f172a" />
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0f172a' }}>
                    Complete 4-Step Setup First
                  </Text>
                  <ArrowRight size={17} color="#0f172a" />
                </TouchableOpacity>

                {/* Secondary CTA: Instant Unlock Demo */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    hSuccess();
                    setIsLicenseUnlocked(true);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: isDark ? 'rgba(56,189,248,0.1)' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(56,189,248,0.25)' : '#cbd5e1',
                    width: '100%',
                    paddingVertical: 13,
                    borderRadius: 14,
                    marginBottom: 10,
                  }}
                >
                  <Sparkles size={16} color="#38bdf8" />
                  <Text style={{ fontSize: 13.5, fontFamily: 'Inter_600SemiBold', color: isDark ? '#38bdf8' : '#0284c7' }}>
                    ⚡ Instant Unlock (Demo Preview)
                  </Text>
                </TouchableOpacity>

                {/* Tertiary CTA: Order History & Keys */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    hSelect();
                    setActiveMode('orders');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 8,
                  }}
                >
                  <FileCode size={15} color="#94a3b8" />
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                    View Order History &amp; License Keys
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'dashboard' && isLicenseUnlocked && (
            <View style={{ gap: 14 }}>
              {/* 1. Hero Bot Status Engine Card */}
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
                        Gold Specialist · Dynamic Basket (M1)
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
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: botActive ? '#10b981' : '#ef4444' }}>
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
                    <Text style={styles.statLabel}>LATENCY PING</Text>
                    <Text style={[styles.statVal, { color: '#38bdf8' }]}>&lt; 1.8ms</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>ASSET PAIR</Text>
                    <Text style={[styles.statVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>XAUUSD · M1</Text>
                  </View>
                </View>
              </View>

              {/* 2. Four Core Financial KPI Cards (2x2 Grid) */}
              <View style={styles.kpiGrid}>
                {/* KPI 1: Balance / Equity */}
                <View style={[styles.kpiCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.kpiLabel}>NET BALANCE</Text>
                    <Wallet size={14} color="#94a3b8" />
                  </View>
                  <Text style={[styles.kpiBigVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>$1,248.50</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#10b981' }}>Equity: $1,286.20</Text>
                </View>

                {/* KPI 2: Today's Profit */}
                <View style={[styles.kpiCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.kpiLabel}>TODAY P&amp;L</Text>
                    <TrendingUp size={14} color="#10b981" />
                  </View>
                  <Text style={[styles.kpiBigVal, { color: '#10b981' }]}>+$159.70</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Win Rate: 88.4%</Text>
                </View>

                {/* KPI 3: Floating Trades */}
                <View style={[styles.kpiCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.kpiLabel}>OPEN ORDERS</Text>
                    <Activity size={14} color="#38bdf8" />
                  </View>
                  <Text style={[styles.kpiBigVal, { color: '#38bdf8' }]}>2 Active</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#10b981' }}>Floating: +$52.70</Text>
                </View>

                {/* KPI 4: Max Drawdown Guard */}
                <View style={[styles.kpiCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.kpiLabel}>DRAWDOWN GUARD</Text>
                    <ShieldCheck size={14} color="#10b981" />
                  </View>
                  <Text style={[styles.kpiBigVal, { color: '#10b981' }]}>1.8% / 3.0%</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#10b981' }}>Risk Guard Protected</Text>
                </View>
              </View>

              {/* 3. Live Floating Positions (Open Orders) */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    Live Positions (2)
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                    Floating: +$52.70
                  </Text>
                </View>

                <View style={{ gap: 8 }}>
                  <View style={[styles.tradeItem, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#f1f5f9' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.tradeBadge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#10b981' }}>BUY</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>0.10 XAUUSD</Text>
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Open: 2642.10 · SL: 2636.00 · TP: 2655.00</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#10b981' }}>+$34.50</Text>
                  </View>

                  <View style={[styles.tradeItem, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#f1f5f9' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.tradeBadge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#10b981' }}>BUY</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>0.05 XAUUSD</Text>
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Open: 2640.80 · SL: 2636.00 · TP: 2655.00</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#10b981' }}>+$18.20</Text>
                  </View>
                </View>
              </View>

              {/* 4. Closed Trades Log */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    Closed Trades (Today)
                  </Text>
                  <Text style={{ fontSize: 11.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>
                    3 Closed · 100% Win
                  </Text>
                </View>

                <View style={{ gap: 8 }}>
                  {[
                    { type: 'BUY', lots: '0.10', profit: '+$42.00', time: '11:24 AM', dur: '18m' },
                    { type: 'SELL', lots: '0.05', profit: '+$65.20', time: '09:41 AM', dur: '24m' },
                    { type: 'BUY', lots: '0.10', profit: '+$52.50', time: '08:15 AM', dur: '12m' },
                  ].map((trade, idx) => (
                    <View key={idx} style={[styles.closedTradeRow, { borderColor: isDark ? '#1e2433' : '#f1f5f9' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.tradeBadge, { backgroundColor: trade.type === 'BUY' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }]}>
                          <Text style={{ fontSize: 9.5, fontFamily: 'Inter_800ExtraBold', color: trade.type === 'BUY' ? '#10b981' : '#ef4444' }}>{trade.type}</Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 12.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            {trade.lots} XAUUSD
                          </Text>
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            {trade.time} · Dur: {trade.dur}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#10b981' }}>{trade.profit}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 5. Connected MT5 Broker Account Card */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Key size={17} color="#a855f7" />
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      VIP Cryptographic License
                    </Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <View style={styles.greenPulse} />
                    <Text style={styles.verifiedText}>LOCKED TO MT5 #{accountNumber}</Text>
                  </View>
                </View>

                {/* Key Container */}
                <View style={[styles.keyBox, { backgroundColor: isDark ? '#0c0e14' : '#f1f5f9', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                  <Text style={[styles.keyText, { color: isDark ? '#38bdf8' : '#0f172a' }]} numberOfLines={1}>
                    {dynamicLicenseKey}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => copyToClipboard(dynamicLicenseKey, 'key')}
                    style={[styles.copyPill, { backgroundColor: copiedKey ? '#10b981' : (isDark ? '#1e2433' : '#ffffff') }]}
                  >
                    {copiedKey ? <Check size={14} color="#fff" /> : <Copy size={14} color={isDark ? '#cbd5e1' : '#475569'} />}
                    <Text style={[styles.copyPillText, { color: copiedKey ? '#fff' : (isDark ? '#cbd5e1' : '#475569') }]}>
                      {copiedKey ? 'Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6. Quick Switch to Setup Wizard CTA */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  hSelect();
                  setActiveMode('setup');
                }}
                style={[styles.wizardSwitchBtn, { backgroundColor: isDark ? '#1e2230' : '#ffffff', borderColor: isDark ? '#2e3547' : '#e2e8f0' }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Layers size={18} color="#38bdf8" />
                  <View>
                    <Text style={{ fontSize: 13.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Reconfigure Bot &amp; Run 4-Step Setup
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>
                      Change MT5 broker, download new EA, or update license
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              MODE 2: 4-STEP SETUP WIZARD (Matching Web App AITrading.tsx)
             ══════════════════════════════════════════════════════════════════════ */}
          {activeMode === 'setup' && (
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
                    { step: 1, label: '1. Connect', isDone: transferStatus === 'approved' },
                    { step: 2, label: '2. Download', isDone: downloadedEA },
                    { step: 3, label: '3. Pay ₹99k', isDone: paymentStatus === 'approved' },
                    { step: 4, label: '4. Activate', isDone: paymentStatus === 'approved' && transferStatus === 'approved' },
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
                          {m.isDone && !isActive ? `✓ ${m.label.split('. ')[1]}` : m.label}
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
                        Open New Account (Recommended)
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
                        Transfer Existing Account
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
                            <Text style={styles.partnerActionBtnText}>Open Vantage Account</Text>
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
                            <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: isDark ? '#cbd5e1' : '#475569' }}>
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
                          Gold Specialist · MT5 Build
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
                      <Text style={[styles.specTileVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>XAUUSD (Gold)</Text>
                    </View>
                    <View style={[styles.specTile, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <Text style={styles.specTileLabel}>TIMEFRAME</Text>
                      <Text style={[styles.specTileVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>1-Min (M1)</Text>
                    </View>
                    <View style={[styles.specTile, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <Text style={styles.specTileLabel}>EXECUTION</Text>
                      <Text style={[styles.specTileVal, { color: '#10b981' }]}>&lt; 3ms Direct</Text>
                    </View>
                    <View style={[styles.specTile, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                      <Text style={styles.specTileLabel}>ENGINE</Text>
                      <Text style={[styles.specTileVal, { color: '#38bdf8' }]}>Dynamic Basket</Text>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSuccess();
                        setDownloadedPreset(true);
                        Alert.alert('Preset Downloaded', 'XAUUSD_M1_Preset.set saved. Use MT5 Load button in EA Inputs to apply.');
                      }}
                      style={[styles.downloadCard, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={[styles.fileIconBox, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
                          <Sparkles size={18} color="#a855f7" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            XAUUSD_M1_Preset.set
                          </Text>
                          <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            Pre-configured inputs with Stop Loss &amp; News Guard
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.downloadPill, { backgroundColor: downloadedPreset ? '#10b981' : '#a855f7' }]}>
                        {downloadedPreset ? <Check size={13} color="#fff" /> : <Download size={13} color="#fff" />}
                        <Text style={[styles.downloadPillText, { color: '#ffffff' }]}>
                          {downloadedPreset ? 'Saved' : 'Download'}
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
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#38bdf8' }} numberOfLines={1}>
                        https://rylwyxhupwpwsdbvuoej.supabase.co
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => copyToClipboard('https://rylwyxhupwpwsdbvuoej.supabase.co', 'webhook')}
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
                        Continue to Step 3: Payment
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

                  {/* 2 Plan Tiers */}
                  <View style={{ gap: 8, marginVertical: 10 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSelect();
                        setSelectedTier('lifetime');
                      }}
                      style={[
                        styles.tierCard,
                        selectedTier === 'lifetime' && styles.tierCardActive,
                        { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: selectedTier === 'lifetime' ? '#f59e0b' : (isDark ? '#1e2433' : '#e2e8f0') },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 15, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                              Lifetime VIP License
                            </Text>
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularText}>BEST VALUE</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 2 }}>
                            0% Profit Share · Unlimited Trading · Lifetime Updates
                          </Text>
                        </View>
                        <Text style={{ fontSize: 17, fontFamily: 'Inter_800ExtraBold', color: '#f59e0b' }}>
                          ₹99,999
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSelect();
                        setSelectedTier('profit_share');
                      }}
                      style={[
                        styles.tierCard,
                        selectedTier === 'profit_share' && styles.tierCardActive,
                        { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: selectedTier === 'profit_share' ? '#38bdf8' : (isDark ? '#1e2433' : '#e2e8f0') },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                          <Text style={{ fontSize: 15, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            Performance Partner Plan
                          </Text>
                          <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 2 }}>
                            ₹5,000 Setup Fee + Daily 50% Profit Share
                          </Text>
                        </View>
                        <Text style={{ fontSize: 17, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                          ₹5,000
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Payment Details Box */}
                  <View style={[styles.payDetailsBox, { backgroundColor: isDark ? '#0c0e14' : '#f0fdf4', borderColor: isDark ? '#1e2433' : '#bbf7d0' }]}>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>
                      UPI / PHONEPE / GPAY PAYMENT DETAILS:
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
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
                    onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`Hello TradiFive Team! I have completed payment for FiAlgo V1 (UTR: ${utrNumber || 'Submitted'}). Please expedite and issue my license key.`)}`)}
                    style={styles.fastTrackBtn}
                  >
                    <MessageCircle size={15} color="#10b981" />
                    <Text style={styles.fastTrackText}>⚡ Need 15-Min Priority Review? Ping on WhatsApp</Text>
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
                        <Text style={[styles.stepActionBtnText, { color: '#ffffff' }]}>
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
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <View style={styles.successIconCircle}>
                      <Check size={28} color="#10b981" strokeWidth={3} />
                    </View>
                    <Text style={[styles.formTitle, { textAlign: 'center', color: isDark ? '#ffffff' : '#0f172a' }]}>
                      FiAlgo V1 License Unlocked!
                    </Text>
                    <Text style={[styles.formDesc, { textAlign: 'center' }]}>
                      Your personal license key has been cryptographically generated and locked to MT5 Account #{accountNumber}.
                    </Text>
                  </View>

                  {/* Large License Key Card */}
                  <View style={[styles.keyBoxLarge, { backgroundColor: isDark ? '#0c0e14' : '#f1f5f9', borderColor: '#38bdf8' }]}>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                      YOUR METATRADER 5 LICENSE KEY:
                    </Text>
                    <Text style={[styles.keyTextLarge, { color: isDark ? '#38bdf8' : '#0f172a' }]}>
                      {dynamicLicenseKey}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => copyToClipboard(dynamicLicenseKey, 'key')}
                      style={[styles.largeCopyBtn, { backgroundColor: copiedKey ? '#10b981' : '#38bdf8' }]}
                    >
                      {copiedKey ? <Check size={18} color="#fff" /> : <Copy size={18} color="#0f172a" />}
                      <Text style={[styles.largeCopyBtnText, { color: copiedKey ? '#fff' : '#0f172a' }]}>
                        {copiedKey ? 'License Key Copied!' : 'Copy License Key'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 4-Step MT5 Activation Guide */}
                  <View style={[styles.guideBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 8 }}>
                      HOW TO ACTIVATE IN METATRADER 5:
                    </Text>
                    <Text style={styles.guideStepText}>1. Open MT5 → Tools → Options → Experts (Allow Algo Trading).</Text>
                    <Text style={styles.guideStepText}>2. Open XAUUSD (Gold) 1-Minute (M1) chart.</Text>
                    <Text style={styles.guideStepText}>3. Drag FiAlgo_v1.0.4.ex5 onto your chart.</Text>
                    <Text style={styles.guideStepText}>4. In the Inputs tab, double-click "LicenseKey" and paste your key.</Text>
                  </View>

                  {/* Launch Live Dashboard Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSuccess();
                      setIsLicenseUnlocked(true);
                      setActiveMode('dashboard');
                    }}
                    style={[styles.launchDashboardBtn, { backgroundColor: '#10b981' }]}
                  >
                    <Zap size={18} color="#ffffff" />
                    <Text style={styles.launchDashboardBtnText}>
                      Launch Live Auto Trade Dashboard
                    </Text>
                    <ArrowRight size={18} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSelect();
                      setActiveMode('orders');
                    }}
                    style={[
                      styles.launchDashboardBtn,
                      {
                        backgroundColor: isDark ? 'rgba(56,189,248,0.1)' : '#f1f5f9',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(56,189,248,0.25)' : '#cbd5e1',
                        marginTop: 10,
                      },
                    ]}
                  >
                    <FileCode size={17} color={isDark ? '#38bdf8' : '#0284c7'} />
                    <Text style={[styles.launchDashboardBtnText, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                      View in Order History &amp; Key Vault
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              MODE 3: ORDER HISTORY & PERMANENT LICENSE KEY VAULT
             ══════════════════════════════════════════════════════════════════════ */}
          {activeMode === 'orders' && (
            <View style={{ gap: 14 }}>
              {/* Header Overview Card */}
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
                      Order History &amp; Licenses
                    </Text>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                      All purchased algorithmic engines, MT5 bindings, and license keys
                    </Text>
                  </View>
                </View>

                {/* Quick Info Box */}
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
                      Active Licensee
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      {currentUser?.first_name || 'Alex'} {currentUser?.last_name || 'Morgan'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10.5, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase' }}>
                      Active Licenses
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#10b981' }}>
                        1 Active Engine
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Order Item #1: FiAlgo V1 Institutional Engine */}
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
                {/* Product Header Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                    <Image
                      source={require('../../assets/images/fialgo-v1-box.png')}
                      style={{ width: 52, height: 52, borderRadius: 12 }}
                      resizeMode="contain"
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text style={{ fontSize: 15.5, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                          FiAlgo V1 Institutional
                        </Text>
                      </View>
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

                {/* Order Details Specification Grid */}
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

                  {/* License Key Code Display */}
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

                  {/* One-Tap Copy Key Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => copyToClipboard(dynamicLicenseKey, 'orderKey')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: copiedOrderKey ? '#10b981' : '#38bdf8',
                      paddingVertical: 11,
                      borderRadius: 10,
                    }}
                  >
                    {copiedOrderKey ? <Check size={16} color="#ffffff" strokeWidth={2.5} /> : <Copy size={16} color="#0f172a" />}
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: copiedOrderKey ? '#ffffff' : '#0f172a' }}>
                      {copiedOrderKey ? 'License Key Copied to Clipboard!' : 'Copy License Key'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ═══ DOWNLOAD ASSETS & PRESETS ═══ */}
                <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                  Algorithm Files &amp; Settings
                </Text>

                {/* File 1: EA */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    hSuccess();
                    setDownloadedEA(true);
                    Alert.alert('FiAlgo V1 Downloaded', 'FiAlgo_v1.0.4.ex5 has been downloaded to your MT5 Experts folder.');
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

                {/* File 2: Preset */}
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

                {/* File 3: PDF Guide */}
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
                        Illustrated step-by-step installation PDF
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

                {/* Direct Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSuccess();
                      setIsLicenseUnlocked(true);
                      setActiveMode('dashboard');
                    }}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: '#10b981',
                      paddingVertical: 12,
                      borderRadius: 12,
                    }}
                  >
                    <Zap size={16} color="#ffffff" />
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#ffffff' }}>
                      Live Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSelect();
                      setActiveMode('setup');
                      setActiveStep(1);
                      setSetupPath('transfer');
                    }}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: isDark ? '#1a202c' : '#f1f5f9',
                      borderWidth: 1,
                      borderColor: isDark ? '#2d3748' : '#cbd5e1',
                      paddingVertical: 12,
                      borderRadius: 12,
                    }}
                  >
                    <RefreshCw size={15} color={isDark ? '#cbd5e1' : '#475569'} />
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Re-bind MT5
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Order Item #2: Gold Scalper Pro (Add-On) */}
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

              {/* Order Item #3: Dynamic Basket & Drawdown Guard */}
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

              {/* Institutional Concierge Support Banner */}
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
          )}
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
    gap: 6,
  },
  milestoneBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
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
    fontSize: 10.5,
    fontFamily: 'Inter_600SemiBold',
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
    gap: 6,
    marginBottom: 8,
  },
  specTile: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
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
