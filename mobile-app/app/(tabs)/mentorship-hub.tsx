import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, RefreshControl, Platform, DeviceEventEmitter, ScrollView, StatusBar, TextInput } from 'react-native';
import { Bell, GraduationCap, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { supabase } from '../utils/supabase';
import { useStore } from '../store';

import { useAppTheme } from '../../hooks/useAppTheme';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

interface Student {
  id: string;
  student_id: string;
  profiles?: { first_name: string; last_name: string; username: string; avatar_url?: string };
  win_rate?: number;
  tier?: string;
}

const TIER_COLORS: Record<string, string> = {
  Advanced: '#a855f7',
  Intermediate: '#3b82f6',
  Beginner: '#94a3b8',
};

const TIER_BG: Record<string, string> = {
  Advanced: '#faf5ff',
  Intermediate: '#eff6ff',
  Beginner: '#f8fafc',
};

export default function MentorshipHubScreen() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useStore(state => state.currentUser);
  const [refreshing, setRefreshing] = useState(false);
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => { subscription.remove(); };
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('mentor_students')
        .select('*, profiles(first_name, last_name, username, avatar_url)')
        .eq('mentor_id', profile.id);
      if (!error && data) setStudents(data);
      else setStudents([]);
    } catch { setStudents([]); }
  }, [profile?.id]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    h();
    fetchStudents().finally(() => setRefreshing(false));
  }, [fetchStudents]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 72;
  const clampedScroll = Animated.diffClamp(scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' }), 0, headerHeight);
  const headerTranslateY = clampedScroll.interpolate({ inputRange: [0, headerHeight], outputRange: [0, -headerHeight], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' });

  const filteredStudents = students.filter(s => {
    const name = `${s.profiles?.first_name ?? ''} ${s.profiles?.last_name ?? ''}`.toLowerCase();
    const username = (s.profiles?.username ?? '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || username.includes(q);
  });

  // Real cohort stats derived from students
  const avgWinRate = students.length > 0
    ? (students.reduce((a, s) => a + (s.win_rate ?? 0), 0) / students.length).toFixed(1) + '%'
    : '—';
  const COMMUNITY_STATS = [
    { label: 'Total Students', value: students.length.toString(), delta: null, up: null },
    { label: 'Avg Win Rate', value: avgWinRate, delta: null, up: null },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={headerStyle === 'simple' ? "dark-content" : "light-content"} />

      <Image source={require('../../assets/images/top-glow.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 150, opacity: headerStyle === 'simple' ? 0 : 0.8 }} resizeMode="stretch" />

      {/* ── SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight, backgroundColor: '#000', zIndex: 2000, paddingTop: insets.top + 8, opacity: headerOpacity, transform: [{ translateY: headerTranslateY }], borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 56 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>Mentorship Hub</Text>
            </View>
            <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ height: headerStyle === 'simple' ? insets.top + 74 : insets.top + 104, backgroundColor: headerStyle === 'simple' ? '#ffffff' : 'transparent', borderBottomWidth: headerStyle === 'simple' ? 1 : 0, borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0', position: 'relative', transform: headerStyle === 'simple' ? [] : [{ scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }] }}>
        <Animated.View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 16 : 38, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: headerStyle === 'simple' ? '#000000' : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Mentorship Hub</Text>
          </View>
          <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} color={headerStyle === 'simple' ? '#000000' : 'white'} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD ── */}
      <Animated.View style={[styles.card, { marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40, borderTopRightRadius: headerStyle === 'simple' ? 0 : 40 }]}>
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 260, paddingTop: 24 }} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" progressViewOffset={10} />}>
          <Animated.View style={{ transform: headerStyle === 'simple' ? [] : [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            <View style={{ paddingHorizontal: 20 }}>

              {/* Quick Actions */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                <TouchableOpacity style={[styles.metricCard, { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 0 }]} onPress={() => h()}>
                  <GraduationCap size={22} color="#3b82f6" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>New Lesson</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.metricCard, { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 0 }]} onPress={() => h()}>
                  <Activity size={22} color="#10b981" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Insights</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.metricCard, { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 0 }]} onPress={() => h()}>
                  <Users size={22} color="#a855f7" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>CRM</Text>
                </TouchableOpacity>
              </View>

              {/* Community Stats (2x2 Grid) */}
              <Text style={[styles.sectionTitle, { fontSize: 16, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }]}>COHORT PERFORMANCE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 28 }}>
                {COMMUNITY_STATS.map((stat, i) => (
                  <View key={i} style={[styles.metricCard, { width: (SCREEN_WIDTH - 52) / 2, padding: 14, marginBottom: 0, minHeight: 0 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Text style={styles.metricLabel}>{stat.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[styles.metricValue, { fontSize: 20, marginTop: 0 }]}>{stat.value}</Text>
                      {stat.delta && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          {stat.up === true ? <ArrowUpRight size={10} color="#10b981" /> : stat.up === false ? <ArrowDownRight size={10} color="#ef4444" /> : null}
                          <Text style={[styles.metricSub, { fontSize: 10, fontFamily: 'Inter_600SemiBold', marginTop: 0, color: stat.up === true ? '#10b981' : stat.up === false ? '#ef4444' : '#94a3b8' }]}>{stat.delta}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Student CRM Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={[styles.sectionTitle, { fontSize: 16, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 0 }]}>ACTIVE STUDENTS</Text>
              </View>

              {/* Search Bar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 20, borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
                <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search students..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#e8e8e8' : '#0f172a', padding: 0 }}
                />
              </View>

              {/* Active Students List */}
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const studentTier = student.tier || 'Beginner';
                  const tierColor = TIER_COLORS[studentTier] || '#94a3b8';
                  const tierBg = TIER_BG[studentTier] || '#f8fafc';
                  const fullName = `${student.profiles?.first_name ?? ''} ${student.profiles?.last_name ?? ''}`.trim() || 'Trader';
                  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                  return (
                    <TouchableOpacity key={student.id} style={styles.studentCard} onPress={() => h()}>
                      <View style={[styles.studentAvatar, { backgroundColor: tierColor + '15' }]}>
                        <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: tierColor }}>{initials}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{fullName}</Text>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b' }}>@{student.profiles?.username ?? 'username'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <View style={[styles.tierBadge, { backgroundColor: tierBg }]}>
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: tierColor }}>{studentTier}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <TrendingUp size={12} color="#10b981" />
                          <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#10b981' }}>{student.win_rate ?? 0}% Win</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>No students found</Text>
                </View>
              )}

            </View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  card: { flex: 1, backgroundColor: '#f8fafc', zIndex: 5 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 12 },
  metricCard: {
    backgroundColor: '#fafafa', borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 2, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  metricLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
  metricValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#0f172a', marginTop: 2, fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  metricSub: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 },
  studentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fafafa', borderRadius: 24, padding: 16, marginBottom: 16,
    borderWidth: 2, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
