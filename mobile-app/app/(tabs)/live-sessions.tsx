import React, { useState, useEffect, useCallback } from 'react';
import ComingSoonVeil from '../../components/ComingSoonVeil';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { Video, Calendar, Clock, Radio, Users, PlayCircle, PackageOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';
import { useStore } from '../store';
import UpgradeGate from '../components/UpgradeGate';

const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

interface LiveSession {
  id: string;
  title: string;
  scheduled_at: string;
  platform: string;
  rsvp_count: number;
  status: 'upcoming' | 'live' | 'ended';
}

interface Recording {
  id: string;
  title: string;
  recorded_at: string;
  duration_minutes: number;
  views_count: number;
  recording_url: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  } catch { return ''; }
}

const EmptyState = ({ isDark, label }: { isDark: boolean; label: string }) => (
  <View style={{ alignItems: 'center', paddingVertical: 60, gap: 14 }}>
    <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: isDark ? '#1e2535' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
      <Video size={32} color={isDark ? '#475569' : '#94a3b8'} />
    </View>
    <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>
      No {label} yet
    </Text>
    <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#475569' : '#cbd5e1', textAlign: 'center', maxWidth: 260, lineHeight: 21 }}>
      {label === 'sessions' ? 'Upcoming live sessions from instructors will appear here.' : 'Past session recordings will appear here once available.'}
    </Text>
  </View>
);

export default function LiveSessionsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useAppTheme();

  const [tab, setTab]             = useState<'upcoming' | 'recordings'>('upcoming');
  const [sessions, setSessions]   = useState<LiveSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [sessRes, recRes] = await Promise.all([
        supabase.from('live_sessions').select('*').order('scheduled_at', { ascending: true }),
        supabase.from('session_recordings').select('*').order('recorded_at', { ascending: false }),
      ]);

      setSessions(!sessRes.error && sessRes.data ? sessRes.data : []);
      setRecordings(!recRes.error && recRes.data ? recRes.data : []);
    } catch {
      setSessions([]);
      setRecordings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const s = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      shadowed[key] = { ...(globalStyles as any)[key] };
      const bg = shadowed[key].backgroundColor;
      if (bg === '#fff' || bg === '#ffffff') shadowed[key].backgroundColor = theme.card;
      else if (bg === '#f8fafc' || bg === '#f4f4f6') shadowed[key].backgroundColor = theme.background;
      const c = shadowed[key].color;
      if (c === '#0f172a' || c === '#1e293b') shadowed[key].color = theme.text;
      const bc = shadowed[key].borderColor;
      if (bc === '#f1f5f9' || bc === '#e2e8f0') shadowed[key].borderColor = theme.cardBorder;
    }
    if (shadowed.tabActive) shadowed.tabActive.backgroundColor = theme.text;
    if (shadowed.tabTxtActive) shadowed.tabTxtActive.color = theme.background;
    return shadowed;
  }, [isDark, theme]);

  return (
    <UpgradeGate feature="live_sessions">
      <View style={s.container}>
        <StatusBar barStyle="light-content" />

        <View style={[s.header, { paddingTop: insets.top + 20 }]}>
          <Image source={require('../../assets/images/top-glow.png')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: insets.top + 160 }} resizeMode="stretch" />
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={18} color="#fff" />
              </View>
              <Text style={s.headerTitle}>Live Sessions</Text>
            </View>
            <Text style={s.headerSub}>Real-time coaching and market analysis</Text>
          </View>
        </View>

        <View style={s.mainCard}>
          {/* Tabs */}
          <View style={s.tabRow}>
            {(['upcoming', 'recordings'] as const).map(t => (
              <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => { h(); setTab(t); }}>
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                  {t === 'upcoming' ? 'Upcoming' : 'Recordings'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120, paddingTop: 8 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            >
              {tab === 'upcoming' && (
                sessions.length === 0 ? <EmptyState isDark={isDark} label="sessions" /> :
                sessions.map(sess => (
                  <TouchableOpacity key={sess.id} style={s.sessionCard} onPress={h}>
                    {sess.status === 'live' && (
                      <View style={s.liveBadge}>
                        <Radio size={11} color="#fff" />
                        <Text style={s.liveTxt}>LIVE NOW</Text>
                      </View>
                    )}
                    <Text style={s.sessionTitle}>{sess.title}</Text>
                    <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} color="#94a3b8" />
                        <Text style={s.metaTxt}>{formatDate(sess.scheduled_at)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color="#94a3b8" />
                        <Text style={s.metaTxt}>{formatTime(sess.scheduled_at)}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Users size={13} color="#6366f1" />
                        <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#6366f1' }}>{sess.rsvp_count} RSVPs</Text>
                      </View>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>{sess.platform}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
              {tab === 'recordings' && (
                recordings.length === 0 ? <EmptyState isDark={isDark} label="recordings" /> :
                recordings.map(rec => (
                  <TouchableOpacity key={rec.id} style={s.recCard} onPress={h}>
                    <PlayCircle size={20} color="#6366f1" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.recTitle}>{rec.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                        <Text style={s.metaTxt}>{formatDate(rec.recorded_at)}</Text>
                        <Text style={s.metaTxt}>{rec.duration_minutes}m</Text>
                        <Text style={s.metaTxt}>{rec.views_count?.toLocaleString()} views</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
          <ComingSoonVeil
            featureTitle="Live Trading Sessions"
            subtitle="London & New York market open live streams and interactive webinars are launching soon."
          />
        </View>
      </View>
    </UpgradeGate>
  );
}

const globalStyles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },
  header:       { backgroundColor: 'transparent', zIndex: 10 },
  headerTitle:  { fontSize: 26, fontFamily: 'Inter_900Black', color: '#fff' },
  headerSub:    { fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  mainCard:     { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  tabRow:       { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 8 },
  tab:          { flex: 1, paddingVertical: 10, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center' },
  tabActive:    { backgroundColor: '#0f172a' },
  tabTxt:       { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#94a3b8' },
  tabTxtActive: { color: '#fff' },
  sessionCard:  { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  liveBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 8 },
  liveTxt:      { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#fff', letterSpacing: 0.5 },
  sessionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0f172a' },
  recCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  recTitle:     { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0f172a' },
  metaTxt:      { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
});
