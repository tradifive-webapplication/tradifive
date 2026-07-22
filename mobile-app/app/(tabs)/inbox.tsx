import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, Platform, StatusBar, Image,
  KeyboardAvoidingView, Keyboard, Animated, ScrollView,
  DeviceEventEmitter, Modal, TouchableWithoutFeedback, InteractionManager, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  Search, Send, Plus, Check, CheckCheck,
  MoreVertical, ArrowLeft, MessageSquare,
  VolumeX, Volume2, User, X, Ticket,
  ShieldAlert, Sparkles, Folder, ChevronRight, Bell,
} from 'lucide-react-native';
import { Send as IconlySend } from 'react-native-iconly';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useInboxData } from '../../hooks/useInboxData';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useStore } from '../store';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width: SW, height: SH } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

// ─── Role Badge Colours ────────────────────────────────────────────────────────
const getRoleColors = (isDark: boolean): Record<string, { bg: string; text: string; border: string }> => ({
  MENTOR: { bg: isDark ? 'rgba(124,58,237,0.15)' : '#f5f3ff', text: isDark ? '#a78bfa' : '#7c3aed', border: 'rgba(124,58,237,0.18)' },
  'RISK DESK': { bg: isDark ? 'rgba(225,29,72,0.15)' : '#fff1f2', text: isDark ? '#fb7185' : '#be123c', border: 'rgba(190,18,60,0.18)' },
  STAFF: { bg: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff', text: isDark ? '#60a5fa' : '#1d4ed8', border: 'rgba(29,78,216,0.18)' },
  BOT: { bg: isDark ? 'rgba(148,163,184,0.15)' : '#f8fafc', text: isDark ? '#94a3b8' : '#64748b', border: 'rgba(100,116,139,0.2)' },
  TRADER: { bg: isDark ? 'rgba(22,163,74,0.15)' : '#f0fdf4', text: isDark ? '#4ade80' : '#15803d', border: 'rgba(21,128,61,0.18)' },
  ADMIN: { bg: isDark ? 'rgba(234,88,12,0.15)' : '#fff7ed', text: isDark ? '#fb923c' : '#c2410c', border: 'rgba(194,65,12,0.18)' },
  FINANCE: { bg: isDark ? 'rgba(22,163,74,0.15)' : '#f0fdf4', text: isDark ? '#4ade80' : '#16a34a', border: 'rgba(22,163,74,0.2)' },
});

const STATUS_COLORS: Record<string, string> = {
  Online: '#10b981', Away: '#f59e0b', Offline: '#94a3b8', Bot: '#6366f1',
};

// ─── Real data only - no demo conversations ─────────────────────────────────
const DEMO_CONVERSATIONS: any[] = [];
const DEMO_MESSAGES: Record<string, any[]> = {};
const FILTERS = ['All', 'Unread', 'Favorites', 'Mentors', 'Support'] as const;
type Filter = typeof FILTERS[number];

export default function InboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

      const btc = shadowed[key].borderTopColor;
      if (btc === '#f1f5f9' || btc === '#eef0f3' || btc === '#e2e8f0' || btc === '#ffffff') shadowed[key].borderTopColor = theme.cardBorder;

      const bbc = shadowed[key].borderBottomColor;
      if (bbc === '#f1f5f9' || bbc === '#eef0f3' || bbc === '#e2e8f0' || bbc === '#ffffff') shadowed[key].borderBottomColor = theme.cardBorder;
    }
    // Overrides
    if (shadowed.filterPill) {
      shadowed.filterPill.backgroundColor = theme.background;
      shadowed.filterPill.borderColor = theme.cardBorder;
    }
    if (shadowed.filterPillTxt) shadowed.filterPillTxt.color = '#94a3b8';

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

    if (shadowed.convItem) {
      shadowed.convItem.borderBottomColor = theme.cardBorder;
    }
    if (shadowed.convItemActive) {
      shadowed.convItemActive.backgroundColor = theme.background;
    }
    if (shadowed.msgBubbleMe) {
      shadowed.msgBubbleMe.backgroundColor = '#4f46e5';
    }
    if (shadowed.chatSendBtn) {
      shadowed.chatSendBtn.backgroundColor = '#4f46e5';
    }

    return shadowed;
  }, [isDark, theme]);

  const currentUser = useStore(state => state.currentUser);
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());

  useEffect(() => {
    const l1 = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => setHeaderStyleState(style));
    return () => { l1.remove(); };
  }, []);


  const params = useLocalSearchParams();
  const initialConvId = typeof params.activeConvId === 'string' ? params.activeConvId : '';
  const [activeConvId, setActiveConvId] = useState<string>(initialConvId);
  const { conversations, messages, sendMessage, getOrCreateConversation } = useInboxData(activeConvId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(!!initialConvId);
  const chatSlideAnim = useRef(new Animated.Value(SW)).current;
  const [isFetchingDirectChat, setIsFetchingDirectChat] = useState(!!params.targetUserId || !!params.activeConvId);
  const skipInitialAnimation = useRef(!!params.targetUserId || !!params.activeConvId);

  useEffect(() => {
    if (showChat) {
      if (skipInitialAnimation.current) {
        chatSlideAnim.setValue(0);
        skipInitialAnimation.current = false;
      } else {
        chatSlideAnim.setValue(SW);
        Animated.spring(chatSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 55,
          friction: 9,
        }).start();
      }
    }
  }, [showChat]);

  const handleCloseChat = () => {
    h();
    Animated.timing(chatSlideAnim, {
      toValue: SW,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowChat(false);
      router.setParams({ targetUserId: '', activeConvId: '' });
    });
  };

  useEffect(() => {
    if (params.activeConvId && typeof params.activeConvId === 'string') {
      setActiveConvId(params.activeConvId);
      setShowChat(true);
      setIsFetchingDirectChat(false);
    } else if (params.targetUserId && typeof params.targetUserId === 'string') {
      // Find or create a conversation for this user
      (async () => {
        if (typeof getOrCreateConversation === 'function') {
          const convId = await getOrCreateConversation(params.targetUserId as string);
          if (convId) {
            setActiveConvId(convId);
            setShowChat(true);
          }
        }
        setIsFetchingDirectChat(false);
      })();
    } else {
      setIsFetchingDirectChat(false);
    }
  }, [params.activeConvId, params.targetUserId]);
  const [showDetails, setShowDetails] = useState(false);
  const [internalShowDetails, setInternalShowDetails] = useState(false);
  const detailsSlideAnim = useRef(new Animated.Value(SH)).current;

  useEffect(() => {
    if (showDetails) {
      setInternalShowDetails(true);
      Animated.spring(detailsSlideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(detailsSlideAnim, { toValue: SH, duration: 260, useNativeDriver: true }).start(() => {
        setInternalShowDetails(false);
      });
    }
  }, [showDetails, detailsSlideAnim]);

  // const [localMessages, setLocalMessages] = useState<Record<string, any[]>>(DEMO_MESSAGES);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [internalShowNewMsg, setInternalShowNewMsg] = useState(false);
  const newMsgSlideAnim = useRef(new Animated.Value(SH)).current;

  useEffect(() => {
    if (showNewMsgModal) {
      setInternalShowNewMsg(true);
      Animated.spring(newMsgSlideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(newMsgSlideAnim, { toValue: SH, duration: 260, useNativeDriver: true }).start(() => {
        setInternalShowNewMsg(false);
      });
    }
  }, [showNewMsgModal, newMsgSlideAnim]);

  const [newMsgSearch, setNewMsgSearch] = useState('');
  const flatRef = useRef<FlatList>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (isActive) {
          try { router.setParams({ chatOpen: showChat ? 'true' : undefined }); } catch (e) {}
        }
      }, 150);
    });
    return () => {
      isActive = false;
      setTimeout(() => {
        try { router.setParams({ chatOpen: undefined }); } catch (e) {}
      }, 0);
    };
  }, [showChat]);

  const filtered = useMemo(() => {
    let result = conversations;
    if (filter === 'Unread') result = result.filter(c => c.unread > 0);
    else if (filter === 'Favorites') result = result.filter(c => c.favorite);
    else if (filter === 'Mentors') result = result.filter(c => c.roleTag === 'MENTOR');
    else if (filter === 'Support') result = result.filter(c => !!c.ticketId);

    if (searchQuery) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [filter, searchQuery, conversations]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  // messages comes from useInboxData


  const handleSend = () => {
    if (!inputText.trim()) return;
    h();
    sendMessage(activeConvId, activeConv?.partnerId || '', inputText.trim());
    setInputText('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const openConv = (id: string) => {
    h();
    setActiveConvId(id);
    setShowChat(true);
    setShowDetails(false);
  };

  // ─── CONVERSATION LIST ITEM ────────────────────────────────────────────────
  const ConvItem = ({ conv }: { conv: any }) => {
    const roleColors = getRoleColors(isDark);
    const role = roleColors[conv.roleTag] || { bg: isDark ? '#111111' : '#f8fafc', text: isDark ? '#94a3b8' : '#64748b', border: 'rgba(100,116,139,0.2)' };
    const isActive = conv.id === activeConvId && showChat;

    return (
      <TouchableOpacity
        style={[s.convItem, isActive && s.convItemActive]}
        onPress={() => openConv(conv.id)}
        activeOpacity={0.8}
      >
        {isActive && <View style={s.activeBar} />}
        {/* Avatar + Status */}
        <View style={{ position: 'relative' }}>
          <Image
            source={typeof conv.avatar === 'string' ? { uri: conv.avatar } : conv.avatar}
            style={s.convAvatar}
          />
          <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[conv.status] || '#94a3b8' }]} />
        </View>

        {/* Content */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          {/* Row 1: Name + Role tag + Time */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Text style={s.convName} numberOfLines={1}>{conv.name}</Text>
              <View style={[s.roleTag, { backgroundColor: role.bg, borderColor: role.border }]}>
                <Text style={[s.roleTagTxt, { color: role.text }]}>{conv.roleTag}</Text>
              </View>
            </View>
            <Text style={s.convTime}>{conv.time}</Text>
          </View>

          {/* Ticket row */}
          {!!conv.ticketId && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <View style={{ backgroundColor: isDark ? '#111111' : '#f8fafc', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1.5 }}>
                <Text style={{ fontSize: 8.5, fontFamily: 'Inter_800ExtraBold', color: '#64748b' }}>#{conv.ticketId}</Text>
              </View>
              <Text style={{
                fontSize: 9, fontFamily: 'Inter_800ExtraBold', letterSpacing: 0.3,
                color: conv.ticketStatus === 'Resolved' ? '#10b981' : conv.ticketStatus === 'In-Progress' ? '#f59e0b' : '#ef4444'
              }}>{conv.ticketStatus}</Text>
            </View>
          )}

          {/* Row 2: Message preview + unread badge */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Text style={s.convMsg} numberOfLines={2}>{conv.content}</Text>
            {conv.unread > 0 && (
              <View style={s.unreadBadge}>
                <Text style={s.unreadTxt}>{conv.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── DETAILS MODAL BOTTOM SHEET ──────────────────────────────────────────
  const renderDetailsModal = () => {
    if (!activeConv) return null;
    return (
      <Modal
        visible={internalShowDetails}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDetails(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[s.bottomSheet, { paddingBottom: insets.bottom + 20, transform: [{ translateY: detailsSlideAnim }] }]}>
                {/* Drag Indicator Handle */}
                <View style={s.sheetHandle} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                  {/* Profile Section */}
                  <View style={{ alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                    <Image source={typeof activeConv.avatar === 'string' ? { uri: activeConv.avatar } : activeConv.avatar} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: isDark ? '#222222' : '#f1f5f9' }} />
                    <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: isDark ? theme.text : '#0f172a' }}>{activeConv.name}</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{activeConv.roleTag} · {activeConv.department} Desk</Text>
                    <TouchableOpacity
                      style={s.viewProfileBtn}
                      onPress={() => {
                        h();
                        setShowDetails(false);
                        router.push({ pathname: '/user/[id]', params: { id: activeConv.id } });
                      }}
                    >
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>View Profile</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Quick Actions */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[
                      { icon: <Ticket size={16} color="#6366f1" />, label: 'Open Ticket' },
                      { icon: <ShieldAlert size={16} color="#ef4444" />, label: 'Risk Audit' },
                      { icon: <Sparkles size={16} color="#f59e0b" />, label: 'Schedule' },
                      { icon: <Folder size={16} color="#10b981" />, label: 'Export' },
                    ].map((item, i) => (
                      <TouchableOpacity key={i} style={[s.actionBtn, { backgroundColor: isDark ? '#111111' : '#f8fafc' }]}>
                        {item.icon}
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#64748b', marginTop: 4, textAlign: 'center' }}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Info Card */}
                  <View style={s.infoCard}>
                    {[
                      { label: 'Designation', value: activeConv.designation },
                      { label: 'Email', value: activeConv.email },
                      { label: 'Timezone', value: activeConv.timezone },
                      { label: 'Status', value: activeConv.status },
                    ].map(row => (
                      <View key={row.label} style={s.infoRow}>
                        <Text style={s.infoLabel}>{row.label}</Text>
                        <Text style={s.infoValue}>{row.value}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Ticket history */}
                  {activeConv.ticketId && (
                    <View style={s.infoCard}>
                      <Text style={{ fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>Active Ticket</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a' }}>#{activeConv.ticketId}</Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>{activeConv.designation}</Text>
                        </View>
                        <View style={{ backgroundColor: activeConv.ticketStatus === 'Resolved' ? '#f0fdf4' : '#fffbeb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: activeConv.ticketStatus === 'Resolved' ? '#10b981' : '#f59e0b' }}>{activeConv.ticketStatus}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderNewMessageModal = () => {
    return (
      <Modal
        visible={internalShowNewMsg}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowNewMsgModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowNewMsgModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback>
              <Animated.View style={{ backgroundColor: isDark ? '#111111' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, height: '80%', transform: [{ translateY: newMsgSlideAnim }] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a' }}>New Message</Text>
                  <TouchableOpacity onPress={() => setShowNewMsgModal(false)}>
                    <X size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <View style={[s.searchBar, { marginHorizontal: 0 }]}>
                  <Search size={18} color="#94a3b8" />
                  <TextInput
                    style={s.searchInput}
                    placeholder="Search users to message..."
                    placeholderTextColor="#94a3b8"
                    value={newMsgSearch}
                    onChangeText={setNewMsgSearch}
                    autoFocus
                  />
                </View>
                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
                  {newMsgSearch.trim().length > 0 && conversations.filter(c => c.name.toLowerCase().includes(newMsgSearch.toLowerCase())).map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}
                      onPress={() => {
                        setShowNewMsgModal(false);
                        openConv(c.id);
                      }}
                    >
                      <Image source={typeof c.avatar === 'string' ? { uri: c.avatar } : c.avatar} style={{ width: 40, height: 40, borderRadius: 20 }} />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a' }}>{c.name}</Text>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748b' }}>{c.designation}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // ─── FULL SCREEN CHAT ─────────────────────────────────────────────────────
  if (isFetchingDirectChat) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  const renderChatUI = () => {
    if (!showChat || !activeConv) return null;
    const myId = currentUser?.id || 'me';

    return (
      <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', transform: [{ translateX: chatSlideAnim }] }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={[s.chatHeader, { paddingTop: insets.top + 4, backgroundColor: isDark ? '#111111' : '#fff', borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, gap: 10 }}>
              <TouchableOpacity onPress={handleCloseChat} style={s.chatBackBtn}>
                <ArrowLeft size={20} color="#0f172a" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { h(); router.push({ pathname: '/user/[id]', params: { id: activeConv?.id || '' } }); }}>
                <Image source={typeof activeConv?.avatar === 'string' ? { uri: activeConv?.avatar } : activeConv?.avatar} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }} />
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDetails(true)}>
                <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a', letterSpacing: -0.2 }}>{activeConv?.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: STATUS_COLORS[activeConv?.status || 'Offline'] }} />
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {activeConv?.status} · {activeConv?.roleTag}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={s.chatHeaderBtn}>
                  {isMuted ? <VolumeX size={17} color="#64748b" /> : <Volume2 size={17} color="#64748b" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDetails(true)} style={s.chatHeaderBtn}>
                  <User size={17} color={showDetails ? '#6366f1' : '#64748b'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowActionMenu(!showActionMenu)} style={s.chatHeaderBtn}>
                  <MoreVertical size={17} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Ticket banner */}
            {activeConv?.ticketId && (
              <View style={s.ticketBanner}>
                <Ticket size={13} color="#64748b" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Support Ticket</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a' }}>ID: <Text style={{ fontFamily: 'Inter_800ExtraBold' }}>#{activeConv.ticketId}</Text> · Status: <Text style={{ fontFamily: 'Inter_800ExtraBold', color: activeConv.ticketStatus === 'Resolved' ? '#10b981' : '#f59e0b' }}>{activeConv.ticketStatus}</Text></Text>
                </View>
                <View style={{ backgroundColor: isDark ? '#111111' : '#f8fafc', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 8, fontFamily: 'Inter_800ExtraBold', color: '#64748b', textTransform: 'uppercase' }}>Priority</Text>
                </View>
              </View>
            )}
          </View>

          {/* Messages Area */}
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            ListHeaderComponent={() => (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={s.threadLabel}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>Audited Communication Thread</Text>
                </View>
              </View>
            )}
            renderItem={({ item: msg }) => {
              const isMe = msg.sender_id === 'me' || msg.sender_id === myId;
              return (
                <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                  {!isMe && (
                    <Image source={typeof activeConv?.avatar === 'string' ? { uri: activeConv?.avatar } : activeConv?.avatar} style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8, marginTop: 4, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9', alignSelf: 'flex-end' }} />
                  )}
                  <View style={{ maxWidth: SW * 0.72 }}>
                    <View style={[s.msgBubble, isMe ? s.msgBubbleMe : s.msgBubbleThem]}>
                      <Text style={[s.msgText, isMe && { color: '#ffffff' }]}>{msg.content}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 3, paddingHorizontal: 4 }}>
                      <Text style={s.msgTime}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {isMe && (msg.is_read ? <CheckCheck size={13} color="#3b82f6" /> : <Check size={13} color="#94a3b8" />)}
                    </View>
                  </View>
                </View>
              );
            }}
          />

          {/* Input */}
          <View style={[s.chatInputBar, { paddingBottom: keyboardVisible ? 8 : (insets.bottom + 8) }]}>
            <TouchableOpacity style={s.chatAttachBtn} onPress={h}>
              <Plus size={22} color={isDark ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
            <View style={[s.chatInputFieldContainer, { backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9' }]}>
              <TextInput
                style={[s.chatInputField, { color: isDark ? theme.text : '#0f172a' }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder={`Reply to ${activeConv?.name || 'conversation'}...`}
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                keyboardAppearance={isDark ? "dark" : "light"}
                multiline
                maxLength={1000}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[s.chatSendBtn, { backgroundColor: inputText.trim() ? (isDark ? '#fff' : '#0f172a') : (isDark ? '#2a2a2a' : '#e2e8f0') }]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <IconlySend set="bulk" size={16} color={inputText.trim() ? (isDark ? '#000' : '#fff') : (isDark ? '#555' : '#94a3b8')} style={{ marginLeft: -2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        {renderDetailsModal()}
      </Animated.View>
    );
  };

  // ─── CONVERSATIONS LIST ────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: headerStyle === 'simple' ? '#f4f4f6' : '#000' }}>
      <StatusBar barStyle={headerStyle === 'simple' ? "dark-content" : "light-content"} />

      {headerStyle !== 'simple' && (
        <Image
          source={require('../../assets/images/top-glow.png')}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, width: SW, height: insets.top + 150 }}
          resizeMode="stretch"
        />
      )}

      {/* ── HEADER ── */}
      <View style={[
        s.header,
        {
          backgroundColor: headerStyle === 'simple' ? '#ffffff' : 'transparent',
          borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
          borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0',
          paddingBottom: headerStyle === 'simple' ? 12 : 28,
        }
      ]}>
        {headerStyle !== 'simple' && (
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {/* Spacer so header has height */}
        <View style={{ height: headerStyle === 'simple' ? 24 : 40, marginTop: headerStyle === 'simple' ? insets.top + 8 : insets.top + 24 }} />

        {/* Content Row */}
        <View style={[s.headerRow, { bottom: headerStyle === 'simple' ? 12 : 38 }]}>
          <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? '#000' : '#fff', letterSpacing: -0.5 }}>Inbox</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => setShowNewMsgModal(true)} style={[s.newMsgBtn, { backgroundColor: headerStyle === 'simple' ? '#f1f5f9' : 'rgba(255,255,255,0.15)', borderColor: headerStyle === 'simple' ? '#e2e8f0' : 'rgba(255,255,255,0.2)' }]}>
              <Plus size={16} color={headerStyle === 'simple' ? '#0f172a' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : 'white'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {renderNewMessageModal()}

      {/* ── MAIN CARD ── */}
      <View style={[
        s.mainCard,
        {
          marginTop: headerStyle === 'simple' ? 0 : -34,
          borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
          borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
        }
      ]}>

        {/* Search */}
        <View style={[s.searchBar, { marginBottom: 14 }]}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={s.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 4, alignItems: 'center' }}
          style={{ marginBottom: 10, height: 48, flexGrow: 0 }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => { h(); setFilter(f); }}
              style={[s.filterPill, filter === f && s.filterPillActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.filterPillTxt, filter === f && s.filterPillTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Total count row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {filtered.length} {filtered.length === 1 ? 'conversation' : 'conversations'}
          </Text>
          <TouchableOpacity onPress={() => { h(); /* setConversations omitted */ }} activeOpacity={0.7} style={{ paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#6366f1' }}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 100 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={28} color="#94a3b8" />
            </View>
            <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a' }}>No Conversations</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748b', textAlign: 'center', paddingHorizontal: 40 }}>
              Connect with mentors, risk desk analysts, or other funded traders to start messaging.
            </Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={filtered}
            keyExtractor={c => c.id}
            renderItem={({ item }) => <ConvItem conv={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          />
        )}
      </View>
      {renderChatUI()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const globalStyles = StyleSheet.create({
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
  mainCard: {
    flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
    overflow: 'hidden', paddingTop: 16, zIndex: 5,
  },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: '#0f172a' },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterPillActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  filterPillTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#64748b' },
  filterPillTxtActive: { color: '#fff' },
  newMsgBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  // Conv Item
  convItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', position: 'relative' },
  convItemActive: { backgroundColor: '#f8fafc' },
  activeBar: { position: 'absolute', left: 0, top: '25%', bottom: '25%', width: 3, backgroundColor: '#64748b', borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  convAvatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#f1f5f9' },
  statusDot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  convName: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0f172a', maxWidth: 120 },
  roleTag: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
  roleTagTxt: { fontSize: 8.5, fontFamily: 'Inter_800ExtraBold', letterSpacing: 0.5, textTransform: 'uppercase' },
  convTime: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  convMsg: { flex: 1, fontSize: 12.5, fontFamily: 'Inter_400Regular', color: '#64748b', lineHeight: 18, paddingRight: 8 },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, alignSelf: 'flex-end' },
  unreadTxt: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  // Chat
  chatHeader: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  chatBackBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  chatHeaderBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  ticketBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  threadLabel: { backgroundColor: 'rgba(148,163,184,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  msgBubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  msgBubbleMe: { backgroundColor: '#0f172a', borderBottomRightRadius: 5 },
  msgBubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  msgText: { fontSize: 14.5, fontFamily: 'Inter_400Regular', color: '#0f172a', lineHeight: 22 },
  msgTime: { fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  chatInputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 12 },
  chatAttachBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  chatInputFieldContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#f1f5f9', borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4 },
  chatInputField: { flex: 1, maxHeight: 120, fontSize: 14.5, fontFamily: 'Inter_500Medium', color: '#0f172a', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: Platform.OS === 'ios' ? 8 : 4, textAlignVertical: 'center' },
  chatSendBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  // Details Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    paddingTop: 8,
  },
  sheetHandle: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#f1f5f9', marginTop: 4 },
  actionBtn: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  infoCard: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#f1f5f9', gap: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#0f172a' },
});
