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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
  BarChart2,
  Layers,
  Sparkles,
  Target,
  Activity,
  Flame,
  Globe,
} from 'lucide-react-native';
import { supabase } from './utils/supabase';
import { useStore } from './store';
import { AuthService } from './services/auth.service';

const { width } = Dimensions.get('window');

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Inter_400Regular';
const fontBold = Platform.OS === 'ios' ? 'System' : 'Inter_700Bold';
const fontSemi = Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold';
const fontMed = Platform.OS === 'ios' ? 'System' : 'Inter_500Medium';

type StepKey = 'NAME' | 'HANDLE' | 'STYLE' | 'MARKET' | 'EDGE' | 'HERE_TO' | 'READY';

const STEPS: StepKey[] = ['NAME', 'HANDLE', 'STYLE', 'MARKET', 'EDGE', 'HERE_TO', 'READY'];

const TRADING_STYLES = [
  { label: 'Day trading', desc: 'In & out within the session', icon: Sun },
  { label: 'Swing trading', desc: 'Multi-day momentum trends', icon: TrendingUp },
  { label: 'Scalping', desc: 'Fast seconds to minutes moves', icon: Zap },
  { label: 'Position trading', desc: 'Macro multi-week swing moves', icon: Shield },
  { label: 'Algo trading', desc: 'Automated quantitative systems', icon: Cpu },
];

const MARKETS = [
  { label: 'Forex', desc: 'EURUSD, GBPUSD, USDJPY', icon: Coins },
  { label: 'Crypto', desc: 'BTC, ETH, Major Altcoins', icon: Zap },
  { label: 'Indices', desc: 'US30, NAS100, SPX, Nifty', icon: BarChart2 },
  { label: 'Commodities', desc: 'Gold (XAUUSD), Silver, Crude Oil', icon: Flame },
  { label: 'Stocks', desc: 'Global & Domestic Equities', icon: TrendingUp },
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

      {/* ── TOP DARK HEADER ── */}
      <SafeAreaView style={styles.safeTop}>
        <View style={styles.navBar}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconBtn} activeOpacity={0.7}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 38 }} />
          )}

          {/* Logo center */}
          <View style={styles.logoCenter}>
            <Image
              source={require('../assets/images/Logo_only.png')}
              style={styles.logoSymbol}
              resizeMode="contain"
            />
            <Image
              source={require('../assets/images/dark-mode-logo.png')}
              style={styles.logoText}
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
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
      </SafeAreaView>

      {/* ── WHITE BOTTOM SHEET (CLEAN WHITE MODE) ── */}
      <View style={styles.whiteSheet}>
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

              <View
                style={[
                  styles.inputCard,
                  focusedField === 'name' && styles.inputCardFocused,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Your full name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => {
                    setFocusedField('name');
                    triggerHaptic();
                  }}
                  onBlur={() => setFocusedField(null)}
                  autoFocus
                  autoCapitalize="words"
                />
              </View>
              <Text style={styles.inputHelper}>
                You can change this anytime from your profile settings.
              </Text>
            </View>
          )}

          {/* ── STEP 2: HANDLE ── */}
          {currentStep === 'HANDLE' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepCategory}>STEP 2 OF 6 • USERNAME</Text>
              <Text style={styles.stepTitle}>Claim your handle</Text>
              <Text style={styles.stepSubtitle}>
                This will be your unique trader identity across the TradiFive ecosystem.
              </Text>

              <View
                style={[
                  styles.inputCard,
                  styles.handleInputRow,
                  focusedField === 'handle' && styles.inputCardFocused,
                ]}
              >
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  style={styles.textInputHandle}
                  placeholder="yourhandle"
                  placeholderTextColor="#94A3B8"
                  value={handle}
                  onChangeText={handleHandleChange}
                  onFocus={() => {
                    setFocusedField('handle');
                    triggerHaptic();
                  }}
                  onBlur={() => setFocusedField(null)}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isCheckingHandle && <ActivityIndicator size="small" color="#ff4d4d" />}
                {!isCheckingHandle && handleAvailable === true && (
                  <View style={styles.verifiedBadge}>
                    <Check size={14} color="#16A34A" strokeWidth={3} />
                  </View>
                )}
                {!isCheckingHandle && handleAvailable === false && (
                  <View style={styles.errorBadge}>
                    <X size={14} color="#EF4444" strokeWidth={3} />
                  </View>
                )}
              </View>

              <View style={styles.handleFeedbackRow}>
                {handleAvailable === true && (
                  <Text style={styles.handleSuccessText}>✓ @{handle} is available!</Text>
                )}
                {handleError && (
                  <Text style={styles.handleErrorText}>⚠ {handleError}</Text>
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
                Select your primary trading methodology so we can calibrate your analytics and metrics.
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
                        <Icon size={20} color={isSelected ? '#ff4d4d' : '#64748B'} />
                      </View>
                      <View style={styles.optionTextCol}>
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
                Select the primary financial asset class you focus on.
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
                        <Icon size={20} color={isSelected ? '#ff4d4d' : '#64748B'} />
                      </View>
                      <View style={styles.optionTextCol}>
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
                Select all strengths that define your trading strategy (choose one or more).
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
                      <Icon size={16} color={isSelected ? '#ff4d4d' : '#64748B'} />
                      <Text style={[styles.multiPillText, isSelected && styles.multiPillTextSelected]}>
                        {item.label}
                      </Text>
                      {isSelected && <Check size={14} color="#ff4d4d" strokeWidth={3} />}
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
                Choose what features you want us to highlight first on your dashboard.
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
                        <Icon size={20} color={isSelected ? '#ff4d4d' : '#64748B'} />
                      </View>
                      <View style={styles.optionTextCol}>
                        <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                          {item.label}
                        </Text>
                      </View>
                      <View style={[styles.checkboxSquare, isSelected && styles.checkboxSquareSelected]}>
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
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
              <View style={styles.passportCard}>
                <View style={styles.passportHeader}>
                  <View style={styles.passportAvatarCircle}>
                    <Text style={styles.passportAvatarText}>
                      {(name || 'T').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.passportName}>{name || 'Trader'}</Text>
                    <Text style={styles.passportHandle}>@{handle || 'trader'}</Text>
                  </View>
                  <View style={styles.passportVerifiedBadge}>
                    <CheckCircle2 size={14} color="#ff4d4d" />
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
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.passportTagLabel}>EDGES</Text>
                    <Text style={[styles.passportTagVal, { fontSize: 13, marginTop: 2 }]} numberOfLines={1}>
                      {selectedEdges.join(' • ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── BOTTOM ACTION BAR (WHITE MODE) ── */}
        <SafeAreaView style={styles.safeBottom}>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.continueBtn, !canContinue() && styles.continueBtnDisabled]}
              disabled={!canContinue() || saving}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.continueBtnText}>
                    {currentStep === 'READY' ? 'Enter TradiFive' : 'Continue'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
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
    paddingTop: Platform.OS === 'android' ? 24 : 0,
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
    justifyContent: 'center',
  },
  logoSymbol: {
    width: 32,
    height: 32,
  },
  logoText: {
    width: 110,
    height: 24,
    marginLeft: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipText: {
    fontFamily: fontSemi,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff4d4d',
  },

  /* ── White Bottom Sheet ── */
  whiteSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
  },
  stepContainer: {
    width: '100%',
  },
  stepCategory: {
    fontFamily: fontBold,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  stepTitle: {
    fontFamily: fontBold,
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: fontFamily,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 24,
  },

  /* ── Inputs ── */
  inputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  inputCardFocused: {
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    fontFamily: fontMed,
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '600',
    height: '100%',
  },
  inputHelper: {
    fontFamily: fontFamily,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    marginLeft: 4,
  },
  handleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    fontFamily: fontBold,
    color: '#64748B',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
  },
  textInputHandle: {
    flex: 1,
    fontFamily: fontMed,
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '600',
    height: '100%',
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleFeedbackRow: {
    minHeight: 24,
    marginTop: 8,
    marginLeft: 4,
  },
  handleSuccessText: {
    fontFamily: fontMed,
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
  },
  handleErrorText: {
    fontFamily: fontMed,
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Option Cards ── */
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#FFF5F5',
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconBoxSelected: {
    backgroundColor: '#FEE2E2',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fontSemi,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  optionDesc: {
    fontFamily: fontFamily,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#ff4d4d',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4d4d',
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#ff4d4d',
  },

  /* ── Multi Pills ── */
  multiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  multiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiPillSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#FFF5F5',
  },
  multiPillText: {
    fontFamily: fontSemi,
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  multiPillTextSelected: {
    color: '#ff4d4d',
    fontWeight: '700',
  },

  /* ── Passport Card ── */
  passportCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passportAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportAvatarText: {
    fontFamily: fontBold,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  passportName: {
    fontFamily: fontBold,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  passportHandle: {
    fontFamily: fontMed,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  passportVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  passportVerifiedText: {
    fontFamily: fontBold,
    color: '#ff4d4d',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passportDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 16,
  },
  passportTagsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  passportTag: {
    flex: 1,
  },
  passportTagLabel: {
    fontFamily: fontBold,
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  passportTagVal: {
    fontFamily: fontSemi,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },

  /* ── Bottom Bar ── */
  safeBottom: {
    backgroundColor: '#FFFFFF',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  continueBtn: {
    height: 52,
    backgroundColor: '#ff4d4d',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
    fontFamily: fontBold,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
