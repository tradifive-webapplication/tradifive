import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  Modal,
  Text,
  Animated,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Bell,
  Menu,
  Bot,
  ChevronDown,
  ChevronUp,
  X,
  Cpu,
  CreditCard,
  ShoppingBag,
  Zap,
  Plus,
  ArrowUpDown,
  SlidersHorizontal,
  MoreHorizontal,
  Home,
  Search,
  LayoutGrid,
  User,
  Users,
  MessageCircle,
  Gift,
  Trophy,
  ShieldCheck,
  FileText as BookOpen,
  Settings2 as Settings
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useStore } from '../store';
import { getAvatarUrl } from '../utils/avatar';

import { useAppTheme } from '../../hooks/useAppTheme';

import { FeedCard } from '../../components/FeedCard';
import { CreatePostModal } from '../../components/CreatePostModal';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useChannelData } from '../../hooks/useChannelData';
import { useInboxData } from '../../hooks/useInboxData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const h = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style);
};
const hSelect = () => { if (Platform.OS !== 'web') Haptics.selectionAsync(); };

const NAV_ITEMS = [
  { label: 'Journal', icon: BookOpen, hasChevron: false },
  { label: 'Risk Guard', icon: ShieldCheck, hasChevron: false },
  { label: 'Rewards', icon: Gift, hasChevron: false },
  { label: 'Channels', icon: Users, hasChevron: true, subItems: ['Channels', 'Messages', 'Feeds'] },
  { label: 'Learning', icon: BookOpen, hasChevron: true, subItems: ['Courses', 'Webinars'] },
  { label: 'Contests', icon: Trophy, hasChevron: true, subItems: ['Contests', 'Profile', 'Leaderboard'] },
  { label: 'Finance', icon: CreditCard, hasChevron: true, subItems: ['Wallet', 'Deposit'] },
  { label: 'Marketplace', icon: ShoppingBag, hasChevron: true, subItems: ['Indicators', 'EAs'] },
];

export default function DashboardScreen() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);

  const { feeds, loading: feedsLoading, refetch: refetchFeeds } = useSocialFeed();
  const { recentTrades, balance, winRate } = useDashboardData();
  const { channels, loading: channelsLoading } = useChannelData();
  const { conversations: messages, loading: messagesLoading } = useInboxData();
  const [postModalVisible, setPostModalVisible] = useState(false);

  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  /* ─── tabs ─── */
  type Tab = 'dashboard' | 'community' | 'contests';
  const [activeTab, setActiveTab] = useState<Tab>('community');

  type CommView = 'messages' | 'channels' | 'feeds';
  const [commView, setCommView] = useState<CommView>('feeds');

  type ContestView = 'contests' | 'profile' | 'leaderboard';
  const [contestView, setContestView] = useState<ContestView>('contests');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeNavItem, setActiveNavItem] = useState({ label: 'Channels', icon: Users });
  const [lastMainTab, setLastMainTab] = useState<Tab>('community');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* dropdown animation */
  const dropAnim = useRef(new Animated.Value(0)).current;
  const openDropdown = () => {
    hSelect();
    setDropdownOpen(true);
    Animated.spring(dropAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 260 }).start();
  };
  const closeDropdown = () => {
    Animated.timing(dropAnim, { toValue: 0, duration: 160, useNativeDriver: true })
      .start(() => setDropdownOpen(false));
  };
  const selectView = (v: CommView | ContestView) => {
    h();
    if (activeTab !== 'community' && activeTab !== 'contests') {
      const target: Tab = ['channels', 'messages'].includes(v) ? 'community' : 'contests';
      switchTab(target);
    }

    if (activeTab === 'community' || (['channels', 'messages'].includes(v))) {
      setCommView(v as CommView);
      if (activeTab !== 'community') switchTab('community');
    } else {
      setContestView(v as ContestView);
      if (activeTab !== 'contests') switchTab('contests');
    }
    closeDropdown();
  };

  const [contestTab, setContestTab] = useState<'Upcoming' | 'In Progress' | 'Finished'>('Upcoming');

  /* messages filter */
  const [msgTab, setMsgTab] = useState<'All' | 'Unread' | 'Favourites'>('All');
  const filtered = msgTab === 'Unread' ? messages.filter((m: any) => m.unread > 0) : messages;

  /* main fade */
  const fadeAnim = useRef(new Animated.Value(activeTab === "community" ? 1 : (activeTab === "contests" ? 2 : 0))).current;
  const switchTab = (tab: Tab) => {
    hSelect();
    setActiveTab(tab);
    if (tab === 'community' || tab === 'contests') {
      setLastMainTab(tab);
    }
    if (tab === 'dashboard') {
      closeDropdown();
    }
    Animated.timing(fadeAnim, { toValue: tab === 'community' ? 1 : (tab === 'contests' ? 2 : 0), duration: 260, useNativeDriver: true }).start();
  };
  const dashOp = fadeAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [1, 0, 0] });
  const commOp = fadeAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] });
  const contOp = fadeAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 0, 1] });

  /* menu modal */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const openMenu = () => {
    h(Haptics.ImpactFeedbackStyle.Medium);
    setMenuOpen(true);
    Animated.spring(menuAnim, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 200 }).start();
  };
  const closeMenu = () => {
    hSelect();
    Animated.timing(menuAnim, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true })
      .start(() => setMenuOpen(false));
  };

  /* AI Coach overlay */
  const [aiOpen, setAiOpen] = useState(false);
  const aiSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const aiOpacity = useRef(new Animated.Value(0)).current;
  const [aiInput, setAiInput] = useState('');
  const openAI = () => {
    h(Haptics.ImpactFeedbackStyle.Medium);
    setAiOpen(true);
    Animated.parallel([
      Animated.spring(aiSlide, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }),
      Animated.timing(aiOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  };
  const closeAI = () => {
    hSelect();
    Animated.parallel([
      Animated.timing(aiSlide, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true }),
      Animated.timing(aiOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setAiOpen(false));
  };

  const aiHeaderFade = aiOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const AI_SUGGESTIONS = [
    'Add test product for store tracking',
    'Set up basic analytics for tracking',
    'What is my win rate this week?',
    'Show me my best performing trades',
  ];

  const headerTitle = commView === 'channels' ? 'Channels' : commView === 'feeds' ? 'Social Feed' : 'Messages';
  const dropdownTop = insets.top + 24 + 40 + 8;

  return (
    <View style={{ flex: 1, backgroundColor: headerStyle === 'simple' ? '#f4f4f6' : '#000' }}>
      <StatusBar barStyle={headerStyle === 'simple' ? "dark-content" : "light-content"} backgroundColor="transparent" translucent />

      {/* ── HEADER ── */}
      <View style={[styles.header, {
        height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92,
        backgroundColor: headerStyle === 'simple' ? '#ffffff' : '#000000',
        borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
        borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0',
        paddingBottom: 0,
      }]}>
        <Image
          source={require('../../assets/images/top-glow.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: insets.top + 160,
            opacity: headerStyle === 'simple' ? 0 : 0.95
          }}
          resizeMode="stretch"
          pointerEvents="none"
        />

        {/* Fading container for all header content when AI is open */}
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: aiHeaderFade }]}>
          {/* Dashboard row — absolutely positioned so both rows overlap */}
          <Animated.View style={[
            styles.headerRow,
            { bottom: headerStyle === 'simple' ? 12 : 38 },
            { opacity: dashOp }
          ]}>
            <Text style={{
              color: headerStyle === 'simple' ? '#000000' : '#fff',
              fontSize: 24,
              fontFamily: 'Inter_700Bold',
              letterSpacing: -0.5
            }}>Home</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color={headerStyle === 'simple' ? '#000000' : 'white'} />
              </TouchableOpacity>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: headerStyle === 'simple' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                overflow: 'hidden'
              }}>
                <Image source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }} style={{ width: '100%', height: '100%' }} />
              </View>
            </View>
          </Animated.View>

          {/* Community row */}
          <Animated.View style={[
            styles.headerRow,
            { bottom: headerStyle === 'simple' ? 12 : 38 },
            { opacity: commOp, zIndex: 10 }
          ]}>
            <TouchableOpacity
              onPress={dropdownOpen ? closeDropdown : openDropdown}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Text style={{
                color: headerStyle === 'simple' ? '#000000' : '#fff',
                fontSize: 22,
                fontFamily: 'Inter_700Bold'
              }}>{headerTitle}</Text>
              {dropdownOpen
                ? <ChevronUp size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
                : <ChevronDown size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {activeTab === 'community' && commView === 'feeds' ? (
                <>
                  <TouchableOpacity
                    onPress={() => setPostModalVisible(true)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 1,
                      borderColor: headerStyle === 'simple' ? '#000000' : '#fff',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={10} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPostModalVisible(true)}>
                    <Text style={{
                      color: headerStyle === 'simple' ? '#000000' : '#fff',
                      fontSize: 13,
                      fontFamily: 'Inter_500Medium'
                    }}>Post</Text>
                  </TouchableOpacity>
                </>
              ) : activeTab === 'community' && commView === 'messages' ? (
                <>
                  <TouchableOpacity
                    onPress={() => h()}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 1,
                      borderColor: headerStyle === 'simple' ? '#000000' : '#fff',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={10} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => h()}>
                    <Text style={{
                      color: headerStyle === 'simple' ? '#000000' : '#fff',
                      fontSize: 13,
                      fontFamily: 'Inter_500Medium'
                    }}>Select</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={22} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Contests header */}
          <Animated.View style={[
            styles.headerRow,
            { bottom: headerStyle === 'simple' ? 12 : 38 },
            { opacity: contOp, zIndex: activeTab === 'contests' ? 10 : 0 }
          ]}>
            <TouchableOpacity
              onPress={dropdownOpen ? closeDropdown : openDropdown}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Text style={{
                color: headerStyle === 'simple' ? '#000000' : '#fff',
                fontSize: 22,
                fontFamily: 'Inter_700Bold'
              }}>
                {contestView === 'contests' ? 'Contests' : contestView === 'profile' ? 'Profile' : 'Leaderboard'}
              </Text>
              {dropdownOpen
                ? <ChevronUp size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
                : <ChevronDown size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />}
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
      {/* ── WHITE CONTENT CARD ── */}
      <View style={[styles.card, {
        marginTop: headerStyle === 'simple' ? 0 : -34,
        borderTopLeftRadius: headerStyle === 'simple' ? 0 : 36,
        borderTopRightRadius: headerStyle === 'simple' ? 0 : 36,
      }]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: dashOp, pointerEvents: activeTab === 'dashboard' ? 'auto' : 'none' }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140, paddingTop: 20 }}>

            {/* ── JOURNEY HUD ── */}
            <View style={styles.hudCard}>
              <View style={styles.hudTop}>
                <View style={styles.hudInfo}>
                  <Text style={styles.hudLabel}>Protocol Architecture</Text>
                  <Text style={styles.hudTitle}>Level 12 Architect</Text>
                </View>
                <View style={styles.xpBadge}>
                  <Trophy size={14} color="#f59e0b" />
                  <Text style={styles.xpText}>250 XP</Text>
                </View>
              </View>

              <View style={styles.hudProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '65%' }]} />
                </View>
                <View style={styles.hudMetrics}>
                  <Text style={styles.hudMetricText}>₹75,000 / ₹100,000</Text>
                  <Text style={styles.hudMetricText}>75% to Diamond</Text>
                </View>
              </View>
            </View>

            {/* ── MT5 CONNECTION BAR ── */}
            <View style={styles.connectionBar}>
              <View style={styles.connStatus}>
                <View style={styles.activePulse} />
                <Text style={styles.connText}>MT5 Connected</Text>
                <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>
              </View>
              <View style={styles.connDetails}>
                <Text style={styles.detailText}>Acct: 50971432</Text>
              </View>
            </View>

            {/* ── TOP METRICS GRID ── */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Account P&L</Text>
                  <Plus size={14} color="#10b981" />
                </View>
                <Text style={styles.metricValue}>₹1,240.50</Text>
                <Text style={styles.metricSubValue}>Today: +₹124.50</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Discipline</Text>
                  <ShieldCheck size={14} color="#3b82f6" />
                </View>
                <Text style={styles.metricValue}>98</Text>
                <Text style={styles.metricSubValue}>Score: Elite</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Win Rate</Text>
                  <Zap size={14} color="#f59e0b" />
                </View>
                <Text style={styles.metricValue}>64%</Text>
                <Text style={styles.metricSubValue}>Last 7 Days</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Daily XP</Text>
                  <Zap size={14} color="#ef4444" />
                </View>
                <Text style={[styles.metricValue, { color: '#ef4444' }]}>+150 XP</Text>
                <Text style={styles.metricSubValue}>Active Streak: 5</Text>
              </View>
            </View>

            {/* ── LIVE RISK MONITOR ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Risk Monitor</Text>
              <View style={styles.statusBadge}><Text style={styles.statusText}>LOW RISK</Text></View>
            </View>

            <View style={styles.riskCard}>
              <View style={styles.riskMain}>
                <View style={styles.riskCircle}>
                  <Text style={styles.riskPct}>1.34%</Text>
                  <Text style={styles.riskLabel}>Drawdown</Text>
                </View>
                <View style={styles.riskStats}>
                  <View style={styles.riskStatItem}>
                    <Text style={styles.statLabel}>Daily Executions</Text>
                    <Text style={styles.statValue}>2 / 3</Text>
                  </View>
                  <View style={styles.riskStatItem}>
                    <Text style={styles.statLabel}>Current Exposure</Text>
                    <Text style={styles.statValue}>0.85 Lots</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.emergencyBtn} onPress={() => h(Haptics.ImpactFeedbackStyle.Heavy)}>
                <Zap size={16} color="#fff" fill="#fff" />
                <Text style={styles.emergencyText}>EMERGENCY FLATTEN</Text>
              </TouchableOpacity>
            </View>

            {/* ── RECENT ACTIVITY ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <View style={{ marginHorizontal: 20, backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 32, padding: 20, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, marginBottom: 20 }}>
              {recentTrades && recentTrades.length > 0 ? recentTrades.map((trade: any, index: number) => {
                 const isBuy = trade.type === 'buy';
                 const color = isBuy ? '#10b981' : '#ef4444';
                 const initial = isBuy ? 'B' : 'S';
                 const symbol = trade.symbol || 'UNKNOWN';
                 const volume = trade.volume || 0;
                 const profit = trade.profit || 0;
                 
                 return (
                  <View key={trade.id || index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: index === recentTrades.length - 1 ? 0 : 16, borderBottomWidth: index === recentTrades.length - 1 ? 0 : 1, borderBottomColor: isDark ? '#222222' : '#f8fafc', paddingBottom: index === recentTrades.length - 1 ? 0 : 16 }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isBuy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                           <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color }}>{initial}</Text>
                        </View>
                        <View>
                           <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? '#e8e8e8' : '#0f172a', marginBottom: 2 }}>{symbol}</Text>
                           <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b' }}>{isBuy ? 'Buy' : 'Sell'} • {volume} Lots</Text>
                        </View>
                     </View>
                     <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color, marginBottom: 2 }}>{profit >= 0 ? '+' : ''}${profit.toFixed(2)}</Text>
                     </View>
                  </View>
                 );
              }) : (
                 <Text style={{ color: '#94a3b8', textAlign: 'center', marginVertical: 10 }}>No recent activity found.</Text>
              )}
            </View>

          </ScrollView>
        </Animated.View>

        {/* ── COMMUNITY VIEW ── */}
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: commOp, pointerEvents: activeTab === 'community' ? 'auto' : 'none' }]}>
          {commView === 'messages' ? (
            <>
              <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <TouchableOpacity onPress={() => router.push('/search')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 14, paddingHorizontal: 14, height: 44 }}>
                    <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Text style={{ flex: 1, fontSize: 15, color: '#94a3b8', fontFamily: 'Inter_400Regular' }}>Search Users...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 44, height: 44, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowUpDown size={17} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 44, height: 44, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <SlidersHorizontal size={17} color="#475569" />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                  {(['All', 'Unread', 'Favourites'] as const).map(t => (
                    <TouchableOpacity key={t} onPress={() => setMsgTab(t)} style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: msgTab === t ? '#0f172a' : '#f1f5f9' }}>
                      <Text style={{ color: msgTab === t ? '#fff' : '#64748b', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}>
                {filtered.map(msg => (
                  <TouchableOpacity key={msg.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#0f172a', marginRight: 14 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                        <Text style={{ fontSize: 15, color: isDark ? '#e8e8e8' : '#0f172a', marginRight: 6, fontFamily: 'Inter_400Regular' }} numberOfLines={1}>{msg.name}</Text>
                        {msg.status === 'Online' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' }} />}
                      </View>
                      <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_400Regular' }} numberOfLines={1}>{msg.content}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6, marginLeft: 10 }}>
                      <Text style={{ fontSize: 13, color: msg.unread > 0 ? '#ef4444' : '#94a3b8', fontFamily: 'Inter_500Medium' }}>{msg.time}</Text>
                      {msg.unread > 0 && (
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Inter_500Medium' }}>{msg.unread}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : commView === 'channels' ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 }}>
                <TouchableOpacity onPress={() => router.push('/search')} style={{ flex: 1, height: 44, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
                  <Search size={18} color="#94a3b8" />
                  <Text style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#94a3b8', fontFamily: 'Inter_400Regular' }}>Search Users...</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpDown size={18} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                  <SlidersHorizontal size={18} color="#475569" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                {channelsLoading ? (
                  <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
                ) : channels.map((item: any) => (
                  <TouchableOpacity key={item.id} onPress={() => h()} style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', marginRight: 15 }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={{ fontSize: 16, color: isDark ? '#e8e8e8' : '#0f172a', fontFamily: 'Inter_400Regular' }}>{item.name}</Text>
                          {item.verified && <ShieldCheck size={14} color="#6366f1" />}
                        </View>
                        <Text style={{ fontSize: 13, color: '#ef4444', fontFamily: 'Inter_500Medium' }}>{item.time || ''}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text numberOfLines={2} style={{ fontSize: 14, color: '#64748b', flex: 1, marginRight: 20, fontFamily: 'Inter_400Regular' }}>{item.description || item.preview || 'No description'}</Text>
                        {item.unread > 0 && (
                          <View style={{ backgroundColor: '#ef4444', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                            <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Inter_500Medium' }}>{item.unread}</Text>
                          </View>
                        )}
                        {item.unreadDot && (
                          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444' }} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            
            </>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                {/* TWISTS SECTION (MOCK DATA) */}
                <View style={{ paddingTop: 16, paddingBottom: 8 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: isDark ? '#fff' : '#000', paddingHorizontal: 16, marginBottom: 12 }}>Twists</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    <View style={{ alignItems: 'center', width: 72 }}>
                      <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#3b82f6', borderStyle: 'dashed', padding: 2, alignItems: 'center', justifyContent: 'center' }}>
                         <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isDark ? '#222' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={24} color="#3b82f6" />
                         </View>
                      </View>
                      <Text style={{ color: isDark ? '#fff' : '#0f172a', fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 6, textAlign: 'center' }}>Add Twist</Text>
                    </View>
                  </ScrollView>
                </View>

                <View style={{ width: '100%', height: 1, backgroundColor: isDark ? '#222' : '#f1f5f9', marginVertical: 8 }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: isDark ? '#fff' : '#000' }}>Recent Posts</Text>
                </View>
                <View>
                  {feedsLoading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
                  ) : feeds.length > 0 ? (
                    feeds.map(post => (
                      <FeedCard key={post.id} post={post} />
                    ))
                  ) : (
                    <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>No posts yet. Be the first to share!</Text>
                  )}
                </View>
              </ScrollView>
              
              <CreatePostModal 
                visible={postModalVisible} 
                onClose={() => setPostModalVisible(false)} 
                onPostCreated={refetchFeeds} 
              />
            </>

          )}
        </Animated.View>

        {/* ── CONTESTS VIEW ── */}
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: contOp, pointerEvents: activeTab === 'contests' ? 'auto' : 'none' }]}>
          {contestView === 'contests' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
              {/* Win Big Rewards Banner */}
              <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 24, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 24, marginBottom: 8, fontFamily: 'Inter_600SemiBold', lineHeight: 30 }}>Win Big Rewards</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter_400Regular' }}>Compete with top traders and prove your skills.</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 24 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <View key={i} style={{ width: i === 1 ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === 1 ? '#fff' : '#475569' }} />
                      ))}
                    </View>
                  </View>
                  <View style={{ width: 100, height: 100, position: 'relative' }}>
                    <CreditCard size={100} color="#334155" style={{ opacity: 0.3 }} />
                  </View>
                </View>
              </View>

              <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
                <Text style={{ fontSize: 22, color: isDark ? '#e8e8e8' : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>Join Competitions <Text style={{ color: '#f97316' }}>Now!</Text></Text>
                <Text style={{ color: '#64748b', fontSize: 14, marginTop: 6, fontFamily: 'Inter_400Regular' }}>Join the hottest Competition happening right now on our platform!</Text>
              </View>

              {/* Tabs */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 24, borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
                {(['Upcoming', 'In Progress', 'Finished'] as const).map(t => (
                  <TouchableOpacity key={t} onPress={() => setContestTab(t)} style={{ paddingVertical: 12, marginRight: 24, borderBottomWidth: contestTab === t ? 2 : 0, borderBottomColor: '#0f172a' }}>
                    <Text style={{ fontSize: 15, color: contestTab === t ? '#0f172a' : '#64748b', fontFamily: contestTab === t ? 'Inter_600SemiBold' : 'Inter_500Medium' }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Competition Card */}
              <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={20} color="#fff" />
                      </View>
                      <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter_500Medium' }}>October Competition 25</Text>
                    </View>
                    <View style={{ width: 36, height: 24, backgroundColor: '#334155', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'Inter_500Medium' }}>SOON</Text>
                    </View>
                  </View>

                  <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 20, marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                      <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <LayoutGrid size={20} color="#94a3b8" />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Start / End</Text>
                        <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_400Regular' }}>Oct 1, 2025 - Oct 31, 2025</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                      <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} color="#94a3b8" />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Prize Pool</Text>
                        <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_400Regular' }}>₹1,000 Cash - Competitions Accounts</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} color="#94a3b8" />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Contestants</Text>
                        <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_400Regular' }}>6507</Text>
                      </View>
                    </View>
                  </View>

                  {/* Countdown */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {[
                        { val: '34', label: 'Days' },
                        { val: '16', label: 'hours' },
                        { val: '22', label: 'Min' },
                        { val: '55', label: 'Sec' }
                      ].map(c => (
                        <View key={c.label} style={{ alignItems: 'center' }}>
                          <View style={{ width: 44, height: 36, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_400Regular' }}>{c.val}</Text>
                          </View>
                          <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 4, fontFamily: 'Inter_500Medium' }}>{c.label}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 2, fontFamily: 'Inter_500Medium' }}>Time Remaining</Text>
                      <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_500Medium' }}>(GMT +3:00)</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={{ flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#475569', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_400Regular' }}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1.2, height: 48, borderRadius: 14, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_400Regular' }}>Enroll</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : contestView === 'profile' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
              <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#000', marginRight: 16 }} />
                    <View>
                      <Text style={{ color: '#fff', fontSize: 24, fontFamily: 'Inter_600SemiBold', lineHeight: 30 }}>Hello Nikhil!</Text>
                      <Text style={{ color: '#f97316', fontSize: 14, marginTop: 4, fontFamily: 'Inter_400Regular' }}>Current Rank N/A</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Zap size={16} color="#94a3b8" />
                      <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Current Balance: <Text style={{ color: '#fff', fontWeight: '600' }}>₹10000.00</Text></Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Zap size={16} color="#94a3b8" />
                      <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Initial Balance: <Text style={{ color: '#fff', fontWeight: '600' }}>₹100000.00</Text></Text>
                    </View>
                  </View>

                  <View style={{ borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <Users size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_400Regular' }}>Account Details</Text>
                    </View>

                    {[
                      { label: 'Server:', val: 'Exness-Real369' },
                      { label: 'Platform:', val: 'mt5' },
                      { label: 'Login:', val: '35965955' },
                      { label: 'Login:', val: 'xxxxxxxxxx', showView: true }
                    ].map(row => (
                      <View key={row.val} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 10 }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{row.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{row.val}</Text>
                          {row.showView ? <Text style={{ color: '#f97316', fontSize: 12, fontFamily: 'Inter_500Medium' }}>View</Text> : <LayoutGrid size={14} color="#64748b" />}
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <LayoutGrid size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_400Regular' }}>Time Until Start</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[
                        { val: '33', label: 'Days' },
                        { val: '17', label: 'hours' },
                        { val: '8', label: 'Minutes' },
                        { val: '55', label: 'Second' }
                      ].map(c => (
                        <View key={c.label} style={{ flex: 1, height: 60, backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: isDark ? '#e8e8e8' : '#000', fontSize: 18, fontFamily: 'Inter_500Medium' }}>{c.val}</Text>
                          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2, fontFamily: 'Inter_500Medium' }}>{c.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 24 }}>
                  <Text style={{ color: '#fff', fontSize: 18, marginBottom: 20, fontFamily: 'Inter_500Medium' }}>Account Details</Text>
                  {[
                    { l: 'Current Equity', r: '₹100000.00' },
                    { l: 'Current Balance', r: '₹100000.00' },
                    { l: 'Return', r: '0.00%' },
                    { l: 'Daily Loss Limit', r: 'Ongoing', dim: true },
                    { l: 'Max Loss Limit', r: '₹5000.00', dim: true },
                    { l: "Today's Permitted Loss", r: '₹0.00', dim: true },
                  ].map(item => (
                    <View key={item.l} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                      <Text style={{ color: item.dim ? '#64748b' : '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{item.l}</Text>
                      <Text style={{ color: item.dim ? '#94a3b8' : '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{item.r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
              <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 20 }}>
                  <View style={{ alignItems: 'center', marginTop: 10 }}>
                    {/* Podium */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 200, width: '100%' }}>
                      {/* #2 */}
                      <View style={{ alignItems: 'center', marginRight: -10 }}>
                        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>₹3,000</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, fontFamily: 'Inter_500Medium' }}>Cash Prize</Text>
                        <View style={{ width: 90, height: 100, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                          <Text style={{ color: '#94a3b8', fontSize: 32, fontFamily: 'Inter_700Bold', lineHeight: 38 }}>#2</Text>
                        </View>
                      </View>
                      {/* #1 */}
                      <View style={{ alignItems: 'center', zIndex: 10 }}>
                        <Text style={{ color: '#fff', fontSize: 20, marginBottom: 4, fontFamily: 'Inter_600SemiBold' }}>₹5,000</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, fontFamily: 'Inter_500Medium' }}>Cash Prize</Text>
                        <View style={{ width: 110, height: 130, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderTopWidth: 2, borderTopColor: 'rgba(255,255,255,0.2)' }}>
                          <Text style={{ color: '#fff', fontSize: 42, fontFamily: 'Inter_700Bold', lineHeight: 38 }}>#1</Text>
                        </View>
                      </View>
                      {/* #3 */}
                      <View style={{ alignItems: 'center', marginLeft: -10 }}>
                        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>₹2,000</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, fontFamily: 'Inter_500Medium' }}>Cash Prize</Text>
                        <View style={{ width: 90, height: 80, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                          <Text style={{ color: '#64748b', fontSize: 28, fontFamily: 'Inter_600SemiBold', lineHeight: 30 }}>#3</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={{ marginTop: 30, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 16, fontFamily: 'Inter_500Medium' }}>All three winners also get:</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                      <View style={{ backgroundColor: '#f97316', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_500Medium' }}>One-year subcription of FX REPLAY</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      <View style={{ backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_500Medium' }}>Youtube Interview</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
                <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter_500Medium' }}>235 players</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_500Medium' }}>Shows top 50 players</Text>
                  </View>
                  {[
                    'Robin pekarvoic', 'Lorant Csicsay', 'Jana Kokosova', 'Denys Dordial', 'Pavel Novacek', 'Jaimw Panadero Ruiz'
                  ].map((name, i) => (
                    <View key={name} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 16, width: 30, fontFamily: 'Inter_400Regular' }}>{i + 1}</Text>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#000', marginRight: 12 }} />
                      <Text style={{ color: '#fff', fontSize: 15, flex: 1, fontFamily: 'Inter_400Regular' }}>{name}</Text>
                      <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_400Regular' }}>₹0.00</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000',
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
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -34,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
  },
  /* Dashboard Specific Styles */
  hudCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hudTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hudInfo: { flex: 1 },
  hudLabel: { color: '#64748b', fontSize: 12, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1 },
  hudTitle: { color: '#fff', fontSize: 20, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
  xpText: { color: '#f59e0b', fontSize: 13, fontFamily: 'Inter_500Medium' },
  hudProgress: { marginTop: 20 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 3 },
  hudMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  hudMetricText: { color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_500Medium' },
  connectionBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  connStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  connText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0f172a' },
  liveBadge: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#10b981' },
  connDetails: { alignItems: 'flex-end' },
  detailText: { fontSize: 13, color: '#64748b', fontFamily: 'Inter_700Bold' },
  metricsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 10 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 32, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: 22, fontFamily: 'Inter_900Black', color: '#0f172a', letterSpacing: -0.5 },
  metricSubValue: { fontSize: 13, color: '#94a3b8', fontFamily: 'Inter_700Bold', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_500Medium', color: '#0f172a' },
  statusBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  statusText: { color: '#10b981', fontSize: 12, fontFamily: 'Inter_500Medium', letterSpacing: 1 },
  riskCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 32, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 10 },
  riskMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  riskCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 6, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  riskPct: { fontSize: 18, fontFamily: 'Inter_500Medium', color: '#3b82f6' },
  riskLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', textTransform: 'uppercase' },
  riskStats: { flex: 1, marginLeft: 24, gap: 12 },
  riskStatItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f8fafc', paddingBottom: 8 },
  statLabel: { fontSize: 13, color: '#64748b', fontFamily: 'Inter_700Bold' },
  statValue: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#0f172a' },
  emergencyBtn: { backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 8, shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  emergencyText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_900Black', letterSpacing: 1 },

  /* Navigation Styles */
  pill: {
    width: 52, height: 52,
    backgroundColor: '#fff', borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  cluster: {
    backgroundColor: '#fff', borderRadius: 32,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 8,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
    borderWidth: 1, borderColor: '#f1f5f9', gap: 4,
  },
  clusterActive: {
    width: 46, height: 46, backgroundColor: '#f1f5f9',
    borderRadius: 23, alignItems: 'center', justifyContent: 'center',
  },
  clusterBtn: {
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
  },
});
