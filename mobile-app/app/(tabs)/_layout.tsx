import { Tabs, useRouter, usePathname, useGlobalSearchParams, useSegments } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Menu, X, Cpu, Zap, CreditCard, History, Brain, Mic, BadgeCheck, Clock, List, Rocket, CircleSlash, UserPlus, DollarSign, ArrowUp, Globe, Sparkles, LogOut, Bell, ShieldAlert
} from 'lucide-react-native';
import {
  User,
  UsersIcon as Users,
  TwoUsers,
  Message,
  MessageIcon as MessageCircle,
  MessageIcon as MessageSquare,
  Chat,
  Setting as SettingsIcon,
  CrownIcon as Crown,
  TrophyIcon as Trophy,
  Home,
  Search,
  ShieldDone,
  ShieldFail,
  ShieldDoneIcon as ShieldCheck,
  Document,
  Document as BookOpen,
  Send,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpIcon as HelpCircle,
  Category,
  Category as LayoutGrid,
  Bag,
  Bookmark,
  Discovery as Gift,
  Discovery,
  Video,
  Activity,
  Wallet,
  Swap,
  Work,
  TimeCircle,
  Chart,
  Graph,
  SparklesIcon,
  CloseSquare,
  Danger,
  Notification,
  Paper,
  Star,
  LogOutIcon,
  Logout
} from '../../components/Iconly';
import {
  View,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Image,
  StatusBar,
  DeviceEventEmitter,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { getHeaderStyle } from '../utils/headerStore';
import { useStore } from '../store';
import UsernameModal from '../components/UsernameModal';
import { getAvatarUrl } from '../utils/avatar';
import { FollowListModal } from '../../components/FollowListModal';
import { usePlan } from '../hooks/usePlan';
import { useAppTheme } from '../../hooks/useAppTheme';
import AiCoachOverlay from '../../components/AiCoachOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

const h = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    if (Platform.OS !== 'web') Haptics.impactAsync(style);
  } catch (e) { }
};
const hSelect = () => {
  try {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  } catch (e) { }
};

const NAV_ITEMS = [
  { label: 'Journal', icon: BookOpen, hasChevron: false },
  { label: 'Risk Guard', icon: ShieldCheck, hasChevron: false },
  { label: 'Channels', icon: Users, hasChevron: false },
  { label: 'Rewards', icon: Gift, hasChevron: false },
];

const AI_SUGGESTIONS = [
  'What is my win rate this week?',
  'Show me my best performing trades',
  'Add test product for store tracking',
  'Set up basic analytics for tracking',
];

const SEARCH_DATA = [
  { label: 'Journal', type: 'tool', route: '/(tabs)/journal', icon: BookOpen },
  { label: 'Risk Guard', type: 'tool', route: '/(tabs)/risk-guard', icon: ShieldCheck },
  { label: 'Broker Connect', type: 'tool', route: '/broker-connect', icon: Zap },
  { label: 'Rewards', type: 'tool', route: '/(tabs)/rewards', icon: Gift },
  { label: 'Channels', type: 'community', route: '/(tabs)/channels', icon: Users },
  { label: 'Help Center', type: 'support', route: '/help', icon: HelpCircle },
  { label: 'Settings', type: 'account', route: '/(tabs)/settings', icon: SettingsIcon },
  { label: 'Marketplace', type: 'store', route: '/(tabs)/marketplace', icon: Bag },
];

const QUICK_SEARCHES = ['Risk Guard', 'Journal', 'Help Center', 'Settings'];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { view, cardActive, mediaViewerOpen } = useGlobalSearchParams();
  const [currentView, setCurrentView] = useState(view || 'feed');
  const [headerStyle, setHeaderStyleState] = useState(getHeaderStyle());
  const { isElite } = usePlan();
  const [currentMarket, setCurrentMarket] = useState('Indian Market');
  const { isDark, theme } = useAppTheme();

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('headerStyleChanged', (style) => {
      setHeaderStyleState(style);
    });
    return () => listener.remove();
  }, []);


  // States
  const [activeNavItem, setActiveNavItem] = useState<any>({ label: 'Journal', icon: BookOpen });
  const scrollY = useRef(new Animated.Value(0)).current;
  const navClampedScroll = Animated.diffClamp(
    Animated.add(
      scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: 'clamp'
      }),
      new Animated.Value(-60)
    ),
    0, 80
  );
  const navTranslateY = Platform.OS === 'web' ? 0 : navClampedScroll.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 120],
    extrapolate: 'clamp'
  });
  const navOpacity = Platform.OS === 'web' ? 1 : navClampedScroll.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const initStore = useStore(state => state.init);
  const currentUser = useStore(state => state.currentUser);
  const followerCount = useStore(state => state.getFollowerCount());
  const followingCount = useStore(state => state.getFollowingCount());
  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('scrollUpdate', (val) => {
      scrollY.setValue(val);
    });
    return () => sub.remove();
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Follow modal state
  const [followModalState, setFollowModalState] = useState<{ isVisible: boolean; type: 'followers' | 'following' }>({ isVisible: false, type: 'followers' });

  // Animations
  const menuAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const aiSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const aiOpacity = useRef(new Animated.Value(0)).current;
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const openDrawer = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setDrawerOpen(true);
    lastOffset.current = DRAWER_WIDTH;
    Animated.spring(drawerAnim, {
      toValue: DRAWER_WIDTH,
      useNativeDriver: false,
      damping: 28,
      stiffness: 250,
      restSpeedThreshold: 0.1,
      restDisplacementThreshold: 0.1
    }).start();
  };

  const closeDrawer = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    lastOffset.current = 0;
    Animated.spring(drawerAnim, {
      toValue: 0,
      useNativeDriver: false,
      damping: 28,
      stiffness: 250,
      restSpeedThreshold: 0.1,
      restDisplacementThreshold: 0.1
    }).start(() => {
      setDrawerOpen(false);
    });
  };

  const openMenu = () => {
    h(Haptics.ImpactFeedbackStyle.Medium);
    setMenuOpen(true);
    Animated.spring(menuAnim, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 200 }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true })
      .start(() => setMenuOpen(false));
  };

  const openAI = () => {
    h();
    setAiOpen(true);
  };

  const closeAI = () => {
    setAiOpen(false);
  };

  const onGestureEvent = (e: any) => {
    const { translationX } = e.nativeEvent;
    let newVal = lastOffset.current + translationX;
    newVal = Math.max(0, Math.min(DRAWER_WIDTH, newVal));
    drawerAnim.setValue(newVal);
  };

  const onHandlerStateChange = (e: any) => {
    if (e.nativeEvent.state === State.END) {
      const { translationX, velocityX } = e.nativeEvent;
      const finalVal = lastOffset.current + translationX;
      if (finalVal > (DRAWER_WIDTH) / 2 || velocityX > 500) {
        openDrawer();
      } else {
        closeDrawer();
      }
    }
  };

  const isSettings = pathname.includes('settings');
  const segs = segments as unknown as string[];
  const isHome = (segs.length <= 1 && (segs[0] === '(tabs)' || !segs[0])) || (segs.length === 2 && segs[0] === '(tabs)' && segs[1] === 'index');

  const [activeTab, setActiveTab] = useState<'feed' | 'dashboard' | 'dynamic'>(view === 'dashboard' ? 'dashboard' : 'feed');
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const { openProfile, chatOpen } = useGlobalSearchParams();

  useEffect(() => {
    if (openProfile === 'true') {
      openDrawer();
      // Use setParams to clear the signal
      router.setParams({ openProfile: undefined });
    }
  }, [openProfile]);

  useEffect(() => {
    // If we have a pending navigation, wait for it to complete
    if (pendingTab) {
      if ((pendingTab === 'feed' || pendingTab === 'dashboard') && isHome && view === (pendingTab === 'feed' ? undefined : pendingTab)) {
        setPendingTab(null);
      } else if (pendingTab === 'dynamic' && !isHome) {
        setPendingTab(null);
      }
      return;
    }

    if (!isHome) {
      setActiveTab('dynamic');
    } else {
      setActiveTab(view === 'dashboard' ? 'dashboard' : 'feed');
    }
  }, [view, isHome, pendingTab]);

  const isInboxActive = pathname.includes('inbox');
  const isFeedActive = isHome && view !== 'dashboard';
  const isDashActive = isHome && view === 'dashboard';
  const isDynamicActive = !isHome && !isInboxActive;

  const drawerTranslateX = drawerAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [-25, 0], // Very subtle parallax
    extrapolate: 'clamp'
  });

  const drawerScale = drawerAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [0.96, 1], // Subtle scale for "coming forward" feel
    extrapolate: 'clamp'
  });

  const drawerOpacity = drawerAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [0.3, 1], // Start slightly visible behind
    extrapolate: 'clamp'
  });

  const contentTranslateX = drawerAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [0, DRAWER_WIDTH],
    extrapolate: 'clamp'
  });

  const contentScale = drawerAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [1, 0.9], // Slightly more dramatic scale for "reveal" feel
    extrapolate: 'clamp'
  });

  const overlayOpacity = drawerAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [0, 0.6],
    extrapolate: 'clamp'
  });

  const isCreator = (currentUser as any)?.is_creator || currentUser?.account_type === 'creator' || false;

  const ALL_DRAWER_ITEMS = [
    {
      label: 'Home',
      icon: Home,
      subItems: [
        { label: 'Feed', icon: Home, route: '/(tabs)', params: { view: 'feed' } },
        { label: 'Inbox', icon: Message, route: '/(tabs)/inbox' },
        { label: 'Notifications', icon: Notification, route: '/notifications' },
      ],
    },
    {
      label: 'Dashboard',
      icon: Category,
      subItems: [
        { label: 'Overview & Stats', icon: Category, route: '/(tabs)', params: { view: 'dashboard' } },
        { label: 'Portfolio', icon: Wallet, route: '/(tabs)/portfolio' },
        { label: 'Broker Connect', icon: Swap, route: '/broker-connect' },
      ],
    },
    {
      label: 'Journal',
      icon: Paper,
      subItems: [
        { label: 'Daily Journal', icon: Document, route: '/(tabs)/journal' },
        { label: 'Performance Analytics', icon: Chart, route: '/(tabs)/journal' },
        { label: 'Trade History', icon: TimeCircle, route: '/(tabs)/journal' },
      ],
    },
    {
      label: 'Risk Guard',
      icon: ShieldDone,
      subItems: [
        { label: 'Risk Dashboard', icon: ShieldDone, route: '/(tabs)/risk-guard' },
        { label: 'Drawdown Limits', icon: ShieldFail, route: '/(tabs)/risk-guard' },
        { label: 'Kill Switch', icon: CloseSquare, route: '/(tabs)/risk-guard' },
      ],
    },
    {
      label: 'AI Coach',
      icon: SparklesIcon,
      subItems: [
        { label: 'AI Coach Insights', icon: SparklesIcon, action: 'ai' },
        { label: 'Trade Feedback & Chat', icon: Chat, action: 'ai' },
      ],
    },
    {
      label: 'Auto Trade',
      icon: Activity,
      subItems: [
        { label: 'Active Bots & Setup', icon: Work, route: '/broker-connect' },
        { label: 'Algo Marketplace', icon: Bag, route: '/(tabs)/marketplace' },
        { label: 'Order History', icon: Document, route: '/(tabs)/journal' },
      ],
    },
    {
      label: 'Discover',
      icon: Discovery,
      subItems: [
        { label: 'Algo Marketplace', icon: Bag, route: '/(tabs)/marketplace' },
        { label: 'Trading Contests', icon: Trophy, route: '/(tabs)/contests' },
        { label: 'Courses & Learning', icon: Paper, route: '/(tabs)/learning' },
      ],
    },
    {
      label: 'Channels',
      icon: TwoUsers,
      subItems: [
        { label: 'Trading Channels', icon: Chat, route: '/(tabs)/channels' },
        { label: 'Mentorship Hub', icon: Crown, route: '/(tabs)/mentorship-hub' },
        { label: 'Live Sessions', icon: Video, route: '/(tabs)/live-sessions' },
      ],
    },
  ];

  if (isElite || isCreator) {
    ALL_DRAWER_ITEMS.push({
      label: 'Creator Studio',
      icon: Crown,
      subItems: [
        { label: 'Creator Dashboard', icon: Category, route: '/(tabs)/creator-studio' },
        { label: 'My Store', icon: Bag, route: '/(tabs)/my-store' },
      ],
    } as any);
  }

  const DRAWER_FOOTER = [
    { label: 'Rewards', icon: Gift, route: '/(tabs)/rewards' },
    { label: 'Settings and privacy', icon: SettingsIcon, route: '/(tabs)/settings' },
    { label: 'Help Centre', icon: HelpCircle, route: '/help' },
    { label: 'Log Out', icon: Logout, action: 'signout' },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : (headerStyle === 'simple' ? '#f4f4f6' : '#000000') }}>
        <StatusBar barStyle={isDark ? "light-content" : (headerStyle === 'simple' ? "dark-content" : "light-content")} />

        {/* FIXED TOP GLOW - Stays stationary during drawer animation */}
        <Image
          source={require('../../assets/images/top-glow.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: SCREEN_WIDTH,
            height: insets.top + 100, // Slightly taller for better coverage
            zIndex: 1, // Behind both drawer and content
            opacity: headerStyle === 'top_glow' ? 1 : 0,
          }}
          resizeMode="stretch"
        />

        {/* PROFILE DRAWER CONTENT */}
        <Animated.View style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: isDark ? 'transparent' : (headerStyle === 'simple' ? '#ffffff' : 'transparent'),
          borderRightWidth: isDark ? 0 : (headerStyle === 'simple' ? 1 : 0),
          borderRightColor: '#e2e8f0',
          zIndex: 5, // Above glow, but behind main content
          paddingTop: insets.top + 50,
          paddingHorizontal: 20,
          opacity: drawerOpacity,
          transform: [
            { translateX: drawerTranslateX },
            { scale: drawerScale }
          ]
        }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20 }}
            style={{ backgroundColor: 'transparent' }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                closeDrawer();
                router.push('/profile');
              }}
              style={{ marginBottom: 24 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <Image
                  source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }}
                  style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : (headerStyle === 'simple' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.2)') }}
                />
                <TouchableOpacity
                  style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: isDark ? '#1e293b' : (headerStyle === 'simple' ? '#cbd5e1' : '#1e293b'), backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : (headerStyle === 'simple' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)'), alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => {
                    Alert.alert(
                      "Select Market",
                      "Choose your preferred trading market",
                      [
                        { text: "Indian Market", onPress: () => setCurrentMarket("Indian Market") },
                        { text: "Global Market", onPress: () => setCurrentMarket("Global Market") },
                        { text: "Cancel", style: "cancel" }
                      ]
                    );
                  }}
                >
                  <Globe size={18} color={isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff')} />
                </TouchableOpacity>
              </View>

              <View>
                <Text style={{ color: isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff'), fontSize: 18, fontFamily: 'Inter_700Bold' }}>
                  {currentUser?.display_name || ''}
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : (headerStyle === 'simple' ? '#64748b' : '#94a3b8'), fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 2 }}>
                  @{currentUser?.username || 'user'} • {currentMarket}
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', gap: 4 }}
                    onPress={() => setFollowModalState({ isVisible: true, type: 'following' })}
                  >
                    <Text style={{ color: isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff'), fontSize: 13, fontFamily: 'Inter_700Bold' }}>{followingCount}</Text>
                    <Text style={{ color: isDark ? '#94a3b8' : (headerStyle === 'simple' ? '#64748b' : '#94a3b8'), fontSize: 13, fontFamily: 'Inter_500Medium' }}>Following</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', gap: 4 }}
                    onPress={() => setFollowModalState({ isVisible: true, type: 'followers' })}
                  >
                    <Text style={{ color: isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff'), fontSize: 13, fontFamily: 'Inter_700Bold' }}>{followerCount}</Text>
                    <Text style={{ color: isDark ? '#94a3b8' : (headerStyle === 'simple' ? '#64748b' : '#94a3b8'), fontSize: 13, fontFamily: 'Inter_500Medium' }}>Followers</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>

            {/* Drawer Main Items - Folders & Subfolders */}
            {ALL_DRAWER_ITEMS.map((item: any, idx: number) => {
              const isExpanded = expandedItem === item.label;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isAnySubActive = hasSubItems && item.subItems.some((sub: any) => {
                if (sub.params?.view && isHome && view === sub.params.view) return true;
                if (sub.route && !sub.params && (pathname === sub.route || pathname.includes(sub.route.replace('/(tabs)', '')))) return true;
                return false;
              });

              return (
                <View key={idx} style={{ marginBottom: 2 }}>
                  {/* Folder Header Row */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      h();
                      closeDrawer();
                      if (item.action === 'ai') {
                        openAI();
                        return;
                      }
                      setActiveNavItem({ label: item.label, icon: item.icon });
                      if (item.label === 'Home') {
                        setActiveTab('feed');
                        setPendingTab('feed');
                        if (isHome) {
                          router.setParams({ view: 'feed' });
                        } else {
                          router.push({ pathname: '/(tabs)', params: { view: 'feed' } } as any);
                        }
                      } else if (item.label === 'Dashboard') {
                        setActiveTab('dashboard');
                        setPendingTab('dashboard');
                        if (isHome) {
                          router.setParams({ view: 'dashboard' });
                        } else {
                          router.push({ pathname: '/(tabs)', params: { view: 'dashboard' } } as any);
                        }
                      } else if (item.label === 'Journal') {
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push('/(tabs)/journal');
                      } else if (item.label === 'Risk Guard') {
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push('/(tabs)/risk-guard');
                      } else if (item.label === 'Auto Trade') {
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push('/broker-connect');
                      } else if (item.label === 'Discover') {
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push('/(tabs)/marketplace');
                      } else if (item.label === 'Channels') {
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push('/(tabs)/channels');
                      } else if (item.label === 'Creator Studio') {
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push('/(tabs)/creator-studio');
                      } else if (item.route) {
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push(item.route as any);
                      } else {
                        // Fallback: toggle expanded if no primary route
                        setExpandedItem(isExpanded ? null : item.label);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      gap: 16,
                      backgroundColor: isAnySubActive && !isExpanded
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'transparent',
                    }}
                  >
                    {/* Fixed container for Iconly Icon ensuring guaranteed gap */}
                    <View style={{ width: 26, alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon
                        size={22}
                        color={isAnySubActive ? '#38bdf8' : '#ffffff'}
                        set={isAnySubActive ? 'bold' : 'curved'}
                        stroke="bold"
                      />
                    </View>

                    <Text style={{
                      flex: 1,
                      color: isAnySubActive ? '#38bdf8' : '#ffffff',
                      fontSize: 16,
                      fontFamily: isAnySubActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                      letterSpacing: -0.2,
                    }}>
                      {item.label}
                    </Text>

                    {hasSubItems && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                        onPress={(e) => {
                          e.stopPropagation();
                          h();
                          setExpandedItem(isExpanded ? null : item.label);
                        }}
                        style={{ padding: 4 }}
                      >
                        <ChevronDown
                          size={18}
                          color={isExpanded ? '#38bdf8' : '#94a3b8'}
                          style={{
                            transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                          }}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {/* Subfolder Items */}
                  {isExpanded && hasSubItems && (
                    <View style={{
                      paddingLeft: 14,
                      marginLeft: 18,
                      marginTop: 2,
                      marginBottom: 6,
                      borderLeftWidth: 1.5,
                      borderLeftColor: 'rgba(255, 255, 255, 0.15)',
                    }}>
                      {item.subItems.map((sub: any, sIdx: number) => {
                        const isSubActive =
                          (sub.params?.view && isHome && view === sub.params.view) ||
                          (sub.route && !sub.params && (pathname === sub.route || pathname.includes(sub.route.replace('/(tabs)', ''))));
                        const SubIcon = sub.icon || Document;

                        return (
                          <TouchableOpacity
                            key={sIdx}
                            activeOpacity={0.65}
                            onPress={() => {
                              h();
                              closeDrawer();
                              setActiveNavItem({ label: sub.label, icon: sub.icon || item.icon });
                              if (sub.action === 'ai') {
                                openAI();
                                return;
                              }
                              if (sub.params) {
                                setActiveTab(sub.params.view === 'dashboard' ? 'dashboard' : 'feed');
                                setPendingTab(sub.params.view === 'dashboard' ? 'dashboard' : 'feed');
                                if (isHome) {
                                  router.setParams(sub.params);
                                } else {
                                  router.push({ pathname: '/(tabs)', params: sub.params } as any);
                                }
                                return;
                              }
                              if (sub.route) {
                                setActiveTab('dynamic');
                                setPendingTab('dynamic');
                                router.push(sub.route as any);
                              }
                            }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderRadius: 10,
                              marginVertical: 2,
                              backgroundColor: isSubActive
                                ? 'rgba(56, 189, 248, 0.15)'
                                : 'transparent',
                              gap: 14,
                            }}
                          >
                            <View style={{ width: 22, alignItems: 'center', justifyContent: 'center' }}>
                              <SubIcon
                                size={17}
                                color={isSubActive ? '#38bdf8' : '#94a3b8'}
                                set={isSubActive ? 'bold' : 'curved'}
                                stroke="bold"
                              />
                            </View>
                            <Text style={{
                              flex: 1,
                              color: isSubActive ? '#38bdf8' : '#e2e8f0',
                              fontSize: 14,
                              fontFamily: isSubActive ? 'Inter_700Bold' : 'Inter_500Medium',
                            }}>
                              {sub.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            <View style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)', marginVertical: 14 }} />

            {/* Drawer Footer Items */}
            {DRAWER_FOOTER.map((item: any, idx: number) => {
              const isFooterActive = item.route && pathname.includes(item.route.replace('/(tabs)', ''));
              const isSignout = item.action === 'signout';
              const iconColor = isSignout ? '#ef4444' : (isFooterActive ? '#38bdf8' : '#ffffff');
              const textColor = isSignout ? '#ef4444' : (isFooterActive ? '#38bdf8' : '#ffffff');

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => {
                    h();
                    closeDrawer();
                    if (isSignout) {
                      Alert.alert(
                        'Log Out',
                        'Are you sure you want to log out of TradiFive?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Log Out',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                const { AuthService } = require('../services/auth.service');
                                await AuthService.signOut();
                              } catch (e) {}
                              router.replace('/login');
                            }
                          }
                        ]
                      );
                      return;
                    }
                    if (item.route) {
                      setActiveNavItem({ label: item.label, icon: item.icon });
                      setActiveTab('dynamic');
                      setPendingTab('dynamic');
                      router.push(item.route as any);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    gap: 16,
                    borderRadius: 10,
                    marginBottom: 4,
                    backgroundColor: isFooterActive
                      ? 'rgba(56, 189, 248, 0.12)'
                      : 'transparent',
                  }}
                >
                  <View style={{ width: 26, alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon
                      size={20}
                      color={iconColor}
                      set={isFooterActive ? 'bold' : 'curved'}
                      stroke="bold"
                    />
                  </View>
                  <Text style={{
                    color: textColor,
                    fontSize: 15,
                    fontFamily: isFooterActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                  }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* MAIN CONTENT AREA */}
        <PanGestureHandler
          enabled={Platform.OS !== 'web' && cardActive !== 'true'}
          activeOffsetX={[-20, 20]}
          failOffsetY={[-10, 10]}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={{
            flex: 1,
            backgroundColor: 'transparent', // Make transparent so fixed glow shows through
            zIndex: 10, // Ensure it is on top
            transform: [
              { translateX: contentTranslateX },
              { scale: contentScale }
            ],
            borderRadius: drawerAnim.interpolate({
              inputRange: [0, DRAWER_WIDTH],
              outputRange: [0, 32],
              extrapolate: 'clamp'
            }),
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: drawerOpen ? 0.5 : 0,
            shadowRadius: 10,
            elevation: drawerOpen ? 10 : 0,
          }}>
            {/* Full-page dimming overlay */}
            <Animated.View
              pointerEvents={drawerOpen ? 'auto' : 'none'}
              style={[StyleSheet.absoluteFillObject, {
                backgroundColor: '#000',
                opacity: drawerAnim.interpolate({
                  inputRange: [0, DRAWER_WIDTH],
                  outputRange: [0, 0.4],
                  extrapolate: 'clamp'
                }),
                zIndex: 10000
              }]}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={closeDrawer}
                style={{ flex: 1 }}
              />
            </Animated.View>

            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarStyle: { display: 'none' },
                sceneStyle: { backgroundColor: 'transparent' }
              }}
              {...({ sceneContainerStyle: { backgroundColor: 'transparent' } } as any)}
            >
              <Tabs.Screen name="index" options={{ title: 'Home' }} />
              <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
              <Tabs.Screen name="risk-guard" options={{ title: 'Risk Guard' }} />
              <Tabs.Screen name="ai-coach" options={{ title: 'AI Coach' }} />
              <Tabs.Screen name="rewards" options={{ title: 'Rewards' }} />
              <Tabs.Screen name="channel" options={{ title: 'Channel' }} />
              <Tabs.Screen name="channels" options={{ title: 'Channels' }} />
              <Tabs.Screen name="learning" options={{ title: 'Learning' }} />
              <Tabs.Screen name="contests" options={{ title: 'Contests' }} />
              <Tabs.Screen name="mentorship-hub" options={{ title: 'Mentorship Hub' }} />
              <Tabs.Screen name="live-sessions" options={{ title: 'Live Sessions' }} />
              <Tabs.Screen name="portfolio" options={{ title: 'Portfolio' }} />
              <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
              <Tabs.Screen name="finance" options={{ title: 'Finance' }} />
              <Tabs.Screen name="marketplace" options={{ title: 'Marketplace' }} />
              <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
              <Tabs.Screen name="creator-studio" options={{ title: 'Creator Studio' }} />
              <Tabs.Screen name="my-store" options={{ title: 'My Store' }} />
              <Tabs.Screen name="referrals" options={{ title: 'Referrals' }} />
            </Tabs>

            {/* GLOBAL TOP HEADER - Show for all tactical pages (Left Aligned Style) */}
            {!isSettings && !isHome && !pathname.includes('channel') && !pathname.includes('journal') && !pathname.includes('risk-guard') && !pathname.includes('rewards') && !pathname.includes('inbox') && !pathname.includes('referrals') && !pathname.includes('notifications') && !pathname.includes('ai-coach') && !pathname.includes('creator-studio') && !pathname.includes('mentorship-hub') && !pathname.includes('my-store') && !pathname.includes('live-sessions') && (
              <View style={{ position: 'absolute', top: 0, width: '100%', zIndex: 1000, pointerEvents: 'box-none' }}>
                <View style={{
                  paddingTop: insets.top + 12,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }} pointerEvents="box-none">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 44 }} pointerEvents="box-none">
                    <TouchableOpacity
                      onPress={openDrawer}
                      style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <Image source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }} style={{ width: '100%', height: '100%' }} />
                    </TouchableOpacity>
                    <Text style={{
                      color: '#fff',
                      fontSize: 24,
                      letterSpacing: -0.5
                      , fontFamily: 'Inter_600SemiBold', lineHeight: 30
                    }}>
                      {activeNavItem.label}
                    </Text>
                    {activeNavItem.hasChevron && (
                      <ChevronDown size={20} color="#fff" style={{ marginTop: 2 }} />
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {/* Profile deliberately removed from Journal view per request */}
                  </View>
                </View>
              </View>
            )}

            {/* GLOBAL FLOATING NAV BAR - Hidden on Settings / Active Post hold / Chat Open / Media Viewer */}
            {!isSettings && cardActive !== 'true' && chatOpen !== 'true' && mediaViewerOpen !== 'true' && (
              <Animated.View style={{
                position: 'absolute',
                bottom: insets.bottom + 2,
                left: 20,
                right: 20,
                zIndex: 1000,
                opacity: navOpacity, // Apply direction-based opacity
                transform: [{ translateY: navTranslateY }],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                  {/* 1. SEARCH CIRCLE PILL */}
                  <TouchableOpacity style={[styles.pill, isDark && { backgroundColor: '#111111', borderColor: '#222222' }]} onPress={() => { h(); setSearchOpen(true); }}>
                    <Search size={20} color="#8E8E93" strokeWidth={2.5} />
                  </TouchableOpacity>

                  {/* MAIN PILL CLUSTER */}
                  <View style={[styles.cluster, isDark && { backgroundColor: '#111111', borderColor: '#222222' }]}>
                    {/* 1. HOME (FEED) */}
                    <TouchableOpacity
                      onPress={() => {
                        setActiveTab('feed');
                        setPendingTab('feed');
                        if (isHome) router.setParams({ view: 'feed' });
                        else router.push({ pathname: '/(tabs)', params: { view: 'feed' } } as any);
                      }}
                      style={isFeedActive ? [styles.clusterActive, isDark && { backgroundColor: '#222222' }] : styles.clusterBtn}
                    >
                      <Home
                        key={isFeedActive ? 'feed-active' : 'feed-inactive'}
                        size={20}
                        color={isFeedActive ? (isDark ? '#ffffff' : '#000') : '#8E8E93'}
                        set={isFeedActive ? 'bold' : 'curved'}
                        stroke="bold"
                      />
                    </TouchableOpacity>

                    {/* 2. DASHBOARD */}
                    <TouchableOpacity
                      onPress={() => {
                        setActiveTab('dashboard');
                        setPendingTab('dashboard');
                        if (isHome) router.setParams({ view: 'dashboard' });
                        else router.push({ pathname: '/(tabs)', params: { view: 'dashboard' } } as any);
                      }}
                      style={isDashActive ? [styles.clusterActive, isDark && { backgroundColor: '#222222' }] : styles.clusterBtn}
                    >
                      <LayoutGrid
                        key={isDashActive ? 'dash-active' : 'dash-inactive'}
                        size={20}
                        color={isDashActive ? (isDark ? '#ffffff' : '#000') : '#8E8E93'}
                        set={isDashActive ? 'bold' : 'curved'}
                        stroke="bold"
                      />
                    </TouchableOpacity>

                    {/* 3. DYNAMIC SLOT */}
                    <TouchableOpacity
                      style={isDynamicActive ? [styles.clusterActive, isDark && { backgroundColor: '#222222' }] : styles.clusterBtn}
                      onPress={() => {
                        h();
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        if (activeNavItem.label === 'Trading Journal' || activeNavItem.label === 'Journal') router.push('/(tabs)/journal');
                        else if (activeNavItem.label === 'Risk Guard') router.push('/(tabs)/risk-guard');
                        else if (activeNavItem.label === 'Rewards') router.push('/(tabs)/rewards');
                        else if (activeNavItem.label === 'Broker Connect') router.push('/broker-connect' as any);
                        else if (activeNavItem.label === 'Channels') router.push('/(tabs)/channels');
                        else if (activeNavItem.label === 'Marketplace') router.push('/(tabs)/marketplace');
                        else if (activeNavItem.label === 'Settings') router.push('/(tabs)/settings');
                      }}
                    >
                      <activeNavItem.icon
                        key={isDynamicActive ? 'dynamic-active' : 'dynamic-inactive'}
                        size={20}
                        color={isDynamicActive ? (isDark ? '#ffffff' : '#000') : '#8E8E93'}
                        set={isDynamicActive ? 'bold' : 'curved'}
                        stroke="bold"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        h();
                        setActiveTab('dynamic');
                        setPendingTab('dynamic');
                        router.push('/(tabs)/inbox' as any);
                      }}
                      style={isInboxActive ? [styles.clusterActive, isDark && { backgroundColor: '#222222' }] : styles.clusterBtn}
                    >
                      <MessageCircle
                        key={isInboxActive ? 'inbox-active' : 'inbox-inactive'}
                        size={20}
                        color={isInboxActive ? (isDark ? '#ffffff' : '#000') : '#8E8E93'}
                        set={isInboxActive ? 'bold' : 'curved'}
                        stroke="bold"
                      />
                    </TouchableOpacity>

                  </View>

                  {/* AI BOT PILL */}
                  <TouchableOpacity style={[styles.pill, isDark && { backgroundColor: '#111111', borderColor: '#222222' }]} onPress={openAI}>
                    <Sparkles size={20} color={isDark ? '#ffffff' : '#000'} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* NAV MENU MODAL */}
            <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
              <Animated.View style={{ flex: 1, backgroundColor: '#000', transform: [{ translateY: menuAnim }] }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: insets.bottom + 100 }}>
                  <Text style={{ color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 16 }}>Navigation</Text>
                  {ALL_DRAWER_ITEMS.map((item: any, idx: number) => {
                    const isExpanded = expandedItem === item.label;
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isAnySubActive = hasSubItems && item.subItems.some((sub: any) => {
                      if (sub.params?.view && isHome && view === sub.params.view) return true;
                      if (sub.route && !sub.params && (pathname === sub.route || pathname.includes(sub.route.replace('/(tabs)', '')))) return true;
                      return false;
                    });

                    return (
                      <View key={idx} style={{ marginBottom: 6 }}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            h();
                            if (hasSubItems) {
                              setExpandedItem(isExpanded ? null : item.label);
                            } else {
                              closeMenu();
                              if (item.action === 'ai') {
                                openAI();
                                return;
                              }
                              setActiveNavItem({ label: item.label, icon: item.icon });
                              if (item.params) {
                                if (isHome) {
                                  router.setParams(item.params);
                                } else {
                                  router.push({ pathname: '/(tabs)', params: item.params } as any);
                                }
                              } else if (item.route) {
                                router.push(item.route as any);
                              }
                            }
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 13,
                            paddingHorizontal: 14,
                            borderRadius: 12,
                            gap: 16,
                            backgroundColor: isAnySubActive ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>
                            <item.icon size={20} color={isAnySubActive ? '#38bdf8' : '#fff'} set={isAnySubActive ? 'bold' : 'curved'} stroke="bold" />
                          </View>
                          <Text style={{
                            color: isAnySubActive ? '#38bdf8' : '#fff',
                            fontSize: 16,
                            flex: 1,
                            fontFamily: isAnySubActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                            letterSpacing: -0.2
                          }}>
                            {item.label}
                          </Text>
                          {hasSubItems && (
                            <ChevronDown
                              size={16}
                              color="#64748b"
                              style={{
                                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                              }}
                            />
                          )}
                        </TouchableOpacity>

                        {isExpanded && hasSubItems && (
                          <View style={{
                            paddingLeft: 14,
                            marginLeft: 24,
                            marginTop: 4,
                            marginBottom: 4,
                            borderLeftWidth: 1.5,
                            borderLeftColor: 'rgba(56, 189, 248, 0.3)',
                          }}>
                            {item.subItems.map((sub: any, sIdx: number) => {
                              const isSubActive =
                                (sub.params?.view && isHome && view === sub.params.view) ||
                                (sub.route && !sub.params && (pathname === sub.route || pathname.includes(sub.route.replace('/(tabs)', ''))));
                              const SubIcon = sub.icon || Document;

                              return (
                                <TouchableOpacity
                                  key={sIdx}
                                  activeOpacity={0.65}
                                  onPress={() => {
                                    h();
                                    closeMenu();
                                    setActiveNavItem({ label: sub.label, icon: sub.icon || item.icon });
                                    if (sub.action === 'ai') {
                                      openAI();
                                      return;
                                    }
                                    if (sub.params) {
                                      setActiveTab(sub.params.view === 'dashboard' ? 'dashboard' : 'feed');
                                      setPendingTab(sub.params.view === 'dashboard' ? 'dashboard' : 'feed');
                                      if (isHome) {
                                        router.setParams(sub.params);
                                      } else {
                                        router.push({ pathname: '/(tabs)', params: sub.params } as any);
                                      }
                                      return;
                                    }
                                    if (sub.route) {
                                      setActiveTab('dynamic');
                                      setPendingTab('dynamic');
                                      router.push(sub.route as any);
                                    }
                                  }}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 9,
                                    paddingHorizontal: 10,
                                    borderRadius: 10,
                                    marginVertical: 1.5,
                                    backgroundColor: isSubActive ? 'rgba(56, 189, 248, 0.14)' : 'transparent',
                                    gap: 14,
                                  }}
                                >
                                  <View style={{ width: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <SubIcon
                                      size={16}
                                      color={isSubActive ? '#38bdf8' : '#94a3b8'}
                                      set={isSubActive ? 'bold' : 'curved'}
                                      stroke="bold"
                                    />
                                  </View>
                                  <Text style={{
                                    flex: 1,
                                    color: isSubActive ? '#38bdf8' : '#e2e8f0',
                                    fontSize: 14,
                                    fontFamily: isSubActive ? 'Inter_700Bold' : 'Inter_500Medium',
                                  }}>
                                    {sub.label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
                <View style={{ position: 'absolute', bottom: insets.bottom + 20, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity
                      onPress={() => { closeMenu(); router.push('/(tabs)/rewards'); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <Gift size={18} color="#fff" strokeWidth={1.5} />
                      <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_500Medium' }}>Rewards</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => { closeMenu(); router.push('/(tabs)/settings'); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <SettingsIcon size={18} color="#fff" strokeWidth={1.5} />
                      <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_500Medium' }}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => { closeMenu(); router.push('/help'); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <HelpCircle size={18} color="#fff" strokeWidth={1.5} />
                      <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_500Medium' }}>Help</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={closeMenu}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: '#1c1c1e',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <X size={26} color="#fff" strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Modal>

            {/* AI COACH OVERLAY */}
            <Modal
              visible={aiOpen}
              animationType="slide"
              transparent={true}
              onRequestClose={closeAI}
            >
              <AiCoachOverlay onClose={closeAI} />
            </Modal>

            {/* SEARCH OVERLAY */}
            <Modal
              visible={searchOpen}
              animationType="slide"
              transparent={true}
              onRequestClose={() => { setSearchOpen(false); setSearchQuery(''); }}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <KeyboardAvoidingView
                  style={{
                    flex: 1,
                    marginTop: insets.top + 15,
                    backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 25,
                  }}
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                  <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: isDark ? '#1a1a1a' : '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#111111' : '#f8fafc', borderRadius: 16, height: 48, paddingHorizontal: 16, borderWidth: 1, borderColor: isDark ? '#222222' : '#e2e8f0' }}>
                      <Search size={18} color="#94a3b8" />
                      <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search Tradifive..."
                        placeholderTextColor="#94a3b8"
                        keyboardAppearance={isDark ? "dark" : "light"}
                        autoFocus
                        style={{ flex: 1, height: '100%', fontSize: 16, fontFamily: 'Inter_500Medium', color: isDark ? theme.text : '#0f172a', paddingLeft: 10 }}
                      />
                      {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                          <X size={16} color="#94a3b8" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <TouchableOpacity onPress={() => { h(); setSearchOpen(false); setSearchQuery(''); }} style={{ paddingHorizontal: 10, height: 48, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                    {!searchQuery ? (
                      <View>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Quick Access</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                          {QUICK_SEARCHES.map((qs, i) => (
                            <TouchableOpacity
                              key={i}
                              style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: isDark ? '#111111' : '#f1f5f9', borderRadius: 20 }}
                              onPress={() => { h(); setSearchQuery(qs); }}
                            >
                              <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? theme.text : '#0f172a' }}>{qs}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <View style={{ marginTop: 32 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <History size={16} color="#94a3b8" />
                            <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>Recent Activity</Text>
                          </View>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#1a1a1a' : '#f1f5f9' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? '#111111' : '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={18} color="#64748b" />
                              </View>
                              <Text style={{ fontSize: 15, fontFamily: 'Inter_500Medium', color: isDark ? theme.text : '#0f172a' }}>Risk Settings Updated</Text>
                            </View>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>2h ago</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? '#111111' : '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                                <BookOpen size={18} color="#64748b" />
                              </View>
                              <Text style={{ fontSize: 15, fontFamily: 'Inter_500Medium', color: isDark ? theme.text : '#0f172a' }}>Viewed Trading Journal</Text>
                            </View>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>Yesterday</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View>
                        {SEARCH_DATA.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                          SEARCH_DATA.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => {
                                h();
                                setSearchOpen(false);
                                setSearchQuery('');
                                router.push(item.route as any);
                              }}
                              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? '#1a1a1a' : '#f1f5f9' }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isDark ? '#111111' : '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                                  <item.icon size={20} color="#3b82f6" />
                                </View>
                                <View>
                                  <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a' }}>{item.label}</Text>
                                  <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', textTransform: 'capitalize' }}>{item.type}</Text>
                                </View>
                              </View>
                              <ChevronRight size={20} color="#cbd5e1" />
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={{ alignItems: 'center', paddingTop: 40 }}>
                            <Search size={40} color="#cbd5e1" style={{ marginBottom: 16 }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a', marginBottom: 4 }}>No results found</Text>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>Try searching for a different term</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </ScrollView>
                </KeyboardAvoidingView>
              </View>
            </Modal>

            <UsernameModal />

          </Animated.View>
        </PanGestureHandler>

        <FollowListModal
          isVisible={followModalState.isVisible}
          onClose={() => setFollowModalState(prev => ({ ...prev, isVisible: false }))}
          userId={currentUser?.id || ''}
          type={followModalState.type}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 54, height: 54,
    backgroundColor: '#ffffff', borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  cluster: {
    backgroundColor: '#ffffff', borderRadius: 34,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 6, paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', gap: 2,
  },
  clusterActive: {
    width: 46, height: 46, backgroundColor: '#F2F2F7',
    borderRadius: 23, alignItems: 'center', justifyContent: 'center',
  },
  clusterBtn: {
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
  },
  aiHeader: {
    paddingHorizontal: 24, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
  },
  aiCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center'
  },
  aiBotMsg: {
    backgroundColor: '#f8fafc', padding: 18, borderRadius: 20,
    borderTopLeftRadius: 4, maxWidth: '85%', marginBottom: 32, borderWidth: 1, borderColor: '#e2e8f0'
  },
  aiMsgText: { color: '#0f172a', fontSize: 16, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  aiSuggest: {
    padding: 16, borderRadius: 14, backgroundColor: '#f8fafc',
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  aiSuggestText: { color: '#334155', fontSize: 14, fontFamily: 'Inter_500Medium' },
  aiInputRow: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#ffffff',
    flexDirection: 'row', alignItems: 'center', gap: 12
  },
  aiInput: {
    flex: 1, height: 44, backgroundColor: '#f1f5f9', borderRadius: 24,
    paddingHorizontal: 20, color: '#0f172a', fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0'
  },
  aiSendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  }
});
