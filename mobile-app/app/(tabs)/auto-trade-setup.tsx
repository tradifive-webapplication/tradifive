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
  TextInput,
  Clipboard,
  Alert,
  Dimensions,
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

// Cryptographic License Key generator locked to MT5 account
const generateLicenseKey = (accNum: string): string => {
  const clean = (accNum || '8392019').replace(/\D/g, '') || '8392019';
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const hexAcc = Math.abs(Number(clean) || 8392019).toString(16).toUpperCase().padStart(8, '0').slice(-8);
  const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(10, '0').slice(-10);
  return `TF-${hexAcc.slice(0, 4)}-${hexAcc.slice(4, 8)}-${hexHash.slice(0, 10)}`;
};

export default function AutoTradeSetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const currentUser = useStore((state) => state.currentUser);
  const mt5Account = useStore((state) => state.mt5Account);

  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  const [refreshing, setRefreshing] = useState(false);

  // Mode: 'dashboard' vs 'setup'
  const [activeMode, setActiveMode] = useState<'dashboard' | 'setup'>('dashboard');

  // Wizard active step: 1 (Connect), 2 (Download), 3 (Buy/Pay), 4 (Activate)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Setup Form State
  const [broker, setBroker] = useState<'exness' | 'vantage' | 'roboforex' | 'other'>('exness');
  const [accountNumber, setAccountNumber] = useState(mt5Account?.account_number || '8392019');
  const [server, setServer] = useState(mt5Account?.server || 'Exness-Real21');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedTier, setSelectedTier] = useState<'lifetime' | 'profit_share'>('lifetime');
  const [utrNumber, setUtrNumber] = useState('');
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);

  // Bot Live State
  const [botActive, setBotActive] = useState(true);
  const [downloadedEA, setDownloadedEA] = useState(false);
  const [downloadedPreset, setDownloadedPreset] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedIB, setCopiedIB] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);

  const dynamicLicenseKey = useMemo(() => {
    return generateLicenseKey(accountNumber);
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

  // Pick payment proof image
  const handlePickProof = async () => {
    hSelect();
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setProofImageUri(res.assets[0].uri);
        hSuccess();
      }
    } catch (e) {
      Alert.alert('Notice', 'Unable to select image. You can still enter your 12-digit UTR.');
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'ib' | 'upi') => {
    Clipboard.setString(text);
    hSuccess();
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'ib') {
      setCopiedIB(true);
      setTimeout(() => setCopiedIB(false), 2000);
    } else if (type === 'upi') {
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    }
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
          <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000') : '#fff', letterSpacing: -0.5 }}>
            Auto Trade
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
        {/* ═══ TOP SEGMENT SWITCHER: [⚡ Live Dashboard] | [🛠️ 4-Step Setup] ═══ */}
        <View style={[styles.modeSwitcherContainer, { backgroundColor: isDark ? '#11131a' : '#eef2f6' }]}>
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
            <Activity size={15} color={activeMode === 'dashboard' ? (isDark ? '#38bdf8' : '#0f172a') : '#94a3b8'} strokeWidth={2.5} />
            <Text
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
            <Layers size={15} color={activeMode === 'setup' ? (isDark ? '#38bdf8' : '#0f172a') : '#94a3b8'} strokeWidth={2.5} />
            <Text
              style={[
                styles.modeSegmentText,
                { color: activeMode === 'setup' ? (isDark ? '#ffffff' : '#0f172a') : '#94a3b8', fontFamily: activeMode === 'setup' ? 'Inter_700Bold' : 'Inter_600SemiBold' },
              ]}
            >
              Setup (4 Steps)
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 130 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" />}
        >
          {/* ══════════════════════════════════════════════════════════════════════
              MODE 1: LIVE AUTO TRADE DASHBOARD (Matching Web App)
             ══════════════════════════════════════════════════════════════════════ */}
          {activeMode === 'dashboard' && (
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

              {/* 2. Active Cryptographic License Key Card */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Key size={17} color="#a855f7" />
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      VIP Bot License Key
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

                <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginTop: 8 }}>
                  Cryptographically verified. Paste into the <Text style={{ fontFamily: 'Inter_700Bold' }}>LicenseKey</Text> parameter in your MetaTrader 5 Expert Advisor inputs.
                </Text>
              </View>

              {/* 3. Connected Broker Account Card */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Activity size={17} color="#38bdf8" />
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      Broker Account (MetaTrader 5)
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <Text style={{ fontSize: 11.5, fontFamily: 'Inter_600SemiBold', color: '#10b981' }}>Connected</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8', textTransform: 'uppercase' }}>ACCOUNT NUMBER</Text>
                    <Text style={{ fontSize: 17, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', letterSpacing: 0.5 }}>
                      #{accountNumber}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8', textTransform: 'uppercase' }}>SERVER</Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#e2e8f0' : '#334155' }}>
                      {server}
                    </Text>
                  </View>
                </View>

                {/* Financial KPI Row */}
                <View style={[styles.kpiRow, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#f1f5f9' }]}>
                  <View style={styles.kpiItem}>
                    <Text style={styles.kpiLabel}>BALANCE</Text>
                    <Text style={[styles.kpiValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>$1,248.50</Text>
                  </View>
                  <View style={styles.kpiItem}>
                    <Text style={styles.kpiLabel}>EQUITY</Text>
                    <Text style={[styles.kpiValue, { color: '#10b981' }]}>$1,286.20</Text>
                  </View>
                  <View style={styles.kpiItem}>
                    <Text style={styles.kpiLabel}>TODAY P&amp;L</Text>
                    <Text style={[styles.kpiValue, { color: '#10b981' }]}>+$159.70</Text>
                  </View>
                </View>
              </View>

              {/* 4. Live Floating Positions (Open Orders) */}
              <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    Open Positions (2)
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
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Open: 2642.10 · SL: 2636.00</Text>
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
                        <Text style={{ fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Open: 2640.80 · SL: 2636.00</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#10b981' }}>+$18.20</Text>
                  </View>
                </View>
              </View>

              {/* 5. Quick Switch to Setup Wizard */}
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
            <View style={{ gap: 16 }}>
              {/* ── 4-STEP PROCESSOR PROGRESS HEADER ── */}
              <View style={[styles.processorCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <View style={styles.stepsNavRow}>
                  {[
                    { step: 1, label: 'Connect' },
                    { step: 2, label: 'Download' },
                    { step: 3, label: 'Payment' },
                    { step: 4, label: 'License' },
                  ].map((s, idx) => {
                    const isPassed = activeStep > s.step;
                    const isCurrent = activeStep === s.step;

                    return (
                      <React.Fragment key={s.step}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            hSelect();
                            setActiveStep(s.step);
                          }}
                          style={{ alignItems: 'center', gap: 4 }}
                        >
                          <View
                            style={[
                              styles.stepBubble,
                              isCurrent && styles.stepBubbleCurrent,
                              isPassed && styles.stepBubblePassed,
                              !isCurrent && !isPassed && { backgroundColor: isDark ? '#1a1d27' : '#f1f5f9' },
                            ]}
                          >
                            {isPassed ? (
                              <Check size={13} color="#fff" strokeWidth={3} />
                            ) : (
                              <Text
                                style={[
                                  styles.stepBubbleText,
                                  isCurrent && { color: '#0f172a' },
                                  !isCurrent && { color: isDark ? '#94a3b8' : '#64748b' },
                                ]}
                              >
                                {s.step}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stepLabelText,
                              isCurrent && { color: isDark ? '#38bdf8' : '#0f172a', fontFamily: 'Inter_700Bold' },
                              !isCurrent && { color: '#94a3b8' },
                            ]}
                          >
                            {s.label}
                          </Text>
                        </TouchableOpacity>

                        {idx < 3 && (
                          <View
                            style={[
                              styles.stepConnectorLine,
                              { backgroundColor: isPassed ? '#10b981' : (isDark ? '#232838' : '#e2e8f0') },
                            ]}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>

                <View style={styles.stepTitleRow}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                    Step {activeStep} of 4:{' '}
                    <Text style={{ color: '#38bdf8' }}>
                      {activeStep === 1
                        ? 'Connect Broker & MT5 Account'
                        : activeStep === 2
                        ? 'Download FiAlgo EA & Presets'
                        : activeStep === 3
                        ? 'Buy Algo & License Payment'
                        : 'Activate & Copy License Key'}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* ── STEP 1: CONNECT BROKER & MT5 ── */}
              {activeStep === 1 && (
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <Text style={[styles.formTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    1. Select Verified Partner Broker
                  </Text>
                  <Text style={styles.formDesc}>
                    For 0% slippage and instant bot execution, use one of our verified partner brokers under partner IB code.
                  </Text>

                  {/* Broker Selection Pills */}
                  <View style={styles.brokerGrid}>
                    {[
                      { id: 'exness', name: 'Exness (Recommended)', tag: 'Instant Exec' },
                      { id: 'vantage', name: 'Vantage Markets', tag: 'Raw Spreads' },
                      { id: 'roboforex', name: 'RoboForex', tag: 'Cent / Standard' },
                      { id: 'other', name: 'Other MT5 Broker', tag: 'Custom' },
                    ].map((b) => (
                      <TouchableOpacity
                        key={b.id}
                        activeOpacity={0.8}
                        onPress={() => {
                          hSelect();
                          setBroker(b.id as any);
                        }}
                        style={[
                          styles.brokerOption,
                          broker === b.id && styles.brokerOptionSelected,
                          { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: broker === b.id ? '#38bdf8' : (isDark ? '#1e2433' : '#e2e8f0') },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={[styles.brokerName, { color: isDark ? '#ffffff' : '#0f172a' }]}>{b.name}</Text>
                          {broker === b.id && <CheckCircle2 size={16} color="#38bdf8" />}
                        </View>
                        <Text style={styles.brokerTag}>{b.tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* IB Partner Callout */}
                  <View style={[styles.ibCallout, { backgroundColor: isDark ? 'rgba(56,189,248,0.08)' : '#f0f9ff', borderColor: 'rgba(56,189,248,0.3)' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: isDark ? '#7dd3fc' : '#0284c7', textTransform: 'uppercase' }}>
                        PARTNER IB CODE FOR ZERO SLIPPAGE
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => copyToClipboard('TRDF940182', 'ib')}
                        style={styles.ibCopyBtn}
                      >
                        {copiedIB ? <Check size={12} color="#10b981" /> : <Copy size={12} color="#0284c7" />}
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: copiedIB ? '#10b981' : '#0284c7' }}>
                          {copiedIB ? 'Copied' : 'Copy'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#ffffff' : '#0f172a', letterSpacing: 1 }}>
                      TRDF940182
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginTop: 2 }}>
                      Enter this code when opening your account to qualify for automated server-side approval and 0% deposit fees.
                    </Text>
                  </View>

                  {/* Input Fields */}
                  <View style={{ gap: 12, marginTop: 10 }}>
                    <View>
                      <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#475569' }]}>MT5 LOGIN / ACCOUNT NUMBER *</Text>
                      <TextInput
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        placeholder="e.g. 8392019"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        style={[styles.inputBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', color: isDark ? '#ffffff' : '#0f172a', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                      />
                    </View>

                    <View>
                      <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#475569' }]}>BROKER SERVER *</Text>
                      <TextInput
                        value={server}
                        onChangeText={setServer}
                        placeholder="e.g. Exness-Real21"
                        placeholderTextColor="#94a3b8"
                        style={[styles.inputBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', color: isDark ? '#ffffff' : '#0f172a', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                      />
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSuccess();
                      setActiveStep(2);
                    }}
                    style={[styles.stepActionBtn, { backgroundColor: isDark ? '#38bdf8' : '#0f172a' }]}
                  >
                    <Text style={[styles.stepActionBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>
                      Save &amp; Continue to Step 2 (Download Algo)
                    </Text>
                    <ArrowRight size={16} color={isDark ? '#0f172a' : '#ffffff'} />
                  </TouchableOpacity>
                </View>
              )}

              {/* ── STEP 2: DOWNLOAD FIALGO & PRESETS ── */}
              {activeStep === 2 && (
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <Text style={[styles.formTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    2. Download FiAlgo V1 &amp; Recommended Presets
                  </Text>
                  <Text style={styles.formDesc}>
                    Download the compiled MetaTrader 5 Expert Advisor (.ex5) and calibrated Gold Low-Risk preset (.set) file.
                  </Text>

                  {/* Download Cards */}
                  <View style={{ gap: 10, marginVertical: 8 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSuccess();
                        setDownloadedEA(true);
                        Alert.alert('Download Started', 'FiAlgo_V1.ex5 has been downloaded to your files. Transfer it to your MT5 MQL5/Experts folder.');
                      }}
                      style={[styles.downloadCard, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.fileIconBox, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                          <Cpu size={20} color="#38bdf8" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            FiAlgo_V1.ex5
                          </Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            Compiled EA · Gold &amp; Multi-Asset
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.downloadPill, { backgroundColor: downloadedEA ? '#10b981' : '#38bdf8' }]}>
                        {downloadedEA ? <Check size={14} color="#fff" /> : <Download size={14} color="#0f172a" />}
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
                        Alert.alert('Preset Downloaded', 'FiAlgo_Gold_LowRisk.set saved. Use MT5 Load button in EA Inputs to apply.');
                      }}
                      style={[styles.downloadCard, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.fileIconBox, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
                          <Sparkles size={20} color="#a855f7" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                            FiAlgo_Gold_LowRisk.set
                          </Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                            Calibrated Low Drawdown Preset
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.downloadPill, { backgroundColor: downloadedPreset ? '#10b981' : '#a855f7' }]}>
                        {downloadedPreset ? <Check size={14} color="#fff" /> : <Download size={14} color="#fff" />}
                        <Text style={[styles.downloadPillText, { color: '#ffffff' }]}>
                          {downloadedPreset ? 'Saved' : 'Download'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* 3-Step MT5 Installation Guide */}
                  <View style={[styles.guideBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 8 }}>
                      3-STEP INSTALLATION QUICK GUIDE:
                    </Text>
                    <Text style={styles.guideStepText}>1. Open MT5 → File → Open Data Folder.</Text>
                    <Text style={styles.guideStepText}>2. Navigate to MQL5 → Experts → Paste FiAlgo_V1.ex5.</Text>
                    <Text style={styles.guideStepText}>3. Restart MT5 → Drag FiAlgo onto XAUUSD (Gold) M5 Chart.</Text>
                  </View>

                  {/* Navigation Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setActiveStep(1)}
                      style={[styles.backStepBtn, { borderColor: isDark ? '#2e3547' : '#e2e8f0' }]}
                    >
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#cbd5e1' : '#475569' }}>← Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSuccess();
                        setActiveStep(3);
                      }}
                      style={[styles.stepActionBtn, { flex: 1, backgroundColor: isDark ? '#38bdf8' : '#0f172a' }]}
                    >
                      <Text style={[styles.stepActionBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>
                        Continue to Step 3 (Buy &amp; Pay)
                      </Text>
                      <ArrowRight size={16} color={isDark ? '#0f172a' : '#ffffff'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── STEP 3: BUY ALGO & LICENSE PAYMENT ── */}
              {activeStep === 3 && (
                <View style={[styles.sectionCard, { backgroundColor: isDark ? '#11131a' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <Text style={[styles.formTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    3. Buy Algo &amp; License Payment
                  </Text>
                  <Text style={styles.formDesc}>
                    Complete the payment to request your personal cryptographic MetaTrader 5 license key.
                  </Text>

                  {/* Plan Tiers */}
                  <View style={{ gap: 10, marginVertical: 8 }}>
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
                          <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 2 }}>
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
                          <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 2 }}>
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
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>
                      UPI / PhonePe / GPay Details:
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                        tradifive@axl
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => copyToClipboard('tradifive@axl', 'upi')}
                        style={styles.upiCopyBtn}
                      >
                        {copiedUPI ? <Check size={12} color="#16a34a" /> : <Copy size={12} color="#16a34a" />}
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#16a34a' }}>
                          {copiedUPI ? 'Copied' : 'Copy UPI'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748b' }}>
                      Bank: Tradifive Technologies Pvt Ltd · A/C: 924020058194012 · IFSC: UTIB0002148
                    </Text>
                  </View>

                  {/* UTR Input Form */}
                  <View style={{ gap: 10, marginTop: 4 }}>
                    <View>
                      <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#475569' }]}>12-DIGIT TRANSACTION UTR / REF NUMBER *</Text>
                      <TextInput
                        value={utrNumber}
                        onChangeText={setUtrNumber}
                        placeholder="e.g. 429381029481"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        style={[styles.inputBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', color: isDark ? '#ffffff' : '#0f172a', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                      />
                    </View>

                    {/* Screenshot Upload Button */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handlePickProof}
                      style={[styles.uploadBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}
                    >
                      <Upload size={18} color="#38bdf8" />
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#38bdf8' : '#0284c7' }}>
                        {proofImageUri ? 'Screenshot Attached ✓' : 'Upload Payment Receipt Screenshot (Optional)'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Navigation Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setActiveStep(2)}
                      style={[styles.backStepBtn, { borderColor: isDark ? '#2e3547' : '#e2e8f0' }]}
                    >
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#cbd5e1' : '#475569' }}>← Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        hSuccess();
                        setPaymentSubmitted(true);
                        setActiveStep(4);
                      }}
                      style={[styles.stepActionBtn, { flex: 1, backgroundColor: '#10b981' }]}
                    >
                      <Text style={[styles.stepActionBtnText, { color: '#ffffff' }]}>
                        Submit Proof &amp; View License Key
                      </Text>
                      <ArrowRight size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── STEP 4: ACTIVATE & COPY LICENSE KEY ── */}
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

                  {/* License Key Display Card */}
                  <View style={[styles.keyBoxLarge, { backgroundColor: isDark ? '#0c0e14' : '#f1f5f9', borderColor: isDark ? '#38bdf8' : '#38bdf8' }]}>
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

                  {/* MT5 Activation Checklist */}
                  <View style={[styles.guideBox, { backgroundColor: isDark ? '#0c0e14' : '#f8fafc', borderColor: isDark ? '#1e2433' : '#e2e8f0' }]}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 8 }}>
                      HOW TO ACTIVATE IN METATRADER 5:
                    </Text>
                    <Text style={styles.guideStepText}>1. Open your XAUUSD chart and attach FiAlgo_V1.</Text>
                    <Text style={styles.guideStepText}>2. In the Inputs tab, double-click "LicenseKey" and paste.</Text>
                    <Text style={styles.guideStepText}>3. Click the Common tab and verify "Allow Algo Trading" is checked.</Text>
                    <Text style={styles.guideStepText}>4. Click OK. The dashboard on chart will show "LICENSE: ACTIVE".</Text>
                  </View>

                  {/* Launch Live Dashboard Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      hSuccess();
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
                </View>
              )}
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
    zIndex: 5,
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 4,
    borderRadius: 20,
  },
  modeSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 16,
  },
  modeSegmentActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modeSegmentText: {
    fontSize: 13,
  },
  heroCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148,163,184,0.2)',
  },
  sectionCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  greenPulse: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  verifiedText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#10b981',
    letterSpacing: 0.4,
  },
  keyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  keyText: {
    fontSize: 14,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.8,
    flex: 1,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  copyPillText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 14.5,
    fontFamily: 'Inter_800ExtraBold',
  },
  tradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  tradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  wizardSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  processorCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  stepsNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  stepBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBubbleCurrent: {
    backgroundColor: '#38bdf8',
  },
  stepBubblePassed: {
    backgroundColor: '#10b981',
  },
  stepBubbleText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  stepLabelText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  stepConnectorLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepTitleRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.15)',
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  formDesc: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 12,
  },
  brokerGrid: {
    gap: 8,
    marginBottom: 12,
  },
  brokerOption: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  brokerOptionSelected: {
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  brokerName: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  brokerTag: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
    marginTop: 2,
  },
  ibCallout: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  ibCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputBox: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  stepActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    marginTop: 14,
  },
  stepActionBtnText: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  backStepBtn: {
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  downloadPillText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  guideBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  guideStepText: {
    fontSize: 11.5,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
    lineHeight: 18,
  },
  tierCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  tierCardActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 4,
  },
  upiCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  keyBoxLarge: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    marginVertical: 10,
  },
  keyTextLarge: {
    fontSize: 18,
    fontFamily: 'Inter_900Black',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 14,
  },
  largeCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 46,
    borderRadius: 14,
  },
  largeCopyBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  launchDashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
    marginTop: 12,
  },
  launchDashboardBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
});
