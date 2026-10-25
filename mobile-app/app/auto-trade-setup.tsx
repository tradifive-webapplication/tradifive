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
  ArrowLeft,
  Download,
  FileCode,
  Layers,
  Terminal,
  Activity,
  CreditCard,
  QrCode,
  TrendingUp,
  MessageCircle,
  Mail,
  UploadCloud,
  RefreshCw,
  Send,
  ImageIcon,
  DollarSign,
  Shield,
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
    brandColor: '#0284c7',
    badge: 'OFFICIAL PARTNER'
  },
  {
    id: 'exness',
    name: 'Exness',
    tagline: 'Instant Withdrawals · Zero Swap',
    url: 'https://exness.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@exness.com',
    brandColor: '#d97706',
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
    brandColor: '#dc2626',
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
    brandColor: '#0284c7',
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
    brandColor: '#4f46e5',
    badge: 'INSTITUTIONAL'
  }
];

export default function AutoTradeSetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();

  // Active Wizard Step: 1 = Connect MT5, 2 = Download FiAlgo, 3 = License Payment, 4 = Activate License
  const [activeStep, setActiveStep] = useState<number>(1);

  // Setup mode: New Account vs Existing Account (IB Transfer)
  const [setupMode, setSetupMode] = useState<'new' | 'transfer'>('new');
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('vantage');
  const [mt5Account, setMt5Account] = useState<string>('8492015');
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [depositConfirmed, setDepositConfirmed] = useState<boolean>(true);
  const [ibVerified, setIbVerified] = useState<boolean>(false);
  const [transferStatus, setTransferStatus] = useState<'none' | 'pending' | 'approved'>('none');

  // Step 2 state
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);

  // Step 3 state: Plan Tier (Lifetime VIP ₹99,999 vs Performance ₹5,000 + 50% Profit Share)
  const [selectedTier, setSelectedTier] = useState<'lifetime' | 'profit_share_50'>('lifetime');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [paymentUtr, setPaymentUtr] = useState<string>('');
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending' | 'approved'>('none');

  // Step 4 state: Bot Control
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
    return generateTradifiveLicenseKey(mt5Account || '8492015');
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
    if (label.toLowerCase().includes('license') || label.toLowerCase().includes('key')) {
      setCopiedKey(true);
    }
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

  const handlePickProofImage = async (isPaymentProof: boolean = false) => {
    h();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        if (isPaymentProof) {
          setPaymentProofUri(result.assets[0].uri);
        } else {
          setProofImageUri(result.assets[0].uri);
        }
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
    if (!depositConfirmed) {
      Alert.alert('Deposit Required', 'Please confirm that your MT5 account maintains a minimum balance of $500 USD.');
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
      setTransferStatus('pending');
      hSuccess();
      Alert.alert(
        'Account Submitted',
        `Your ${selectedBroker.name} MT5 account #${mt5Account.trim()} has been submitted for partner verification. Proceeding to Step 2.`,
        [{ text: 'Continue to Step 2', onPress: () => setActiveStep(2) }]
      );
    } catch (e: any) {
      setTransferStatus('pending');
      setActiveStep(2);
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleSubmitPayment = () => {
    h();
    if (!paymentUtr.trim()) {
      Alert.alert('Missing UTR', 'Please enter the 12-digit UTR / Ref Number from your PhonePe/UPI or NetBanking app.');
      return;
    }
    setPaymentStatus('pending');
    hSuccess();
    Alert.alert(
      'Payment Submitted',
      `UTR #${paymentUtr.trim()} has been submitted to our finance desk. Turnaround is ~2 hours (or fast-track in 15 mins on WhatsApp). Proceeding to Step 4.`,
      [{ text: 'Check Step 4: License Key', onPress: () => setActiveStep(4) }]
    );
  };

  // Preset calculation
  const dailyProfitEst = useMemo(() => {
    return Math.round(calcCapital * (dailyTargetPct / 100));
  }, [calcCapital, dailyTargetPct]);

  const monthlyProfitEst = useMemo(() => {
    return Math.round(dailyProfitEst * 22); // 22 trading days
  }, [dailyProfitEst]);

  const compound90Days = useMemo(() => {
    let balance = calcCapital;
    const rate = dailyTargetPct / 100;
    for (let day = 0; day < 66; day++) { // 66 trading days (~3 months)
      balance += balance * rate;
    }
    return Math.round(balance);
  }, [calcCapital, dailyTargetPct]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── TOP HEADER (BLACK BACKGROUND WITH TOP-GLOW FIT LIKE OTHER SCREENS) ── */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Image
          source={require('../assets/images/top-glow.png')}
          style={styles.headerGlow}
          resizeMode="stretch"
        />

        <View style={styles.headerRow}>
          {/* Circular Blurred Back Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { h(); router.back(); }}
            style={styles.backButton}
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>

          {/* Page Name */}
          <Text style={styles.headerTitle}>AI Trading Setup</Text>

          {/* Calculator Pill Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { h(); setShowCalculator(true); }}
            style={styles.calcButton}
          >
            <Calculator size={13} color="#60a5fa" />
            <Text style={styles.calcButtonText}>Calculator</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BACKSIDE WHITE CARD (CURVED -34 MARGIN TOP FITTING LIKE JOURNAL & RISK GUARD) ── */}
      <View style={[styles.card, { backgroundColor: isDark ? theme.background : '#ffffff' }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 48 }]}
        >
          {/* Subtitle Inside Card */}
          <View style={styles.titleSection}>
            <Text style={[styles.pageSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Connect your MT5 broker and activate automated trading.
            </Text>
          </View>

          {/* ── SLEEK PROGRESS BAR (EXACTLY MATCHING WEB USER APP) ── */}
          <View style={styles.stepperContainer}>
            {/* Progress Header Meta */}
            <View style={styles.stepperMetaRow}>
              <Text style={[styles.stepperMetaText, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
                Step {activeStep} of 4: {activeStep === 1 ? 'Connect MT5' : activeStep === 2 ? 'Download FiAlgo' : activeStep === 3 ? 'License Payment' : 'Activate License'}
              </Text>
              <Text style={styles.stepperPercentText}>
                {activeStep === 1 ? '25%' : activeStep === 2 ? '50%' : activeStep === 3 ? '75%' : '100%'}
              </Text>
            </View>

            {/* Progress Bar Track */}
            <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: activeStep === 1 ? '25%' : activeStep === 2 ? '50%' : activeStep === 3 ? '75%' : '100%' }
                ]}
              />
            </View>

            {/* 4 Step Milestone Tabs */}
            <View style={styles.milestoneGrid}>
              {[
                { step: 1, title: 'Connect', isDone: ibVerified },
                { step: 2, title: 'Download', isDone: hasDownloaded },
                { step: 3, title: 'Pay ₹99k', isDone: paymentStatus === 'approved', isPending: paymentStatus === 'pending' },
                { step: 4, title: 'Activate', isDone: ibVerified && (paymentStatus === 'approved' || selectedTier === 'profit_share_50') },
              ].map(({ step, title, isDone, isPending }) => {
                const isActive = activeStep === step;
                return (
                  <TouchableOpacity
                    key={step}
                    activeOpacity={0.7}
                    onPress={() => { h(); setActiveStep(step); }}
                    style={[
                      styles.milestoneTab,
                      {
                        backgroundColor: isActive
                          ? (isDark ? '#ffffff' : '#0f172a')
                          : isDone
                          ? (isDark ? '#064e3b' : '#ecfdf5')
                          : isPending
                          ? (isDark ? '#451a03' : '#fffbeb')
                          : (isDark ? '#1e293b' : '#f8fafc'),
                        borderColor: isActive
                          ? (isDark ? '#ffffff' : '#0f172a')
                          : isDone
                          ? 'rgba(16,185,129,0.4)'
                          : isPending
                          ? 'rgba(245,158,11,0.4)'
                          : (isDark ? '#334155' : '#e2e8f0'),
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.milestoneTabText,
                        {
                          color: isActive
                            ? (isDark ? '#0f172a' : '#ffffff')
                            : isDone
                            ? '#10b981'
                            : isPending
                            ? '#f59e0b'
                            : (isDark ? '#94a3b8' : '#64748b'),
                        }
                      ]}
                      numberOfLines={1}
                    >
                      {isDone ? `✓ ${title}` : isPending ? `⌛ ${title}` : `${step}. ${title}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ========================================================================= */}
          {/* STEP 1: CONNECT MT5 BROKER                                                */}
          {/* ========================================================================= */}
          {activeStep === 1 && (
            <View style={styles.stepContent}>
              <View style={[styles.panelCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                {/* Panel Header */}
                <View style={styles.panelHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.panelTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      Connect MT5 Account
                    </Text>
                    <Text style={[styles.panelDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Complete these steps to link your broker and unlock your FiAlgo V1 license.
                    </Text>
                  </View>
                  {ibVerified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle2 size={12} color="#10b981" />
                      <Text style={styles.verifiedBadgeText}>Connected</Text>
                    </View>
                  )}
                </View>

                {/* 2-Option Segmented Control: Open New Account vs Transfer Existing Account */}
                <View style={[styles.segmentedWrap, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setSetupMode('new'); setSelectedBrokerId('vantage'); }}
                    style={[
                      styles.segmentBtn,
                      setupMode === 'new' && (isDark ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
                    ]}
                  >
                    <Text style={[styles.segmentBtnText, setupMode === 'new' && styles.segmentBtnTextActive]}>
                      Open New Account
                    </Text>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedBadgeText}>Recommended</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setSetupMode('transfer'); }}
                    style={[
                      styles.segmentBtn,
                      setupMode === 'transfer' && (isDark ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
                    ]}
                  >
                    <Text style={[styles.segmentBtnText, setupMode === 'transfer' && styles.segmentBtnTextActive]}>
                      Transfer Existing
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Broker Selector Pills */}
                <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 16 }]}>
                  SELECT YOUR BROKER
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brokerScroll}>
                  {BROKERS.map((b) => {
                    const isSelected = selectedBrokerId === b.id;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        activeOpacity={0.7}
                        onPress={() => { h(); setSelectedBrokerId(b.id); }}
                        style={[
                          styles.brokerPill,
                          {
                            backgroundColor: isSelected ? (isDark ? '#0284c7' : '#0f172a') : (isDark ? '#0f172a' : '#f8fafc'),
                            borderColor: isSelected ? (isDark ? '#38bdf8' : '#0f172a') : (isDark ? '#334155' : '#e2e8f0'),
                          }
                        ]}
                      >
                        <Text style={[styles.brokerPillText, { color: isSelected ? '#ffffff' : (isDark ? '#cbd5e1' : '#0f172a') }]}>
                          {b.name}
                        </Text>
                        <View style={[styles.brokerMiniTag, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }]}>
                          <Text style={[styles.brokerMiniTagText, { color: isSelected ? '#ffffff' : '#64748b' }]}>
                            {b.badge}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Sub-Step 1: Partner Link & Referral */}
                <View style={[styles.instructionBox, { backgroundColor: isDark ? '#0f172a' : '#f0f9ff', borderColor: isDark ? '#0369a1' : '#bae6fd' }]}>
                  <View style={styles.instructionHeader}>
                    <View style={styles.instructionStepNum}>
                      <Text style={styles.instructionStepNumText}>1</Text>
                    </View>
                    <Text style={[styles.instructionTitle, { color: isDark ? '#f0f9ff' : '#0369a1' }]}>
                      {setupMode === 'new' ? `Open ${selectedBroker.name} Account` : `Transfer ${selectedBroker.name} to Partner IB`}
                    </Text>
                  </View>

                  <Text style={[styles.instructionDesc, { color: isDark ? '#cbd5e1' : '#0c4a6e' }]}>
                    {setupMode === 'new'
                      ? `Register with partner referral code ${selectedBroker.referralCode} to link your account to our institutional server.`
                      : `Email ${selectedBroker.name} support (${selectedBroker.supportEmail}) to transfer your existing account to Partner IB ${selectedBroker.ibNumber}.`}
                  </Text>

                  <View style={styles.instructionActionRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => openBrokerLink(selectedBroker.url)}
                      style={styles.primaryPillBtn}
                    >
                      <Text style={styles.primaryPillBtnText}>Open {selectedBroker.name}</Text>
                      <ExternalLink size={13} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => copyToClipboard(selectedBroker.referralCode, 'Partner Code')}
                      style={[styles.secondaryPillBtn, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
                    >
                      {copiedCode === 'Partner Code' ? <Check size={12} color="#10b981" /> : <Copy size={12} color={isDark ? '#cbd5e1' : '#475569'} />}
                      <Text style={[styles.secondaryPillBtnText, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                        {copiedCode === 'Partner Code' ? 'Copied' : 'Copy Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sub-Step 2: Maintain $500 Deposit */}
                <View style={[styles.requirementBox, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                  <View style={styles.instructionStepNumGray}>
                    <Text style={styles.instructionStepNumText}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.requirementTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                        Maintain $500+ Account Balance
                      </Text>
                      <View style={styles.minBadge}>
                        <Text style={styles.minBadgeText}>Min. $500</Text>
                      </View>
                    </View>
                    <Text style={[styles.requirementSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Maintain at least $500 USD balance for the Gold grid safety buffer and lot sizing.
                    </Text>
                  </View>
                </View>

                {/* Sub-Step 3: Submit MT5 Account & Proof */}
                <View style={[styles.submissionBox, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                  <View style={styles.instructionHeader}>
                    <View style={styles.instructionStepNum}>
                      <Text style={styles.instructionStepNumText}>3</Text>
                    </View>
                    <Text style={[styles.instructionTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      Submit MT5 Account & Proof
                    </Text>
                  </View>

                  <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 10 }]}>
                    MT5 ACCOUNT NUMBER (LOGIN)
                  </Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#cbd5e1', color: isDark ? '#ffffff' : '#0f172a' }]}
                    placeholder="e.g. 8492015"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={mt5Account}
                    onChangeText={setMt5Account}
                  />

                  {/* Confirmation Checkbox */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setDepositConfirmed(!depositConfirmed)}
                    style={styles.checkboxRow}
                  >
                    <View style={[styles.checkboxBox, depositConfirmed && styles.checkboxBoxActive]}>
                      {depositConfirmed && <Check size={12} color="#ffffff" />}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                      I confirm this MT5 account has a <Text style={{ fontFamily: 'Inter_700Bold' }}>minimum balance of $500 USD</Text>.
                    </Text>
                  </TouchableOpacity>

                  {/* Screenshot Proof Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePickProofImage(false)}
                    style={[styles.proofUploadBtn, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
                  >
                    <UploadCloud size={16} color={proofImageUri ? '#10b981' : '#64748b'} />
                    <Text style={[styles.proofUploadText, { color: proofImageUri ? '#10b981' : (isDark ? '#cbd5e1' : '#475569') }]}>
                      {proofImageUri ? 'Screenshot Proof Attached ✓' : 'Upload MT5 Deposit Screenshot (Optional)'}
                    </Text>
                  </TouchableOpacity>

                  {/* Submit CTA */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSubmitVerification}
                    disabled={isUploadingProof}
                    style={styles.submitButton}
                  >
                    {isUploadingProof ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Send size={14} color="#ffffff" />
                        <Text style={styles.submitButtonText}>Submit MT5 Account for Verification</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Priority Fast-Track Support Desk */}
                <View style={[styles.supportBox, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.supportTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      Need instant 15-min verification?
                    </Text>
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityBadgeText}>Priority Desk</Text>
                    </View>
                  </View>
                  <Text style={[styles.supportSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    Ping our desk with your MT5 ID to get approved immediately:
                  </Text>
                  <View style={styles.supportBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => Linking.openURL(`https://wa.me/?text=Hello%20TradiFive!%20Please%20verify%20my%20MT5%20account%20%23${mt5Account}%20under%20Partner%20IB%2027863221.`)}
                      style={[styles.supportBtn, { backgroundColor: isDark ? '#064e3b' : '#ecfdf5', borderColor: '#10b981' }]}
                    >
                      <MessageCircle size={13} color="#10b981" />
                      <Text style={[styles.supportBtnText, { color: '#10b981' }]}>WhatsApp Desk</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => Linking.openURL(`mailto:support@tradifive.in?subject=Verify%20MT5%20Account%20${mt5Account}&body=Please%20verify%20MT5%20account%20%23${mt5Account}`)}
                      style={[styles.supportBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
                    >
                      <Mail size={13} color={isDark ? '#94a3b8' : '#475569'} />
                      <Text style={[styles.supportBtnText, { color: isDark ? '#cbd5e1' : '#334155' }]}>Email Desk</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bottom Stepper CTA */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => { h(); setActiveStep(2); }}
                  style={styles.continueButton}
                >
                  <Text style={styles.continueButtonText}>Continue to Step 2: Download FiAlgo</Text>
                  <ArrowRight size={15} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: DOWNLOAD FIALGO EA                                                */}
          {/* ========================================================================= */}
          {activeStep === 2 && (
            <View style={styles.stepContent}>
              <View style={[styles.panelCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                {/* Panel Header */}
                <View style={styles.panelHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.panelTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      Download FiAlgo EA
                    </Text>
                    <Text style={[styles.panelDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Deploy our institutional Gold EA directly into your MetaTrader 5 terminal.
                    </Text>
                  </View>
                  <View style={styles.versionBadge}>
                    <Text style={styles.versionBadgeText}>v1.0.4 PRO</Text>
                  </View>
                </View>

                {/* Algorithmic Specs Strip */}
                <View style={styles.specsGrid}>
                  <View style={[styles.specTile, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <View style={styles.specTileHeader}>
                      <Text style={styles.specTileLabel}>ASSET PAIR</Text>
                      <Coins size={12} color="#64748b" />
                    </View>
                    <Text style={[styles.specTileValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>XAUUSD (Gold)</Text>
                    <Text style={styles.specTileSub}>Spot / USD Structure</Text>
                  </View>

                  <View style={[styles.specTile, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <View style={styles.specTileHeader}>
                      <Text style={styles.specTileLabel}>TIMEFRAME</Text>
                      <Clock size={12} color="#64748b" />
                    </View>
                    <Text style={[styles.specTileValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>1-Min (M1)</Text>
                    <Text style={styles.specTileSub}>Tick-Level Accuracy</Text>
                  </View>

                  <View style={[styles.specTile, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <View style={styles.specTileHeader}>
                      <Text style={styles.specTileLabel}>EXECUTION</Text>
                      <Zap size={12} color="#10b981" />
                    </View>
                    <Text style={[styles.specTileValue, { color: '#10b981' }]}>&lt; 3ms Direct</Text>
                    <Text style={styles.specTileSub}>Zero Broker Relay</Text>
                  </View>

                  <View style={[styles.specTile, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <View style={styles.specTileHeader}>
                      <Text style={styles.specTileLabel}>ENGINE</Text>
                      <Layers size={12} color="#64748b" />
                    </View>
                    <Text style={[styles.specTileValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>Dynamic Basket</Text>
                    <Text style={styles.specTileSub}>Adaptive Risk Guard</Text>
                  </View>
                </View>

                {/* Safety Specifications */}
                <View style={[styles.safetyCard, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Shield size={13} color="#64748b" />
                      <Text style={[styles.safetyTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Safety Specifications</Text>
                    </View>
                    <View style={styles.guardActiveBadge}>
                      <CheckCircle2 size={10} color="#10b981" />
                      <Text style={styles.guardActiveBadgeText}>Risk Guard Active</Text>
                    </View>
                  </View>

                  <View style={styles.quantRow}>
                    <View style={[styles.quantBox, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                      <Text style={styles.quantLabel}>Min. Deposit</Text>
                      <Text style={[styles.quantVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>$500 USD</Text>
                    </View>
                    <View style={[styles.quantBox, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                      <Text style={styles.quantLabel}>Base Lot</Text>
                      <Text style={[styles.quantVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>0.01</Text>
                    </View>
                    <View style={[styles.quantBox, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
                      <Text style={styles.quantLabel}>Leverage</Text>
                      <Text style={[styles.quantVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>1:100+</Text>
                    </View>
                  </View>
                </View>

                {/* File Download Buttons */}
                <View style={styles.downloadSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <FileCode size={14} color="#64748b" />
                      <Text style={[styles.fileCodeText, { color: isDark ? '#cbd5e1' : '#334155' }]}>FiAlgo_v1.0.4.ex5</Text>
                    </View>
                    <Text style={styles.fileSizeText}>248 KB · Real Compiled EA</Text>
                  </View>

                  <View style={styles.downloadBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        hSuccess();
                        setHasDownloaded(true);
                        Share.share({
                          title: 'FiAlgo_v1.0.4.set',
                          message: 'Download FiAlgo Gold M1 Settings Preset: https://tradifive.in/presets/FiAlgo_Gold_M1.set'
                        });
                      }}
                      style={[styles.downloadSubBtn, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
                    >
                      <Sliders size={13} color={isDark ? '#cbd5e1' : '#334155'} />
                      <Text style={[styles.downloadSubBtnText, { color: isDark ? '#cbd5e1' : '#334155' }]}>Presets (.set)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        hSuccess();
                        setHasDownloaded(true);
                        Share.share({
                          title: 'FiAlgo_v1.0.4.ex5',
                          message: 'Download FiAlgo v1.0.4 MetaTrader 5 Expert Advisor: https://tradifive.in/download/FiAlgo_v1.0.4.ex5'
                        });
                      }}
                      style={styles.downloadMainBtn}
                    >
                      <Download size={14} color="#ffffff" />
                      <Text style={styles.downloadMainBtnText}>Download (.ex5)</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* MT5 WebRequest Setup Card */}
                <View style={[styles.webrequestBox, { backgroundColor: isDark ? '#0f172a' : '#eff6ff', borderColor: isDark ? '#0369a1' : '#bfdbfe' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Zap size={14} color="#0284c7" />
                      <Text style={[styles.webrequestTitle, { color: isDark ? '#f0f9ff' : '#0369a1' }]}>
                        Required MT5 WebRequest Setup (1-Time)
                      </Text>
                    </View>
                    <View style={styles.realtimeBadge}>
                      <Text style={styles.realtimeBadgeText}>Enables Real Feed</Text>
                    </View>
                  </View>
                  <Text style={[styles.webrequestDesc, { color: isDark ? '#cbd5e1' : '#0c4a6e' }]}>
                    Open MT5 → Tools → Options → Experts. Check "Allow WebRequest for listed URL" and add:
                  </Text>
                  <View style={[styles.urlCopyRow, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#bfdbfe' }]}>
                    <Text style={styles.urlText} numberOfLines={1}>
                      https://rylwyxhupwpwsdbvuoej.supabase.co
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => copyToClipboard('https://rylwyxhupwpwsdbvuoej.supabase.co', 'Webhook URL')}
                      style={styles.urlCopyBtn}
                    >
                      <Copy size={11} color="#ffffff" />
                      <Text style={styles.urlCopyBtnText}>Copy URL</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Navigation Buttons: Back to Step 1 & Forward to Step 3 */}
                <View style={styles.navRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setActiveStep(1); }}
                    style={[styles.backNavBtn, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}
                  >
                    <ArrowLeft size={13} color={isDark ? '#cbd5e1' : '#475569'} />
                    <Text style={[styles.backNavBtnText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Back to Step 1</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setActiveStep(3); }}
                    style={styles.forwardNavBtn}
                  >
                    <Text style={styles.forwardNavBtnText}>Continue to Step 3: License Payment</Text>
                    <ArrowRight size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: LIFETIME LICENSE PAYMENT ₹99,999                                  */}
          {/* ========================================================================= */}
          {activeStep === 3 && (
            <View style={styles.stepContent}>
              <View style={[styles.panelCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                {/* Panel Header */}
                <View style={styles.panelHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.panelTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      License Payment
                    </Text>
                    <Text style={[styles.panelDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Complete payment via PhonePe / UPI or Bank Transfer to request your license key.
                    </Text>
                  </View>
                  {paymentStatus === 'approved' ? (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle2 size={12} color="#10b981" />
                      <Text style={styles.verifiedBadgeText}>Payment Confirmed</Text>
                    </View>
                  ) : paymentStatus === 'pending' ? (
                    <View style={styles.pendingBadge}>
                      <Clock size={12} color="#f59e0b" />
                      <Text style={styles.pendingBadgeText}>Under Review (~2h)</Text>
                    </View>
                  ) : null}
                </View>

                {/* 2-Tier Plan Selector */}
                <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 8 }]}>
                  CHOOSE YOUR ACCESS PLAN
                </Text>
                <View style={styles.tierGrid}>
                  {/* Tier 1: Lifetime VIP ₹99,999 */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setSelectedTier('lifetime'); }}
                    style={[
                      styles.tierCard,
                      selectedTier === 'lifetime' && styles.tierCardActivePurple,
                      { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: selectedTier === 'lifetime' ? '#7c3aed' : (isDark ? '#334155' : '#e2e8f0') }
                    ]}
                  >
                    <View style={styles.tierTop}>
                      <View style={styles.tierBadgePurple}>
                        <Text style={styles.tierBadgePurpleText}>VIP LIFETIME (0% SHARE)</Text>
                      </View>
                      <View style={[styles.radioCircle, selectedTier === 'lifetime' && styles.radioCircleActivePurple]}>
                        {selectedTier === 'lifetime' && <Check size={10} color="#ffffff" />}
                      </View>
                    </View>
                    <Text style={[styles.tierTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Lifetime VIP License</Text>
                    <Text style={[styles.tierSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Pay once, keep <Text style={{ fontFamily: 'Inter_700Bold', color: '#7c3aed' }}>100% of all profits</Text> forever. Zero recurring cuts.
                    </Text>
                    <View style={[styles.tierPriceStrip, { borderTopColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                      <Text style={styles.tierPriceLabel}>ONE-TIME</Text>
                      <Text style={[styles.tierPriceVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>₹99,999</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Tier 2: Performance Partner ₹5,000 Setup + 50% Share */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setSelectedTier('profit_share_50'); }}
                    style={[
                      styles.tierCard,
                      selectedTier === 'profit_share_50' && styles.tierCardActiveBlue,
                      { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: selectedTier === 'profit_share_50' ? '#0284c7' : (isDark ? '#334155' : '#e2e8f0') }
                    ]}
                  >
                    <View style={styles.tierTop}>
                      <View style={styles.tierBadgeBlue}>
                        <Text style={styles.tierBadgeBlueText}>LOW ENTRY SETUP</Text>
                      </View>
                      <View style={[styles.radioCircle, selectedTier === 'profit_share_50' && styles.radioCircleActiveBlue]}>
                        {selectedTier === 'profit_share_50' && <Check size={10} color="#ffffff" />}
                      </View>
                    </View>
                    <Text style={[styles.tierTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Performance Partner</Text>
                    <Text style={[styles.tierSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Low ₹5k setup fee + daily 50% profit share on winning trades only.
                    </Text>
                    <View style={[styles.tierPriceStrip, { borderTopColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                      <Text style={styles.tierPriceLabel}>SETUP FEE</Text>
                      <Text style={[styles.tierPriceVal, { color: isDark ? '#ffffff' : '#0f172a' }]}>₹5,000</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Payment Method Tabs */}
                <View style={[styles.segmentedWrap, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', marginTop: 16 }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setPaymentMethod('upi'); }}
                    style={[
                      styles.segmentBtn,
                      paymentMethod === 'upi' && (isDark ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
                    ]}
                  >
                    <QrCode size={13} color={paymentMethod === 'upi' ? (isDark ? '#ffffff' : '#0f172a') : '#64748b'} />
                    <Text style={[styles.segmentBtnText, paymentMethod === 'upi' && styles.segmentBtnTextActive]}>
                      PhonePe / UPI QR
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setPaymentMethod('bank'); }}
                    style={[
                      styles.segmentBtn,
                      paymentMethod === 'bank' && (isDark ? styles.segmentBtnActiveDark : styles.segmentBtnActiveLight),
                    ]}
                  >
                    <CreditCard size={13} color={paymentMethod === 'bank' ? (isDark ? '#ffffff' : '#0f172a') : '#64748b'} />
                    <Text style={[styles.segmentBtnText, paymentMethod === 'bank' && styles.segmentBtnTextActive]}>
                      Bank Transfer
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Payment Details Box */}
                {paymentMethod === 'upi' ? (
                  <View style={[styles.paymentDetailsBox, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <Text style={[styles.qrTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      Scan & Pay via Any UPI App
                    </Text>
                    <Text style={[styles.qrSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      GPay, PhonePe, Paytm, BHIM or Mobile Banking
                    </Text>

                    {/* Clean UPI ID Box */}
                    <View style={[styles.upiIdRow, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#cbd5e1' }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.upiIdLabel}>OFFICIAL UPI ID</Text>
                        <Text style={[styles.upiIdVal, { color: isDark ? '#38bdf8' : '#0284c7' }]}>9731980756@axisbank</Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => copyToClipboard('9731980756@axisbank', 'UPI ID')}
                        style={styles.copyPillBtn}
                      >
                        <Copy size={11} color="#ffffff" />
                        <Text style={styles.copyPillBtnText}>Copy UPI</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.paymentSummaryStrip}>
                      <Text style={styles.summaryLabel}>PAYABLE AMOUNT:</Text>
                      <Text style={[styles.summaryAmount, { color: isDark ? '#10b981' : '#047857' }]}>
                        {selectedTier === 'lifetime' ? '₹99,999' : '₹5,000'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.paymentDetailsBox, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <Text style={[styles.qrTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      IMPS / NEFT / RTGS Bank Transfer
                    </Text>
                    <View style={styles.bankDetailItem}>
                      <Text style={styles.bankLabel}>Beneficiary Name</Text>
                      <Text style={[styles.bankValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>TRADIFIVE TECHNOLOGIES</Text>
                    </View>
                    <View style={styles.bankDetailItem}>
                      <Text style={styles.bankLabel}>Bank Name</Text>
                      <Text style={[styles.bankValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>Axis Bank Ltd</Text>
                    </View>
                    <View style={styles.bankDetailItem}>
                      <Text style={styles.bankLabel}>Account Number</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.bankValueMono, { color: isDark ? '#38bdf8' : '#0284c7' }]}>924010072811588</Text>
                        <TouchableOpacity onPress={() => copyToClipboard('924010072811588', 'Account Number')}>
                          <Copy size={12} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.bankDetailItem}>
                      <Text style={styles.bankLabel}>IFSC Code</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.bankValueMono, { color: isDark ? '#38bdf8' : '#0284c7' }]}>UTIB0000004</Text>
                        <TouchableOpacity onPress={() => copyToClipboard('UTIB0000004', 'IFSC Code')}>
                          <Copy size={12} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* UTR Input & Proof Upload */}
                <View style={[styles.submissionBox, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', marginTop: 14 }]}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                    12-DIGIT UTR / REFERENCE NUMBER
                  </Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#cbd5e1', color: isDark ? '#ffffff' : '#0f172a' }]}
                    placeholder="e.g. 429104829104"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={paymentUtr}
                    onChangeText={setPaymentUtr}
                  />

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePickProofImage(true)}
                    style={[styles.proofUploadBtn, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#cbd5e1' }]}
                  >
                    <UploadCloud size={16} color={paymentProofUri ? '#10b981' : '#64748b'} />
                    <Text style={[styles.proofUploadText, { color: paymentProofUri ? '#10b981' : (isDark ? '#cbd5e1' : '#475569') }]}>
                      {paymentProofUri ? 'Payment Screenshot Attached ✓' : 'Upload Payment Receipt Screenshot'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSubmitPayment}
                    style={styles.submitButton}
                  >
                    <Send size={14} color="#ffffff" />
                    <Text style={styles.submitButtonText}>Submit Payment Verification</Text>
                  </TouchableOpacity>
                </View>

                {/* WhatsApp Fast-Track */}
                <View style={[styles.supportBox, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0', marginTop: 14 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.supportTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      Need 15-Minute Priority Issuance?
                    </Text>
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityBadgeText}>⚡ 15-Min Fast Track</Text>
                    </View>
                  </View>
                  <Text style={[styles.supportSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    Send your UTR #{paymentUtr || 'number'} directly to our WhatsApp desk for instant activation:
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(`https://wa.me/?text=Hello%20TradiFive!%20I%20have%20completed%20the%20${selectedTier === 'lifetime' ? 'Rs.99,999' : 'Rs.5,000'}%20license%20payment.%20My%20UTR%20is%20${paymentUtr}.%20Please%20verify%20and%20issue%20my%20license%20key.`)}
                    style={[styles.supportBtnFull, { backgroundColor: isDark ? '#064e3b' : '#ecfdf5', borderColor: '#10b981' }]}
                  >
                    <MessageCircle size={14} color="#10b981" />
                    <Text style={[styles.supportBtnText, { color: '#10b981' }]}>Fast-Track on WhatsApp Desk</Text>
                  </TouchableOpacity>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.navRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setActiveStep(2); }}
                    style={[styles.backNavBtn, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}
                  >
                    <ArrowLeft size={13} color={isDark ? '#cbd5e1' : '#475569'} />
                    <Text style={[styles.backNavBtnText, { color: isDark ? '#cbd5e1' : '#475569' }]}>Back to Step 2</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { h(); setActiveStep(4); }}
                    style={styles.forwardNavBtn}
                  >
                    <Text style={styles.forwardNavBtnText}>Check Step 4: License Key</Text>
                    <ArrowRight size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: ACTIVATE LICENSE & LIVE ENGINE                                    */}
          {/* ========================================================================= */}
          {activeStep === 4 && (
            <View style={styles.stepContent}>
              <View style={[styles.panelCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                {/* Panel Header */}
                <View style={styles.panelHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.panelTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                      Activation Key & Live Trading
                    </Text>
                    <Text style={[styles.panelDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Copy your cryptographic license key and attach it to FiAlgo V1 in MT5.
                    </Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <CheckCircle2 size={12} color="#10b981" />
                    <Text style={styles.verifiedBadgeText}>Active & Bound</Text>
                  </View>
                </View>

                {/* Personal Cryptographic License Key Box */}
                <View style={[styles.licenseCard, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                  <View style={styles.licenseHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={styles.greenPulseDot} />
                      <Text style={[styles.licenseCardTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                        MT5 License Key
                      </Text>
                      <View style={[styles.accountPill, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                        <Text style={[styles.accountPillText, { color: isDark ? '#cbd5e1' : '#334155' }]}>#{mt5Account}</Text>
                      </View>
                    </View>
                    <Text style={styles.lifetimeActiveText}>Lifetime Active</Text>
                  </View>

                  <View style={[styles.keyDisplayRow, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#cbd5e1' }]}>
                    <Text style={[styles.licenseKeyText, { color: isDark ? '#38bdf8' : '#0f172a' }]} numberOfLines={1}>
                      {licenseKey}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => copyToClipboard(licenseKey, 'License Key')}
                      style={styles.copyKeyBtn}
                    >
                      {copiedKey ? <Check size={12} color="#ffffff" /> : <Copy size={12} color="#ffffff" />}
                      <Text style={styles.copyKeyBtnText}>{copiedKey ? 'Copied' : 'Copy Key'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Bound Guarantee */}
                  <View style={[styles.boundBox, { backgroundColor: isDark ? '#064e3b' : '#ecfdf5', borderColor: '#10b981' }]}>
                    <ShieldCheck size={14} color="#10b981" />
                    <Text style={[styles.boundBoxText, { color: isDark ? '#a7f3d0' : '#065f46' }]}>
                      Strictly bound to MT5 account #{mt5Account}. Mathematical FNV-1a verification will auto-block execution on any other terminal login.
                    </Text>
                  </View>
                </View>

                {/* Live Engine Master Control */}
                <View style={[styles.botControlCard, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0', marginTop: 14 }]}>
                  <View style={styles.botControlHeader}>
                    <View>
                      <Text style={[styles.botControlTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                        Algo Engine Execution
                      </Text>
                      <Text style={[styles.botControlSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                        Status: <Text style={{ fontFamily: 'Inter_700Bold', color: isBotRunning ? '#10b981' : '#ef4444' }}>{isBotRunning ? 'RUNNING (LIVE)' : 'STANDBY (PAUSED)'}</Text>
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => { hSuccess(); setIsBotRunning(!isBotRunning); }}
                      style={[styles.botSwitchBtn, { backgroundColor: isBotRunning ? '#ef4444' : '#10b981' }]}
                    >
                      {isBotRunning ? <Pause size={13} color="#ffffff" /> : <Play size={13} color="#ffffff" />}
                      <Text style={styles.botSwitchBtnText}>{isBotRunning ? 'Pause Engine' : 'Start Engine'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Daily Target Pills */}
                  <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 12 }]}>
                    DAILY PROFIT TARGET DISCIPLINE
                  </Text>
                  <View style={styles.targetRow}>
                    {[2, 3, 4, 5].map((pct) => (
                      <TouchableOpacity
                        key={pct}
                        activeOpacity={0.8}
                        onPress={() => { h(); setDailyTargetPct(pct); }}
                        style={[
                          styles.targetPill,
                          dailyTargetPct === pct && (isDark ? styles.targetPillActiveDark : styles.targetPillActiveLight),
                          { backgroundColor: dailyTargetPct === pct ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#1e293b' : '#ffffff'), borderColor: isDark ? '#334155' : '#cbd5e1' }
                        ]}
                      >
                        <Text style={[styles.targetPillText, dailyTargetPct === pct && (isDark ? styles.targetPillTextActiveDark : styles.targetPillTextActiveLight)]}>
                          {pct}.0%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Telemetry Projections */}
                  <View style={styles.telemetryRow}>
                    <View style={[styles.telemetryBox, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                      <Text style={styles.telemetryLabel}>EST. DAILY RETURN</Text>
                      <Text style={[styles.telemetryVal, { color: '#10b981' }]}>+₹{dailyProfitEst.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.telemetryBox, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                      <Text style={styles.telemetryLabel}>EST. MONTHLY (22D)</Text>
                      <Text style={[styles.telemetryVal, { color: '#0284c7' }]}>+₹{monthlyProfitEst.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>

                {/* Launch Live AutoTrade CTA */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    hSuccess();
                    Alert.alert(
                      'Algo Activated',
                      'FiAlgo V1 is active on your MT5 terminal. Redirecting to live trading dashboard.',
                      [{ text: 'Open Dashboard', onPress: () => router.push('/(tabs)' as any) }]
                    );
                  }}
                  style={[styles.launchButton, { marginTop: 18 }]}
                >
                  <Zap size={16} color="#ffffff" />
                  <Text style={styles.launchButtonText}>Launch Live AutoTrade Dashboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* ── PROFIT CALCULATOR MODAL IN WHITE MODE ── */}
      <Modal
        visible={showCalculator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalculator(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                  FiAlgo Profit Calculator
                </Text>
                <Text style={[styles.modalSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Projected algorithmic growth based on daily compound target.
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowCalculator(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
              >
                <X size={16} color={isDark ? '#ffffff' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            {/* Capital Presets */}
            <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 14 }]}>
              STARTING CAPITAL PRESETS
            </Text>
            <View style={styles.calcPresetsRow}>
              {[25000, 50000, 100000, 500000].map((cap) => (
                <TouchableOpacity
                  key={cap}
                  activeOpacity={0.8}
                  onPress={() => { h(); setCalcCapital(cap); }}
                  style={[
                    styles.calcPresetBtn,
                    calcCapital === cap && (isDark ? styles.calcPresetBtnActiveDark : styles.calcPresetBtnActiveLight),
                    { backgroundColor: calcCapital === cap ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#0f172a' : '#f8fafc') }
                  ]}
                >
                  <Text style={[styles.calcPresetBtnText, calcCapital === cap && (isDark ? styles.calcPresetBtnTextActiveDark : styles.calcPresetBtnTextActiveLight)]}>
                    ₹{(cap / 1000).toFixed(0)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Capital Input */}
            <Text style={[styles.inputLabel, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 12 }]}>
              OR ENTER EXACT CAPITAL (INR)
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#cbd5e1', color: isDark ? '#ffffff' : '#0f172a' }]}
              keyboardType="number-pad"
              value={String(calcCapital)}
              onChangeText={(txt) => setCalcCapital(Number(txt.replace(/\D/g, '')) || 0)}
            />

            {/* Calculated Strip */}
            <View style={[styles.calcResultsBox, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0', marginTop: 14 }]}>
              <View style={styles.calcResultItem}>
                <Text style={styles.calcResultLabel}>Daily Return ({dailyTargetPct}%)</Text>
                <Text style={[styles.calcResultVal, { color: '#10b981' }]}>₹{dailyProfitEst.toLocaleString()}</Text>
              </View>
              <View style={styles.calcResultItem}>
                <Text style={styles.calcResultLabel}>Monthly Return (22 Days)</Text>
                <Text style={[styles.calcResultVal, { color: '#0284c7' }]}>₹{monthlyProfitEst.toLocaleString()}</Text>
              </View>
              <View style={[styles.calcResultItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.calcResultLabel}>90-Day Compounded Projection</Text>
                <Text style={[styles.calcResultValBig, { color: '#7c3aed' }]}>₹{compound90Days.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowCalculator(false)}
              style={[styles.continueButton, { marginTop: 16 }]}
            >
              <Text style={styles.continueButtonText}>Apply & Close Calculator</Text>
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
    backgroundColor: '#000000',
  },
  headerContainer: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    paddingBottom: 44,
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 120,
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  calcButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  /* Backside white card */
  card: {
    flex: 1,
    marginTop: -34,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    lineHeight: 18,
  },
  /* Stepper */
  stepperContainer: {
    marginBottom: 16,
  },
  stepperMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepperMetaText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  stepperPercentText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#2563eb',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  milestoneGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  milestoneTab: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  milestoneTabText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  /* Step Panels */
  stepContent: {
    marginBottom: 16,
  },
  panelCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  panelDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 17,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  verifiedBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  pendingBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#b45309',
  },
  versionBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  versionBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#0284c7',
  },
  /* Segmented control */
  segmentedWrap: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
  },
  segmentBtnActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentBtnActiveDark: {
    backgroundColor: '#1e293b',
  },
  segmentBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  segmentBtnTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  recommendedBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  recommendedBadgeText: {
    fontSize: 8.5,
    fontFamily: 'Inter_700Bold',
    color: '#0284c7',
  },
  /* Broker scroll */
  inputLabel: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  brokerScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  brokerPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brokerPillText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  brokerMiniTag: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brokerMiniTagText: {
    fontSize: 8.5,
    fontFamily: 'Inter_700Bold',
  },
  /* Instruction Step Box */
  instructionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  instructionStepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionStepNumGray: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  instructionStepNumText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  instructionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  instructionDesc: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
    marginBottom: 10,
  },
  instructionActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryPillBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryPillBtnText: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  secondaryPillBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryPillBtnText: {
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
  },
  /* Requirements box */
  requirementBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  requirementTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  requirementSub: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  minBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  minBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#b45309',
  },
  /* Submission Box */
  submissionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  checkboxLabel: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    lineHeight: 16,
  },
  proofUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  proofUploadText: {
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  /* Support Box */
  supportBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  supportTitle: {
    fontSize: 12.5,
    fontFamily: 'Inter_700Bold',
  },
  priorityBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#0284c7',
  },
  supportSub: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    marginBottom: 8,
  },
  supportBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  supportBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  supportBtnFull: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  supportBtnText: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
  },
  /* Stepper Bottom Actions */
  continueButton: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  continueButtonText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  backNavBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backNavBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  forwardNavBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  forwardNavBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  /* STEP 2 SPECS */
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  specTile: {
    width: (SCREEN_WIDTH - 72) / 2,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  specTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  specTileLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  specTileValue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  specTileSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginTop: 2,
  },
  safetyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 12.5,
    fontFamily: 'Inter_700Bold',
  },
  guardActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  guardActiveBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  quantRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  quantBox: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quantLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  quantVal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
  },
  downloadSection: {
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  fileCodeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  fileSizeText: {
    fontSize: 10.5,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  downloadBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  downloadSubBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadSubBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  downloadMainBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadMainBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  webrequestBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginTop: 6,
  },
  webrequestTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  realtimeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  realtimeBadgeText: {
    fontSize: 8.5,
    fontFamily: 'Inter_700Bold',
    color: '#1d4ed8',
  },
  webrequestDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
    marginBottom: 8,
  },
  urlCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    paddingLeft: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  urlText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#0284c7',
    flex: 1,
    marginRight: 6,
  },
  urlCopyBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urlCopyBtnText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  /* STEP 3 TIERS */
  tierGrid: {
    gap: 10,
    marginTop: 4,
  },
  tierCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
  },
  tierCardActivePurple: {
    borderColor: '#7c3aed',
  },
  tierCardActiveBlue: {
    borderColor: '#0284c7',
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tierBadgePurple: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgePurpleText: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: '#7c3aed',
  },
  tierBadgeBlue: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeBlueText: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: '#0284c7',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActivePurple: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  radioCircleActiveBlue: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  tierTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  tierSub: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  tierPriceStrip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  tierPriceLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
  },
  tierPriceVal: {
    fontSize: 17,
    fontFamily: 'Inter_800ExtraBold',
  },
  paymentDetailsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  qrTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  qrSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    marginBottom: 10,
  },
  upiIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  upiIdLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
  },
  upiIdVal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
  },
  copyPillBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyPillBtnText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  paymentSummaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#64748b',
  },
  summaryAmount: {
    fontSize: 18,
    fontFamily: 'Inter_800ExtraBold',
  },
  bankDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  bankLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  bankValue: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
  },
  bankValueMono: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
  },
  /* STEP 4 ACTIVATE */
  licenseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  licenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  licenseCardTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  accountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  accountPillText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
  },
  lifetimeActiveText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#10b981',
  },
  keyDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  licenseKeyText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    flex: 1,
    marginRight: 8,
  },
  copyKeyBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyKeyBtnText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  boundBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  boundBoxText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    flex: 1,
    lineHeight: 15,
  },
  botControlCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  botControlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botControlTitle: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  botControlSub: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  botSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  botSwitchBtnText: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  targetPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetPillActiveLight: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  targetPillActiveDark: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  targetPillText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  targetPillTextActiveLight: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
  },
  targetPillTextActiveDark: {
    color: '#0f172a',
    fontFamily: 'Inter_700Bold',
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  telemetryBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  telemetryLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
  },
  telemetryVal: {
    fontSize: 15,
    fontFamily: 'Inter_800ExtraBold',
    marginTop: 2,
  },
  launchButton: {
    backgroundColor: '#0284c7',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  launchButtonText: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  /* Calculator Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  modalSub: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  calcPresetBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcPresetBtnActiveLight: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  calcPresetBtnActiveDark: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  calcPresetBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  calcPresetBtnTextActiveLight: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
  },
  calcPresetBtnTextActiveDark: {
    color: '#0f172a',
    fontFamily: 'Inter_700Bold',
  },
  calcResultsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  calcResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  calcResultLabel: {
    fontSize: 11.5,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  calcResultVal: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
  },
  calcResultValBig: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
  },
});
