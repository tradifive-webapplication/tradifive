import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, Alert, Dimensions, Animated, DeviceEventEmitter
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import {
  TrendingUp, Users, DollarSign, Eye, Heart,
  ChevronRight, BarChart2, Video, FileText, Mic,
  ArrowUp, ArrowDown, Plus, Crown, GraduationCap, Cpu, MessageCircle, PlayCircle, Bell
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store';
import { supabase } from '../utils/supabase';

import { useAppTheme } from '../../hooks/useAppTheme';
const { width } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const TIMEFRAMES = ['24H', '7D', '30D', 'ALL'];
const CONTENT = [
  { id: '1', type: 'video', title: 'My 5-Step Entry Framework', views: 42800, likes: 2340, revenue: '$182.50', date: 'Jun 4' },
  { id: '2', type: 'post', title: 'Why 90% of traders fail at risk management', views: 28100, likes: 1870, revenue: '$94.20', date: 'Jun 2' },
  { id: '3', type: 'video', title: 'LIVE: London Session Breakdown', views: 19400, likes: 980, revenue: '$67.80', date: 'May 30' },
  { id: '4', type: 'audio', title: 'Trading Psychology Deep Dive', views: 11600, likes: 540, revenue: '$38.90', date: 'May 27' },
  { id: '5', type: 'post', title: 'Gold setup for next week (XAU/USD)', views: 9200, likes: 720, revenue: '$31.10', date: 'May 25' },
];

const STATS_BY_TIMEFRAME: Record<string, { followers: string; followerChange: number; revenue: string; revenueChange: number; views: string; viewsChange: number; engagement: string }> = {
  '24H': { followers: '24,812', followerChange: 48, revenue: '$92.30', revenueChange: 12, views: '3,240', viewsChange: 8, engagement: '5.4%' },
  '7D': { followers: '24,812', followerChange: 312, revenue: '$614.50', revenueChange: 18, views: '22,100', viewsChange: 14, engagement: '5.4%' },
  '30D': { followers: '24,812', followerChange: 1240, revenue: '$2,180.00', revenueChange: 24, views: '111,200', viewsChange: 31, engagement: '5.4%' },
  'ALL': { followers: '24,812', followerChange: 0, revenue: '$18,420.00', revenueChange: 0, views: '1.2M', viewsChange: 0, engagement: '5.4%' },
};

const TYPE_ICON: Record<string, any> = { video: Video, post: FileText, audio: Mic };
const TYPE_COLOR: Record<string, string> = { video: '#ef4444', post: '#3b82f6', audio: '#8b5cf6' };

const ELITE_TOOLS = [
  { id: 'mentorship', icon: GraduationCap, label: 'Mentorship Hub', color: '#3b82f6', bg: '#eff6ff', route: '/(tabs)/mentorship-hub' },
  { id: 'store', icon: Cpu, label: 'My Store', color: '#10b981', bg: '#ecfdf5', route: '/(tabs)/my-store' },
  { id: 'channels', icon: MessageCircle, label: 'Private Channels', color: '#a855f7', bg: '#faf5ff', route: '/(tabs)/channels' },
  { id: 'live', icon: PlayCircle, label: 'Live Sessions', color: '#f43f5e', bg: '#fff1f2', route: '/(tabs)/live-sessions' },
];

export default function CreatorStudio() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useGlobalSearchParams();
  const [timeframe, setTimeframe] = useState('7D');
  
  const currentUser = useStore(state => state.currentUser);
  const [posts, setPosts] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(24812);

  useEffect(() => {
    if (!currentUser?.id) return;

    const loadCreatorData = async () => {
      try {
        const { data: postsData, error: postsErr } = await supabase
          .from('social_posts')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (postsErr) throw postsErr;
        if (postsData) setPosts(postsData);

        const { count, error: countErr } = await supabase
          .from('social_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', currentUser.id);

        if (countErr) throw countErr;
        if (count !== null) setFollowersCount(count);
      } catch (err) {
        console.error('Error loading creator studio data:', err);
      }
    };

    loadCreatorData();
  }, [currentUser]);

  // Derived Performance Metrics
  const realViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);
  const realLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const realRevenue = realViews * 0.005;
  const realEngagement = realViews > 0 ? ((realLikes / realViews) * 100).toFixed(1) + '%' : '0.0%';

  // Format functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const currentStats = {
    followers: formatNumber(followersCount),
    followerChange: 0,
    revenue: `$${realRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    revenueChange: 0,
    views: formatNumber(realViews),
    viewsChange: 0,
    engagement: realEngagement
  };

  const contentToRender = posts.map(p => ({
    id: p.id,
    type: p.media_url ? 'video' : 'post',
    title: p.content || 'Untitled post',
    views: p.views_count || 0,
    likes: p.likes_count || 0,
    revenue: `$${((p.views_count || 0) * 0.005).toFixed(2)}`,
    date: new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  const stats = currentStats;
  const headerStyle = params.headerStyle === 'simple' ? 'simple' : 'smart';

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 60;
  
  const clampedScroll = Animated.diffClamp(scrollY, 0, headerHeight);
  const headerTranslateY = clampedScroll.interpolate({ inputRange: [0, headerHeight], outputRange: [0, -headerHeight], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' });

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => { DeviceEventEmitter.emit('scrollUpdate', value); });
    return () => scrollY.removeListener(listener);
  }, []);

  return (
    <View style={s.container}>
      <StatusBar barStyle={headerStyle === 'simple' ? "dark-content" : "light-content"} />

      <Image source={require('../../assets/images/top-glow.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 150, opacity: headerStyle === 'simple' ? 0 : 0.8 }} resizeMode="stretch" />

      {/* ── SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight, backgroundColor: '#000', zIndex: 2000, paddingTop: insets.top, opacity: headerOpacity, transform: [{ translateY: headerTranslateY }], borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 }}>
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>Creator Dashboard</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><Bell size={22} color="#fff" /></TouchableOpacity>
              <TouchableOpacity onPress={() => { h(); Alert.alert('Create Content', 'Opening content creation flow...'); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92, backgroundColor: headerStyle === 'simple' ? '#ffffff' : 'transparent', borderBottomWidth: headerStyle === 'simple' ? 1 : 0, borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0', position: 'relative', transform: headerStyle === 'simple' ? [] : [{ scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }] }}>
        <Animated.View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 12 : 38, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
          <Text style={{ color: headerStyle === 'simple' ? '#000000' : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Creator Dashboard</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><Bell size={22} color={headerStyle === 'simple' ? '#000000' : 'white'} /></TouchableOpacity>
            <TouchableOpacity onPress={() => { h(); Alert.alert('Create Content', 'Opening content creation flow...'); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} color={headerStyle === 'simple' ? '#000000' : 'white'} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD ── */}
      <Animated.View style={[s.mainCard, { marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40, borderTopRightRadius: headerStyle === 'simple' ? 0 : 40 }]}>
        <Animated.ScrollView 
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 260, paddingTop: 24 }}
        >
          <Animated.View style={{ transform: headerStyle === 'simple' ? [] : [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            <View style={{ paddingTop: headerStyle === 'simple' ? 20 : 0 }}>

              {/* Timeframes moved below the tools, right above Stats */}
              <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={[s.sectionTitle, { fontSize: 16, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }]}>PERFORMANCE</Text>
                  <View style={s.timeframeTabs}>
                    {TIMEFRAMES.map(tf => (
                      <TouchableOpacity key={tf} style={[s.tfTab, timeframe === tf && s.tfTabActive]} onPress={() => { h(); setTimeframe(tf); }}>
                        <Text style={[s.tfTabTxt, timeframe === tf && s.tfTabTxtActive]}>{tf}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Stat Cards Layout */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View style={[s.statCard, { flex: 1, padding: 14 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <View style={[s.statIcon, { backgroundColor: '#f3e8ff', width: 28, height: 28, borderRadius: 8, marginBottom: 0, alignItems: 'center', justifyContent: 'center' }]}><Users size={14} color="#a855f7" /></View>
                      <Text style={s.statLabel}>Followers</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[s.statValue, { fontSize: 20, marginTop: 0 }]}>{stats.followers}</Text>
                      {stats.followerChange !== 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {stats.followerChange > 0 ? <ArrowUp size={10} color="#10b981" /> : <ArrowDown size={10} color="#ef4444" />}
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: stats.followerChange > 0 ? '#10b981' : '#ef4444' }}>{Math.abs(stats.followerChange)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[s.statCard, { flex: 1, padding: 14 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <View style={[s.statIcon, { backgroundColor: '#dcfce7', width: 28, height: 28, borderRadius: 8, marginBottom: 0, alignItems: 'center', justifyContent: 'center' }]}><DollarSign size={14} color="#10b981" /></View>
                      <Text style={s.statLabel}>Revenue</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[s.statValue, { fontSize: 20, marginTop: 0 }]}>{stats.revenue}</Text>
                      {stats.revenueChange !== 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <ArrowUp size={10} color="#10b981" />
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#10b981' }}>{stats.revenueChange}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
                  <View style={[s.statCard, { flex: 1, padding: 14 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <View style={[s.statIcon, { backgroundColor: '#fef9c3', width: 28, height: 28, borderRadius: 8, marginBottom: 0, alignItems: 'center', justifyContent: 'center' }]}><Eye size={14} color="#f59e0b" /></View>
                      <Text style={s.statLabel}>Views</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[s.statValue, { fontSize: 20, marginTop: 0 }]}>{stats.views}</Text>
                      {stats.viewsChange !== 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <ArrowUp size={10} color="#10b981" />
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#10b981' }}>{stats.viewsChange}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[s.statCard, { flex: 1, padding: 14 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <View style={[s.statIcon, { backgroundColor: '#fee2e2', width: 28, height: 28, borderRadius: 8, marginBottom: 0, alignItems: 'center', justifyContent: 'center' }]}><Heart size={14} color="#ef4444" /></View>
                      <Text style={s.statLabel}>Engagement</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[s.statValue, { fontSize: 20, marginTop: 0 }]}>{stats.engagement}</Text>
                      <Text style={{ fontSize: 10, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>Avg rate</Text>
                    </View>
                  </View>
                </View>
              </View>

            {/* Content Performance */}
            <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
              <Text style={[s.sectionTitle, { marginBottom: 16, fontSize: 16, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }]}>TOP CONTENT</Text>
              <View style={s.contentTable}>
              <View style={[s.tableRow, s.tableHeader]}>
                <Text style={[s.tableCell, { flex: 2, color: '#94a3b8', textAlign: 'left' }]}>Content</Text>
                <Text style={[s.tableCell, { color: '#94a3b8', textAlign: 'right' }]}>Views</Text>
                <Text style={[s.tableCell, { color: '#94a3b8', textAlign: 'right' }]}>Earned</Text>
              </View>
              {contentToRender.map((item, idx) => {
                const IconComp = TYPE_ICON[item.type] || FileText;
                const iconColor = TYPE_COLOR[item.type] || '#64748b';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[s.tableRow, idx < contentToRender.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }]}
                    onPress={() => { h(); Alert.alert(item.title, `${item.views.toLocaleString()} views · ${item.likes.toLocaleString()} likes\nRevenue: ${item.revenue}`); }}
                  >
                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[s.contentTypeIcon, { backgroundColor: `${iconColor}18` }]}>
                        <IconComp size={16} color={iconColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.contentTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={s.contentDate}>{item.date}</Text>
                      </View>
                    </View>
                    <Text style={s.tableCell}>{item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}K` : item.views}</Text>
                    <Text style={[s.tableCell, { color: '#10b981' }]}>{item.revenue}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

              </View>
            </View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  mainCard: { flex: 1, backgroundColor: '#f8fafc', zIndex: 5 },
  
  timeframeTabs: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  tfTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center' },
  tfTabActive: { backgroundColor: '#0f172a' },
  tfTabTxt: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#94a3b8' },
  tfTabTxtActive: { color: '#fff' },
  
  statCard: { backgroundColor: '#fafafa', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 2, borderColor: '#ffffff' },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 24, fontFamily: 'Inter_900Black', color: '#0f172a', marginTop: 4, fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  
  toolCard: { backgroundColor: '#fafafa', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 2, borderColor: '#ffffff' },
  toolTitle: { fontSize: 15, fontFamily: 'Inter_800ExtraBold', color: '#0f172a', marginBottom: 2 },
  toolDesc: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 16 },
  
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#0f172a', letterSpacing: -0.5 },
  
  contentTable: { backgroundColor: '#fafafa', borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  tableHeader: { backgroundColor: '#fafafa', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableCell: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', minWidth: 60, textAlign: 'right' },
  contentTypeIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contentTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', lineHeight: 18, marginBottom: 2 },
  contentDate: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
});
