import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Animated, TouchableOpacity, StyleSheet,
  Dimensions, Platform, StatusBar, TextInput, Image,
  DeviceEventEmitter, RefreshControl, ScrollView, FlatList,
  KeyboardAvoidingView, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import {
  Search, BadgeCheck, Bell, TrendingUp, Users, Lock,
  Zap, ArrowLeft, Send, Hash, MoreVertical, Phone, Video,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import ComingSoonVeil from '../../components/ComingSoonVeil';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../store';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width: SW, height: SH } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

// ─── Channel Demo Data ─────────────────────────────────────────────────────────
// Real data only - channels loaded from Supabase
const CATEGORIES = ['All', 'Forex', 'Crypto', 'Indices', 'Education', 'Prop', 'AI'];

export default function Channels() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { openChannelId } = useLocalSearchParams();
  const { isDark, theme } = useAppTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());
  const [activeChannel, setActiveChannel] = useState<any | null>(null);
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const storeChannels = useStore(state => state.channels);

  // Colors based on theme
  const bg = isDark ? theme.background : '#f8fafc';
  const card = isDark ? theme.card : '#ffffff';
  const border = isDark ? theme.cardBorder : '#f1f5f9';
  const text = isDark ? theme.text : '#0f172a';
  const sub = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#1e2a3a' : '#f1f5f9';

  useEffect(() => {
    const l1 = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => setHeaderStyleState(style));
    const l2 = scrollY.addListener(({ value }) => DeviceEventEmitter.emit('scrollUpdate', value));
    return () => { l1.remove(); scrollY.removeListener(l2); };
  }, []);

  useEffect(() => {
    if (openChannelId && storeChannels.length > 0) {
      const channelToOpen = storeChannels.find(c => c.id === openChannelId);
      if (channelToOpen && activeChannel?.id !== channelToOpen.id) {
        // format it like channelsToRender
        const formatted = {
          id: channelToOpen.id,
          name: channelToOpen.name,
          category: 'forex',
          description: channelToOpen.description || 'Welcome to the channel!',
          members: channelToOpen.member_count || 120,
          is_verified: channelToOpen.is_verified || false,
          isLive: false,
          color: '#6366f1',
          lastMsg: 'Welcome to our channel!',
          lastTime: '',
          unread: 0,
          messages: [{ id: 'm1', text: 'Welcome to our channel!', isMe: false, time: 'Now' }],
        };
        openChannel(formatted);
      }
    }
  }, [openChannelId, storeChannels.length]);

  const onRefresh = React.useCallback(() => {
    h();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const headerHeight = insets.top + 64;
  const clampedScroll = Animated.diffClamp(scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' }), 0, headerHeight);
  const headerTranslateY = clampedScroll.interpolate({ inputRange: [0, headerHeight], outputRange: [0, -headerHeight], extrapolate: 'clamp' });
  const smartHeaderOpacity = scrollY.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' });
  const channelsToRender = storeChannels.map((sc, idx) => ({
      id: sc.id, name: sc.name, category: 'forex',
      description: sc.description || 'Welcome to the channel!',
      members: sc.member_count || 120, is_verified: sc.is_verified || false,
      isLive: idx % 3 === 0, color: idx % 2 === 0 ? '#6366f1' : '#10b981',
      lastMsg: 'Welcome to our channel!', lastTime: '', unread: 0,
      messages: [{ id: 'm1', text: 'Welcome to our channel!', isMe: false, time: 'Now' }],
    }));

  const filtered = channelsToRender.filter(c => {
    const matchCat = activeCategory === 'All' || c.category === activeCategory.toLowerCase();
    const matchQ = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const formatMembers = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  const openChannel = (ch: any) => {
    h();
    setChatMessages(ch.messages || []);
    setActiveChannel(ch);
    router.setParams({ chatOpen: 'true' } as any);
  };

  const closeChannel = () => {
    h();
    setActiveChannel(null);
    setInputText('');
    router.setParams({ chatOpen: undefined } as any);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    h();
    const newMsg = { id: `m_${Date.now()}`, text: inputText.trim(), isMe: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ── CHAT VIEW ────────────────────────────────────────────────────────────────
  if (activeChannel) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? theme.background : '#f8fafc' }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Chat Header */}
        <View style={{
          backgroundColor: card,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
          <TouchableOpacity
            onPress={closeChannel}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? '#1e2a3a' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={18} color={text} />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: activeChannel.color, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' }}>{activeChannel.name[0]}</Text>
            {activeChannel.isLive && (
              <View style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', borderWidth: 2, borderColor: card }} />
            )}
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: text }}>{activeChannel.name}</Text>
              {activeChannel.is_verified && <BadgeCheck size={14} color="#3b82f6" fill="#3b82f6" />}
            </View>
            <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: sub }}>
              {formatMembers(activeChannel.members)} members {activeChannel.isLive ? '· 🔴 LIVE' : ''}
            </Text>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={h} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: isDark ? '#1e2a3a' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={16} color={sub} />
            </TouchableOpacity>
            <TouchableOpacity onPress={h} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: isDark ? '#1e2a3a' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <MoreVertical size={16} color={sub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListHeaderComponent={
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: activeChannel.color, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 28, fontFamily: 'Inter_700Bold', color: '#fff' }}>{activeChannel.name[0]}</Text>
                </View>
                <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: text, marginBottom: 2 }}>{activeChannel.name}</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: sub, textAlign: 'center', paddingHorizontal: 40 }}>{activeChannel.description}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: isDark ? '#1e2a3a' : '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                  <Users size={12} color={sub} />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: sub }}>{formatMembers(activeChannel.members)} members</Text>
                </View>
                <View style={{ height: 1, backgroundColor: border, width: '60%', marginTop: 20 }} />
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', justifyContent: item.isMe ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                {!item.isMe && (
                  <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: activeChannel.color, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 2, alignSelf: 'flex-end' }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#fff' }}>{activeChannel.name[0]}</Text>
                  </View>
                )}
                <View style={{ maxWidth: '72%' }}>
                  <View style={[
                    {
                      paddingHorizontal: 14, paddingVertical: 10,
                      borderRadius: 20,
                    },
                    item.isMe
                      ? { backgroundColor: isDark ? '#4f46e5' : '#0f172a', borderBottomRightRadius: 4 }
                      : { backgroundColor: card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: border }
                  ]}>
                    <Text style={{
                      fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21,
                      color: item.isMe ? '#ffffff' : text
                    }}>{item.text}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: sub, fontFamily: 'Inter_400Regular', marginTop: 3, alignSelf: item.isMe ? 'flex-end' : 'flex-start', marginHorizontal: 4 }}>{item.time}</Text>
                </View>
              </View>
            )}
          />

          {/* Input Bar */}
          <View style={{
            flexDirection: 'row', alignItems: 'flex-end',
            paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 8,
            backgroundColor: card, borderTopWidth: 1, borderTopColor: border, gap: 10,
          }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: inputBg, borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4 }}>
              <TextInput
                style={{ flex: 1, maxHeight: 120, fontSize: 14.5, fontFamily: 'Inter_400Regular', color: text, paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: Platform.OS === 'ios' ? 8 : 4 }}
                value={inputText}
                onChangeText={setInputText}
                placeholder={`Message ${activeChannel.name}...`}
                placeholderTextColor={sub}
                keyboardAppearance={isDark ? 'dark' : 'light'}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={{
                  width: 32, height: 32, borderRadius: 16, marginLeft: 8,
                  backgroundColor: inputText.trim() ? '#4f46e5' : (isDark ? '#2a2a2a' : '#e2e8f0'),
                  alignItems: 'center', justifyContent: 'center',
                }}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              >
                <Send size={14} color={inputText.trim() ? '#fff' : sub} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── CHANNELS LIST VIEW ────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.background : '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── TOP BACKSIDE GLOW / ARTWORK IMAGE ── */}
      {headerStyle !== 'simple' && (
        <Image
          source={require('../../assets/images/top-glow.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: insets.top + 180,
            zIndex: 0,
            opacity: 0.95,
          }}
          resizeMode="stretch"
          pointerEvents="none"
        />
      )}

      {/* ── COLLAPSIBLE HERO HEADER ── */}
      <Animated.View style={{
        backgroundColor: headerStyle === 'simple' ? card : 'transparent',
        borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
        borderBottomColor: border,
        paddingBottom: headerStyle === 'simple' ? 12 : 28,
        position: 'relative',
        transform: headerStyle === 'simple' ? [] : [
          { scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) },
          { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }
        ]
      }}>
        {headerStyle !== 'simple' && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />}
        <View style={{ height: headerStyle === 'simple' ? 24 : 40, marginTop: headerStyle === 'simple' ? insets.top + 8 : insets.top + 24 }} />
        <Animated.View style={[StyleSheet.absoluteFillObject, {
          opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' })
        }]}>
          <View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 12 : 38, left: 0, right: 0, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: headerStyle === 'simple' ? (isDark ? theme.text : '#0f172a') : '#fff', fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Channels</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} onPress={() => { h(); }}>
                <Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#0f172a') : '#fff'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { h(); router.setParams({ openProfile: 'true' }); }}
                style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: headerStyle === 'simple' ? border : 'rgba(255,255,255,0.2)' }}
              >
                <Image source={require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── SMART REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight,
          backgroundColor: '#000', zIndex: 2000, paddingTop: insets.top,
          opacity: smartHeaderOpacity, transform: [{ translateY: headerTranslateY }],
          borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden'
        }}>
          <Image source={require('../../assets/images/top-glow.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 80, opacity: 0.8 }} resizeMode="stretch" />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 }}>
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>Channels</Text>
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

      {/* ── MAIN CONTENT ── */}
      <Animated.View style={{
        flex: 1,
        backgroundColor: card,
        borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
        borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
        marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }),
        overflow: 'hidden',
        zIndex: 5,
      }}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 140 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" progressViewOffset={10} />}
        >
          <Animated.View style={{ transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>

            {/* ── SEARCH BAR ── */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: isDark ? '#1e2a3a' : '#f8fafc',
              borderRadius: 16, height: 46, paddingHorizontal: 16,
              borderWidth: 1, borderColor: border,
              marginHorizontal: 20, marginBottom: 14,
            }}>
              <Search size={16} color={sub} />
              <TextInput
                placeholder="Search channels..."
                placeholderTextColor={sub}
                style={{ flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: text }}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* ── CATEGORY PILLS ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 4 }} style={{ marginBottom: 16 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { h(); setActiveCategory(cat); }}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: activeCategory === cat ? '#4f46e5' : (isDark ? '#1e2a3a' : '#f1f5f9'),
                    borderWidth: 1,
                    borderColor: activeCategory === cat ? '#4f46e5' : border,
                  }}
                >
                  <Text style={{
                    fontSize: 13, fontFamily: 'Inter_600SemiBold',
                    color: activeCategory === cat ? '#fff' : sub,
                  }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── SECTION HEADER ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} color="#4f46e5" />
                <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: text }}>
                  {activeCategory === 'All' ? 'All Channels' : `${activeCategory} Channels`}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: sub }}>({filtered.length})</Text>
              </View>
              <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#4f46e5' }}>Sort: Popular</Text>
            </View>

            {/* ── CHANNEL LIST ── */}
            <View>
              {filtered.map((c, idx) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => openChannel(c as any)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: 13, paddingHorizontal: 20,
                    borderBottomWidth: idx < filtered.length - 1 ? 1 : 0,
                    borderBottomColor: border,
                    backgroundColor: card,
                  }}
                >
                  {/* Avatar */}
                  <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: (c as any).color, alignItems: 'center', justifyContent: 'center', marginRight: 12, position: 'relative' }}>
                    <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' }}>{c.name[0]}</Text>
                    {c.isLive && (
                      <View style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#ef4444', borderWidth: 2, borderColor: card, alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={7} color="#fff" fill="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    {/* Name row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: text, flex: 1 }} numberOfLines={1}>{c.name}</Text>
                        {c.is_verified && <BadgeCheck size={14} color="#3b82f6" fill="#3b82f6" />}
                      </View>
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: sub, marginLeft: 8 }}>{c.lastTime}</Text>
                    </View>
                    {/* Last message */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: sub, flex: 1 }} numberOfLines={1}>{c.lastMsg}</Text>
                      {c.unread > 0 && (
                        <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: 8 }}>
                          <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' }}>{c.unread}</Text>
                        </View>
                      )}
                    </View>
                    {/* Members row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Users size={10} color={sub} />
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: sub }}>{formatMembers(c.members)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Lock size={10} color={sub} />
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: sub }}>Public</Text>
                      </View>
                      {c.isLive && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#ef4444' }} />
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#ef4444', letterSpacing: 0.3 }}>LIVE</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

          </Animated.View>
        </Animated.ScrollView>
        <ComingSoonVeil
            featureTitle="Trading Channels"
            subtitle="Institutional trader groups, verified live trade signals & community chat channels are launching soon."
          />
        </Animated.View>
      </View>
  );
}
