import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Animated, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Platform, StatusBar, Image, DeviceEventEmitter, RefreshControl, Alert, TextInput, Clipboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import {
  Star, Zap, Crown, Target, CircleDollarSign, Check, Bell, Flame, Calendar,
  Share2, Copy, Trophy, ShieldCheck, Gift, Sparkles, Info, Heart, Users,
  Medal, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, PlayCircle, TrendingUp, BookOpen
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { supabase } from '../utils/supabase';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const h = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const WEEKLY_STREAK_REWARDS = [
  { day: 1, xp: 20 },
  { day: 2, xp: 20 },
  { day: 3, xp: 30 },
  { day: 4, xp: 30 },
  { day: 5, xp: 50 },
  { day: 6, xp: 50 },
  { day: 7, xp: 150, bonus: true },
];

const XP_EARN_MAP = [
  { icon: TrendingUp, label: "Profitable Trade", xp: "25–100", cat: "Trading", color: "#10b981", bg: "#ecfdf5" },
  { icon: Calendar, label: "Daily Check-In", xp: "20–150", cat: "Streak", color: "#f97316", bg: "#fff7ed" },
  { icon: Target, label: "Daily Directives", xp: "50–250", cat: "Missions", color: "#3b82f6", bg: "#eff6ff" },
  { icon: ShieldAlert, label: "Zero Risk Violations", xp: "100", cat: "Discipline", color: "#f59e0b", bg: "#fffbeb" },
  { icon: Star, label: "Weekly Consistency", xp: "200", cat: "Discipline", color: "#8b5cf6", bg: "#faf5ff" },
  { icon: BookOpen, label: "Journal Entry", xp: "50", cat: "Journal", color: "#14b8a6", bg: "#f0fdfa" },
  { icon: Medal, label: "Connect MT5 Broker", xp: "500", cat: "Platform", color: "#10b981", bg: "#ecfdf5" },
];

export default function Rewards() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useAppTheme();
  
  const s = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      shadowed[key] = { ...(globalStyles as any)[key] };
      const bg = shadowed[key].backgroundColor;
      if (bg === '#fff' || bg === '#ffffff' || bg === '#fafafa') shadowed[key].backgroundColor = theme.card;
      else if (bg === '#f4f4f6' || bg === '#f8fafc' || bg === '#090d16') shadowed[key].backgroundColor = theme.background;
      
      const c = shadowed[key].color;
      if (c === '#0f172a' || c === '#1e293b' || c === '#000' || c === '#000000') shadowed[key].color = theme.text;
      
      const bc = shadowed[key].borderColor;
      if (bc === '#f1f5f9' || bc === '#eef0f3' || bc === '#e2e8f0' || bc === '#ffffff') shadowed[key].borderColor = theme.cardBorder;
    }
    // Overrides
    if (shadowed.filterPillActive) {
      shadowed.filterPillActive.backgroundColor = theme.text;
      shadowed.filterPillActive.borderColor = theme.text;
    }
    if (shadowed.catPillActive) {
      shadowed.catPillActive.backgroundColor = theme.text;
      shadowed.catPillActive.borderColor = theme.text;
    }
    if (shadowed.filterPillTxtActive) shadowed.filterPillTxtActive.color = theme.background;
    if (shadowed.catPillTxtActive) shadowed.catPillTxtActive.color = theme.background;
    if (shadowed.unreadTxt) shadowed.unreadTxt.color = theme.background;
    
    return shadowed;
  }, [isDark, theme]);

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());

  const currentUser = useStore(state => state.currentUser);

  // Check-in state mimicking web storage
  const [claimDay, setClaimDay] = useState(1);
  const [isClaimedToday, setIsClaimedToday] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [xpLedger, setXpLedger] = useState<any[]>([]);

  const fetchXpData = async () => {
    if (!currentUser?.id) return;
    try {
      // Fetch user profile stats
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('xp_total, xp_level, streak_days')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileErr) throw profileErr;
      if (profile) {
        setUserProfile(profile);
        const calcDay = ((profile.streak_days || 0) % 7) || 1;
        setClaimDay(calcDay);
      }

      // Fetch transactions ledger
      const { data: ledgerData, error: ledgerErr } = await supabase
        .from('user_xp_ledger')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (ledgerErr) throw ledgerErr;
      if (ledgerData) {
        setXpLedger(ledgerData);

        // Check if already claimed today
        const todayStr = new Date().toISOString().split('T')[0];
        const hasClaimedToday = ledgerData.some(entry => 
          entry.event_type === 'check_in' && 
          entry.created_at && entry.created_at.startsWith(todayStr)
        );
        setIsClaimedToday(hasClaimedToday);
      }
    } catch (err) {
      console.error('Error fetching rewards/XP data:', err);
    }
  };

  useEffect(() => {
    fetchXpData();
  }, [currentUser]);

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyleState(style);
    });
    return () => listener.remove();
  }, []);

  const [tasks, setTasks] = useState<any[]>([]);

  const benefits: any[] = [];

  // Animated Scroll Node
  const scrollY = useRef(new Animated.Value(0)).current;

  // Sync scroll with global floating navigation bar
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      DeviceEventEmitter.emit('scrollUpdate', value);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(() => {
    h();
    setRefreshing(true);
    fetchXpData().then(() => setRefreshing(false));
  }, [currentUser]);

  const handleCheckin = async () => {
    if (!currentUser?.id) return;
    if (isClaimedToday) {
      Alert.alert("Already Claimed", "You have checked-in today! Return tomorrow.");
      return;
    }
    h();

    const reward = WEEKLY_STREAK_REWARDS[claimDay - 1];
    const rewardXp = reward.bonus ? 150 : reward.xp;

    try {
      // Insert into user_xp_ledger
      const { error: ledgerErr } = await supabase
        .from('user_xp_ledger')
        .insert([{
          user_id: currentUser.id,
          xp_amount: rewardXp,
          event_type: 'check_in',
          description: `Daily Check-In (Day ${claimDay})`,
          source_page: 'rewards'
        }]);

      if (ledgerErr) throw ledgerErr;

      // Update profile stats
      const newStreak = (userProfile?.streak_days || 0) + 1;
      const newXpTotal = (userProfile?.xp_total || 0) + rewardXp;
      const newLevel = Math.floor(newXpTotal / 1000) + 1;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          streak_days: newStreak,
          xp_total: newXpTotal,
          xp_level: newLevel
        })
        .eq('id', currentUser.id);

      if (profileErr) throw profileErr;

      Alert.alert(
        reward.bonus ? "🎁 Gold Mystery Chest!" : "Daily Reward Claimed",
        `You earned +${rewardXp} XP!`
      );

      // Reload fresh data from database
      fetchXpData();
    } catch (err) {
      console.error('Error claiming check-in:', err);
      Alert.alert("Claim Failed", "Could not complete check-in. Please try again.");
    }
  };

  const handleCopyCode = () => {
    h();
    Clipboard.setString('TF-CREATOR-XP');
    Alert.alert("Code Copied!", "Share this code with fellow traders to earn +500 XP.");
  };

  // Smart Reveal Header Calculations
  const headerHeight = insets.top + 64;

  const clampedScroll = Animated.diffClamp(
    scrollY.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolateLeft: 'clamp'
    }),
    0,
    headerHeight
  );

  const headerTranslateY = clampedScroll.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const smartHeaderOpacity = scrollY.interpolate({
    inputRange: [140, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={s.container}>
      <StatusBar barStyle={headerStyle === 'simple' ? "dark-content" : "light-content"} />

      <Image
        source={require('../../assets/images/top-glow.png')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 150, opacity: headerStyle === 'simple' ? 0 : 0.8 }}
        resizeMode="stretch"
      />

      {/* ── SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          backgroundColor: '#000',
          zIndex: 2000,
          paddingTop: insets.top,
          opacity: smartHeaderOpacity,
          transform: [{ translateY: headerTranslateY }],
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          overflow: 'hidden'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 }}>
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>
              Rewards
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} onPress={() => { h(); router.push('/notifications' as any); }}>
                <Bell size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { h(); router.setParams({ openProfile: 'true' }); }}
                style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                {useStore(state => state.currentUser?.avatar_url) ? (
                  <Image source={{ uri: useStore(state => state.currentUser?.avatar_url) }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Image source={require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92, backgroundColor: headerStyle === 'simple' ? (isDark ? theme.card : '#ffffff') : 'transparent', borderBottomWidth: headerStyle === 'simple' ? 1 : 0, borderBottomColor: isDark ? theme.cardBorder : '#e2e8f0', position: 'relative', transform: headerStyle === 'simple' ? [] : [{ scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }] }}>
        <Animated.View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 12 : 38, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
          <Text style={{ color: headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Rewards</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : 'white'} /></TouchableOpacity>
            <TouchableOpacity onPress={() => { h(); router.setParams({ openProfile: 'true' }); }} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: headerStyle === 'simple' ? (isDark ? theme.cardBorder : 'rgba(0,0,0,0.1)') : 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              {useStore(state => state.currentUser?.avatar_url) ? (
                <Image source={{ uri: useStore(state => state.currentUser?.avatar_url) }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Image source={require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD ── */}
      <Animated.View style={[s.mainCard, { marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40, borderTopRightRadius: headerStyle === 'simple' ? 0 : 40 }]}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 260, paddingTop: 24 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" progressViewOffset={10} />}
        >
          <Animated.View style={{ transform: headerStyle === 'simple' ? [] : [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            <View style={{ paddingHorizontal: 20 }}>

              {/* PERFECT REWARD METRICS */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
                {(() => {
                  const tradesCount = useStore(state => state.trades.length);
                  const winningTrades = useStore(state => state.trades.filter(t => (t.profit || 0) > 0).length);
                  const winRate = tradesCount > 0 
                    ? Math.round((winningTrades / tradesCount) * 100)
                    : 0;

                  const xpVal = userProfile?.xp_total ?? 0;
                  const level = userProfile?.xp_level ?? 1;
                  const streak = userProfile?.streak_days ?? 0;
                  const nextLvlXp = level * 1000;
                  const currentLvlProgress = Math.round(((xpVal % 1000) / 1000) * 100);

                  return [
                    { label: 'Discipline Level', value: `Lvl ${level}`, sub: `Trades: ${tradesCount}`, icon: Crown, color: '#a855f7', bg: '#faf5ff' },
                    { label: 'Current XP', value: xpVal.toLocaleString(), sub: `Next Lvl: ${nextLvlXp}`, icon: Star, color: '#3b82f6', bg: '#eff6ff', progress: currentLvlProgress },
                    { label: 'Streak Days', value: `${streak} Days`, sub: 'Daily Logins', icon: Zap, color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'Bounty Balance', value: `$${(tradesCount * 250 + 1200).toLocaleString()}`, sub: 'Available Rewards', icon: CircleDollarSign, color: '#10b981', bg: '#ecfdf5' },
                  ].map((m, i) => (
                    <View key={i} style={s.metricCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={s.metricLabel}>{m.label}</Text>
                        <View style={[s.iconBox, { backgroundColor: m.bg }]}><m.icon size={14} color={m.color} /></View>
                      </View>
                      <Text style={s.metricVal}>{m.value}</Text>
                      {m.sub && <Text style={s.metricSub}>{m.sub}</Text>}
                      {m.progress !== undefined && (
                        <View style={s.progressTrack}>
                          <View style={[s.progressFill, { width: `${m.progress}%` }]} />
                        </View>
                      )}
                    </View>
                  ));
                })()}
              </ScrollView>

              {/* 7-DAY CONSISTENCY CHECK-IN */}
              <View style={[s.card, { padding: 18, marginBottom: 24 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[s.iconBox, { backgroundColor: '#ffedd5' }]}><Flame size={16} color="#ea580c" /></View>
                    <View>
                      <Text style={s.cardTitle}>Login Consistency Check-In</Text>
                      <Text style={s.cardSub}>Maintain streak for large Gold Chest rewards.</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#ffedd5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#ea580c', letterSpacing: 0.5 }}>WEEK 1</Text>
                  </View>
                </View>

                {/* Day blocks scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
                  {WEEKLY_STREAK_REWARDS.map((item) => {
                    const isCompleted = item.day < claimDay;
                    const isCurrent = item.day === claimDay && !isClaimedToday;
                    const isClaimedCurrent = item.day === claimDay && isClaimedToday;

                    return (
                      <View
                        key={item.day}
                        style={[
                          s.dayBlock,
                          isCompleted && { backgroundColor: isDark ? '#111111' : '#f8fafc', borderColor: 'transparent', opacity: 0.6 },
                          isClaimedCurrent && { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
                          isCurrent && { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
                          item.day === 7 && !isCompleted && !isClaimedCurrent && { backgroundColor: '#fffbeb', borderColor: '#fde047' }
                        ]}
                      >
                        <Text style={[s.dayText, isCompleted && { color: '#94a3b8' }]}>Day {item.day}</Text>
                        <View style={{ marginVertical: 6 }}>
                          {isCompleted || isClaimedCurrent ? (
                            <Check size={16} color="#10b981" />
                          ) : item.day === 7 ? (
                            <Gift size={16} color="#eab308" style={{ transform: [{ rotate: '-10deg' }] }} />
                          ) : (
                            <CircleDollarSign size={14} color="#3b82f6" />
                          )}
                        </View>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: isCompleted ? '#94a3b8' : '#0f172a' }}>
                          +{item.bonus ? "150" : item.xp} XP
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', flex: 1, paddingRight: 10 }}>
                    {isClaimedToday ? "Streak saved. Returns tomorrow." : "Claim daily login to extend active streak."}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCheckin}
                    disabled={isClaimedToday}
                    style={[s.claimBtn, isClaimedToday && { backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderColor: 'transparent' }]}
                  >
                    <Text style={[s.claimBtnTxt, isClaimedToday && { color: '#94a3b8' }]}>
                      {isClaimedToday ? "Checked-In" : "Check-In"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>



              {/* DAILY DIRECTIVES */}
              <View style={s.secRow}>
                <Text style={s.secLabel}>DAILY DIRECTIVES</Text>
                <Text style={s.resetTxt}>Resets in 4h 12m</Text>
              </View>

              <View style={[s.card, { paddingVertical: 4, marginBottom: 24 }]}>
                {tasks.map((t, idx, arr) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => { h(); setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: !x.done } : x)); }}
                    style={[
                      s.taskRow,
                      t.done && { opacity: 0.5, backgroundColor: isDark ? '#111111' : '#f8fafc' },
                      idx === arr.length - 1 && s.lastRow
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[s.checkbox, t.done && { backgroundColor: '#000000', borderColor: '#000000' }]}>
                        {t.done && <Check size={12} color="#ffffff" />}
                      </View>
                      <Text style={[s.taskText, t.done && { textDecorationLine: 'line-through', color: '#94a3b8' }]}>{t.text}</Text>
                    </View>
                    <View style={[s.xpPill, t.done && { backgroundColor: '#e2e8f0' }]}>
                      <Text style={[s.xpPillTxt, t.done && { color: '#94a3b8' }]}>{t.reward}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* XP SURGE BANNER */}
              <View style={s.surgeBanner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, fontFamily: 'Inter_700Bold' }}>SPECIAL OFFER</Text>
                </View>
                <Text style={{ fontSize: 22, color: '#ffffff', fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>XP Surge Active</Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontFamily: 'Inter_500Medium', lineHeight: 18 }}>
                  Get 2.5x XP for every journal entry today.
                </Text>
                <TouchableOpacity style={s.surgeBtn} onPress={h}>
                  <Text style={{ fontSize: 13, color: isDark ? '#e8e8e8' : '#000000', fontFamily: 'Inter_700Bold' }}>View Multipliers</Text>
                </TouchableOpacity>
              </View>

              {/* XP EARN MAP */}
              <View style={s.secRow}>
                <Text style={s.secLabel}>ALL WAYS TO EARN XP</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
                {XP_EARN_MAP.map((e, idx) => (
                  <View key={idx} style={[s.card, { width: (SCREEN_WIDTH - 52) / 2, padding: 14, marginBottom: 0, justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View style={[s.iconBox, { backgroundColor: e.bg, width: 28, height: 28, borderRadius: 8 }]}><e.icon size={14} color={e.color} /></View>
                      <Text style={{ fontSize: 8, fontFamily: 'Inter_700Bold', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' }}>{e.cat}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a', lineHeight: 16 }} numberOfLines={2}>{e.label}</Text>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#10b981', marginTop: 4 }}>+{e.xp} XP</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* BENEFIT STORE */}
              <View style={s.secRow}>
                <Text style={s.secLabel}>BENEFIT STORE</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
              >
                {benefits.map(b => (
                  <View key={b.id} style={s.benefitCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <View style={s.benefitIcon}><b.icon size={16} color="#0f172a" /></View>
                      <Text style={s.benefitType}>{b.type}</Text>
                    </View>
                    <Text style={s.benefitTitle} numberOfLines={2}>{b.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <CircleDollarSign size={12} color="#10b981" />
                      <Text style={{ fontSize: 13, color: '#10b981', fontFamily: 'Inter_700Bold' }}>{b.cost.toLocaleString()} XP</Text>
                    </View>
                    <TouchableOpacity style={s.unlockBtn} onPress={h}>
                      <Text style={s.unlockBtnTxt}>Unlock Benefit</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* XP LEDGER */}
              <View style={[s.secRow, { marginTop: 12 }]}>
                <Text style={s.secLabel}>XP TRANSACTION LEDGER</Text>
              </View>

              <View style={s.ordersTable}>
                {xpLedger.map((r, i, arr) => (
                  <View key={r.id || i} style={[s.orderRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a' }}>{r.description || r.event_type}</Text>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 4 }}>
                        {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={s.multPill}><Text style={s.multTxt}>1.0x</Text></View>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: '#10b981' }}>+{r.xp_amount} XP</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* MILESTONE ROADMAP */}
              <View style={[s.card, { padding: 18 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>MILESTONE ROADMAP</Text>
                  <Trophy size={16} color="#fbbf24" fill="#fbbf24" />
                </View>
                <Text style={s.cardTitle}>Milestone Roadmap</Text>
                <Text style={s.cardSub}>
                  Reach Level 20 to unlock "The Institutional Vault" indicators.
                </Text>
                <View style={[s.progressTrack, { marginTop: 16, backgroundColor: '#e2e8f0' }]}>
                  {(() => {
                    const level = userProfile?.xp_level ?? 1;
                    const percent = Math.min(100, Math.round((level / 20) * 100));
                    return (
                      <View style={[s.progressFill, { width: `${percent}%`, backgroundColor: '#3b82f6' }]} />
                    );
                  })()}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>Progress to Lvl 20</Text>
                  {(() => {
                    const level = userProfile?.xp_level ?? 1;
                    const percent = Math.min(100, Math.round((level / 20) * 100));
                    return (
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#3b82f6' }}>{percent}% Complete</Text>
                    );
                  })()}
                </View>
              </View>

            </View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
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
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    zIndex: 5,
  },
  metricCard: {
    width: SCREEN_WIDTH * 0.52,
    backgroundColor: '#fafafa',
    borderRadius: 24,
    padding: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  metricSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 0,
    fontFamily: 'Inter_500Medium',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  secRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  secLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resetTxt: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    marginTop: 2,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  xpPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpPillTxt: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  surgeBanner: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#090d16',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  surgeBtn: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  benefitCard: {
    width: SCREEN_WIDTH * 0.44,
    backgroundColor: '#fafafa',
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitType: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
    marginTop: 8,
  },
  unlockBtn: {
    marginTop: 16,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  unlockBtnTxt: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  ordersTable: {
    backgroundColor: '#fafafa',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  multPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  multTxt: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#64748b',
  },
  roadmap: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBlock: {
    width: 72,
    minHeight: 84,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
  },
  dayText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  claimBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  claimBtnTxt: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  }
});
