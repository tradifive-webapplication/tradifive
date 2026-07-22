import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Trophy, Calendar, Users, Globe, Award, PackageOpen, ChevronRight, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';
import { useStore } from '../store';
import UpgradeGate from '../components/UpgradeGate';

const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const FILTERS = ['All', 'Upcoming', 'Active', 'Finished'];

interface Competition {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  prize_pool: string;
  participants_count: number;
}

const EmptyState = ({ isDark }: { isDark: boolean }) => (
  <View style={{ alignItems: 'center', paddingVertical: 70, gap: 14 }}>
    <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: isDark ? '#1e2535' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
      <Trophy size={32} color={isDark ? '#475569' : '#94a3b8'} />
    </View>
    <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>
      No competitions yet
    </Text>
    <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#475569' : '#cbd5e1', textAlign: 'center', maxWidth: 260, lineHeight: 21 }}>
      Upcoming trading competitions will appear here when they go live. Check back soon!
    </Text>
  </View>
);

export default function Contests() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useAppTheme();
  const profile = useStore(state => state.currentUser);

  const [filter, setFilter]             = useState('All');
  const [view, setView]                 = useState<'Contests' | 'Leaderboard'>('Contests');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const fetchCompetitions = useCallback(async () => {
    try {
      // Try to fetch from competitions table if it exists
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('start_date', { ascending: true });

      if (!error && data) {
        setCompetitions(data);
      } else {
        // Table doesn't exist yet — show empty state (no mock data)
        setCompetitions([]);
      }
    } catch {
      setCompetitions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCompetitions(); }, [fetchCompetitions]);

  const onRefresh = () => { setRefreshing(true); fetchCompetitions(); };

  const filtered = competitions.filter(c => filter === 'All' || c.status === filter);

  const statusColor = (st: string) =>
    st === 'Upcoming' ? { bg: '#fff7ed', text: '#ea580c' } :
    st === 'Active'   ? { bg: '#eef2ff', text: '#4f46e5' } :
                        { bg: '#f1f5f9', text: '#64748b' };

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
    if (shadowed.filterPillActive) { shadowed.filterPillActive.backgroundColor = theme.text; }
    if (shadowed.filterPillTxtActive) shadowed.filterPillTxtActive.color = theme.background;
    if (shadowed.tabActive) shadowed.tabActive.backgroundColor = theme.text;
    if (shadowed.tabTxtActive) shadowed.tabTxtActive.color = theme.background;
    return shadowed;
  }, [isDark, theme]);

  return (
    <UpgradeGate feature="competitions">
      <View style={s.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 20 }]}>
          <Image source={require('../../assets/images/top-glow.png')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: insets.top + 160 }} resizeMode="stretch" />
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} color="#fff" />
              </View>
              <Text style={s.headerTitle}>Competitions</Text>
            </View>
            <Text style={s.headerSub}>Compete globally and win real prize pools</Text>
          </View>
        </View>

        <View style={s.mainCard}>
          {/* Tabs */}
          <View style={s.tabRow}>
            {(['Contests', 'Leaderboard'] as const).map(t => (
              <TouchableOpacity key={t} style={[s.tab, view === t && s.tabActive]} onPress={() => { h(); setView(t); }}>
                <Text style={[s.tabTxt, view === t && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {view === 'Contests' && (
            <>
              {/* Filter pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
                {FILTERS.map(f => (
                  <TouchableOpacity key={f} style={[s.filterPill, filter === f && s.filterPillActive]} onPress={() => { h(); setFilter(f); }}>
                    <Text style={[s.filterPillTxt, filter === f && s.filterPillTxtActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                  <ActivityIndicator size="large" color="#6366f1" />
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
                >
                  {filtered.length === 0 ? (
                    <EmptyState isDark={isDark} />
                  ) : (
                    filtered.map(comp => {
                      const sc = statusColor(comp.status);
                      return (
                        <TouchableOpacity key={comp.id} style={s.compCard} onPress={h}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <Text style={s.compTitle}>{comp.title}</Text>
                            <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                              <Text style={[s.statusTxt, { color: sc.text }]}>{comp.status}</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Award size={14} color="#6366f1" />
                              <Text style={s.compMeta}>{comp.prize_pool}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Users size={14} color="#64748b" />
                              <Text style={s.compMeta}>{comp.participants_count?.toLocaleString() ?? '0'}</Text>
                            </View>
                          </View>
                          <View style={s.compFooter}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Calendar size={13} color="#94a3b8" />
                              <Text style={s.compDate}>{comp.start_date} – {comp.end_date}</Text>
                            </View>
                            <ChevronRight size={16} color="#94a3b8" />
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              )}
            </>
          )}

          {view === 'Leaderboard' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120, paddingTop: 8 }}
            >
              <EmptyState isDark={isDark} />
            </ScrollView>
          )}
        </View>
      </View>
    </UpgradeGate>
  );
}

const globalStyles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#000' },
  header:            { backgroundColor: 'transparent', zIndex: 10 },
  headerTitle:       { fontSize: 26, fontFamily: 'Inter_900Black', color: '#fff' },
  headerSub:         { fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  mainCard:          { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  tabRow:            { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, gap: 8 },
  tab:               { flex: 1, paddingVertical: 10, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center' },
  tabActive:         { backgroundColor: '#0f172a' },
  tabTxt:            { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#94a3b8' },
  tabTxtActive:      { color: '#fff' },
  filterPill:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  filterPillActive:  { backgroundColor: '#0f172a' },
  filterPillTxt:     { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' },
  filterPillTxtActive: { color: '#fff' },
  compCard:          { backgroundColor: '#fff', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  compTitle:         { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0f172a', flex: 1, marginRight: 10 },
  compMeta:          { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b' },
  compFooter:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 10, marginTop: 4 },
  compDate:          { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  statusBadge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusTxt:         { fontSize: 11, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
});
