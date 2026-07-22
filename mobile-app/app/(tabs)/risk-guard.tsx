import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar, Image, Switch, Animated, DeviceEventEmitter } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useRouter } from 'expo-router';
import UpgradeGate from '../components/UpgradeGate';
import { Eye, Shield, Zap, Power, Brain, Timer, Trophy, Target, ShieldAlert, Bell, Settings, TrendingDown, Info, Clock, Check } from 'lucide-react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
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

// Toggle Switch Component
function CustomToggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const { isDark } = useAppTheme();
  return (
    <Switch
      value={value}
      onValueChange={(v) => { h(); onValueChange(v); }}
      trackColor={{ false: isDark ? '#3f3f46' : '#e2e8f0', true: '#3b82f6' }}
      thumbColor="#fff"
      ios_backgroundColor={isDark ? '#3f3f46' : '#e2e8f0'}
      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
    />
  );
}

// Custom Slider Component
function CustomSlider({ label, valuePct, valueText }: { label: string, valuePct: number, valueText: string }) {
  const { isDark } = useAppTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{valueText}</Text>
      </View>
      <View style={{ height: 16, justifyContent: 'center' }}>
        <View style={{ height: 4, backgroundColor: isDark ? '#2a2a2e' : '#e2e8f0', borderRadius: 2, width: '100%', position: 'absolute' }} />
        <View style={{ height: 4, backgroundColor: '#6366f1', borderRadius: 2, width: `${valuePct}%`, position: 'absolute' }} />
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#6366f1', left: `${valuePct}%`, marginLeft: -7, position: 'absolute' }} />
      </View>
    </View>
  );
}

// Half-Circle Gauge Component (Max Lot Guard)
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

export default function RiskGuardScreen() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());
  const router = useRouter();

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyleState(style);
    });
    return () => listener.remove();
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 64;

  const clampedScroll = Animated.diffClamp(
    scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' }),
    0, headerHeight
  );

  const headerTranslateY = clampedScroll.interpolate({
    inputRange: [0, headerHeight], outputRange: [0, -headerHeight], extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp',
  });

  const smartHeaderVisibilityY = scrollY.interpolate({
    inputRange: [0, 139, 140], outputRange: [-500, -500, 0], extrapolate: 'clamp',
  });

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => { DeviceEventEmitter.emit('scrollUpdate', value); });
    return () => scrollY.removeListener(listener);
  }, []);

  const currentUser = useStore(state => state.currentUser);
  const mt5Account = useStore(state => state.mt5Account);
  const toggleAlgoStatus = useStore(state => state.toggleAlgoStatus);

  // Toggle States
  const [liveOps, setLiveOps] = useState(mt5Account?.algo_status || false);
  const [maxLotGuard, setMaxLotGuard] = useState(true);
  const [drawdownGuard, setDrawdownGuard] = useState(true);
  const [disciplineSentinel, setDisciplineSentinel] = useState(true);
  const [lossCooldown, setLossCooldown] = useState(true);
  const [sessionSentinel, setSessionSentinel] = useState(true);

  // Values
  const [maxLotSize, setMaxLotSize] = useState(1.5);
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState(17);
  const [maxWeeklyLossPercent, setMaxWeeklyLossPercent] = useState(20);
  const [maxMonthlyLossPercent, setMaxMonthlyLossPercent] = useState(25);
  const [targetCapital, setTargetCapital] = useState(624);
  const [dailyTrades, setDailyTrades] = useState(3);
  const [sessions, setSessions] = useState(['London', 'New York']);
  const [cooldownDuration, setCooldownDuration] = useState(30);

  // Load configuration from user_risk_configs on mount
  useEffect(() => {
    if (!currentUser?.id) return;
    setLiveOps(mt5Account?.algo_status || false);

    const fetchRiskConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('user_risk_configs')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setMaxLotGuard(data.max_lot_size !== null && data.max_lot_size > 0);
          setMaxLotSize(data.max_lot_size || 1.5);
          setDrawdownGuard(data.max_daily_loss_percent !== null && data.max_daily_loss_percent > 0);
          setMaxDailyLossPercent(data.max_daily_loss_percent || 17);
          setMaxWeeklyLossPercent(data.max_overall_drawdown_percent || 20);
          setTargetCapital(data.target_capital || 624);
          setDisciplineSentinel(data.max_open_trades !== null && data.max_open_trades > 0);
          setDailyTrades(data.max_open_trades || 3);
        } else {
          // If no config exists, insert a default one
          const defaultConfig = {
            user_id: currentUser.id,
            max_lot_size: 1.5,
            max_daily_loss_percent: 17,
            max_overall_drawdown_percent: 20,
            max_open_trades: 3,
            target_capital: 624,
            alert_on_warning: true,
            alert_on_breach: true
          };
          await supabase.from('user_risk_configs').insert([defaultConfig]);
        }
      } catch (err) {
        console.error('Error fetching user_risk_configs:', err);
      }
    };

    fetchRiskConfig();
  }, [currentUser, mt5Account]);

  // Save updates helper
  const saveRiskConfig = async (updates: any) => {
    if (!currentUser?.id) return;
    try {
      const { error } = await supabase
        .from('user_risk_configs')
        .update(updates)
        .eq('user_id', currentUser.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating user_risk_configs:', err);
    }
  };

  const handleToggleLiveOps = async (v: boolean) => {
    setLiveOps(v);
    try {
      await toggleAlgoStatus(v);
    } catch (err) {
      console.error('Error toggling live ops status:', err);
    }
  };

  const handleToggleMaxLotGuard = (v: boolean) => {
    setMaxLotGuard(v);
    saveRiskConfig({ max_lot_size: v ? maxLotSize : null });
  };

  const handleToggleDrawdownGuard = (v: boolean) => {
    setDrawdownGuard(v);
    saveRiskConfig({
      max_daily_loss_percent: v ? maxDailyLossPercent : null,
      max_overall_drawdown_percent: v ? maxWeeklyLossPercent : null
    });
  };

  const handleToggleDisciplineSentinel = (v: boolean) => {
    setDisciplineSentinel(v);
    saveRiskConfig({ max_open_trades: v ? dailyTrades : null });
  };

  const toggleSession = (s: string) => {
    h();
    setSessions(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  // Dynamic card style based on theme
  const cardStyle = {
    backgroundColor: isDark ? '#111111' : '#fafafa',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: isDark ? '#222222' : '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 12,
    elevation: 2,
  };

  const iconBoxStyle = {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? '#1a1a1e' : '#f8fafc',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: isDark ? '#222222' : '#f1f5f9',
  };

  const inputWrapperStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: isDark ? '#222222' : '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: isDark ? '#1a1a1e' : '#f8fafc',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0a0a0a' : '#f8fafc' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP GLOW ── */}
      <Image
        source={require('../../assets/images/top-glow.png')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 150, opacity: headerStyle === 'simple' ? 0 : 0.8 }}
        resizeMode="stretch"
      />

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92, backgroundColor: headerStyle === 'simple' ? (isDark ? '#111111' : '#ffffff') : 'transparent', borderBottomWidth: headerStyle === 'simple' ? 1 : 0, borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0', position: 'relative', zIndex: 1, transform: headerStyle === 'simple' ? [] : [{ scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }] }}>
        <Animated.View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 12 : 38, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
          <Text style={{ color: headerStyle === 'simple' ? (isDark ? '#ffffff' : '#000000') : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Risk Guard</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} color={headerStyle === 'simple' ? (isDark ? '#ffffff' : '#000000') : 'white'} />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={22} color={headerStyle === 'simple' ? (isDark ? '#ffffff' : '#000000') : 'white'} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── MAIN SCROLL SURFACE ── */}
      <Animated.View style={{
        flex: 1,
        backgroundColor: isDark ? '#0a0a0a' : '#f8fafc',
        overflow: 'hidden',
        zIndex: 5,
        marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }),
        borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
        borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
      }}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: 24 }}
        >
          <Animated.View style={{ transform: headerStyle === 'simple' ? [] : [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            <View style={{ padding: 16, gap: 20, paddingTop: headerStyle === 'simple' ? 16 : 0 }}>

            {/* ── LIVE OPERATIONS ── */}
            <View style={{ marginBottom: 4, marginTop: -8 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { h(); handleToggleLiveOps(!liveOps); }}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: liveOps
                    ? (isDark ? '#042f1a' : '#f0fdf4')
                    : (isDark ? '#2d0a10' : '#fff1f2'),
                  paddingHorizontal: 16, paddingVertical: 14,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: liveOps
                    ? (isDark ? '#065f46' : '#bbf7d0')
                    : (isDark ? '#881337' : '#fecdd3'),
                  width: '100%'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: liveOps ? (isDark ? '#064e3b' : '#dcfce7') : (isDark ? '#4c0519' : '#ffe4e6'),
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Power size={18} color={liveOps ? "#10b981" : "#e11d48"} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: liveOps ? '#10b981' : '#e11d48', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      LIVE OPERATIONS
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: liveOps ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#fb7185' : '#9f1239'), marginTop: 2 }}>
                      {liveOps ? 'System is actively trading' : 'All trading is halted'}
                    </Text>
                  </View>
                </View>
                <CustomToggle value={liveOps} onValueChange={handleToggleLiveOps} />
              </TouchableOpacity>
            </View>

            {/* ── PROTOCOL ARCHITECTURE CARD ── */}
            <View style={cardStyle}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>PROTOCOL ARCHITECTURE</Text>
                  <Text style={{ fontSize: 22, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', letterSpacing: -0.5 }}>Level {currentUser?.xp_level || 1} Architect</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6' }} />
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>STARTING CAPITAL: ${(mt5Account?.balance || 500).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginBottom: 8 }}>
                    <Trophy size={14} color="#6366f1" />
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#6366f1' }}>{currentUser?.xp_total || 0} XP</Text>
                  </View>
                  <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>TARGET CAPITAL</Text>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_900Black', color: isDark ? '#e8e8e8' : '#0f172a' }}>${targetCapital} USD</Text>
                </View>
              </View>

              {/* Progress Bar Area */}
              <View style={{ marginTop: 30, paddingHorizontal: 10 }}>
                <View style={{ height: 8, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 4, width: '100%', position: 'absolute', top: 0, left: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 }}>
                  {[0, Math.round(targetCapital*0.25), Math.round(targetCapital*0.5), Math.round(targetCapital*0.75), targetCapital].map((val, idx) => (
                    <View key={idx} style={{ alignItems: 'center' }}>
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: idx === 0 ? '#f59e0b' : (isDark ? '#2a2a2e' : '#fff'), borderWidth: 2, borderColor: idx === 0 ? '#f59e0b' : (isDark ? '#333338' : '#e2e8f0'), zIndex: 2 }} />
                      <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', marginTop: 10 }}>${val}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* ── TARGET CAPITAL GUARD ── */}
            <View style={cardStyle}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                  <View style={iconBoxStyle}><Target size={20} color="#64748b" /></View>
                  <View style={{ flexShrink: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Target Capital Guard</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>Configure target goals and parameters</Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>STARTING CAPITAL</Text>
                  <View style={inputWrapperStyle}>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>${(mt5Account?.balance || 500).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    <View style={{ backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#6366f1', textTransform: 'uppercase' }}>FETCHED</Text>
                    </View>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>TARGET CAPITAL</Text>
                  <View style={inputWrapperStyle}>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>$</Text>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', flex: 1, textAlign: 'right' }}>{targetCapital}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── MAX LOT GUARD ── */}
            <View style={cardStyle}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                  <View style={iconBoxStyle}><ShieldAlert size={20} color="#64748b" /></View>
                  <View style={{ flexShrink: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Max Lot Guard</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>Enforce maximum order volume thresholds</Text>
                  </View>
                </View>
                <View style={{ flexShrink: 0 }}>
                  <CustomToggle value={maxLotGuard} onValueChange={handleToggleMaxLotGuard} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', opacity: maxLotGuard ? 1 : 0.5 }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>MAX LOT SIZE LIMIT</Text>
                  <View style={inputWrapperStyle}>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{maxLotSize.toFixed(1)}</Text>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>Lots</Text>
                  </View>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 8 }}>EXPOSURE ARCHITECTURE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6' }} />
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Current: 0.00 / {maxLotSize.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <HalfGauge value={0.0} max={maxLotSize} />
                </View>
              </View>
            </View>

            <UpgradeGate
              feature="risk_guard_advanced"
              title="Advanced Risk Controls"
              description="Upgrade to Pro or Elite to access Drawdown Guards, Discipline Sentinels, and Session Permits."
            >
              {/* ── DRAWDOWN GUARD ── */}
              <View style={cardStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                    <View style={iconBoxStyle}><TrendingDown size={20} color="#64748b" /></View>
                    <View style={{ flexShrink: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Drawdown Guard</Text>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>Protect equity with automated session limits</Text>
                    </View>
                  </View>
                  <View style={{ flexShrink: 0 }}>
                    <CustomToggle value={drawdownGuard} onValueChange={setDrawdownGuard} />
                  </View>
                </View>
                <View style={{ opacity: drawdownGuard ? 1 : 0.5 }}>
                  <CustomSlider label="MAX DAILY DRAWDOWN" valuePct={maxDailyLossPercent} valueText={`${maxDailyLossPercent}% = $${((mt5Account?.balance || 500) * (maxDailyLossPercent / 100)).toFixed(0)} USD`} />
                  <CustomSlider label="MAX WEEKLY DRAWDOWN" valuePct={maxWeeklyLossPercent} valueText={`${maxWeeklyLossPercent}% = $${((mt5Account?.balance || 500) * (maxWeeklyLossPercent / 100)).toFixed(0)} USD`} />
                  <CustomSlider label="MAX MONTHLY DRAWDOWN" valuePct={maxMonthlyLossPercent} valueText={`${maxMonthlyLossPercent}% = $${((mt5Account?.balance || 500) * (maxMonthlyLossPercent / 100)).toFixed(0)} USD`} />
                  <View style={{ borderTopWidth: 1, borderTopColor: isDark ? '#222222' : '#f1f5f9', paddingTop: 16, marginTop: 8 }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 18 }}>
                      Liquidation and halts occur immediately when equity drawdowns exceed Daily (17%), Weekly (20%), or Monthly (25%) risk limits.
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── DISCIPLINE SENTINEL ── */}
              <View style={cardStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                    <View style={iconBoxStyle}><Info size={20} color="#64748b" /></View>
                    <View style={{ flexShrink: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Discipline Sentinel</Text>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>Prevent revenge trading and lock limits</Text>
                    </View>
                  </View>
                  <View style={{ flexShrink: 0 }}>
                    <CustomToggle value={disciplineSentinel} onValueChange={handleToggleDisciplineSentinel} />
                  </View>
                </View>

                <View style={{ opacity: disciplineSentinel ? 1 : 0.5, marginBottom: 30 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Daily Execution Limit</Text>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>Locks orders when slot budget is exhausted</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#3b82f6' }} />
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: isDark ? '#2a2a2e' : '#e2e8f0' }} />
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: isDark ? '#2a2a2e' : '#e2e8f0' }} />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', paddingHorizontal: 6, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}>
                        <TouchableOpacity onPress={() => { h(); const newVal = Math.max(1, dailyTrades - 1); setDailyTrades(newVal); saveRiskConfig({ max_open_trades: newVal }); }} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#64748b' }}>-</Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, fontFamily: 'Inter_900Black', color: isDark ? '#e8e8e8' : '#0f172a' }}>{dailyTrades}</Text>
                        <TouchableOpacity onPress={() => { h(); const newVal = Math.min(10, dailyTrades + 1); setDailyTrades(newVal); saveRiskConfig({ max_open_trades: newVal }); }} style={{ width: 28, height: 28, backgroundColor: isDark ? '#3b82f6' : '#0f172a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' }}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16 }}>BUDGET USAGE</Text>
                      <Text style={{ fontSize: 16, fontFamily: 'Inter_900Black', color: isDark ? '#e8e8e8' : '#0f172a', marginTop: 2 }}>1/3</Text>
                    </View>
                  </View>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: isDark ? '#222222' : '#f1f5f9', paddingTop: 24, opacity: disciplineSentinel ? 1 : 0.5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ flexShrink: 1, paddingRight: 16 }}>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Loss Cooldown Shield</Text>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>Locks execution after any losing trade</Text>
                    </View>
                    <View style={{ flexShrink: 0 }}>
                      <CustomToggle value={lossCooldown} onValueChange={setLossCooldown} />
                    </View>
                  </View>
                  <CustomSlider label="COOLDOWN DURATION" valuePct={30} valueText="30 Minutes" />

                  <View style={{
                    backgroundColor: isDark ? '#042f1a' : '#f0fdf4',
                    borderWidth: 1,
                    borderColor: isDark ? '#065f46' : '#bbf7d0',
                    borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12
                  }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e' }} />
                    <View>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 }}>STANDING BY</Text>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: isDark ? '#34d399' : '#15803d', marginTop: 2 }}>Monitoring trades...</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── SESSION SENTINEL ── */}
              <View style={cardStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                    <View style={iconBoxStyle}><Clock size={20} color="#64748b" /></View>
                    <View style={{ flexShrink: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Session Sentinel</Text>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 }}>Permit and restrict custom hourly trading windows</Text>
                    </View>
                  </View>
                  <View style={{ flexShrink: 0 }}>
                    <CustomToggle value={sessionSentinel} onValueChange={setSessionSentinel} />
                  </View>
                </View>
                <View style={{ opacity: sessionSentinel ? 1 : 0.5 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>SESSION PERMITS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                    {['London', 'Sydney', 'New York', 'Asian'].map(city => {
                      const isActive = sessions.includes(city);
                      return (
                        <TouchableOpacity
                          key={city}
                          onPress={() => toggleSession(city)}
                          style={{
                            width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                            borderWidth: 1,
                            borderColor: isActive ? (isDark ? '#065f46' : '#bbf7d0') : (isDark ? '#222222' : '#e2e8f0'),
                            borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16,
                            backgroundColor: isActive ? (isDark ? '#042f1a' : '#f0fdf4') : (isDark ? '#111111' : '#fff')
                          }}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{city}</Text>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isActive ? '#10b981' : (isDark ? '#333338' : '#e2e8f0') }} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </UpgradeGate>
          </View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}
