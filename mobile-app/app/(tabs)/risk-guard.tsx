import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, Image, Switch, Animated, DeviceEventEmitter, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useRouter } from 'expo-router';
import UpgradeGate from '../components/UpgradeGate';
import { 
  Eye, Shield, Zap, Power, Brain, Timer, Trophy, Target, ShieldAlert, Bell, Settings, 
  TrendingDown, Info, Clock, Check, Layers, AlertTriangle, Crosshair, CheckSquare, 
  StopCircle, Star, Sparkles, Lock, ShieldCheck, Activity, HeartPulse, Moon, Volume2, ShieldOff,
  ChevronDown, TrendingUp, Sunrise, Minus, Plus, Calendar, Wallet, Key, MonitorOff
} from 'lucide-react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store';
import { supabase } from '../utils/supabase';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width, height } = Dimensions.get('window');
const h = (s: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    try { Haptics.impactAsync(s).catch(() => { }); } catch (e) { }
  }
};

function CustomToggle({ value, onValueChange, activeColor = '#3b82f6', scale = 0.9 }: { value: boolean; onValueChange: (v: boolean) => void; activeColor?: string; scale?: number }) {
  const { isDark } = useAppTheme();
  return (
    <Switch
      value={value}
      onValueChange={(v) => { h(); onValueChange(v); }}
      trackColor={{ false: isDark ? '#3f3f46' : '#e2e8f0', true: activeColor }}
      thumbColor="#fff"
      ios_backgroundColor={isDark ? '#3f3f46' : '#e2e8f0'}
      style={{ transform: [{ scaleX: scale }, { scaleY: scale }] }}
    />
  );
}

function HalfGauge({ value, max }: { value: number; max: number }) {
  const { isDark } = useAppTheme();
  const pct = Math.min(1, value / max);
  const W = 160, H = 85, sw = 12, r = 60;
  const angle = Math.PI - (pct * Math.PI);
  const cx = W / 2;
  const cy = H - 5;
  const nx = cx + Math.cos(angle) * (r - 10);
  const ny = cy - Math.sin(angle) * (r - 10);

  return (
    <View style={{ alignItems: 'center', marginTop: 10 }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#22c55e" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${Math.PI * r}`} strokeDashoffset={`${(Math.PI * r) * 0.66}`} />
        <Path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#eab308" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${Math.PI * r}`} strokeDashoffset={`${(Math.PI * r) * 0.33}`} />
        <Path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#ef4444" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${Math.PI * r}`} strokeDashoffset={`0`} opacity="0.5" />
        <Path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={isDark ? '#2a2a2e' : '#e2e8f0'} strokeWidth={sw} strokeLinecap="round" opacity="0.4" />
        <Path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#10b981" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${Math.PI * r}`} strokeDashoffset={`${Math.PI * r * (1 - pct)}`} />
        <Circle cx={cx} cy={cy} r="4" fill={isDark ? '#e8e8e8' : '#0f172a'} />
        <Line x1={cx} y1={cy} x2={nx} y2={ny} stroke={isDark ? '#e8e8e8' : '#0f172a'} strokeWidth="3" strokeLinecap="round" />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: W, paddingHorizontal: 10, marginTop: -5 }}>
        <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#64748b' }}>0</Text>
        <Text style={{ fontSize: 18, fontFamily: 'Inter_900Black', color: isDark ? '#e8e8e8' : '#0f172a', marginTop: 10 }}>{value.toFixed(1)}</Text>
        <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#64748b' }}>{max.toFixed(1)}</Text>
      </View>
    </View>
  );
}

function CustomSlider({ label, valuePct, valueText, color = '#6366f1' }: { label: string, valuePct: number, valueText: string, color?: string }) {
  const { isDark } = useAppTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{valueText}</Text>
      </View>
      <View style={{ height: 16, justifyContent: 'center' }}>
        <View style={{ height: 4, backgroundColor: isDark ? '#2a2a2e' : '#e2e8f0', borderRadius: 2, width: '100%', position: 'absolute' }} />
        <View style={{ height: 4, backgroundColor: color, borderRadius: 2, width: `${Math.min(100, Math.max(0, valuePct))}%`, position: 'absolute' }} />
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, left: `${Math.min(100, Math.max(0, valuePct))}%`, marginLeft: -7, position: 'absolute' }} />
      </View>
    </View>
  );
}

function DropdownButton({ value, onPress }: { value: string, onPress: () => void }) {
  const { isDark } = useAppTheme();
  return (
    <TouchableOpacity onPress={() => { h(); onPress(); }} style={{ backgroundColor: isDark ? '#141414' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#222' : '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{value}</Text>
      <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>▼</Text>
    </TouchableOpacity>
  );
}

export default function RiskGuardScreen() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);
  const mt5Account = useStore(state => state.mt5Account);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyleState(style);
    });
    return () => listener.remove();
  }, []);

  // Kill Switch
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'trading_control' | 'risk_management' | 'behaviour'>('trading_control');
  const [targetCapital, setTargetCapital] = useState(2000);
  const currentCapital = mt5Account?.balance || 500;
  const progressPercent = Math.min(100, Math.max(0, (currentCapital / targetCapital) * 100));

  // --- TRADING CONTROL STATES ---
  const [maxLotActive, setMaxLotActive] = useState(true);
  const [maxLot, setMaxLot] = useState(1.5);
  const [noAveragingDown, setNoAveragingDown] = useState(false);
  const [martingaleDetection, setMartingaleDetection] = useState(false);
  const [martingaleMultiplier, setMartingaleMultiplier] = useState(1.5);
  const [oneInstrumentMode, setOneInstrumentMode] = useState(false);
  const [allowedTicker, setAllowedTicker] = useState("XAUUSD");
  const [oneStrategyRule, setOneStrategyRule] = useState(false);
  const [strategyName, setStrategyName] = useState("Breakout Pro");

  // --- RISK MANAGEMENT STATES ---
  const [drawdownGuardActive, setDrawdownGuardActive] = useState(true);
  const [maxDrawdown, setMaxDrawdown] = useState(17);
  const [weeklyDrawdown, setWeeklyDrawdown] = useState(20);
  const [monthlyDrawdown, setMonthlyDrawdown] = useState(25);
  const [dailyProfitTargetActive, setDailyProfitTargetActive] = useState(false);
  const [dailyProfitTarget, setDailyProfitTarget] = useState(500);
  const [stopLossRequired, setStopLossRequired] = useState(false);
  const [stopLossAction, setStopLossAction] = useState("auto");
  const [stopLossMethod, setStopLossMethod] = useState("pips");
  const [defaultStopLoss, setDefaultStopLoss] = useState(15);
  const [minRiskRewardActive, setMinRiskRewardActive] = useState(false);
  const [minRiskReward, setMinRiskReward] = useState(2.0);
  const [weekendLock, setWeekendLock] = useState(false);
  const [weekendCloseTime, setWeekendCloseTime] = useState("20:00");
  const [equityHardStopActive, setEquityHardStopActive] = useState(false);
  const [equityHardStop, setEquityHardStop] = useState(5000);

  // --- BEHAVIOUR & DISCIPLINE STATES ---
  const [disciplineSentinel, setDisciplineSentinel] = useState(true);
  const [dailyTrades, setDailyTrades] = useState(3);
  const [stopAfterWin, setStopAfterWin] = useState(false);
  const [consecutiveWins, setConsecutiveWins] = useState(3);
  const [emotionalTradingDetector, setEmotionalTradingDetector] = useState(false);
  const [emotionSensitivity, setEmotionSensitivity] = useState(80);
  const [lossCooldown, setLossCooldown] = useState(true);
  const [waitPeriod, setWaitPeriod] = useState(5);
  const [sessionSentinel, setSessionSentinel] = useState(true);
  const [sessions, setSessions] = useState(['London', 'New York']);
  const [sleepProtection, setSleepProtection] = useState(false);
  const [sleepTimeStart, setSleepTimeStart] = useState("23:00");
  const [noTradingAfterTimeActive, setNoTradingAfterTimeActive] = useState(false);
  const [noTradingAfterTime, setNoTradingAfterTime] = useState("15:00");
  const [newsFilter, setNewsFilter] = useState(false);
  const [preTradeChecklist, setPreTradeChecklist] = useState(false);
  const [psychologyCheck, setPsychologyCheck] = useState(false);
  const [aiVoiceWarning, setAiVoiceWarning] = useState(false);

  const toggleSession = (s: string) => {
    h();
    setSessions(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleKillSwitch = (v: boolean) => {
    if (v) {
      Alert.alert(
        "🔴 KILL SWITCH",
        "This will immediately close ALL open positions and halt all trading. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "ACTIVATE", style: "destructive", onPress: () => setKillSwitchActive(true) }
        ]
      );
    } else {
      setKillSwitchActive(false);
    }
  };

  const headerHeight = insets.top + 64;
  const clampedScroll = Animated.diffClamp(scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' }), 0, headerHeight);
  const headerTranslateY = clampedScroll.interpolate({ inputRange: [0, headerHeight], outputRange: [0, -headerHeight], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    card: {
      flex: 1,
      backgroundColor: isDark ? theme.background : '#f8fafc',
      zIndex: 10,
    },
    metricCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 24,
      padding: 16,
      borderWidth: 2,
      borderColor: isDark ? '#2C2C2E' : '#F1F5F9',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    activeMetricCard: {
      borderColor: isDark ? '#064e3b' : '#a7f3d0',
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    iconBoxStyle: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: isDark ? '#2C2C2E' : '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#3C3C3E' : '#F1F5F9',
    },
    inputWrapperStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#F1F5F9',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: isDark ? '#2C2C2E' : '#F8FAFC',
      marginTop: 6
    }
  });

  const renderCardHeader = (Icon: any, title: string, description: string, active: boolean, onToggle: (v: boolean) => void) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
        <View style={styles.iconBoxStyle}><Icon size={18} color="#64748b" /></View>
        <View style={{ flexShrink: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{title}</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>{description}</Text>
        </View>
      </View>
      <View style={{ flexShrink: 0 }}>
        <CustomToggle value={active} onValueChange={onToggle} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* ── SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight, backgroundColor: '#000', zIndex: 2000, paddingTop: insets.top, opacity: headerOpacity, transform: [{ translateY: headerTranslateY }], borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' }}>
          <Image source={require('../../assets/images/top-glow.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 80, opacity: 0.8 }} resizeMode="stretch" />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 }}>
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>Risk Guard</Text>
            {/* Kill Switch Mini */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: killSwitchActive ? (isDark ? '#450a0a' : '#fef2f2') : (isDark ? '#1a1a1e' : '#ffffff'), borderRadius: 20, paddingLeft: 12, paddingRight: 6, paddingVertical: 2, borderWidth: 1, borderColor: killSwitchActive ? '#ef4444' : (isDark ? '#333' : '#e2e8f0'), shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Power size={14} color={killSwitchActive ? '#ef4444' : (isDark ? '#fff' : '#0f172a')} />
              <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: killSwitchActive ? '#ef4444' : (isDark ? '#fff' : '#0f172a'), marginRight: 0 }}>Kill Switch</Text>
              <View style={{ marginRight: -4, marginLeft: -2 }}>
                <CustomToggle value={killSwitchActive} onValueChange={handleKillSwitch} activeColor="#ef4444" scale={0.85} />
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92, backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#ffffff') : 'transparent', borderBottomWidth: headerStyle === 'simple' ? 1 : 0, borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0', position: 'relative', transform: headerStyle === 'simple' ? [] : [{ scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }] }}>
        <Animated.View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 12 : 38, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
          <Text style={{ color: headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Risk Guard</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: killSwitchActive ? (isDark ? '#450a0a' : '#fef2f2') : (isDark ? '#1a1a1e' : '#ffffff'), borderRadius: 20, paddingLeft: 12, paddingRight: 6, paddingVertical: 2, borderWidth: 1, borderColor: killSwitchActive ? '#ef4444' : (isDark ? '#333' : '#e2e8f0'), shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Power size={14} color={killSwitchActive ? '#ef4444' : (isDark ? '#fff' : '#0f172a')} />
            <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: killSwitchActive ? '#ef4444' : (isDark ? '#fff' : '#0f172a'), marginRight: 0 }}>Kill Switch</Text>
            <View style={{ marginRight: -4, marginLeft: -2 }}>
              <CustomToggle value={killSwitchActive} onValueChange={handleKillSwitch} activeColor="#ef4444" scale={0.85} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD OVERLAY ── */}
      <Animated.View style={[styles.card, { marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40, borderTopRightRadius: headerStyle === 'simple' ? 0 : 40 }]}>
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140, paddingTop: 16, paddingHorizontal: 20 }} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16}>
          <Animated.View style={{ transform: headerStyle === 'simple' ? [] : [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            
            {/* PROTOCOL ARCHITECTURE */}
            <View style={styles.metricCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>PROTOCOL ARCHITECTURE</Text>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', letterSpacing: -0.5 }}>Level {currentUser?.xp_level || 1} Architect</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Trophy size={12} color="#6366f1" />
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#6366f1' }}>{currentUser?.xp_total || 0} XP</Text>
                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6' }} />
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Start: ${currentCapital}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Target: ${targetCapital}</Text>
                  </View>
                </View>
                <View style={{ height: 8, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 4, width: '100%', overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#6366f1', borderRadius: 4 }} />
                </View>
              </View>
            </View>

            {/* TABS */}
            <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 30, padding: 4, marginBottom: 24, width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
              {[
                { id: 'trading_control', label: 'Control' },
                { id: 'risk_management', label: 'Risk Mgt' },
                { id: 'behaviour', label: 'Behaviour' }
              ].map((tab) => (
                <TouchableOpacity 
                  key={tab.id}
                  onPress={() => { h(); setActiveTab(tab.id as typeof activeTab); }} 
                  style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: activeTab === tab.id ? (isDark ? '#333' : '#fff') : 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: activeTab === tab.id ? 0.1 : 0, shadowRadius: 2, elevation: activeTab === tab.id ? 1 : 0 }}
                >
                  <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 13, fontFamily: activeTab === tab.id ? 'Inter_700Bold' : 'Inter_600SemiBold', color: activeTab === tab.id ? (isDark ? '#fff' : '#0f172a') : '#64748b' }}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 1. TRADING CONTROL */}
            {activeTab === 'trading_control' && (
              <View>
                <View style={[styles.metricCard, maxLotActive && styles.activeMetricCard]}>
                  {renderCardHeader(Layers, "Max Lot Size", "Hard cap on lot size per trade", maxLotActive, setMaxLotActive)}
                  <View style={{ opacity: maxLotActive ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>MAX LOT SIZE LIMIT</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity onPress={() => setMaxLot(Math.max(0.01, maxLot - 0.1))} style={styles.plusMinusBtn}>
                        <Minus size={16} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                      <View style={[styles.inputWrapperStyle, { width: 140, justifyContent: 'space-between', paddingHorizontal: 16 }]}>
                        <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{maxLot.toFixed(2)}</Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Lots</Text>
                      </View>
                      <TouchableOpacity onPress={() => setMaxLot(Math.min(10.0, maxLot + 0.1))} style={styles.plusMinusBtn}>
                        <Plus size={16} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, noAveragingDown && styles.activeMetricCard]}>
                  {renderCardHeader(TrendingDown, "No Averaging Down", "Prevent adding to losing positions", noAveragingDown, setNoAveragingDown)}
                  <View style={{ opacity: noAveragingDown ? 1 : 0.5, gap: 12 }}>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>MODE</Text>
                      <DropdownButton value="Strict Block" onPress={() => {}} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>SCOPE</Text>
                      <DropdownButton value="Same Symbol + Direction" onPress={() => {}} />
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, martingaleDetection && styles.activeMetricCard]}>
                  {renderCardHeader(AlertTriangle, "Martingale Protection", "Block increasing lot sizes after a loss", martingaleDetection, setMartingaleDetection)}
                  <View style={{ opacity: martingaleDetection ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>TRIGGER MULTIPLIER</Text>
                    <View style={[styles.inputWrapperStyle, { justifyContent: 'center' }]}>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{martingaleMultiplier.toFixed(1)}×</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, oneInstrumentMode && styles.activeMetricCard]}>
                  {renderCardHeader(Crosshair, "One Instrument Mode", "Limit trading to a single ticker", oneInstrumentMode, setOneInstrumentMode)}
                  <View style={{ opacity: oneInstrumentMode ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ALLOWED INSTRUMENT</Text>
                    <DropdownButton value={allowedTicker} onPress={() => {}} />
                  </View>
                </View>

                <View style={[styles.metricCard, oneStrategyRule && styles.activeMetricCard]}>
                  {renderCardHeader(CheckSquare, "Allowed Strategy Only", "Allow trades only from the selected strategy", oneStrategyRule, setOneStrategyRule)}
                  <View style={{ opacity: oneStrategyRule ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ALLOWED STRATEGY</Text>
                    <DropdownButton value={strategyName} onPress={() => {}} />
                  </View>
                </View>
              </View>
            )}

            {/* 2. RISK MANAGEMENT */}
            {activeTab === 'risk_management' && (
              <View>
                <View style={[styles.metricCard, drawdownGuardActive && styles.activeMetricCard]}>
                  {renderCardHeader(ShieldAlert, "Drawdown Guard", "Max daily drawdown limits", drawdownGuardActive, setDrawdownGuardActive)}
                  <View style={{ opacity: drawdownGuardActive ? 1 : 0.5 }}>
                    <CustomSlider label="MAX DAILY DRAWDOWN" valuePct={maxDrawdown} valueText={`${maxDrawdown.toFixed(1)}%`} />
                    <CustomSlider label="MAX WEEKLY DRAWDOWN" valuePct={weeklyDrawdown} valueText={`${weeklyDrawdown.toFixed(1)}%`} />
                    <CustomSlider label="MAX MONTHLY DRAWDOWN" valuePct={monthlyDrawdown} valueText={`${monthlyDrawdown.toFixed(1)}%`} />
                  </View>
                </View>

                <View style={[styles.metricCard, dailyProfitTargetActive && styles.activeMetricCard]}>
                  {renderCardHeader(Target, "Daily Profit Target", "Lock terminal after profit", dailyProfitTargetActive, setDailyProfitTargetActive)}
                  <View style={{ opacity: dailyProfitTargetActive ? 1 : 0.5, gap: 12 }}>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>TARGET AMOUNT</Text>
                      <View style={styles.inputWrapperStyle}>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' }}>$</Text>
                        <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{dailyProfitTarget}</Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>USD</Text>
                      </View>
                    </View>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CALCULATION</Text>
                      <DropdownButton value="Closed P&L" onPress={() => {}} />
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, stopLossRequired && styles.activeMetricCard]}>
                  {renderCardHeader(StopCircle, "Stop Loss Required", "Require SL on every execution", stopLossRequired, setStopLossRequired)}
                  <View style={{ opacity: stopLossRequired ? 1 : 0.5, gap: 12 }}>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                      <DropdownButton value={stopLossAction === 'auto' ? "Auto add SL" : "Block trades without SL"} onPress={() => setStopLossAction(stopLossAction === 'auto' ? 'block' : 'auto')} />
                    </View>
                    {stopLossAction === 'auto' && (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>METHOD</Text>
                          <DropdownButton value={stopLossMethod === 'pips' ? "Pips" : "Percent"} onPress={() => setStopLossMethod(stopLossMethod === 'pips' ? 'percent' : 'pips')} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>VALUE</Text>
                          <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                            <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{defaultStopLoss}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                <View style={[styles.metricCard, minRiskRewardActive && styles.activeMetricCard]}>
                  {renderCardHeader(TrendingUp, "Min Risk/Reward", "Require a minimum reward-to-risk ratio", minRiskRewardActive, setMinRiskRewardActive)}
                  <View style={{ opacity: minRiskRewardActive ? 1 : 0.5 }}>
                    <CustomSlider label="MINIMUM TARGET R:R" valuePct={minRiskReward * 20} valueText={`1:${minRiskReward.toFixed(1)}`} />
                  </View>
                </View>

                <View style={[styles.metricCard, weekendLock && styles.activeMetricCard]}>
                  {renderCardHeader(Calendar, "Weekend Lock", "Auto flatten before Friday close", weekendLock, setWeekendLock)}
                  <View style={{ opacity: weekendLock ? 1 : 0.5, gap: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CLOSE TIME</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{weekendCloseTime}</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                        <DropdownButton value="Close & Block" onPress={() => {}} />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, equityHardStopActive && styles.activeMetricCard]}>
                  {renderCardHeader(Wallet, "Account Protection", "Minimum equity level", equityHardStopActive, setEquityHardStopActive)}
                  <View style={{ opacity: equityHardStopActive ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>MINIMUM EQUITY LEVEL</Text>
                    <View style={[styles.inputWrapperStyle, { justifyContent: 'flex-start' }]}>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b', marginRight: 4 }}>$</Text>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{equityHardStop}</Text>
                      <View style={{ flex: 1 }} />
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>USD</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 3. BEHAVIOUR & DISCIPLINE */}
            {activeTab === 'behaviour' && (
              <View>
                <View style={[styles.metricCard, disciplineSentinel && styles.activeMetricCard]}>
                  {renderCardHeader(Activity, "Daily Trade Limit", "Limits maximum executions per day", disciplineSentinel, setDisciplineSentinel)}
                  <View style={{ opacity: disciplineSentinel ? 1 : 0.5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>DAILY EXECUTION LIMIT</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', padding: 6, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#222' : '#f1f5f9' }}>
                        <TouchableOpacity onPress={() => { h(); setDailyTrades(Math.max(1, dailyTrades - 1)); }} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#64748b', fontSize: 18, fontFamily: 'Inter_700Bold' }}>-</Text></TouchableOpacity>
                        <Text style={{ fontSize: 15, fontFamily: 'Inter_900Black', color: isDark ? '#fff' : '#0f172a' }}>{dailyTrades}</Text>
                        <TouchableOpacity onPress={() => { h(); setDailyTrades(Math.min(20, dailyTrades + 1)); }} style={{ width: 28, height: 28, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' }}>+</Text></TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, lossCooldown && styles.activeMetricCard]}>
                  {renderCardHeader(ShieldOff, "Loss Cooldown", "Locks execution after losing trades", lossCooldown, setLossCooldown)}
                  <View style={{ opacity: lossCooldown ? 1 : 0.5, gap: 12 }}>
                    <CustomSlider label="DURATION (MINUTES)" valuePct={(waitPeriod/120)*100} valueText={`${waitPeriod}M`} />
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>TRIGGER</Text>
                      <DropdownButton value="After every losing trade" onPress={() => {}} />
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, sessionSentinel && styles.activeMetricCard]}>
                  {renderCardHeader(Clock, "Session Sentinel", "Custom hourly trading windows", sessionSentinel, setSessionSentinel)}
                  <View style={{ opacity: sessionSentinel ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>ACTIVE SESSIONS</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {['London', 'Sydney', 'New York', 'Asian'].map(city => {
                        const isActive = sessions.includes(city);
                        return (
                          <TouchableOpacity
                            key={city}
                            onPress={() => toggleSession(city)}
                            style={{
                              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                              borderWidth: 1, borderColor: isActive ? (isDark ? '#3730a3' : '#c7d2fe') : (isDark ? '#222' : '#e2e8f0'),
                              borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
                              backgroundColor: isActive ? (isDark ? '#312e81' : '#eef2ff') : (isDark ? '#141414' : '#fff')
                            }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isActive ? (isDark ? '#a5b4fc' : '#4f46e5') : (isDark ? '#94a3b8' : '#64748b') }}>{city}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, stopAfterWin && styles.activeMetricCard]}>
                  {renderCardHeader(Trophy, "Win Streak Cooldown", "Lock trading after wins", stopAfterWin, setStopAfterWin)}
                  <View style={{ opacity: stopAfterWin ? 1 : 0.5, gap: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>MAX WINS</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', padding: 4, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#222' : '#f1f5f9' }}>
                          <TouchableOpacity onPress={() => { h(); setConsecutiveWins(Math.max(1, consecutiveWins - 1)); }} style={{ flex: 1, height: 26, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#64748b', fontSize: 16, fontFamily: 'Inter_700Bold' }}>-</Text></TouchableOpacity>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_900Black', color: isDark ? '#fff' : '#0f172a' }}>{consecutiveWins}</Text>
                          <TouchableOpacity onPress={() => { h(); setConsecutiveWins(consecutiveWins + 1); }} style={{ flex: 1, height: 26, backgroundColor: '#3b82f6', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' }}>+</Text></TouchableOpacity>
                        </View>
                      </View>
                      <View style={{ flex: 1.5 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                        <DropdownButton value="Pause trading" onPress={() => {}} />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, noTradingAfterTimeActive && styles.activeMetricCard]}>
                  {renderCardHeader(Sunrise, "No Trading After Time", "Daily cutoff time", noTradingAfterTimeActive, setNoTradingAfterTimeActive)}
                  <View style={{ opacity: noTradingAfterTimeActive ? 1 : 0.5, gap: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CUTOFF TIME</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{noTradingAfterTime}</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                        <DropdownButton value="Block new trades" onPress={() => {}} />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, emotionalTradingDetector && styles.activeMetricCard]}>
                  {renderCardHeader(HeartPulse, "Behavioural Risk Detector", "AI pacing detection", emotionalTradingDetector, setEmotionalTradingDetector)}
                  <View style={{ opacity: emotionalTradingDetector ? 1 : 0.5 }}>
                    <CustomSlider label="SENSITIVITY" valuePct={emotionSensitivity} valueText={`${emotionSensitivity}%`} />
                  </View>
                </View>
                
                <View style={[styles.metricCard, newsFilter && styles.activeMetricCard]}>
                  {renderCardHeader(AlertTriangle, "News Filter", "Block around high-impact news", newsFilter, setNewsFilter)}
                  <View style={{ opacity: newsFilter ? 1 : 0.5, gap: 12 }}>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>IMPACT LEVEL</Text>
                      <DropdownButton value="High Only" onPress={() => {}} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>BLOCK BFR.</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>30</Text>
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8' }}>MIN</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>RESUME AFT.</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>15</Text>
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8' }}>MIN</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, sleepProtection && styles.activeMetricCard]}>
                  {renderCardHeader(Moon, "Sleep Protection", "Disable midnight trading", sleepProtection, setSleepProtection)}
                  <View style={{ opacity: sleepProtection ? 1 : 0.5 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>LOCKOUT START</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{sleepTimeStart}</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>LOCKOUT END</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>06:00</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.metricCard, preTradeChecklist && styles.activeMetricCard]}>
                  {renderCardHeader(CheckSquare, "Pre-Trade Checklist", "Mandatory popup checklist", preTradeChecklist, setPreTradeChecklist)}
                  <View style={{ opacity: preTradeChecklist ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CHECKLIST PRESET</Text>
                    <DropdownButton value="Standard Checklist" onPress={() => {}} />
                  </View>
                </View>

                <View style={[styles.metricCard, psychologyCheck && styles.activeMetricCard]}>
                  {renderCardHeader(Brain, "AI Psychology Check", "Quick emotion assessment before NY Open", psychologyCheck, setPsychologyCheck)}
                </View>

                <View style={[styles.metricCard, aiVoiceWarning && styles.activeMetricCard]}>
                  {renderCardHeader(Volume2, "AI Voice Warning", "Verbal warnings during drawdown spikes", aiVoiceWarning, setAiVoiceWarning)}
                </View>
              </View>
            )}

          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}
