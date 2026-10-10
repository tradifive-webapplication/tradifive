import { Tabs, useRouter, usePathname, useGlobalSearchParams, useSegments } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Menu, X, Cpu, Zap, CreditCard, History, Brain, Mic, BadgeCheck, Clock, List, Rocket, CircleSlash, UserPlus, DollarSign, ArrowUp, Globe, Sparkles
} from 'lucide-react-native';
import {
  User,
  UsersIcon as Users,
  MessageIcon as MessageCircle,
  MessageIcon as MessageSquare,
  Setting as SettingsIcon,
  CrownIcon as Crown,
  TrophyIcon as Trophy,
  Home,
  Search,
  ShieldDoneIcon as ShieldCheck,
  Document as BookOpen,
  Send,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpIcon as HelpCircle,
  Category as LayoutGrid,
  Bag,
  Bookmark,
  Discovery as Gift,
  Video
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
  { label: 'Rewards', type: 'tool', route: '/(tabs)/rewards', icon: Gift },
  { label: 'Discover', type: 'community', route: '/(tabs)/channel?view=Discover', icon: Users },
  { label: 'Channels', type: 'community', route: '/(tabs)/channels', icon: Users },
  { label: 'Help Center', type: 'support', route: '/help', icon: HelpCircle },
  { label: 'Settings', type: 'account', route: '/settings', icon: SettingsIcon },
  { label: 'Contests', type: 'community', route: '/(tabs)/contests', icon: Trophy },
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
  const isHome = (segments.length <= 1 && (segments[0] === '(tabs)' || !segments[0])) || (segments.length === 2 && segments[0] === '(tabs)' && (segments[1] as string) === 'index');

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

  const isCreator = (currentUser as any)?.is_creator || false;

  const ALL_DRAWER_ITEMS = [
    { label: 'Home', icon: Home, type: 'nav', subItems: ['Dashboard Overview', 'Inbox', 'Notifications'] },
    { label: 'Discover', icon: Search, type: 'nav', subItems: ['Marketplace', 'Rewards & Referrals'] },
    { label: 'Auto Trade', icon: Rocket, type: 'nav', subItems: ['Active Bots', 'Strategy Builder', 'Backtesting', 'Order History'] },
    { label: 'Portfolio & Finance', icon: Bag, type: 'nav', subItems: ['Portfolio', 'Broker Connect'] },
    { label: 'Risk Guard', icon: ShieldCheck, type: 'nav', subItems: ['Risk Dashboard', 'Drawdown Limits', 'Kill Switch'] },
    { label: 'AI & Journal', icon: Brain, type: 'nav', subItems: ['AI Coach Insights', 'Daily Journal', 'Performance Analytics'] },
    { label: 'Community & Learning', icon: Users, type: 'nav', subItems: ['Channels', 'Contests', 'Mentorship Hub', 'Live Sessions'] },
  ];

  if (isElite && currentUser?.account_type === 'creator') {
    ALL_DRAWER_ITEMS.push({
      label: 'Creator Studio', icon: Crown, type: 'nav',
      subItems: ['Creator Dashboard', 'My Store']
    } as any);
  }

  const DRAWER_FOOTER = [
    { label: 'Settings and privacy', icon: SettingsIcon },
    { label: 'Refer a Friend', icon: Users },
    { label: 'Help Centre', icon: HelpCircle },
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

            {/* Drawer Main Items */}
            {ALL_DRAWER_ITEMS.map((item: any, idx) => {
              const isExpanded = expandedItem === item.label;
              const isSoon = item.soon;

              return (
                <View key={idx}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.type === 'profile') {
                        closeDrawer();
                        router.push('/profile');
                      } else if (item.type === 'nav') {
                        if (isSoon) {
                          h();
                          return;
                        }
                        if (item.subItems) {
                          setExpandedItem(isExpanded ? null : item.label);
                          hSelect();
                        } else {
                          if ((item as any).isLocked) {
                            h();
                            Alert.alert("Locked", `${item.label} is currently locked.`);
                            return;
                          }
                          setActiveNavItem({ label: item.label, icon: item.icon });
                          setActiveTab('dynamic');
                          setPendingTab('dynamic');
                          if (item.label === 'Journal') router.push('/(tabs)/journal');
                          else if (item.label === 'Risk Guard') router.push('/(tabs)/risk-guard');
                          else if (item.label === 'Rewards') router.push('/(tabs)/rewards');
                          else if (item.label === 'Discover') router.push({ pathname: '/(tabs)/channel', params: { view: 'Discover' } });
                          else if (item.label === 'Channels') router.push('/(tabs)/channels');
                          closeDrawer();
                        }
                      }
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 16 }}
                  >
                    <item.icon size={20} color={isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff')} strokeWidth={2} />
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{ color: isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff'), fontSize: 16, fontFamily: 'Inter_700Bold' }}>{item.label}</Text>
                        {isSoon && (
                          <View style={{ backgroundColor: isDark ? '#1e293b' : (headerStyle === 'simple' ? '#f1f5f9' : '#1e293b'), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ color: isDark ? '#64748b' : (headerStyle === 'simple' ? '#64748b' : '#64748b'), fontSize: 8, fontFamily: 'Inter_700Bold' }}>SOON</Text>
                          </View>
                        )}
                      </View>
                      {item.subItems && (
                        <ChevronDown
                          size={16}
                          color={isDark ? '#475569' : (headerStyle === 'simple' ? '#64748b' : '#475569')}
                          style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && item.subItems && (
                    <View style={{ paddingLeft: 32, paddingBottom: 10, borderLeftWidth: 1, borderLeftColor: isDark ? '#1e293b' : (headerStyle === 'simple' ? '#e2e8f0' : '#1e293b'), marginLeft: 26, marginTop: 4 }}>
                      {item.subItems.map((sub: string) => {
                        const SUB_ITEM_ICONS: Record<string, any> = {
                          'Dashboard Overview': LayoutGrid,
                          'Inbox': MessageCircle,
                          'Notifications': Bookmark,
                          'Marketplace': Bag,
                          'Rewards & Referrals': Gift,
                          'Active Bots': Cpu,
                          'Strategy Builder': Zap,
                          'Backtesting': History,
                          'Order History': List,
                          'Portfolio': Bag,
                          'Broker Connect': Zap,
                          'Risk Dashboard': ShieldCheck,
                          'Drawdown Limits': CircleSlash,
                          'Kill Switch': X,
                          'AI Coach Insights': Brain,
                          'Daily Journal': BookOpen,
                          'Performance Analytics': Clock,
                          'Channels': Users,
                          'Contests': Trophy,
                          'Mentorship Hub': Bookmark,
                          'Live Sessions': Video,
                          'Creator Dashboard': Crown,
                          'My Store': Bag,
                        };
                        const SubIcon = SUB_ITEM_ICONS[sub] || BookOpen;
                        return (
                          <TouchableOpacity
                            key={sub}
                            onPress={() => {
                              if (item.isSoonGroup) {
                                h();
                                return;
                              }
                              setActiveNavItem({ label: item.label, icon: item.icon });
                              setActiveTab('dynamic');
                              setPendingTab('dynamic');
                              
                              if (sub === 'Inbox') { closeDrawer(); router.push('/(tabs)/inbox' as any); return; }
                              if (sub === 'Dashboard Overview') { closeDrawer(); router.setParams({ view: 'dashboard' }); return; }
                              if (sub === 'Marketplace') { closeDrawer(); router.push('/(tabs)/marketplace'); return; }
                              if (sub === 'Rewards & Referrals') { closeDrawer(); router.push('/(tabs)/rewards'); return; }
                              if (sub === 'Portfolio') { closeDrawer(); router.push('/(tabs)/finance'); return; }
                              if (sub === 'Broker Connect') { closeDrawer(); router.push('/broker-connect' as any); return; }
                              if (sub === 'Risk Dashboard') { closeDrawer(); router.push('/(tabs)/risk-guard'); return; }
                              if (sub === 'Daily Journal') { closeDrawer(); router.push('/(tabs)/journal'); return; }
                              if (sub === 'AI Coach Insights') { closeDrawer(); openAI(); return; }
                              if (sub === 'Channels') { closeDrawer(); router.push('/(tabs)/channels'); return; }
                              if (sub === 'Contests') { closeDrawer(); router.push('/(tabs)/contests'); return; }
                              if (sub === 'Mentorship Hub') { closeDrawer(); router.push('/(tabs)/mentorship-hub'); return; }
                              if (sub === 'Live Sessions') { closeDrawer(); router.push('/(tabs)/live-sessions'); return; }
                              if (sub === 'Creator Dashboard') { closeDrawer(); router.push('/(tabs)/creator-studio'); return; }
                              if (sub === 'My Store') { closeDrawer(); router.push('/(tabs)/my-store'); return; }

                              closeDrawer();
                            }}
                            style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                          >
                            <SubIcon size={15} color={isDark ? '#94a3b8' : (headerStyle === 'simple' ? '#64748b' : '#94a3b8')} strokeWidth={2} />
                            <Text style={{ color: isDark ? '#94a3b8' : (headerStyle === 'simple' ? '#475569' : '#94a3b8'), fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{sub}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            <View style={{ height: 1, backgroundColor: isDark ? '#1e293b' : (headerStyle === 'simple' ? '#e2e8f0' : '#1e293b'), marginVertical: 12 }} />

            {/* Drawer Footer Items */}
            {DRAWER_FOOTER.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  if (item.label === 'Settings and privacy') {
                    closeDrawer();
                    router.push('/(tabs)/settings');
                  } else if (item.label === 'Help Centre') {
                    closeDrawer();
                    router.push('/help');
                  } else if (item.label === 'Refer a Friend') {
                    closeDrawer();
                    router.push('/(tabs)/referrals');
                  }
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 16 }}
              >
                <item.icon size={18} color={isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff')} strokeWidth={2} />
                <Text style={{ color: isDark ? '#fff' : (headerStyle === 'simple' ? '#0f172a' : '#fff'), fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
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
              <Tabs.Screen name="channel" options={{ title: 'Channels' }} />
              <Tabs.Screen name="learning" options={{ title: 'Learning' }} />
              <Tabs.Screen name="contests" options={{ title: 'Contests' }} />
              <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
              <Tabs.Screen name="finance" options={{ title: 'Finance' }} />
              <Tabs.Screen name="marketplace" options={{ title: 'Marketplace' }} />
              <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
              <Tabs.Screen name="creator-studio" options={{ title: 'Creator Studio' }} />
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
                        if (activeNavItem.label === 'Journal') router.push('/(tabs)/journal');
                        else if (activeNavItem.label === 'Risk Guard') router.push('/(tabs)/risk-guard');
                        else if (activeNavItem.label === 'Rewards') router.push('/(tabs)/rewards');
                        else if (activeNavItem.label === 'Discover') router.push({ pathname: '/(tabs)/channel', params: { view: 'Discover' } });
                        else if (activeNavItem.label === 'Channels') router.push('/(tabs)/channels');
                        else if (activeNavItem.label === 'Learning') router.push('/(tabs)/learning');
                        else if (activeNavItem.label === 'Contests') router.push('/(tabs)/contests');
                        else if (activeNavItem.label === 'Finance') router.push('/(tabs)/finance');
                        else if (activeNavItem.label === 'Marketplace') router.push('/(tabs)/marketplace');
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
                  {(() => {
                    const localNavItems: any[] = [
                      { label: 'Journal', icon: BookOpen, hasChevron: false },
                      { label: 'Risk Guard', icon: ShieldCheck, hasChevron: false },
                      { label: 'Channels', icon: Users, hasChevron: false },
                      { label: 'Rewards', icon: Gift, hasChevron: false },
                    ];
                    if (isElite && currentUser?.account_type === 'creator') {
                      localNavItems.push({
                        label: 'Creator Hub',
                        icon: Crown,
                        hasChevron: true,
                        subItems: ['Creator Dashboard', 'Mentorship Hub', 'My Store', 'Live Sessions']
                      } as any);
                    }
                    return localNavItems.map(item => {
                      const Icon = item.icon;
                      const isExpanded = expandedItem === item.label;
                      return (
                        <View key={item.label}>
                          <TouchableOpacity
                            activeOpacity={0.2}
                            onPress={() => {
                              if (item.subItems) {
                                setExpandedItem(isExpanded ? null : item.label);
                                hSelect();
                              } else {
                                h();
                                setActiveNavItem({ label: item.label, icon: item.icon });
                                if (item.label === 'Journal') router.push('/(tabs)/journal');
                                else if (item.label === 'Discover') router.push({ pathname: '/(tabs)/channel', params: { view: 'Discover' } });
                                else if (item.label === 'Channels') router.push('/(tabs)/channels');
                                else if (item.label === 'Rewards') router.push('/(tabs)/rewards');
                                else if (item.label === 'Risk Guard') router.push('/(tabs)/risk-guard');
                                closeMenu();
                              }
                            }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: 14,
                              paddingHorizontal: 16,
                              marginBottom: 4,
                              opacity: 1
                            }}
                          >
                            <Icon size={18} color="#fff" style={{ marginRight: 16 }} strokeWidth={1.5} />
                            <Text style={{
                              color: '#fff',
                              fontSize: 16,
                              flex: 1,
                              fontFamily: 'Inter_400Regular',
                              letterSpacing: -0.1
                            }}>
                              {item.label}
                            </Text>

                            {item.hasChevron && (
                              <ChevronDown
                                size={16}
                                color="#fff"
                                style={{
                                  opacity: 0.6,
                                  transform: [{ rotate: isExpanded ? '180deg' : '0deg' }]
                                }}
                              />
                            )}
                          </TouchableOpacity>

                          {isExpanded && item.subItems && (
                            <View style={{ paddingLeft: 32, paddingBottom: 10, borderLeftWidth: 1, borderLeftColor: '#1e293b', marginLeft: 24, marginTop: 4 }}>
                              {item.subItems.map((sub: string) => {
                                const SUB_ITEM_ICONS: Record<string, any> = {
                                  'Creator Dashboard': Crown,
                                  'Mentorship Hub': Bookmark,
                                  'My Store': Bag,
                                  'Live Sessions': Video,
                                };
                                const SubIcon = SUB_ITEM_ICONS[sub] || BookOpen;
                                return (
                                  <TouchableOpacity
                                    key={sub}
                                    onPress={() => {
                                      setActiveNavItem({ label: item.label, icon: item.icon });
                                      if (sub === 'Creator Dashboard') { closeMenu(); router.push('/(tabs)/creator-studio'); return; }
                                      if (sub === 'Mentorship Hub') { closeMenu(); router.push('/(tabs)/mentorship-hub'); return; }
                                      if (sub === 'My Store') { closeMenu(); router.push('/(tabs)/my-store'); return; }
                                      if (sub === 'Live Sessions') { closeMenu(); router.push('/(tabs)/live-sessions'); return; }
                                      if (item.label === 'Channels') router.push('/(tabs)/channels');
                                      else if (item.label === 'Contests') router.push('/(tabs)/contests');
                                      else if (item.label === 'Learning') router.push('/(tabs)/learning');
                                      else if (item.label === 'AI Auto Trader') router.push('/(tabs)/ai-auto-trader' as any);
                                      else if (item.label === 'Strategy Builder') router.push('/(tabs)/strategy-builder' as any);
                                      else if (item.label === 'Finance') router.push('/(tabs)/finance');
                                      else if (item.label === 'Marketplace') router.push('/(tabs)/marketplace');
                                      else if (item.label === 'Risk Guard') router.push('/(tabs)/risk-guard');
                                      else if (item.label === 'Rewards') router.push('/(tabs)/rewards');
                                      closeMenu();
                                    }}
                                    style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                                  >
                                    <SubIcon size={16} color="#94a3b8" strokeWidth={2} />
                                    <Text style={{ color: '#94a3b8', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>{sub}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      );
                    });
                  })()}
                </ScrollView>
                <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', gap: 24 }}>
                    <TouchableOpacity
                      onPress={() => { closeMenu(); router.push('/(tabs)/settings'); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    >
                      <SettingsIcon size={20} color="#fff" strokeWidth={1.5} />
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_400Regular' }}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => { closeMenu(); router.push('/help'); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    >
                      <HelpCircle size={20} color="#fff" strokeWidth={1.5} />
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_400Regular' }}>Help</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={closeMenu}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 42,
                      backgroundColor: '#1c1c1e',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.05)'
                    }}
                  >
                    <X size={32} color="#fff" strokeWidth={1.5} />
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
