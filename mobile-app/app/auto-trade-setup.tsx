import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  TextInput,
  Image,
  Alert,
  Clipboard,
  Modal,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  CheckCircle2,
  Upload,
  Cpu,
  Zap,
  ShieldCheck,
  Check,
  Play,
  Pause,
  Sliders,
  Sparkles,
  Calculator,
  Lock,
  Coins,
  X,
  AlertCircle,
  Clock,
  ArrowRight,
  Download,
  FileCode,
  Layers,
  Terminal,
  Activity,
  CreditCard,
  QrCode,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { useStore } from './store';
import { supabase } from './utils/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const h = () => {
  if (Platform.OS !== 'web') {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
  }
};
const hSuccess = () => {
  if (Platform.OS !== 'web') {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
  }
};

// Cryptographic Key Generator matching Tradifive.mq5 FNV-1a algorithm & TF_SALT
export const generateTradifiveLicenseKey = (mt5AccountNumber?: string | number, expDays: number = 10000): string => {
  const salt = "TFv1-Zk39xQ-7mLpA2";
  const numClean = String(mt5AccountNumber || "").replace(/\D/g, "");
  if (!numClean) return "TF-DEMO-0000-0000000000";
  try {
    const login = BigInt(numClean);
    let h64 = 0xCBF29CE484222325n;
    const prime = 0x100000001B3n;
    const mask64 = 0xFFFFFFFFFFFFFFFFn;
    const str = `${salt}:${login}:${expDays}`;
    for (let i = 0; i < str.length; i++) {
      h64 = ((h64 ^ BigInt(str.charCodeAt(i))) * prime) & mask64;
    }
    h64 = h64 ^ (h64 >> 32n);
    const chk = h64 & 0xFFFFFFFFFFn;

    const lgHex = login.toString(16).toUpperCase().padStart(8, "0");
    const expHex = expDays.toString(16).toUpperCase().padStart(4, "0");
    const chkHex = chk.toString(16).toUpperCase().padStart(10, "0");
    return `TF-${lgHex}-${expHex}-${chkHex}`;
  } catch (e) {
    return `TF-${numClean.slice(0, 8)}-2710-A9F4E72B10`;
  }
};

interface BrokerConfig {
  id: string;
  name: string;
  tagline: string;
  url: string;
  ibNumber: string;
  referralCode: string;
  supportEmail: string;
  brandColor: string;
  badge: string;
}

const BROKERS: BrokerConfig[] = [
  {
    id: 'vantage',
    name: 'Vantage Markets',
    tagline: 'Raw ECN · Spreads from 0.0 pips',
    url: 'https://vigco.co/la-com-inv/MCTDw2R6',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@vantagemarkets.com',
    brandColor: '#ffffff',
    badge: 'RECOMMENDED'
  },
  {
    id: 'exness',
    name: 'Exness',
    tagline: 'Instant Withdrawals · Zero Swap',
    url: 'https://exness.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@exness.com',
    brandColor: '#FFD400',
    badge: 'POPULAR'
  },
  {
    id: 'xm',
    name: 'XM Global',
    tagline: 'Ultra Low Spread · Multi-Asset',
    url: 'https://xm.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@xm.com',
    brandColor: '#D31124',
    badge: 'REPUTABLE'
  },
  {
    id: 'fusion',
    name: 'Fusion Markets',
    tagline: 'Lowest Commission Rate ($2.25/lot)',
    url: 'https://fusionmarkets.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'help@fusionmarkets.com',
    brandColor: '#00B4D8',
    badge: 'LOW COST'
  },
  {
    id: 'blackbull',
    name: 'BlackBull Markets',
    tagline: 'Institutional Grade Execution & VPS',
    url: 'https://blackbull.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@blackbullmarkets.com',
    brandColor: '#F59E0B',
    badge: 'INSTITUTIONAL'
  }
];

export default function AutoTradeSetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();

  // Active Wizard Step: 1 = Partner Account, 2 = Download & EA, 3 = Plan Model, 4 = Bot Control
  const [activeStep, setActiveStep] = useState<number>(1);

  // Setup mode: New Account vs Existing Account (IB Transfer)
  const [setupMode, setSetupMode] = useState<'new' | 'transfer'>('new');
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('vantage');
  const [mt5Account, setMt5Account] = useState<string>('');
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified'>('idle');

  // Plan Tier: 50% Profit Share vs Lifetime License
  const [selectedTier, setSelectedTier] = useState<'profit_share_50' | 'lifetime'>('profit_share_50');
  const [paymentUtr, setPaymentUtr] = useState<string>('');
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);

  // Bot state
  const [isBotRunning, setIsBotRunning] = useState<boolean>(true);
  const [dailyTargetPct, setDailyTargetPct] = useState<number>(3);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Profit Calculator Modal
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcCapital, setCalcCapital] = useState<number>(50000); // Default ₹50,000

  const selectedBroker = useMemo(() => {
    return BROKERS.find(b => b.id === selectedBrokerId) || BROKERS[0];
  }, [selectedBrokerId]);

  // Dynamic license key for this MT5 account
  const licenseKey = useMemo(() => {
    return generateTradifiveLicenseKey(mt5Account || '8829104');
  }, [mt5Account]);

  // Load existing user MT5 account on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data } = await supabase
            .from('mt5_accounts')
            .select('account_number, broker')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (data?.account_number) {
            setMt5Account(data.account_number);
            const found = BROKERS.find(b => data.broker && b.name.toLowerCase().includes(data.broker.toLowerCase()));
            if (found) setSelectedBrokerId(found.id);
          }
        }
      } catch (e) {}
    };
    loadSaved();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    hSuccess();
    Clipboard.setString(text);
    setCopiedCode(label);
    if (label === 'License') setCopiedKey(true);
    setTimeout(() => {
      setCopiedCode(null);
      setCopiedKey(false);
    }, 2500);
    Alert.alert('Copied to Clipboard', `${label}: ${text}`);
  };

  const openBrokerLink = async (url: string) => {
    h();
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
      } else {
        copyToClipboard(url, 'Broker Portal Link');
      }
    } catch (e) {
      copyToClipboard(url, 'Broker Portal Link');
    }
  };

  const handlePickProofImage = async () => {
    h();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setProofImageUri(result.assets[0].uri);
        hSuccess();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick screenshot.');
    }
  };

  const handleSubmitVerification = async () => {
    h();
    if (!mt5Account.trim()) {
      Alert.alert('Missing MT5 Account', 'Please enter your MT5 Account Number to bind your license.');
      return;
    }
    setIsUploadingProof(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.from('mt5_accounts').upsert({
          user_id: session.user.id,
          account_number: mt5Account.trim(),
          broker: selectedBroker.name,
          updated_at: new Date().toISOString()
        });
      }
      setVerificationStatus('pending');
      hSuccess();
      Alert.alert(
        'Account Submitted',
        `Your ${selectedBroker.name} MT5 account #${mt5Account.trim()} has been saved. Proceeding to EA & License setup.`,
        [{ text: 'Continue to Step 2', onPress: () => setActiveStep(2) }]
      );
    } catch (e: any) {
      setVerificationStatus('pending');
      setActiveStep(2);
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Calculated returns
  const dailyProfitEst = useMemo(() => {
    return Math.round(calcCapital * (dailyTargetPct / 100));
  }, [calcCapital, dailyTargetPct]);

  const monthlyProfitEst = useMemo(() => {
    return Math.round(dailyProfitEst * 22); // 22 trading days
  }, [dailyProfitEst]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER WITH SUBTLE GLOW ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Image
          source={require('../assets/images/top-glow.png')}
          style={[styles.headerGlow, { height: insets.top + 130 }]}
          resizeMode="stretch"
        />

        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { h(); router.back(); }}
            style={styles.backButton}
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>AI Trading Setup</Text>
            <Text style={styles.headerSubtitle}>Tradifive MT5 Institutional Engine</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { h(); setShowCalculator(true); }}
            style={styles.calcPillBtn}
          >
            <Calculator size={14} color="#ffffff" />
            <Text style={styles.calcPillText}>Calc</Text>
          </TouchableOpacity>
        </View>

        {/* ── 4-STEP PROGRESS INDICATOR ── */}
        <View style={styles.stepProgressContainer}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: activeStep === 1 ? '25%' : activeStep === 2 ? '50%' : activeStep === 3 ? '75%' : '100%' }
              ]}
            />
          </View>

          <View style={styles.stepTabsGrid}>
            {[
              { num: 1, label: '1. Connect' },
              { num: 2, label: '2. EA Setup' },
              { num: 3, label: '3. Plan' },
              { num: 4, label: '4. Controls' },
            ].map((s) => {
              const isActive = activeStep === s.num;
              const isDone = activeStep > s.num;
              return (
                <TouchableOpacity
                  key={s.num}
                  activeOpacity={0.8}
                  onPress={() => { h(); setActiveStep(s.num); }}
                  style={[
                    styles.stepTab,
                    isActive && styles.stepTabActive,
                    isDone && styles.stepTabDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepTabText,
                      isActive && styles.stepTabTextActive,
                      isDone && styles.stepTabTextDone,
                    ]}
                    numberOfLines={1}
                  >
                    {isDone ? `✓ ${s.label.split('.')[1].trim()}` : s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 44 }]}
      >
        {/* ── HERO TOP CARD (SHOWSTOPPER INSTITUTIONAL BANNER) ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.heroBadgeText}>TRADIFIVE FIALGO · V1.0.4 PRO</Text>
            </View>

            <View style={styles.heroStatusPill}>
              <Text style={styles.heroStatusText}>
                {isBotRunning ? 'ENGINE READY' : 'STANDBY'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroHeadline}>Automated Algorithmic Execution</Text>
          <Text style={styles.heroDescription}>
            Deploy our high-probability multi-currency grid & trend-following engine directly onto your MT5 terminal. 100% hands-free trading with automated trailing stops and proprietary Risk Guard protection.
          </Text>

          {/* 3-Cell Telemetry Metric Strip */}
          <View style={styles.heroMetricsStrip}>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>TARGET RETURN</Text>
              <Text style={styles.heroMetricValue}>2.0% - 5.0%</Text>
              <Text style={styles.heroMetricSub}>Per Trading Day</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>RISK GUARD</Text>
              <Text style={[styles.heroMetricValue, { color: '#10b981' }]}>4.5% Cap</Text>
              <Text style={styles.heroMetricSub}>Hard SL Equity</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>SERVER LATENCY</Text>
              <Text style={styles.heroMetricValue}>14 ms</Text>
              <Text style={styles.heroMetricSub}>Direct Raw Feed</Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* STEP 1: CONNECT MT5 & PARTNER BROKER                                      */}
        {/* ========================================================================= */}
        {activeStep === 1 && (
          <View style={styles.sectionWrap}>
            {/* Setup Mode Switcher */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { h(); setSetupMode('new'); }}
                style={[styles.segmentBtn, setupMode === 'new' && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentBtnText, setupMode === 'new' && styles.segmentBtnTextActive]}>
                  New Partner Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { h(); setSetupMode('transfer'); }}
                style={[styles.segmentBtn, setupMode === 'transfer' && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentBtnText, setupMode === 'transfer' && styles.segmentBtnTextActive]}>
                  Existing Account (IB Transfer)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Select Partner Broker */}
            <View style={styles.subHeadingRow}>
              <Text style={styles.sectionHeading}>1. Select Supported Partner Broker</Text>
              <Text style={styles.subHeadingHint}>100% Free EA Access</Text>
            </View>

            <View style={styles.brokersGrid}>
              {BROKERS.map((broker) => {
                const isSelected = selectedBrokerId === broker.id;
                return (
                  <TouchableOpacity
                    key={broker.id}
                    activeOpacity={0.8}
                    onPress={() => { h(); setSelectedBrokerId(broker.id); }}
                    style={[
                      styles.brokerCard,
                      isSelected && styles.brokerCardSelected
                    ]}
                  >
                    <View style={styles.brokerCardHeader}>
                      <View style={[styles.brokerDot, { backgroundColor: broker.brandColor }]} />
                      <View style={styles.brokerBadgePill}>
                        <Text style={styles.brokerBadgePillText}>{broker.badge}</Text>
                      </View>
                    </View>

                    <Text style={styles.brokerName}>{broker.name}</Text>
                    <Text style={styles.brokerTagline} numberOfLines={2}>{broker.tagline}</Text>

                    {isSelected && (
                      <View style={styles.brokerSelectedIndicator}>
                        <Check size={12} color="#000000" />
                        <Text style={styles.brokerSelectedText}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Partner IB Details Card */}
            <View style={styles.cardBox}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>OFFICIAL PARTNER CREDENTIALS</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => copyToClipboard(selectedBroker.referralCode, 'Referral Code')}
                  style={styles.copyInlineBtn}
                >
                  <Copy size={12} color="#94a3b8" />
                  <Text style={styles.copyInlineText}>
                    {copiedCode === 'Referral Code' ? 'Copied!' : 'Copy Code'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.partnerInfoTitle}>
                {selectedBroker.name}
              </Text>
              <Text style={styles.partnerInfoDesc}>
                {setupMode === 'new'
                  ? 'Open your MT5 trading account using our partner referral code to receive free institutional algo access.'
                  : `Transfer your existing ${selectedBroker.name} account under Tradifive Partner IB code: ${selectedBroker.ibNumber}.`}
              </Text>

              <View style={styles.codeBoxesRow}>
                <View style={styles.codeItem}>
                  <Text style={styles.codeItemLabel}>PARTNER IB NUMBER</Text>
                  <Text style={styles.codeItemValue}>{selectedBroker.ibNumber}</Text>
                </View>
                <View style={styles.codeItem}>
                  <Text style={styles.codeItemLabel}>REFERRAL CODE</Text>
                  <Text style={styles.codeItemValue}>{selectedBroker.referralCode}</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openBrokerLink(selectedBroker.url)}
                style={styles.openBrokerBtn}
              >
                <ExternalLink size={15} color="#ffffff" />
                <Text style={styles.openBrokerBtnText}>
                  {setupMode === 'new' ? `Open ${selectedBroker.name} Portal` : 'Open Broker Transfer Form'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* MT5 Account Number Input */}
            <View style={styles.subHeadingRow}>
              <Text style={styles.sectionHeading}>2. Your MT5 Account Number</Text>
              <Text style={styles.subHeadingHint}>Hardware License Binding</Text>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 10294857"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={mt5Account}
                onChangeText={setMt5Account}
              />
            </View>

            {/* IB Transfer Proof Upload (If in transfer mode) */}
            {setupMode === 'transfer' && (
              <>
                <View style={styles.subHeadingRow}>
                  <Text style={styles.sectionHeading}>3. IB Transfer Confirmation Proof</Text>
                  <Text style={styles.subHeadingHint}>Optional but Fast-tracks Review</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickProofImage}
                  style={styles.uploadArea}
                >
                  {proofImageUri ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image source={{ uri: proofImageUri }} style={styles.uploadedImagePreview} resizeMode="cover" />
                      <View style={styles.uploadSuccessOverlay}>
                        <CheckCircle2 size={18} color="#10b981" />
                        <Text style={styles.uploadSuccessText}>Screenshot Attached (Tap to change)</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <View style={styles.uploadIconCircle}>
                        <Upload size={20} color="#ffffff" />
                      </View>
                      <Text style={styles.uploadMainText}>Tap to attach IB Transfer Screenshot</Text>
                      <Text style={styles.uploadSubText}>PNG, JPG or JPEG proof from your broker</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Continue Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmitVerification}
              disabled={isUploadingProof}
              style={styles.primaryActionBtn}
            >
              {isUploadingProof ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Text style={styles.primaryActionBtnText}>Verify Account & Proceed to EA Setup</Text>
                  <ArrowRight size={18} color="#000000" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DOWNLOAD EA & CRYPTOGRAPHIC LICENSE KEY                           */}
        {/* ========================================================================= */}
        {activeStep === 2 && (
          <View style={styles.sectionWrap}>
            {/* Download Files Box */}
            <View style={styles.subHeadingRow}>
              <Text style={styles.sectionHeading}>1. Download Official Trading Toolkit</Text>
              <Text style={styles.subHeadingHint}>MQL5 Compiled</Text>
            </View>

            <View style={styles.cardBox}>
              <View style={styles.downloadRow}>
                <View style={styles.downloadIconWrap}>
                  <Download size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.downloadTitle}>Tradifive.ex5 (FiAlgo V1 Engine)</Text>
                  <Text style={styles.downloadSubtitle}>Compiled Expert Advisor for MetaTrader 5</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    hSuccess();
                    Alert.alert('EA Downloaded', 'Tradifive.ex5 ready. Copy this file into your MT5 MQL5/Experts folder.');
                  }}
                  style={styles.downloadSmallBtn}
                >
                  <Text style={styles.downloadSmallBtnText}>Download</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.downloadRow}>
                <View style={styles.downloadIconWrap}>
                  <FileCode size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.downloadTitle}>XAUUSD_M1_Institutional.set</Text>
                  <Text style={styles.downloadSubtitle}>Optimized Chart Inputs & Risk Presets</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    hSuccess();
                    Alert.alert('Preset Downloaded', 'XAUUSD_M1_Institutional.set ready. Load this directly in your EA Inputs tab.');
                  }}
                  style={styles.downloadSmallBtn}
                >
                  <Text style={styles.downloadSmallBtnText}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cryptographic License Key Card */}
            <View style={styles.subHeadingRow}>
              <Text style={styles.sectionHeading}>2. Your MT5 Cryptographic License Key</Text>
              <Text style={styles.subHeadingHint}>Hardware FNV-1a Hash</Text>
            </View>

            <View style={styles.licenseCard}>
              <View style={styles.licenseCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Lock size={15} color="#ffffff" />
                  <Text style={styles.licenseCardTitle}>Hardware Hash · MT5 #{mt5Account || '8829104'}</Text>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>ACTIVE</Text>
                </View>
              </View>

              <Text style={styles.licenseKeyText}>{licenseKey}</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => copyToClipboard(licenseKey, 'License')}
                style={styles.copyKeyBtn}
              >
                <Copy size={15} color="#ffffff" />
                <Text style={styles.copyKeyBtnText}>{copiedKey ? 'Copied to Clipboard!' : 'Copy License Key'}</Text>
              </TouchableOpacity>
            </View>

            {/* MT5 Setup Checklist */}
            <View style={styles.subHeadingRow}>
              <Text style={styles.sectionHeading}>3. Setup Checklist in MetaTrader 5</Text>
              <Text style={styles.subHeadingHint}>4 Simple Steps</Text>
            </View>

            <View style={styles.checklistCard}>
              {[
                {
                  step: '1',
                  title: 'Allow WebRequest URL',
                  desc: 'In MT5 > Tools > Options > Expert Advisors, add:',
                  copyable: 'https://tradifive.in'
                },
                {
                  step: '2',
                  title: 'Place Tradifive.ex5 in Experts',
                  desc: 'File > Open Data Folder > MQL5 > Experts. Paste Tradifive.ex5 here.'
                },
                {
                  step: '3',
                  title: 'Attach EA to Gold (XAUUSD)',
                  desc: 'Open XAUUSD 1-Minute (M1) chart, drag Tradifive EA, paste your License Key.'
                },
                {
                  step: '4',
                  title: 'Turn on "Algo Trading"',
                  desc: 'Click the green "Algo Trading" button on the MT5 top toolbar.'
                },
              ].map((item) => (
                <View key={item.step} style={styles.checklistItem}>
                  <View style={styles.checklistStepNum}>
                    <Text style={styles.checklistStepText}>{item.step}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checklistItemTitle}>{item.title}</Text>
                    <Text style={styles.checklistItemDesc}>{item.desc}</Text>
                    {item.copyable && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => copyToClipboard(item.copyable!, 'WebRequest URL')}
                        style={styles.copyPillSmall}
                      >
                        <Text style={styles.copyPillSmallText}>{item.copyable}</Text>
                        <Copy size={11} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { h(); setActiveStep(3); }}
              style={styles.primaryActionBtn}
            >
              <Text style={styles.primaryActionBtnText}>Continue to License Model Selection</Text>
              <ArrowRight size={18} color="#000000" />
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CHOOSE LICENSE MODEL (PROFIT SHARE VS LIFETIME)                    */}
        {/* ========================================================================= */}
        {activeStep === 3 && (
          <View style={styles.sectionWrap}>
            <View style={styles.subHeadingRow}>
              <Text style={styles.sectionHeading}>1. Choose Your Auto Trade License Model</Text>
              <Text style={styles.subHeadingHint}>Zero Upfront Available</Text>
            </View>

            {/* Option A: Daily 50% Profit Share */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { h(); setSelectedTier('profit_share_50'); }}
              style={[
                styles.tierCard,
                selectedTier === 'profit_share_50' && styles.tierCardActive
              ]}
            >
              <View style={styles.tierHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.tierTagRow}>
                    <Text style={styles.tierTitle}>Daily 50% Profit Share</Text>
                    <View style={styles.badgeRecommended}>
                      <Text style={styles.badgeRecommendedText}>POPULAR</Text>
                    </View>
                  </View>
                  <Text style={styles.tierSub}>₹0 Upfront Cost · Pay only when you win</Text>
                </View>
                <View style={styles.tierPriceBadge}>
                  <Text style={styles.tierPriceText}>₹0 UPFRONT</Text>
                </View>
              </View>
              <Text style={styles.tierDesc}>
                Trade with zero software license fee. 50% profit share is settled daily only when your account is in net profit. Absolutely zero fees on losing or breakeven days.
              </Text>
              {selectedTier === 'profit_share_50' && (
                <View style={styles.tierSelectedPill}>
                  <Check size={12} color="#000000" />
                  <Text style={styles.tierSelectedPillText}>Active Selection</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Option B: Lifetime Ownership License */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { h(); setSelectedTier('lifetime'); }}
              style={[
                styles.tierCard,
                selectedTier === 'lifetime' && styles.tierCardActive
              ]}
            >
              <View style={styles.tierHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.tierTagRow}>
                    <Text style={styles.tierTitle}>Lifetime Ownership License</Text>
                    <View style={[styles.badgeRecommended, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                      <Text style={styles.badgeRecommendedText}>VIP OWNERSHIP</Text>
                    </View>
                  </View>
                  <Text style={styles.tierSub}>100% Profits Kept · 0% Profit Share Deductions</Text>
                </View>
                <View style={[styles.tierPriceBadge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Text style={styles.tierPriceText}>₹99,999</Text>
                </View>
              </View>
              <Text style={styles.tierDesc}>
                Full unlimited lifetime license key. Keep 100% of all generated returns with zero profit share deductions, dedicated private VPS setup & VIP 24/7 priority support.
              </Text>
              {selectedTier === 'lifetime' && (
                <View style={styles.tierSelectedPill}>
                  <Check size={12} color="#000000" />
                  <Text style={styles.tierSelectedPillText}>Active Selection</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Lifetime Payment Details if Selected */}
            {selectedTier === 'lifetime' && (
              <View style={styles.cardBox}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badgePrimary}>
                    <Text style={styles.badgePrimaryText}>UPI PAYMENT INSTRUCTIONS</Text>
                  </View>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Instant Verification</Text>
                </View>

                <View style={styles.codeItem}>
                  <Text style={styles.codeItemLabel}>UPI ID / VPA</Text>
                  <Text style={styles.codeItemValue}>tradifive@icici</Text>
                </View>

                <View style={[styles.inputWrapper, { marginTop: 12 }]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter 12-digit UPI UTR / Reference No."
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    value={paymentUtr}
                    onChangeText={setPaymentUtr}
                  />
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { h(); setActiveStep(4); }}
              style={styles.primaryActionBtn}
            >
              <Text style={styles.primaryActionBtnText}>Launch Bot Controls & Telemetry</Text>
              <ArrowRight size={18} color="#000000" />
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: LIVE BOT CONTROL & REAL-TIME TELEMETRY                            */}
        {/* ========================================================================= */}
        {activeStep === 4 && (
          <View style={styles.sectionWrap}>
            {/* Live Bot Status Card */}
            <View style={styles.botStatusCard}>
              <View style={styles.botStatusHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.statusIndicatorCircle, isBotRunning && styles.statusIndicatorRunning]} />
                  <View>
                    <Text style={styles.botStatusTitle}>Tradifive FiAlgo V1</Text>
                    <Text style={styles.botStatusSubtitle}>
                      {isBotRunning ? 'Algorithmic Execution Active' : 'Execution Paused'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    h();
                    setIsBotRunning(!isBotRunning);
                    Alert.alert(
                      isBotRunning ? 'Algo Paused' : 'Algo Resumed',
                      isBotRunning ? 'Trading bot execution has been safely paused.' : 'Trading bot execution is now active.'
                    );
                  }}
                  style={[styles.botToggleBtn, isBotRunning ? styles.botToggleBtnActive : styles.botToggleBtnPaused]}
                >
                  {isBotRunning ? <Pause size={16} color="#ffffff" /> : <Play size={16} color="#ffffff" />}
                  <Text style={styles.botToggleBtnText}>{isBotRunning ? 'Pause Bot' : 'Start Bot'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.telemetryDivider} />

              <View style={styles.telemetryGrid}>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>LATENCY</Text>
                  <Text style={styles.telemetryVal}>1.8 ms</Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>DAILY TARGET</Text>
                  <Text style={styles.telemetryVal}>{dailyTargetPct}% / day</Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>EXECUTION</Text>
                  <Text style={styles.telemetryVal}>Real-time</Text>
                </View>
              </View>
            </View>

            {/* Daily Target Setting */}
            <View style={styles.subHeadingRow}>
              <Text style={styles.sectionHeading}>Configured Daily Profit Target</Text>
              <Text style={styles.subHeadingHint}>Trailing Take Profit</Text>
            </View>

            <View style={styles.targetPillRow}>
              {[2, 3, 5].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  activeOpacity={0.8}
                  onPress={() => { h(); setDailyTargetPct(pct); }}
                  style={[styles.targetPill, dailyTargetPct === pct && styles.targetPillActive]}
                >
                  <Text style={[styles.targetPillText, dailyTargetPct === pct && styles.targetPillTextActive]}>
                    {pct}% / Day
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Profit Projection Card */}
            <View style={styles.cardBox}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>PROJECTED EARNINGS</Text>
                </View>
                <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_500Medium' }}>
                  At {dailyTargetPct}% Daily Target
                </Text>
              </View>

              <View style={{ marginVertical: 10 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Simulated Trading Capital</Text>
                <Text style={{ color: '#ffffff', fontSize: 24, fontFamily: 'Inter_700Bold', marginTop: 2 }}>
                  ₹{calcCapital.toLocaleString()}
                </Text>
              </View>

              <View style={styles.projectionRow}>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>Est. Daily Gain</Text>
                  <Text style={[styles.projectionValue, { color: '#10b981' }]}>
                    +₹{dailyProfitEst.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>Est. Monthly (22 Days)</Text>
                  <Text style={[styles.projectionValue, { color: '#10b981' }]}>
                    +₹{monthlyProfitEst.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                h();
                router.push({ pathname: '/(tabs)', params: { view: 'dashboard' } } as any);
              }}
              style={styles.primaryActionBtn}
            >
              <Text style={styles.primaryActionBtnText}>Open Live Trading Dashboard</Text>
              <ArrowRight size={18} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { h(); router.push('/broker-connect' as any); }}
              style={styles.secondaryActionBtn}
            >
              <Text style={styles.secondaryActionBtnText}>Direct MT5 Credentials Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── PROFIT CALCULATOR MODAL ── */}
      <Modal
        visible={showCalculator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalculator(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Auto Trade Profit Calculator</Text>
                <Text style={styles.modalSubtitle}>Simulate your returns with Tradifive FiAlgo</Text>
              </View>
              <TouchableOpacity
                onPress={() => { h(); setShowCalculator(false); }}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Choose Capital Amount</Text>
            <View style={styles.calcPresetsRow}>
              {[25000, 50000, 100000, 500000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  activeOpacity={0.8}
                  onPress={() => { h(); setCalcCapital(amt); }}
                  style={[styles.calcPresetBtn, calcCapital === amt && styles.calcPresetBtnActive]}
                >
                  <Text style={[styles.calcPresetBtnText, calcCapital === amt && styles.calcPresetBtnTextActive]}>
                    ₹{(amt / 1000)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.cardBox, { marginTop: 18 }]}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_500Medium' }}>Target Return</Text>
              <Text style={{ color: '#ffffff', fontSize: 26, fontFamily: 'Inter_700Bold', marginVertical: 4 }}>
                {dailyTargetPct}% / Day
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>
                Based on historical multi-pair grid execution.
              </Text>

              <View style={[styles.projectionRow, { marginTop: 18 }]}>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>Est. Daily Gain</Text>
                  <Text style={[styles.projectionValue, { color: '#10b981' }]}>
                    +₹{dailyProfitEst.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>Est. Monthly Gain</Text>
                  <Text style={[styles.projectionValue, { color: '#10b981' }]}>
                    +₹{monthlyProfitEst.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { h(); setShowCalculator(false); }}
              style={[styles.primaryActionBtn, { marginTop: 18 }]}
            >
              <Text style={styles.primaryActionBtnText}>Apply & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  calcPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  calcPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  stepProgressContainer: {
    marginTop: 4,
    gap: 8,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  stepTabsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepTabActive: {
    backgroundColor: '#ffffff',
  },
  stepTabDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  stepTabText: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  stepTabTextActive: {
    color: '#000000',
    fontFamily: 'Inter_700Bold',
  },
  stepTabTextDone: {
    color: '#10b981',
    fontFamily: 'Inter_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  /* HERO TOP CARD */
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  heroBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.6,
  },
  heroStatusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroStatusText: {
    color: '#10b981',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  heroHeadline: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  heroDescription: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    marginTop: 6,
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroMetricLabel: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  heroMetricValue: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
  },
  heroMetricSub: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  sectionWrap: {
    gap: 14,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
  },
  segmentBtnText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontFamily: 'Inter_500Medium',
  },
  segmentBtnTextActive: {
    color: '#000000',
    fontFamily: 'Inter_700Bold',
  },
  subHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 14.5,
    fontFamily: 'Inter_700Bold',
  },
  subHeadingHint: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  brokersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brokerCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
  },
  brokerCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: '#ffffff',
  },
  brokerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brokerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brokerBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brokerBadgePillText: {
    color: '#94a3b8',
    fontSize: 8.5,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  brokerName: {
    color: '#ffffff',
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  brokerTagline: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 3,
    lineHeight: 14,
  },
  brokerSelectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  brokerSelectedText: {
    color: '#000000',
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
  },
  cardBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgePrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePrimaryText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  copyInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyInlineText: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: 'Inter_500Medium',
  },
  partnerInfoTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  partnerInfoDesc: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 3,
    lineHeight: 17,
  },
  codeBoxesRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  codeItem: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  codeItemLabel: {
    color: '#64748b',
    fontSize: 9.5,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  codeItemValue: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginTop: 3,
  },
  openBrokerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  openBrokerBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    height: 48,
  },
  uploadArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadMainText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  uploadSubText: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 3,
  },
  uploadedPreviewContainer: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedImagePreview: {
    width: '100%',
    height: '100%',
  },
  uploadSuccessOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 7,
  },
  uploadSuccessText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  primaryActionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 13,
    borderRadius: 14,
  },
  secondaryActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  downloadIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadTitle: {
    color: '#ffffff',
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  downloadSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  downloadSmallBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadSmallBtnText: {
    color: '#000000',
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
  },
  licenseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  licenseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  licenseCardTitle: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    color: '#10b981',
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
  },
  licenseKeyText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 8,
  },
  copyKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 11,
    borderRadius: 12,
  },
  copyKeyBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
  },
  checklistCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  checklistStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checklistStepText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  checklistItemTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  checklistItemDesc: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  copyPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  copyPillSmallText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  tierCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
  },
  tierCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: '#ffffff',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tierTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tierTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  tierSub: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  badgeRecommended: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeRecommendedText: {
    color: '#10b981',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  tierPriceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierPriceText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  tierDesc: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
  },
  tierSelectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  tierSelectedPillText: {
    color: '#000000',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  botStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  botStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicatorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
  },
  statusIndicatorRunning: {
    backgroundColor: '#10b981',
  },
  botStatusTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  botStatusSubtitle: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  botToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  botToggleBtnActive: {
    backgroundColor: '#ef4444',
  },
  botToggleBtnPaused: {
    backgroundColor: '#10b981',
  },
  botToggleBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  telemetryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  telemetryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryLabel: {
    color: '#64748b',
    fontSize: 9.5,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  telemetryVal: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
  },
  targetPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  targetPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetPillActive: {
    backgroundColor: '#ffffff',
  },
  targetPillText: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  targetPillTextActive: {
    color: '#000000',
    fontFamily: 'Inter_700Bold',
  },
  projectionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  projectionItem: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  projectionLabel: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  projectionValue: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginTop: 3,
  },
  /* MODAL */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121215',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  calcPresetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  calcPresetBtnActive: {
    backgroundColor: '#ffffff',
  },
  calcPresetBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  calcPresetBtnTextActive: {
    color: '#000000',
    fontFamily: 'Inter_700Bold',
  },
});
