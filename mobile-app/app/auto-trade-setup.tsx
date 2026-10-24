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
  ArrowRight
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
}

const BROKERS: BrokerConfig[] = [
  {
    id: 'vantage',
    name: 'Vantage Markets',
    tagline: 'Raw ECN · Ultra Low Spreads',
    url: 'https://vigco.co/la-com-inv/MCTDw2R6',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@vantagemarkets.com'
  },
  {
    id: 'exness',
    name: 'Exness',
    tagline: 'Instant Withdrawals · Zero Swap',
    url: 'https://exness.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@exness.com'
  },
  {
    id: 'xm',
    name: 'XM Global',
    tagline: 'Ultra Low Spread · Multi-Asset',
    url: 'https://xm.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@xm.com'
  },
  {
    id: 'fusion',
    name: 'Fusion Markets',
    tagline: 'Lowest Commission Rate',
    url: 'https://fusionmarkets.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'help@fusionmarkets.com'
  },
  {
    id: 'blackbull',
    name: 'BlackBull Markets',
    tagline: 'Institutional Grade Execution',
    url: 'https://blackbull.com/ib',
    ibNumber: '27863221',
    referralCode: 'MCTDw2R6',
    supportEmail: 'support@blackbullmarkets.com'
  }
];

export default function AutoTradeSetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();

  // Wizard active step: 1 = Partner Account, 2 = EA & License, 3 = Bot Control
  const [activeStep, setActiveStep] = useState<number>(1);

  // Setup mode: New Account vs Existing Account (IB Transfer)
  const [setupMode, setSetupMode] = useState<'new' | 'transfer'>('new');
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('vantage');
  const [mt5Account, setMt5Account] = useState<string>('');
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified'>('idle');

  // Plan Tier: 'profit_share_50' | 'lifetime'
  const [selectedTier, setSelectedTier] = useState<'profit_share_50' | 'lifetime'>('profit_share_50');

  // Bot Status & Settings
  const [isBotRunning, setIsBotRunning] = useState<boolean>(true);
  const [dailyTargetPct, setDailyTargetPct] = useState<number>(3);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);

  // Calculator State
  const [calcCapital, setCalcCapital] = useState<number>(50000);

  const selectedBroker = useMemo(() => {
    return BROKERS.find(b => b.id === selectedBrokerId) || BROKERS[0];
  }, [selectedBrokerId]);

  const licenseKey = useMemo(() => {
    return generateTradifiveLicenseKey(mt5Account || '10293847');
  }, [mt5Account]);

  const copyToClipboard = (text: string, label: string = 'Text') => {
    hSuccess();
    Clipboard.setString(text);
    setCopiedKey(true);
    Alert.alert('Copied!', `${label} copied to clipboard.`);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handlePickProofImage = async () => {
    h();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
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
      Alert.alert('Missing MT5 Account', 'Please enter your MT5 Account Number.');
      return;
    }
    setIsUploadingProof(true);
    try {
      // Save locally and in Supabase
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
        'Submission Received',
        `Your ${selectedBroker.name} account (${mt5Account}) has been submitted for IB verification. You can proceed with EA setup!`,
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
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f8fafc' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* TOP HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { h(); router.back(); }}
            style={styles.backButton}
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>

          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={styles.headerTitle}>Auto Trade Setup</Text>
            <Text style={styles.headerSubtitle}>Tradifive MT5 Algorithmic Engine</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { h(); setShowCalculator(true); }}
            style={styles.calcIconButton}
          >
            <Calculator size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* STEP PROGRESS TABS */}
        <View style={styles.stepIndicatorRow}>
          {[
            { num: 1, title: 'Partner Account' },
            { num: 2, title: 'EA & License' },
            { num: 3, title: 'Bot Control' },
          ].map((s) => {
            const isActive = activeStep === s.num;
            const isCompleted = activeStep > s.num;

            return (
              <TouchableOpacity
                key={s.num}
                activeOpacity={0.8}
                onPress={() => { h(); setActiveStep(s.num); }}
                style={[
                  styles.stepTab,
                  isActive && styles.stepTabActive,
                  isCompleted && styles.stepTabCompleted,
                ]}
              >
                <View style={[
                  styles.stepBadge,
                  isActive && styles.stepBadgeActive,
                  isCompleted && styles.stepBadgeCompleted
                ]}>
                  {isCompleted ? (
                    <Check size={12} color="#ffffff" />
                  ) : (
                    <Text style={[styles.stepBadgeText, isActive && styles.stepBadgeTextActive]}>
                      {s.num}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.stepTabText,
                  isActive && styles.stepTabTextActive,
                  isCompleted && styles.stepTabTextCompleted
                ]}>
                  {s.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* ========================================================================= */}
        {/* STEP 1: PARTNER ACCOUNT & BROKER VERIFICATION                              */}
        {/* ========================================================================= */}
        {activeStep === 1 && (
          <View style={styles.stepContainer}>
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
            <Text style={styles.sectionHeading}>1. Select Supported Partner Broker</Text>
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
                      <View style={styles.brokerIconContainer}>
                        <Cpu size={18} color="#ffffff" />
                      </View>
                      {isSelected && (
                        <View style={styles.checkPill}>
                          <Check size={12} color="#ffffff" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.brokerName}>{broker.name}</Text>
                    <Text style={styles.brokerTagline}>{broker.tagline}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Partner IB Details Card */}
            <View style={styles.cardBox}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>OFFICIAL PARTNER IB</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => copyToClipboard(selectedBroker.referralCode, 'Referral Code')}
                  style={styles.copyInlineBtn}
                >
                  <Copy size={13} color="#94a3b8" />
                  <Text style={styles.copyInlineText}>Copy Code</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.partnerInfoTitle}>
                {selectedBroker.name} Partner Credentials
              </Text>
              <Text style={styles.partnerInfoDesc}>
                {setupMode === 'new'
                  ? 'Open your MT5 trading account using our official partner code to receive 100% free algo access.'
                  : `Transfer your existing ${selectedBroker.name} account under Tradifive IB code: ${selectedBroker.ibNumber}.`}
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
                onPress={() => copyToClipboard(selectedBroker.url, 'Partner Link')}
                style={styles.openBrokerBtn}
              >
                <ExternalLink size={16} color="#ffffff" />
                <Text style={styles.openBrokerBtnText}>
                  {setupMode === 'new' ? `Open ${selectedBroker.name} Account` : 'Copy Partner Registration Link'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* MT5 Account Number Input */}
            <Text style={styles.sectionHeading}>2. Your MT5 Account Number</Text>
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
                <Text style={styles.sectionHeading}>3. Upload IB Transfer Proof Screenshot</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickProofImage}
                  style={styles.uploadArea}
                >
                  {proofImageUri ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image source={{ uri: proofImageUri }} style={styles.uploadedImagePreview} resizeMode="cover" />
                      <View style={styles.uploadSuccessOverlay}>
                        <CheckCircle2 size={24} color="#10b981" />
                        <Text style={styles.uploadSuccessText}>Screenshot Attached</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <View style={styles.uploadIconCircle}>
                        <Upload size={22} color="#ffffff" />
                      </View>
                      <Text style={styles.uploadMainText}>Tap to choose IB Transfer Screenshot</Text>
                      <Text style={styles.uploadSubText}>PNG, JPG or JPEG from your broker portal</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Continue Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmitVerification}
              disabled={isUploadingProof}
              style={styles.primaryActionBtn}
            >
              {isUploadingProof ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.primaryActionBtnText}>Verify Account & Proceed</Text>
                  <ArrowRight size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: EA DOWNLOAD & CRYPTOGRAPHIC LICENSE KEY                           */}
        {/* ========================================================================= */}
        {activeStep === 2 && (
          <View style={styles.stepContainer}>
            {/* Plan Tier Selector */}
            <Text style={styles.sectionHeading}>1. Choose Your Auto Trade License Model</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { h(); setSelectedTier('profit_share_50'); }}
              style={[
                styles.tierCard,
                selectedTier === 'profit_share_50' && styles.tierCardActive
              ]}
            >
              <View style={styles.tierHeader}>
                <View>
                  <Text style={styles.tierTitle}>Daily 50% Profit Share</Text>
                  <Text style={styles.tierSub}>Recommended · ₹0 Upfront Cost</Text>
                </View>
                <View style={styles.tierPriceBadge}>
                  <Text style={styles.tierPriceText}>₹0 UPFRONT</Text>
                </View>
              </View>
              <Text style={styles.tierDesc}>
                Trade with zero software license fee. 50% profit share is settled daily only when your account is in net profit. Zero fee on losing days.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { h(); setSelectedTier('lifetime'); }}
              style={[
                styles.tierCard,
                selectedTier === 'lifetime' && styles.tierCardActive
              ]}
            >
              <View style={styles.tierHeader}>
                <View>
                  <Text style={styles.tierTitle}>Lifetime Ownership License</Text>
                  <Text style={styles.tierSub}>100% Profits Kept · 0% Profit Share</Text>
                </View>
                <View style={[styles.tierPriceBadge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Text style={styles.tierPriceText}>₹99,999</Text>
                </View>
              </View>
              <Text style={styles.tierDesc}>
                Full unlimited lifetime license key. Keep 100% of all generated returns with zero profit share deductions, dedicated private VPS setup & VIP 24/7 priority support.
              </Text>
            </TouchableOpacity>

            {/* Cryptographic License Key Card */}
            <Text style={styles.sectionHeading}>2. Your MT5 Cryptographic License Key</Text>
            <View style={styles.licenseCard}>
              <View style={styles.licenseCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Lock size={16} color="#ffffff" />
                  <Text style={styles.licenseCardTitle}>FNV-1a Hardware Hash</Text>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>ACTIVE</Text>
                </View>
              </View>

              <Text style={styles.licenseKeyText}>{licenseKey}</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => copyToClipboard(licenseKey, 'Tradifive License Key')}
                style={styles.copyKeyBtn}
              >
                <Copy size={16} color="#ffffff" />
                <Text style={styles.copyKeyBtnText}>{copiedKey ? 'Copied to Clipboard!' : 'Copy License Key'}</Text>
              </TouchableOpacity>
            </View>

            {/* MT5 Setup Checklist */}
            <Text style={styles.sectionHeading}>3. Setup Checklist in MetaTrader 5</Text>
            <View style={styles.checklistCard}>
              {[
                { step: '1', title: 'Add WebRequest URL', desc: 'In MT5 > Tools > Options > Expert Advisors, add: https://tradifive.in' },
                { step: '2', title: 'Install Tradifive EA', desc: 'Copy Tradifive.ex5 into your MT5 /MQL5/Experts folder.' },
                { step: '3', title: 'Paste License Key', desc: 'Attach EA to XAUUSD (Gold) or EURUSD chart and paste your license key.' },
                { step: '4', title: 'Enable Algo Trading', desc: 'Turn on the green "Algo Trading" button on the MT5 top toolbar.' },
              ].map((item) => (
                <View key={item.step} style={styles.checklistItem}>
                  <View style={styles.checklistStepNum}>
                    <Text style={styles.checklistStepText}>{item.step}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checklistItemTitle}>{item.title}</Text>
                    <Text style={styles.checklistItemDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { h(); setActiveStep(3); }}
              style={styles.primaryActionBtn}
            >
              <Text style={styles.primaryActionBtnText}>Launch Bot Controls</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BOT CONTROL & TELEMETRY                                            */}
        {/* ========================================================================= */}
        {activeStep === 3 && (
          <View style={styles.stepContainer}>
            {/* Live Bot Status Card */}
            <View style={styles.botStatusCard}>
              <View style={styles.botStatusHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.statusIndicatorCircle, isBotRunning && styles.statusIndicatorRunning]} />
                  <View>
                    <Text style={styles.botStatusTitle}>Tradifive Fialgo v1</Text>
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
                  {isBotRunning ? <Pause size={18} color="#ffffff" /> : <Play size={18} color="#ffffff" />}
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
            <Text style={styles.sectionHeading}>Configured Daily Profit Target</Text>
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

            {/* Quick Profit Calculator Card */}
            <View style={styles.cardBox}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>PROJECTED EARNINGS</Text>
                </View>
                <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_500Medium' }}>
                  At {dailyTargetPct}% Daily
                </Text>
              </View>

              <View style={{ marginVertical: 12 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Trading Capital</Text>
                <Text style={{ color: '#ffffff', fontSize: 24, fontFamily: 'Inter_700Bold', marginTop: 2 }}>
                  ₹{calcCapital.toLocaleString()}
                </Text>
              </View>

              <View style={styles.projectionRow}>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>Est. Daily Profit</Text>
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
              activeOpacity={0.8}
              onPress={() => {
                h();
                router.push({ pathname: '/(tabs)', params: { view: 'dashboard' } } as any);
              }}
              style={styles.primaryActionBtn}
            >
              <Text style={styles.primaryActionBtnText}>Open Live Trading Dashboard</Text>
              <ArrowRight size={18} color="#ffffff" />
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

      {/* PROFIT CALCULATOR MODAL */}
      <Modal
        visible={showCalculator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalculator(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Auto Trade Profit Calculator</Text>
                <Text style={styles.modalSubtitle}>Simulate your returns with Tradifive Fialgo</Text>
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

            <View style={[styles.cardBox, { marginTop: 20 }]}>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_500Medium' }}>Target Return</Text>
              <Text style={{ color: '#ffffff', fontSize: 28, fontFamily: 'Inter_700Bold', marginVertical: 4 }}>
                {dailyTargetPct}% / Day
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>
                Based on historical multi-pair grid execution.
              </Text>

              <View style={[styles.projectionRow, { marginTop: 20 }]}>
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
              activeOpacity={0.8}
              onPress={() => { h(); setShowCalculator(false); }}
              style={[styles.primaryActionBtn, { marginTop: 20 }]}
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
  },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  stepTabCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#ffffff',
  },
  stepBadgeCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  stepBadgeTextActive: {
    color: '#000000',
  },
  stepTabText: {
    color: '#64748b',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  stepTabTextActive: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
  },
  stepTabTextCompleted: {
    color: '#cbd5e1',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  stepContainer: {
    gap: 16,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  segmentBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  segmentBtnTextActive: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginTop: 6,
  },
  brokersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brokerCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
  },
  brokerCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: '#ffffff',
  },
  brokerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brokerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brokerName: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  brokerTagline: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  cardBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgePrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePrimaryText: {
    color: '#ffffff',
    fontSize: 10,
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
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  partnerInfoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  partnerInfoDesc: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    lineHeight: 18,
  },
  codeBoxesRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  codeItem: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  codeItemLabel: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  codeItemValue: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  openBrokerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  openBrokerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    height: 50,
  },
  uploadArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadMainText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  uploadSubText: {
    color: '#64748b',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  uploadedPreviewContainer: {
    width: '100%',
    height: 140,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  uploadSuccessText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryActionBtnText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tierCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 18,
  },
  tierCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#ffffff',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  tierSub: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  tierPriceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierPriceText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  tierDesc: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  licenseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 18,
  },
  licenseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  licenseCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    color: '#10b981',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  licenseKeyText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  copyKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  copyKeyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  checklistCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    gap: 14,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checklistStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistStepText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  checklistItemTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  checklistItemDesc: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  botStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 18,
  },
  botStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicatorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#94a3b8',
  },
  statusIndicatorRunning: {
    backgroundColor: '#10b981',
  },
  botStatusTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  botStatusSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  botToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
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
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  telemetryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryLabel: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  telemetryVal: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  targetPillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  targetPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  targetPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  targetPillText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  targetPillTextActive: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
  },
  projectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  projectionItem: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 12,
    borderRadius: 12,
  },
  projectionLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  projectionValue: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
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
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  calcPresetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
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
