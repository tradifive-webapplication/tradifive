import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Animated, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Platform, StatusBar, TextInput, Image,
  DeviceEventEmitter, RefreshControl, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import {
  Plus, Users, BadgeCheck, Search, ArrowLeft, Bell,
  TrendingUp, Award, Shield, Crown, ChevronRight, Hash
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useStore } from '../store';
import { supabase } from '../utils/supabase';
const { width } = Dimensions.get('window');

const h = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const BUBBLE_PEOPLE: any[] = [];

const COUNTRIES = [
  { name: 'France', flag: '🇫🇷' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Germany', flag: '🇩🇪' },
];

export default function Channel() {
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
      else if (c === '#64748b' || c === '#475569' || c === '#94a3b8' || c === '#334155') shadowed[key].color = theme.textSecondary;
      
      const bc = shadowed[key].borderColor;
      if (bc === '#f1f5f9' || bc === '#eef0f3' || bc === '#e2e8f0' || bc === '#ffffff') shadowed[key].borderColor = theme.cardBorder;

      const btc = shadowed[key].borderTopColor;
      if (btc === '#f1f5f9' || btc === '#eef0f3' || btc === '#e2e8f0' || btc === '#ffffff') shadowed[key].borderTopColor = theme.cardBorder;

      const bbc = shadowed[key].borderBottomColor;
      if (bbc === '#f1f5f9' || bbc === '#eef0f3' || bbc === '#e2e8f0' || bbc === '#ffffff' || bbc === '#f4f4f6') shadowed[key].borderBottomColor = theme.cardBorder;
    }
    // Overrides
    if (shadowed.msgFilterActive) {
      shadowed.msgFilterActive.backgroundColor = theme.text;
      shadowed.msgFilterActive.borderColor = theme.text;
    }
    if (shadowed.msgFilterTxtActive) shadowed.msgFilterTxtActive.color = theme.background;
    if (shadowed.badgeTxt) shadowed.badgeTxt.color = theme.background;
    if (shadowed.joinBtn) shadowed.joinBtn.backgroundColor = theme.text;
    if (shadowed.joinBtnText) shadowed.joinBtnText.color = theme.background;
    if (shadowed.findPeopleBtn) shadowed.findPeopleBtn.backgroundColor = theme.text;
    if (shadowed.findPeopleBtnText) shadowed.findPeopleBtnText.color = theme.background;
    if (shadowed.msgBubbleRight) {
      shadowed.msgBubbleRight.backgroundColor = '#4f46e5';
    }
    if (shadowed.chatHeaderTitle) shadowed.chatHeaderTitle.color = theme.text;
    if (shadowed.exploreHeading) shadowed.exploreHeading.color = theme.text;
    if (shadowed.sectionHeader) shadowed.sectionHeader.color = '#94a3b8';
    if (shadowed.seeAllText) shadowed.seeAllText.color = theme.text;
    if (shadowed.gainerName) shadowed.gainerName.color = theme.text;
    if (shadowed.discoverChannelName) shadowed.discoverChannelName.color = theme.text;
    if (shadowed.chatName) shadowed.chatName.color = theme.text;
    if (shadowed.avatarText) shadowed.avatarText.color = theme.text;
    if (shadowed.chatHeaderRow) shadowed.chatHeaderRow.borderBottomColor = theme.cardBorder;
    if (shadowed.gainerCard) shadowed.gainerCard.borderColor = theme.cardBorder;
    if (shadowed.card) shadowed.card.borderColor = theme.cardBorder;
    if (shadowed.searchBar) shadowed.searchBar.borderColor = theme.cardBorder;
    if (shadowed.msgFilterPill) shadowed.msgFilterPill.borderColor = theme.cardBorder;
    
    // Bubble badges
    if (shadowed.followedBadge) {
      shadowed.followedBadge.backgroundColor = theme.text;
      shadowed.followedBadge.borderColor = theme.card;
    }
    if (shadowed.badge) shadowed.badge.backgroundColor = theme.text;
    if (shadowed.dotBadge) shadowed.dotBadge.backgroundColor = theme.text;
    if (shadowed.backButtonInner) shadowed.backButtonInner.backgroundColor = theme.background;
    
    return shadowed;
  }, [isDark, theme]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { view } = useGlobalSearchParams();
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyleState(style);
    });
    return () => listener.remove();
  }, []);

  const [activeView, setActiveView] = useState<'Discover' | 'Channels' | 'Messages'>((view as any) || 'Discover');
  const [msgFilter, setMsgFilter] = useState('All');
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'traders' | 'gainers' | 'discipliners' | 'groups' | null>(null);

  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [countryIndex, setCountryIndex] = useState(0);

  const pulseAnims = useRef(BUBBLE_PEOPLE.map(() => new Animated.Value(0))).current;

  // Gentle breathing animation for floating bubbles
  useEffect(() => {
    const animations = pulseAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + (index * 250) % 1500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000 + (index * 250) % 1500,
            useNativeDriver: true,
          }),
        ])
      );
    });

    animations.forEach(anim => anim.start());
    return () => animations.forEach(anim => anim.stop());
  }, []);

  // Country text auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCountryIndex((prev) => (prev + 1) % COUNTRIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleFollow = (id: number) => {
    setFollowedIds(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const followAll = () => {
    if (followedIds.length === BUBBLE_PEOPLE.length) {
      setFollowedIds([]);
    } else {
      setFollowedIds(BUBBLE_PEOPLE.map(p => p.id));
    }
  };

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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Smart Reveal Header Calculations matching Home screen
  const headerHeight = insets.top + 72;

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

  useEffect(() => {
    if (view) {
      setActiveView(view as any);
    }
  }, [view]);

  // Load configuration and leaderboard from Supabase on mount
  const storeChannels = useStore(state => state.channels);
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, xp_total, xp_level')
          .order('xp_total', { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data) {
          setLeaderboardUsers(data);
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  // Channels Data mapped dynamically
  const channelChats = storeChannels.length > 0 ? storeChannels.map((c, idx) => ({
    id: c.id as any,
    name: c.name,
    time: 'Live',
    msg: c.description || 'Welcome to our channel!',
    unread: idx === 0 ? 1 : 0,
    verified: false
  })) : [];

  // Messages Data
  const messageChats: any[] = [];

  const activeChats = activeView === 'Channels' ? channelChats : messageChats;
  const isMsg = activeView === 'Messages';

  const defaultGainers: any[] = [];

  const gainersList = leaderboardUsers.length > 0 ? leaderboardUsers.slice(0, 5).map((user, idx) => ({
    name: user.full_name || 'Anonymous',
    pnl: `+${(50 + (user.xp_level || 1) * 2.5).toFixed(1)}%`,
    avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    rank: idx + 1
  })) : defaultGainers;

  const defaultDiscipliners: any[] = [];

  const disciplinersList = leaderboardUsers.length > 0 ? leaderboardUsers.slice(0, 5).map((user, idx) => ({
    name: user.full_name || 'Anonymous',
    score: Math.min(100, 85 + (user.xp_level || 1)),
    avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    rank: idx + 1
  })) : defaultDiscipliners;

  const activeGroupsData = [
    { name: 'Gold Analysis Pro', members: '12.4k', desc: 'Premium XAUUSD signals & analysis', verified: true },
    { name: 'Smart Money Traders', members: '8.7k', desc: 'Institutional order flow community', verified: true },
    { name: 'Forex Mentors Hub', members: '6.2k', desc: 'Learn from top-tier mentors', verified: false },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── COLLAPSIBLE HEADER ── */}
      <Animated.View
        style={[
          s.header,
          {
            zIndex: 0,
            backgroundColor: headerStyle === 'simple' ? (isDark ? theme.card : '#ffffff') : 'transparent',
            borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
            borderBottomColor: isDark ? theme.cardBorder : '#e2e8f0',
            paddingBottom: headerStyle === 'simple' ? 12 : 28, // compact simple header
            transform: headerStyle === 'simple' ? [] : [
              {
                scale: scrollY.interpolate({
                  inputRange: [0, 80],
                  outputRange: [1, 0.85],
                  extrapolate: 'clamp'
                })
              },
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, -60],
                  extrapolate: 'clamp'
                })
              }
            ]
          }
        ]}
      >
        {headerStyle !== 'simple' && (
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {/* Spacer so header has height */}
        <View style={{ height: headerStyle === 'simple' ? 44 : 48, marginTop: headerStyle === 'simple' ? insets.top + 18 : insets.top + 30 }} />

        {/* Fading container for all header content when scrolling */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({
                inputRange: [0, 140],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              })
            }
          ]}
        >
          <View style={[s.headerRow, { bottom: headerStyle === 'simple' ? 16 : 38 }]}>
            <Text style={[s.title, { color: headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#ffffff' }]}>
              {activeView}
            </Text>

            {/* Header Right */}
            <View style={s.headerRight}>
              <TouchableOpacity style={s.headerIconButton} onPress={h}>
                <Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#ffffff'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { h(); router.setParams({ openProfile: 'true' }); }}
                style={[s.avatarContainer, { borderColor: headerStyle === 'simple' ? (isDark ? theme.cardBorder : 'rgba(0,0,0,0.1)') : 'rgba(255,255,255,0.2)' }]}
              >
                <Image source={require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── NATIVE SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          backgroundColor: '#000',
          zIndex: 2000,
          paddingTop: insets.top + 8,
          opacity: smartHeaderOpacity,
          transform: [{ translateY: headerTranslateY }],
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          overflow: 'hidden'
        }}>
          <Image
            source={require('../../assets/images/top-glow.png')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 80, opacity: 0.8 }}
            resizeMode="stretch"
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 56 }}>
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>
              {activeView}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} onPress={h}>
                <Bell size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { h(); router.setParams({ openProfile: 'true' }); }}
                style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <Image source={require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── WHITE CONTENT CARD ── */}
      <Animated.View
        style={[
          s.mainCard,
          {
            marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({
              inputRange: [0, 150],
              outputRange: [-34, -184],
              extrapolate: 'clamp'
            }),
            borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
            borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
          }
        ]}
      >
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 140
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8E8E93"
              progressViewOffset={10}
            />
          }
        >
          <Animated.View
            style={{
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, 150],
                  extrapolate: 'clamp'
                })
              }]
            }}
          >
            {/* Search Bar / Controls Bar */}
            <View style={s.controlsRow}>
              <View style={s.searchBar}>
                <Search size={16} color="#8e8e93" />
                <TextInput
                  placeholder="Search"
                  placeholderTextColor="#8e8e93"
                  style={s.searchInput}
                  editable={true}
                />
              </View>
            </View>

            {/* Messages Filter Pills */}
            {isMsg && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pillsScrollContent}
                style={{ marginBottom: 16 }}
              >
                {['All', 'Unread', 'Favourites'].map(f => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => { h(); setMsgFilter(f); }}
                    style={[s.msgFilterPill, msgFilter === f && s.msgFilterActive]}
                  >
                    <Text style={[s.msgFilterTxt, msgFilter === f && s.msgFilterTxtActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Content Box */}
            {activeView === 'Discover' ? (
              <View style={{ paddingVertical: 4 }}>
                {activeChannel ? (
                  <View style={s.card}>
                    <View style={s.chatHeaderRow}>
                      <TouchableOpacity onPress={() => setActiveChannel(null)} style={s.backButtonInner}>
                        <ArrowLeft size={18} color={isDark ? theme.text : '#000000'} />
                      </TouchableOpacity>
                      <Text style={s.chatHeaderTitle}>{activeChannel}</Text>
                    </View>
                    <ScrollView style={{ height: 320, padding: 16 }}>
                      <Text style={{ color: '#8e8e93', textAlign: 'center', marginBottom: 20, fontSize: 13, fontWeight: '500' }}>
                        Welcome to {activeChannel}!
                      </Text>
                      <View style={s.msgBubbleLeft}>
                        <Text style={{ fontSize: 14, color: isDark ? theme.text : '#000000', fontWeight: '500' }}>
                          Hello everyone! Welcome to the channel.
                        </Text>
                      </View>
                      <View style={s.msgBubbleRight}>
                        <Text style={{ fontSize: 14, color: '#ffffff', fontWeight: '500' }}>
                          Thanks! Glad to be here.
                        </Text>
                      </View>
                    </ScrollView>
                  </View>
                ) : (
                  <>
                    {/* ── SUGGESTED TRADERS CAROUSEL ── */}
                    <View style={s.sectionRow}>
                      <View style={s.sectionLabelRow}>
                        <Users size={14} color="#6366f1" strokeWidth={2.5} />
                        <Text style={s.sectionHeader}>SUGGESTED TRADERS</Text>
                      </View>
                      <TouchableOpacity onPress={() => { h(); setModalType('traders'); setModalVisible(true); }}>
                        <Text style={s.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginHorizontal: -20, marginBottom: 10 }}
                      contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 10 }}
                    >
                      {gainersList.map((user, idx) => (
                        <TouchableOpacity key={user.name + idx} style={[s.gainerCard, { width: 140 }]} onPress={h} activeOpacity={0.85}>
                          <Image source={{ uri: user.avatar }} style={[s.gainerAvatarImg, { width: 60, height: 60, borderRadius: 30, marginBottom: 12, borderWidth: 2, borderColor: '#6366f1' }]} />
                          <Text style={[s.gainerName, { marginBottom: 4 }]} numberOfLines={1}>{user.name}</Text>
                          <Text style={{ color: '#10b981', fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>{user.pnl}</Text>
                          <View style={{ backgroundColor: '#6366f1', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, width: '100%', alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Follow</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View style={s.sectionRow}>
                      <View style={s.sectionLabelRow}>
                        <TrendingUp size={14} color="#10b981" strokeWidth={2.5} />
                        <Text style={s.sectionHeader}>TOP GAINERS</Text>
                      </View>
                      <TouchableOpacity onPress={() => { h(); setModalType('gainers'); setModalVisible(true); }}>
                        <Text style={s.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginHorizontal: -20 }}
                      contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 20 }}
                    >
                      {gainersList.map((user) => (
                        <TouchableOpacity key={user.rank} style={s.gainerCard} onPress={h} activeOpacity={0.85}>
                          {/* Rank Medal */}
                          <View style={[
                            s.rankBadge,
                            { backgroundColor: user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#D97706' : (isDark ? theme.accent : '#E2E8F0') }
                          ]}>
                            <Text style={[s.rankText, { color: user.rank <= 3 ? '#fff' : (isDark ? theme.textSecondary : '#64748b') }]}>{user.rank}</Text>
                          </View>
                          <Image source={{ uri: user.avatar }} style={s.gainerAvatarImg} />
                          <Text style={s.gainerName} numberOfLines={1}>{user.name}</Text>
                          <View style={s.pnlPill}>
                            <TrendingUp size={10} color="#10b981" strokeWidth={3} />
                            <Text style={s.gainerPercentage}>{user.pnl}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View style={s.sectionRow}>
                      <View style={s.sectionLabelRow}>
                        <Shield size={14} color="#6366f1" strokeWidth={2.5} />
                        <Text style={s.sectionHeader}>TOP DISCIPLINERS</Text>
                      </View>
                      <TouchableOpacity onPress={() => { h(); setModalType('discipliners'); setModalVisible(true); }}>
                        <Text style={s.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginHorizontal: -20 }}
                      contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 20 }}
                    >
                      {disciplinersList.map((user) => (
                        <TouchableOpacity key={user.rank} style={s.gainerCard} onPress={h} activeOpacity={0.85}>
                          {/* Rank Medal */}
                          <View style={[
                            s.rankBadge,
                            { backgroundColor: user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#D97706' : (isDark ? theme.accent : '#E2E8F0') }
                          ]}>
                            <Text style={[s.rankText, { color: user.rank <= 3 ? '#fff' : (isDark ? theme.textSecondary : '#64748b') }]}>{user.rank}</Text>
                          </View>
                          <Image source={{ uri: user.avatar }} style={s.gainerAvatarImg} />
                          <Text style={s.gainerName} numberOfLines={1}>{user.name}</Text>
                          <View style={s.scorePill}>
                            <Award size={10} color="#6366f1" strokeWidth={3} />
                            <Text style={s.gainerScore}>{user.score}/100</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View style={s.sectionRow}>
                      <View style={s.sectionLabelRow}>
                        <Hash size={14} color="#000" strokeWidth={2.5} />
                        <Text style={s.sectionHeader}>ACTIVE GROUPS</Text>
                      </View>
                      <TouchableOpacity onPress={() => { h(); setModalType('groups'); setModalVisible(true); }}>
                        <Text style={s.seeAllText}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={s.card}>
                      {activeGroupsData.map((ch, idx, arr) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => setActiveChannel(ch.name)}
                          activeOpacity={0.7}
                          style={[s.discoverChannelRow, idx === arr.length - 1 && s.lastRow]}
                        >
                          <View style={s.discoverChannelAvatar}>
                            <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#000' }}>{ch.name[0]}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={s.discoverChannelName}>{ch.name}</Text>
                              {ch.verified && (
                                <BadgeCheck size={14} color="#3b82f6" fill="#3b82f6" />
                              )}
                            </View>
                            <Text style={s.discoverChannelDesc} numberOfLines={1}>{ch.desc}</Text>
                            <Text style={s.discoverChannelMembers}>{ch.members} members</Text>
                          </View>
                          <View style={s.joinBtn}>
                            <Text style={s.joinBtnText}>Join</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View style={s.card}>
                {activeChats.map((c, i) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[s.chatRow, i === activeChats.length - 1 && s.lastRow]}
                    onPress={h}
                  >
                    <View style={s.avatar}>
                      <Text style={s.avatarText}>{c.name[0]}</Text>
                    </View>
                    <View style={s.chatContent}>
                      <View style={s.chatTop}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={s.chatName}>{c.name}</Text>
                          {c.verified && (
                            <BadgeCheck size={15} color="#3b82f6" fill="#3b82f6" style={{ backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 8 }} />
                          )}
                        </View>
                        <Text style={s.chatTime}>{c.time}</Text>
                      </View>
                      <View style={s.chatBottom}>
                        <Text style={s.chatMsg} numberOfLines={2}>{c.msg}</Text>
                        {c.unread > 0 && (
                          <View style={s.badge}><Text style={s.badgeTxt}>{c.unread}</Text></View>
                        )}
                        {c.unread === -1 && (
                          <View style={s.dotBadge} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>

      {/* ── SEE ALL MODAL ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ height: '80%', backgroundColor: isDark ? theme.background : '#F8F9FA', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#000' }}>
                {modalType === 'traders' ? 'Suggested Traders' : 
                 modalType === 'gainers' ? 'Top Gainers' : 
                 modalType === 'discipliners' ? 'Top Discipliners' : 'Active Groups'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: isDark ? theme.card : '#e2e8f0', borderRadius: 20 }}>
                <Text style={{ color: isDark ? theme.text : '#000', fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
              {modalType === 'traders' && gainersList.map((user, idx) => (
                <TouchableOpacity key={user.name + idx} style={[s.gainerCard, { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 }]} onPress={() => { h(); setModalVisible(false); }} activeOpacity={0.85}>
                  <Image source={{ uri: user.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#6366f1' }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.gainerName, { marginBottom: 2, textAlign: 'left' }]} numberOfLines={1}>{user.name}</Text>
                    <Text style={{ color: '#10b981', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>{user.pnl}</Text>
                  </View>
                  <View style={{ backgroundColor: '#6366f1', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Follow</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {modalType === 'gainers' && gainersList.map((user) => (
                <TouchableOpacity key={user.rank} style={[s.gainerCard, { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 }]} onPress={() => { h(); setModalVisible(false); }} activeOpacity={0.85}>
                  <View style={[s.rankBadge, { backgroundColor: user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#D97706' : (isDark ? theme.accent : '#E2E8F0'), position: 'relative', top: 0, left: 0, marginRight: 12 }]}>
                    <Text style={[s.rankText, { color: user.rank <= 3 ? '#fff' : (isDark ? theme.textSecondary : '#64748b') }]}>{user.rank}</Text>
                  </View>
                  <Image source={{ uri: user.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                  <Text style={[s.gainerName, { flex: 1, textAlign: 'left' }]} numberOfLines={1}>{user.name}</Text>
                  <View style={s.pnlPill}>
                    <TrendingUp size={10} color="#10b981" strokeWidth={3} />
                    <Text style={s.gainerPercentage}>{user.pnl}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {modalType === 'discipliners' && disciplinersList.map((user) => (
                <TouchableOpacity key={user.rank} style={[s.gainerCard, { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 }]} onPress={() => { h(); setModalVisible(false); }} activeOpacity={0.85}>
                  <View style={[s.rankBadge, { backgroundColor: user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#D97706' : (isDark ? theme.accent : '#E2E8F0'), position: 'relative', top: 0, left: 0, marginRight: 12 }]}>
                    <Text style={[s.rankText, { color: user.rank <= 3 ? '#fff' : (isDark ? theme.textSecondary : '#64748b') }]}>{user.rank}</Text>
                  </View>
                  <Image source={{ uri: user.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                  <Text style={[s.gainerName, { flex: 1, textAlign: 'left' }]} numberOfLines={1}>{user.name}</Text>
                  <View style={s.scorePill}>
                    <Award size={10} color="#6366f1" strokeWidth={3} />
                    <Text style={s.gainerScore}>{user.score}/100</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {modalType === 'groups' && activeGroupsData.map((ch, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => { setActiveChannel(ch.name); setModalVisible(false); }}
                  activeOpacity={0.7}
                  style={[s.discoverChannelRow, { borderBottomWidth: 1, borderBottomColor: isDark ? theme.cardBorder : '#e2e8f0', paddingVertical: 12 }]}
                >
                  <View style={s.discoverChannelAvatar}>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#000' }}>{ch.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={s.discoverChannelName}>{ch.name}</Text>
                      {ch.verified && (
                        <BadgeCheck size={14} color="#3b82f6" fill="#3b82f6" />
                      )}
                    </View>
                    <Text style={s.discoverChannelDesc} numberOfLines={1}>{ch.desc}</Text>
                    <Text style={s.discoverChannelMembers}>{ch.members} members</Text>
                  </View>
                  <View style={s.joinBtn}>
                    <Text style={s.joinBtnText}>Join</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: '#f4f4f6',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    zIndex: 5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#000000',
    paddingLeft: 8,
  },
  pillsScrollContent: {
    gap: 8,
    paddingBottom: 16,
  },
  msgFilterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  msgFilterActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  msgFilterTxt: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  msgFilterTxtActive: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    overflow: 'hidden',
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  backButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
  },
  msgBubbleLeft: {
    backgroundColor: '#f4f4f6',
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    marginBottom: 12,
  },
  msgBubbleRight: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#8e8e93',
    letterSpacing: 1.5,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  gainerCard: {
    width: 130,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eef0f3',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  gainerAvatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f0f0f4',
  },
  gainerName: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gainerPercentage: {
    fontSize: 11,
    color: '#10b981',
    fontFamily: 'Inter_700Bold',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gainerScore: {
    fontSize: 11,
    color: '#6366f1',
    fontFamily: 'Inter_700Bold',
  },
  discoverChannelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  discoverChannelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f4f4f6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverChannelName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
  },
  discoverChannelDesc: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  discoverChannelMembers: {
    fontSize: 11,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f4f4f6',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  chatContent: {
    flex: 1,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  chatName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
  },
  chatTime: {
    fontSize: 12,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
  },
  chatBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chatMsg: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    paddingRight: 16,
    fontFamily: 'Inter_500Medium',
    lineHeight: 17,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeTxt: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  dotBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    marginBottom: 4,
  },
  exploreContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  bubbleContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    overflow: 'visible',
    marginVertical: 12,
  },
  bubbleWrapper: {
    position: 'absolute',
  },
  bubbleTouch: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  followedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  exploreTextContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  exploreHeading: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  exploreSubheading: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8e8e93',
    textAlign: 'center',
  },
  findPeopleBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  findPeopleBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
