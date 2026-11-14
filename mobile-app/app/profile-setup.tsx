import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  Sun,
  TrendingUp,
  Zap,
  Shield,
  Cpu,
  Coins,
  Globe,
  BarChart2,
  Layers,
  Sparkles,
  Target,
  Smile,
  Activity,
  Flame,
} from 'lucide-react-native';
import { supabase } from './utils/supabase';
import { useStore } from './store';
import { AuthService } from './services/auth.service';

const { width, height } = Dimensions.get('window');

type StepKey = 'NAME' | 'HANDLE' | 'STYLE' | 'MARKET' | 'EDGE' | 'HERE_TO' | 'READY';

const STEPS: StepKey[] = ['NAME', 'HANDLE', 'STYLE', 'MARKET', 'EDGE', 'HERE_TO', 'READY'];

const TRADING_STYLES = [
  { label: 'Day trading', desc: 'In & out within the day', icon: Sun },
  { label: 'Swing trading', desc: 'Multi-day momentum', icon: TrendingUp },
  { label: 'Scalping', desc: 'Seconds to minutes moves', icon: Zap },
  { label: 'Position trading', desc: 'Macro multi-week trends', icon: Shield },
  { label: 'Algo trading', desc: 'Automated quantitative systems', icon: Cpu },
];

const MARKETS = [
  { label: 'Forex', desc: 'EURUSD, GBPUSD, USDJPY', icon: Coins },
  { label: 'Crypto', desc: 'BTC, ETH, Altcoins', icon: Zap },
  { label: 'Indices', desc: 'US30, NAS100, SPX, Nifty', icon: BarChart2 },
  { label: 'Commodities', desc: 'Gold (XAUUSD), Silver, Oil', icon: Flame },
  { label: 'Stocks', desc: 'Equities & Shares', icon: TrendingUp },
];

const EDGES = [
  { label: 'Price Action & SMC', icon: Target },
  { label: 'Technical Indicators', icon: Activity },
  { label: 'Risk Management', icon: Shield },
  { label: 'Market Psychology', icon: Sparkles },
  { label: 'Automated Algorithms', icon: Cpu },
  { label: 'Order Flow & Volume', icon: Layers },
];

const HERE_TO_OPTIONS = [
  { label: 'Automated Algo Trading', icon: Cpu },
  { label: 'AI Trading Coach', icon: Sparkles },
  { label: 'Risk Protection & Discipline', icon: Shield },
  { label: 'Trade Journal & Analytics', icon: BarChart2 },
  { label: 'Community & Mentorship', icon: Globe },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Form states
  const [name, setName] = useState(currentUser?.display_name || currentUser?.first_name || '');
  const [handle, setHandle] = useState('');
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  const [style, setStyle] = useState('Day trading');
  const [market, setMarket] = useState('Forex');
  const [selectedEdges, setSelectedEdges] = useState<string[]>(['Risk Management']);
  const [selectedHereTo, setSelectedHereTo] = useState<string[]>(['Automated Algo Trading']);
  const [saving, setSaving] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStep = STEPS[currentStepIndex];

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
  };

  // Prepopulate handle from name or email
  useEffect(() => {
    if (!handle) {
      const base = name || currentUser?.email?.split('@')[0] || '';
      const clean = base.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15);
      if (clean.length >= 3) {
        setHandle(clean);
        checkHandle(clean);
      }
    }
  }, [name, currentUser]);

  const checkHandle = async (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!clean) {
      setHandleAvailable(null);
      setHandleError(null);
      return;
    }
    if (clean.length < 3) {
      setHandleAvailable(false);
      setHandleError('Must be at least 3 characters');
      return;
    }

    setIsCheckingHandle(true);
    setHandleError(null);

    try {
      const taken = await AuthService.checkUsernameExists(clean, currentUser?.id);
      setIsCheckingHandle(false);
      if (taken) {
        setHandleAvailable(false);
        setHandleError('This handle is already taken');
      } else {
        setHandleAvailable(true);
        setHandleError(null);
      }
    } catch (e: any) {
      setIsCheckingHandle(false);
      setHandleAvailable(true); // Don't block user on network error
    }
  };

  const handleHandleChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHandle(clean);
    setHandleAvailable(null);
    setHandleError(null);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      checkHandle(clean);
    }, 400);
  };

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    triggerHaptic();
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((x) => x !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleNext = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleBack = () => {
    triggerHaptic();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinalSave = async () => {
    if (saving) return;
    setSaving(true);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const targetUserId = currentUser?.id || session?.user?.id;
      if (!targetUserId) throw new Error('No active user session');

      const finalUsername = handle || `trader_${targetUserId.slice(0, 6)}`;
      const finalName = name.trim() || currentUser?.first_name || 'Trader';
      const combinedStyle = Array.from(new Set([style, ...selectedEdges])).join(', ');

      // 1. Update Supabase profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: finalName,
          display_name: finalName,
          username: finalUsername,
          trading_style: style,
          preferred_market: market,
          has_chosen_username: true,
        })
        .eq('id', targetUserId);

      if (profileError) {
        console.warn('[ProfileSetup] Profile update note:', profileError.message);
      }

      // 2. Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: finalName,
          display_name: finalName,
          username: finalUsername,
          trading_style: style,
          preferred_market: market,
          has_chosen_username: true,
          onboarding_completed: true,
        },
      }).catch(() => {});

      // 3. Sync store
      await useStore.getState().init();

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('[ProfileSetup Error]:', err);
      // Even if update failed, let user into the app
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 'NAME':
        return name.trim().length >= 2;
      case 'HANDLE':
        return handle.length >= 3 && handleAvailable !== false;
      case 'STYLE':
        return !!style;
      case 'MARKET':
        return !!market;
      case 'EDGE':
        return selectedEdges.length > 0;
      case 'HERE_TO':
        return selectedHereTo.length > 0;
      case 'READY':
        return true;
      default:
        return true;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" translucent />
      
      {/* ── TOP NAV BAR ── */}
      <SafeAreaView style={styles.safeTop}>
        <View style={styles.navBar}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}

          {/* Logo center */}
          <View style={styles.logoCenter}>
            <Image
              source={require('../assets/images/Logo_only.png')}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Image
              source={require('../assets/images/dark-mode-logo.png')}
              style={{ width: 110, height: 24, marginLeft: 4 }}
              resizeMode="contain"
            />
          </View>

          {/* Skip link */}
          <TouchableOpacity onPress={handleFinalSave} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Step indicator bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }]} />
        </View>
      </SafeAreaView>

      {/* ── MAIN CONTENT ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── STEP 1: NAME ── */}
        {currentStep === 'NAME' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCategory}>STEP 1 OF 6 • IDENTITY</Text>
            <Text style={styles.stepTitle}>What should we call you?</Text>
            <Text style={styles.stepSubtitle}>
              Your display name across the TradiFive ecosystem — journal, AI coach, community, and leaderboards.
            </Text>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInputLarge}
                placeholder="Your full name"
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {/* ── STEP 2: HANDLE ── */}
        {currentStep === 'HANDLE' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCategory}>STEP 2 OF 6 • USERNAME</Text>
            <Text style={styles.stepTitle}>Claim your handle.</Text>
            <Text style={styles.stepSubtitle}>
              This will be your unique trader identity across TradiFive.
            </Text>

            <View style={[styles.inputCard, styles.handleInputRow]}>
              <Text style={styles.atSymbol}>@</Text>
              <TextInput
                style={styles.textInputHandle}
                placeholder="yourhandle"
                placeholderTextColor="#475569"
                value={handle}
                onChangeText={handleHandleChange}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isCheckingHandle && <ActivityIndicator size="small" color="#3b82f6" />}
              {!isCheckingHandle && handleAvailable === true && (
                <View style={styles.verifiedBadge}>
                  <Check size={14} color="#10b981" strokeWidth={3} />
                </View>
              )}
              {!isCheckingHandle && handleAvailable === false && (
                <View style={styles.errorBadge}>
                  <X size={14} color="#ef4444" strokeWidth={3} />
                </View>
              )}
            </View>

            <View style={{ minHeight: 24, marginTop: 8 }}>
              {handleAvailable === true && (
                <Text style={styles.handleSuccessText}>@{handle} is available!</Text>
              )}
              {handleError && (
                <Text style={styles.handleErrorText}>{handleError}</Text>
              )}
            </View>
          </View>
        )}

        {/* ── STEP 3: STYLE ── */}
        {currentStep === 'STYLE' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCategory}>STEP 3 OF 6 • METHODOLOGY</Text>
            <Text style={styles.stepTitle}>How do you trade?</Text>
            <Text style={styles.stepSubtitle}>
              Select your primary trading methodology so we can tailor your algorithms and metrics.
            </Text>

            <View style={styles.optionsList}>
              {TRADING_STYLES.map((item) => {
                const Icon = item.icon;
                const isSelected = style === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      triggerHaptic();
                      setStyle(item.label);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.optionIconBox, isSelected && styles.optionIconBoxSelected]}>
                      <Icon size={20} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                        {item.label}
                      </Text>
                      <Text style={styles.optionDesc}>{item.desc}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 4: MARKET ── */}
        {currentStep === 'MARKET' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCategory}>STEP 4 OF 6 • ASSET CLASS</Text>
            <Text style={styles.stepTitle}>What do you trade?</Text>
            <Text style={styles.stepSubtitle}>
              Select the primary financial asset class you specialize in.
            </Text>

            <View style={styles.optionsList}>
              {MARKETS.map((item) => {
                const Icon = item.icon;
                const isSelected = market === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      triggerHaptic();
                      setMarket(item.label);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.optionIconBox, isSelected && styles.optionIconBoxSelected]}>
                      <Icon size={20} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                        {item.label}
                      </Text>
                      <Text style={styles.optionDesc}>{item.desc}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 5: EDGE ── */}
        {currentStep === 'EDGE' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCategory}>STEP 5 OF 6 • YOUR EDGE</Text>
            <Text style={styles.stepTitle}>What powers your edge?</Text>
            <Text style={styles.stepSubtitle}>
              Select all strengths that define your trading strategy (choose multiple).
            </Text>

            <View style={styles.multiGrid}>
              {EDGES.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedEdges.includes(item.label);
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.multiPill, isSelected && styles.multiPillSelected]}
                    onPress={() => toggleItem(item.label, selectedEdges, setSelectedEdges)}
                    activeOpacity={0.8}
                  >
                    <Icon size={16} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                    <Text style={[styles.multiPillText, isSelected && styles.multiPillTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && <Check size={14} color="#3b82f6" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 6: HERE TO ── */}
        {currentStep === 'HERE_TO' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCategory}>STEP 6 OF 6 • OBJECTIVES</Text>
            <Text style={styles.stepTitle}>What brings you to TradiFive?</Text>
            <Text style={styles.stepSubtitle}>
              Choose what features you want us to set up first on your dashboard.
            </Text>

            <View style={styles.optionsList}>
              {HERE_TO_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedHereTo.includes(item.label);
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => toggleItem(item.label, selectedHereTo, setSelectedHereTo)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.optionIconBox, isSelected && styles.optionIconBoxSelected]}>
                      <Icon size={20} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                        {item.label}
                      </Text>
                    </View>
                    <View style={[styles.checkboxSquare, isSelected && styles.checkboxSquareSelected]}>
                      {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── STEP 7: READY / ALL SET ── */}
        {currentStep === 'READY' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepCategory}>COMPLETED • PASSPORT READY</Text>
            <Text style={styles.stepTitle}>You're all set!</Text>
            <Text style={styles.stepSubtitle}>
              Here is your official TradiFive Trading Passport. Welcome to the elite community.
            </Text>

            {/* Trading Passport Card */}
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.passportCard}
            >
              <View style={styles.passportHeader}>
                <View style={styles.passportAvatarCircle}>
                  <Text style={styles.passportAvatarText}>
                    {(name || 'T').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.passportName}>{name || 'Trader'}</Text>
                  <Text style={styles.passportHandle}>@{handle || 'trader'}</Text>
                </View>
                <View style={styles.passportVerifiedBadge}>
                  <CheckCircle2 size={16} color="#38bdf8" />
                  <Text style={styles.passportVerifiedText}>VERIFIED</Text>
                </View>
              </View>

              <View style={styles.passportDivider} />

              <View style={styles.passportTagsRow}>
                <View style={styles.passportTag}>
                  <Text style={styles.passportTagLabel}>STYLE</Text>
                  <Text style={styles.passportTagVal}>{style}</Text>
                </View>
                <View style={styles.passportTag}>
                  <Text style={styles.passportTagLabel}>MARKET</Text>
                  <Text style={styles.passportTagVal}>{market}</Text>
                </View>
              </View>

              {selectedEdges.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.passportTagLabel}>EDGES</Text>
                  <Text style={[styles.passportTagVal, { fontSize: 12, marginTop: 2 }]} numberOfLines={1}>
                    {selectedEdges.join(' • ')}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* ── BOTTOM ACTION BAR ── */}
      <SafeAreaView style={styles.safeBottom}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.continueBtn, !canContinue() && styles.continueBtnDisabled]}
            disabled={!canContinue() || saving}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.continueBtnText}>
                  {currentStep === 'READY' ? 'Enter TradiFive' : 'Continue'}
                </Text>
                <ArrowRight size={18} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeTop: {
    backgroundColor: '#000000',
  },
  navBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  stepContainer: {
    width: '100%',
  },
  stepCategory: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 8,
  },
  stepSubtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  inputCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  textInputLarge: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  handleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    color: '#3b82f6',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 6,
  },
  textInputHandle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleSuccessText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
  },
  handleErrorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  optionCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconBoxSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  optionTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#ffffff',
  },
  optionDesc: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#3b82f6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  multiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  multiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiPillSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  multiPillText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  multiPillTextSelected: {
    color: '#ffffff',
  },
  passportCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passportAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportAvatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  passportName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  passportHandle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  passportVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  passportVerifiedText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passportDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 18,
  },
  passportTagsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  passportTag: {
    flex: 1,
  },
  passportTagLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  passportTagVal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  safeBottom: {
    backgroundColor: '#000000',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  continueBtn: {
    height: 54,
    backgroundColor: '#ff4d4d',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  continueBtnDisabled: {
    opacity: 0.45,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
