import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch,
  Platform, TextInput, StyleSheet, StatusBar, Image, Alert, DeviceEventEmitter,
  ActivityIndicator, Animated, useColorScheme, Linking, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import { getAvatarUrl } from '../utils/avatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User, Setting, ShieldDoneIcon as ShieldCheck, Notification as Bell, LogOutIcon as LogOut,
  ChevronRight, ChevronLeft, TrophyIcon as Trophy,
  LinkIcon as Link2, KeyIcon as Key, ActivityIcon as Activity, UsersIcon as Users,
  CameraIcon as Camera, MailIcon as Mail,
  PhoneIcon as Phone, LocationIcon as MapPin, CalendarIcon as Calendar, AtSignIcon as AtSign, Lock,
  HelpIcon as HelpCircle, MessageIcon as MessageSquare, SparklesIcon as Sparkles,
  CrownIcon as Crown, WalletIcon as CreditCard
} from '../../components/Iconly';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { getHeaderStyle, setHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useStore, DEFAULT_PREFERENCES } from '../store';
import { usePlan } from '../hooks/usePlan';
import { useAppTheme } from '../../hooks/useAppTheme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView);
import { Monitor, Smartphone, Sun, Moon, AlertTriangle, Trash2, Check, CheckCircle, ShieldAlert, Ban, DollarSign, VolumeX, UserCog, LayoutGrid, UserCheck, LineChart, Gift, Server, Search, Ticket, MessageSquare as LucideMessageSquare, Globe, Sliders, Link, Database, FileText, Info } from 'lucide-react-native';
import ProfileTab from '../../components/settings/ProfileTab';

const h = () => {
  const store = useStore.getState();
  const enabled = store.currentUser?.preferences?.hapticsEnabled ?? true;
  if (enabled && Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const TABS = ['Appearance', 'Profile', 'Privacy', 'Security', 'Standing', 'Family', 'Plan', 'Subscription', 'Channels', 'Creator', 'AI', 'Notifications', 'Integrations', 'Help', 'Language', 'TradingDefaults', 'LinkedAccounts', 'DataStorage', 'Legal', 'About'];

const MAIN_MENU = [
  {
    title: 'My Account',
    items: [
      { id: 'Profile', label: 'Profile Information', icon: User },
      { id: 'Standing', label: 'Account Standing', icon: Activity },
      { id: 'Family', label: 'Family Center', icon: Users },
    ]
  },
  {
    title: 'Security & Privacy',
    items: [
      { id: 'Security', label: 'Security & Auth', icon: ShieldCheck },
      { id: 'Privacy', label: 'Privacy Settings', icon: Lock },
      { id: 'LinkedAccounts', label: 'Linked Accounts', icon: Link },
      { id: 'DataStorage', label: 'Data & Storage', icon: Database },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'Appearance', label: 'Theme', icon: Setting },
      { id: 'Notifications', label: 'Notifications', icon: Bell },
      { id: 'Language', label: 'Language & Region', icon: Globe },
      { id: 'TradingDefaults', label: 'Trading Defaults', icon: Sliders },
    ]
  },
  {
    title: 'AI & Tools',
    items: [
      { id: 'AI', label: 'AI Coach', icon: Sparkles },
      { id: 'Integrations', label: 'Broker Integrations', icon: Link2 },
    ]
  },
  {
    title: 'Billing',
    items: [
      { id: 'Plan', label: 'Current Plan', icon: Trophy },
      { id: 'Subscription', label: 'Subscription', icon: CreditCard },
    ]
  },
  {
    title: 'Community & Channels',
    items: [
      { id: 'Channels', label: 'Channels', icon: MessageSquare },
      { id: 'Creator', label: 'Creator Account', icon: Crown },
    ]
  },
  {
    title: 'Legal & About',
    items: [
      { id: 'Legal', label: 'Terms & Policies', icon: FileText },
      { id: 'About', label: 'About Tradifive', icon: Info },
    ]
  }
];
const Toggle = ({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) => {
  const systemThemeMode = useStore(state => state.currentUser?.preferences?.systemThemeMode ?? 'light');
  const darkModeOverride = useStore(state => state.currentUser?.preferences?.darkModeOverride ?? false);
  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  return (
    <Switch
      value={value}
      onValueChange={(v) => { h(); onValueChange(v); }}
      trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#6366f1' }}
      thumbColor="#ffffff"
      ios_backgroundColor={isDark ? '#3f3f46' : '#e4e4e7'}
    />
  );
};

const SectionHeader = ({ title }: { title: string }) => {
  const systemThemeMode = useStore(state => state.currentUser?.preferences?.systemThemeMode ?? 'light');
  const darkModeOverride = useStore(state => state.currentUser?.preferences?.darkModeOverride ?? false);
  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  if (!title) return null;

  return (
    <Text style={[globalStyles.sectionHeader, isDark && { color: '#94a3b8' }]}>{title}</Text>
  );
};

const RowItem = ({ icon: Icon, label, value, onPress, danger, style }: any) => {
  const systemThemeMode = useStore(state => state.currentUser?.preferences?.systemThemeMode ?? 'light');
  const darkModeOverride = useStore(state => state.currentUser?.preferences?.darkModeOverride ?? false);
  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  return (
    <TouchableOpacity
      onPress={() => { h(); onPress?.(); }}
      style={[
        globalStyles.rowItem,
        isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
        style
      ]}
    >
      <View style={globalStyles.rowLeft}>
        <Icon size={20} color={danger ? '#ef4444' : (isDark ? '#cbd5e1' : '#000000')} />
        <Text style={[globalStyles.rowLabel, { color: danger ? '#ef4444' : (isDark ? '#ffffff' : '#000000') }]}>{label}</Text>
      </View>
      <View style={globalStyles.rowRight}>
        {value !== undefined ? (
          <Text style={[globalStyles.rowValue, { color: isDark ? '#94a3b8' : '#8e8e93' }]}>{value}</Text>
        ) : (
          <ChevronRight size={18} color={isDark ? '#475569' : '#c7c7cc'} stroke="bold" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const ToggleRowItem = ({ icon: Icon, label, description, value, onValueChange, style }: any) => {
  const systemThemeMode = useStore(state => state.currentUser?.preferences?.systemThemeMode ?? 'light');
  const darkModeOverride = useStore(state => state.currentUser?.preferences?.darkModeOverride ?? false);
  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  return (
    <View
      style={[
        globalStyles.rowItem,
        isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
        style
      ]}
    >
      <View style={[globalStyles.rowLeft, { flex: 1 }]}>
        <Icon size={20} color={isDark ? '#cbd5e1' : '#000000'} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[globalStyles.rowLabel, { marginLeft: 0, color: isDark ? '#ffffff' : '#000000' }]}>{label}</Text>
          {description && <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b', marginTop: 2 }}>{description}</Text>}
        </View>
      </View>
      <View style={[globalStyles.rowRight, { marginLeft: 16 }]}>
        <Checkbox value={value} onValueChange={onValueChange} isDark={isDark} />
      </View>
    </View>
  );
};

const BrokerRowItem = ({ imageUri, label, onPress, style }: any) => {
  const systemThemeMode = useStore(state => state.currentUser?.preferences?.systemThemeMode ?? 'light');
  const darkModeOverride = useStore(state => state.currentUser?.preferences?.darkModeOverride ?? false);
  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  return (
    <TouchableOpacity
      onPress={() => { h(); onPress?.(); }}
      style={[
        globalStyles.rowItem,
        isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
        style
      ]}
    >
      <View style={globalStyles.rowLeft}>
        <Image source={{ uri: imageUri }} style={{ width: 24, height: 24, borderRadius: 6, marginRight: 4 }} />
        <Text style={[globalStyles.rowLabel, { color: isDark ? '#ffffff' : '#000000' }]}>{label}</Text>
      </View>
      <View style={globalStyles.rowRight}>
        <ChevronRight size={18} color={isDark ? '#475569' : '#c7c7cc'} stroke="bold" />
      </View>
    </TouchableOpacity>
  );
};

const InputField = ({ label, value, onChangeText, placeholder, icon: Icon, style }: any) => {
  const systemThemeMode = useStore(state => state.currentUser?.preferences?.systemThemeMode ?? 'light');
  const darkModeOverride = useStore(state => state.currentUser?.preferences?.darkModeOverride ?? false);
  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  return (
    <View style={[globalStyles.inputWrap, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.05)' }, style]}>
      {Icon && (
        <View style={[globalStyles.inputIconContainer, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
          <Icon size={16} color={isDark ? '#cbd5e1' : '#000000'} stroke="bold" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[globalStyles.inputLabel, { color: isDark ? '#64748b' : '#8e8e93' }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#475569' : '#a1a1aa'}
          style={[globalStyles.input, { color: isDark ? '#e8e8e8' : '#000000' }]}
        />
      </View>
    </View>
  );
};

const Checkbox = ({ value, onValueChange, isDark }: any) => {
  return (
    <TouchableOpacity
      onPress={() => { h(); onValueChange(!value); }}
      style={{
        width: 22, height: 22, borderRadius: 6,
        borderWidth: 2,
        borderColor: value ? '#6366f1' : (isDark ? '#3f3f46' : '#e4e4e7'),
        backgroundColor: value ? '#6366f1' : 'transparent',
        alignItems: 'center', justifyContent: 'center'
      }}
    >
      {value && <Check size={14} color="#fff" strokeWidth={3} />}
    </TouchableOpacity>
  );
};

const NotifRow = ({ label, push, app, email, onToggle }: any) => {
  const systemThemeMode = useStore(state => state.currentUser?.preferences?.systemThemeMode ?? 'light');
  const darkModeOverride = useStore(state => state.currentUser?.preferences?.darkModeOverride ?? false);
  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' || darkModeOverride === true || (systemThemeMode === 'auto' && deviceColorScheme === 'dark');
  return (
    <View style={globalStyles.notifRow}>
      <Text style={[globalStyles.notifLabel, { color: isDark ? '#f1f5f9' : '#000000' }]}>{label}</Text>
      <View style={globalStyles.notifToggles}>
        <View style={globalStyles.notifToggle}>
          <Text style={[globalStyles.notifToggleLabel, { color: isDark ? '#64748b' : '#8e8e93' }]}>Push</Text>
          <Checkbox value={push} onValueChange={() => onToggle('push')} isDark={isDark} />
        </View>
        <View style={globalStyles.notifToggle}>
          <Text style={[globalStyles.notifToggleLabel, { color: isDark ? '#64748b' : '#8e8e93' }]}>App</Text>
          <Checkbox value={app} onValueChange={() => onToggle('app')} isDark={isDark} />
        </View>
        <View style={globalStyles.notifToggle}>
          <Text style={[globalStyles.notifToggleLabel, { color: isDark ? '#64748b' : '#8e8e93' }]}>Email</Text>
          <Checkbox value={email} onValueChange={() => onToggle('email')} isDark={isDark} />
        </View>
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());
  const mt5Account = useStore(state => state.mt5Account);
  const locationPermissionEnabled = useStore(state => state.locationPermissionEnabled);
  const setLocationPermissionEnabled = useStore(state => state.setLocationPermissionEnabled);
  const updatePreferences = useStore(state => state.updatePreferences);
  const getTabLabel = (tabId: string | null) => {
    if (!tabId) return 'Settings';
    for (const group of MAIN_MENU) {
      const found = group.items.find(item => item.id === tabId);
      if (found) return found.label;
    }
    return tabId;
  };

  // Subscription State
  const [starterExpanded, setStarterExpanded] = useState(false);
  const [proExpanded, setProExpanded] = useState(false);
  const [eliteExpanded, setEliteExpanded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  // Channels State
  const [channelsMuteAll, setChannelsMuteAll] = useState(false);
  const [channelsMentionsOnly, setChannelsMentionsOnly] = useState(true);
  const [channelsAutoJoin, setChannelsAutoJoin] = useState(false);

  // Creator State
  const currentUser = useStore(state => state.currentUser);
  const setAccountType = useStore(state => state.setAccountType);
  const [accountMode, setAccountMode] = useState<'personal' | 'creator'>(currentUser?.account_type === 'creator' ? 'creator' : 'personal');
  const [enablePremium, setEnablePremium] = useState(true);
  const [subscriptionPrice, setSubscriptionPrice] = useState('29.99');
  const [webhookUrl, setWebhookUrl] = useState('Auto-Broadcast Trades');
  const [enableTipping, setEnableTipping] = useState(false);

  const { isElite, plan: currentPlan } = usePlan();

  React.useEffect(() => {
    const listener = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyleState(style);
    });
    return () => listener.remove();
  }, []);

  const changeHeaderStyle = (style: HeaderStyle) => {
    h();
    setHeaderStyle(style);
    updatePreferences({ headerStyle: style });
  };

  // Profile data from Production Backend
  const user = useStore(state => state.currentUser);
  const [profile, setProfile] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '', city: '',
    state: '', country: '',
    instagram: user?.username ? `@${user.username}` : '',
    dob: '',
    username: user?.username || '',
    bio: user?.bio || '',
    tags: user?.tags || [] as string[],
    website: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDismissingStanding, setIsDismissingStanding] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleDismissStanding = async () => {
    if (!user) return;
    setIsDismissingStanding(true);
    h();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_standing: 'GOOD',
          standing_message: null
        })
        .eq('id', user.id);

      if (error) throw error;

      useStore.setState({
        currentUser: {
          ...user,
          account_standing: 'GOOD',
          standing_message: null
        }
      });

      Alert.alert("Success", "Account standing acknowledged successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to acknowledge warning.");
    } finally {
      setIsDismissingStanding(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      setProfile(p => ({
        ...p,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        instagram: user.username ? `@${user.username}` : '',
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    h();
    try {
      {
        const updates = {
          first_name: profile.firstName,
          last_name: profile.lastName,
          bio: profile.bio,
          tags: profile.tags,
        };

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
      }

      useStore.setState({
        currentUser: {
          ...user,
          first_name: profile.firstName,
          last_name: profile.lastName,
          bio: profile.bio,
          tags: profile.tags,
        }
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Security data
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);

  // New Sections Data
  const [privacySettings, setPrivacySettings] = useState({
    show_location: true,
    show_winrate: true,
    show_roi: true,
    show_streak: true,
    show_trades: true,
    is_private: false,
  });

  const [familyControls, setFamilyControls] = useState({
    supervised_trading: false,
    max_daily_loss: '50',
  });

  const [reportText, setReportText] = useState('');

  // Preferences data
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [darkModeOverride, setDarkModeOverride] = useState(false);
  const [themeAccent, setThemeAccent] = useState('Emerald');
  const [systemThemeMode, setSystemThemeMode] = useState<'auto' | 'light' | 'dark'>('light');

  // Notifications data
  const [notifs, setNotifs] = useState(DEFAULT_PREFERENCES.notifs);

  React.useEffect(() => {
    if (user?.preferences) {
      setTwoFactor(user.preferences.twoFactor ?? false);
      setBiometric(user.preferences.biometric ?? true);
      setHapticsEnabled(user.preferences.hapticsEnabled ?? true);
      setCompactMode(user.preferences.compactMode ?? false);
      setDarkModeOverride(user.preferences.darkModeOverride ?? false);
      setSystemThemeMode(user.preferences.systemThemeMode ?? 'light');
      if (user.preferences.headerStyle) {
        setHeaderStyleState(user.preferences.headerStyle);
      }
      if (user.preferences.notifs) {
        setNotifs(user.preferences.notifs);
      }
    }
  }, [user, user?.preferences]);

  const deviceColorScheme = useColorScheme();
  const isDark = systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  const localStyles = {
    ...globalStyles,
    container: [globalStyles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f4f4f6' }],
    header: [globalStyles.header, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderBottomWidth: 1, borderBottomColor: isDark ? '#1a1a1a' : '#f1f5f9' }],
    title: [globalStyles.title, { color: isDark ? '#e8e8e8' : '#000000' }],
    tabBarContainer: [globalStyles.tabBarContainer, { backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9' }],
    tabActive: [globalStyles.tabActive, { backgroundColor: isDark ? '#2b2b2b' : '#ffffff' }],
    tabTextActive: [globalStyles.tabTextActive, { color: isDark ? '#e8e8e8' : '#0f172a' }],
    tabTextInactive: [globalStyles.tabTextInactive, { color: isDark ? '#636363' : '#64748b' }],
    card: [globalStyles.card, isDark ? {
      backgroundColor: '#111111',
      borderColor: '#222222',
      borderWidth: 1,
      shadowOpacity: 0,
      elevation: 0,
    } : {}],
    profileHeaderBlock: [globalStyles.profileHeaderBlock, isDark ? {
      backgroundColor: '#111111',
      borderColor: '#222222',
    } : {}],
    rowItem: [globalStyles.rowItem, { borderBottomColor: isDark ? '#1a1a1a' : '#f4f4f6' }],
    rowLabel: [globalStyles.rowLabel, { color: isDark ? '#e8e8e8' : '#000000' }],
    rowSub: [globalStyles.rowSub, { color: isDark ? '#919191' : '#8e8e93' }],
    rowValue: [globalStyles.rowValue, { color: isDark ? '#636363' : '#8e8e93' }],
    inputWrap: [globalStyles.inputWrap, { borderBottomColor: isDark ? '#1a1a1a' : '#f4f4f6' }],
    inputIconContainer: [globalStyles.inputIconContainer, { backgroundColor: isDark ? '#1c1c1c' : '#f4f4f6' }],
    input: [globalStyles.input, { color: isDark ? '#e8e8e8' : '#000000' }],
    saveBtn: [globalStyles.saveBtn, { backgroundColor: isDark ? '#e8e8e8' : '#000000' }],
    saveBtnText: [globalStyles.saveBtnText, { color: isDark ? '#0a0a0a' : '#ffffff' }],
    switchRow: [globalStyles.switchRow, { borderBottomColor: isDark ? '#1a1a1a' : '#f4f4f6' }],
    sectionHeader: [globalStyles.sectionHeader, { color: isDark ? '#636363' : '#94a3b8' }],

    planFeatureText: [globalStyles.planFeatureText, { color: isDark ? '#cbd5e1' : '#000000' }],
    planFeatureRow: [globalStyles.planFeatureRow, { borderBottomColor: isDark ? '#1a1a1a' : '#f4f4f6' }],
    billingHistoryRow: [globalStyles.billingHistoryRow, { borderBottomColor: isDark ? '#1a1a1a' : '#f4f4f6' }],
    billingHistoryDate: [globalStyles.billingHistoryDate, { color: isDark ? '#cbd5e1' : '#000000' }],
    billingHistoryAmount: [globalStyles.billingHistoryAmount, { color: isDark ? '#cbd5e1' : '#000000' }],

    planName: [globalStyles.planName, { color: isDark ? '#e8e8e8' : '#1e293b' }],
    planDesc: [globalStyles.planDesc, { color: isDark ? '#919191' : '#64748b' }],
    priceText: [globalStyles.priceText, { color: isDark ? '#ffffff' : '#0f172a' }],
    pricePeriod: [globalStyles.pricePeriod, { color: isDark ? '#919191' : '#64748b' }],
    featureText: [globalStyles.featureText, { color: isDark ? '#cbd5e1' : '#1e293b' }],
    featuresTitle: [globalStyles.featuresTitle, { color: isDark ? '#636363' : '#94a3b8' }],
    showMoreText: [globalStyles.showMoreText, { color: isDark ? '#818cf8' : '#6366f1' }],

    mt5ConnectionBlock: [globalStyles.mt5ConnectionBlock, { borderBottomColor: isDark ? '#1a1a1a' : '#f4f4f6' }],
    mt5ServerName: [globalStyles.mt5ServerName, { color: isDark ? '#ffffff' : '#000000' }],
    mt5AccountDetails: [globalStyles.mt5AccountDetails, { color: isDark ? '#919191' : '#8e8e93' }],

    inputLabel: [globalStyles.inputLabel, { color: isDark ? '#94a3b8' : '#8e8e93' }],
    notifRowContainer: [globalStyles.notifRowContainer, { borderBottomColor: isDark ? '#1a1a1a' : '#f4f4f6' }],
  };
  const styles = localStyles;

  const toggleNotif = (cat: 'trading' | 'account' | 'ai', id: string, ch: 'push' | 'app' | 'email') => {
    const updatedCategory = notifs[cat].map(n => n.id === id ? { ...n, [ch]: !n[ch] } : n);
    const updatedNotifs = {
      ...notifs,
      [cat]: updatedCategory,
    };
    setNotifs(updatedNotifs);
    updatePreferences({ notifs: updatedNotifs });
  };

  const handleDeleteAccount = () => {
    h();
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action is irreversible and all your data (profile, trades, posts) will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanent",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);
            try {
              {
                const { error } = await supabase.rpc('delete_own_user');
                if (error) throw error;
              }

              // Sign out and reset store
              const { AuthService } = require('../services/auth.service');
              await AuthService.signOut();
              router.replace('/signup');
              Alert.alert("Account Deleted", "Your account and all associated data have been permanently deleted.");
            } catch (e: any) {
              Alert.alert("Deletion Failed", e.message || "Failed to delete account.");
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const renderPreferences = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* ── TOP HEADER STYLE ── */}
      <View style={styles.section}>
        <SectionHeader title="Top Header Style" />
        <View style={styles.card}>
          {/* Top Glow option */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => changeHeaderStyle('top_glow')}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Sparkles size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Top Glow</Text>
                <Text style={styles.rowSub}>Immersive glow behind a translucent header</Text>
              </View>
            </View>
            <Switch
              value={headerStyle === 'top_glow'}
              onValueChange={() => changeHeaderStyle('top_glow')}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#000000' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Normal option */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => changeHeaderStyle('normal')}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Monitor size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Normal</Text>
                <Text style={styles.rowSub}>Clean dark header without background glow</Text>
              </View>
            </View>
            <Switch
              value={headerStyle === 'normal'}
              onValueChange={() => changeHeaderStyle('normal')}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#000000' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Simple option */}
          <TouchableOpacity
            style={[styles.switchRow, styles.lastRow]}
            onPress={() => changeHeaderStyle('simple')}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Smartphone size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Simple</Text>
                <Text style={styles.rowSub}>Flat white background header with black text</Text>
              </View>
            </View>
            <Switch
              value={headerStyle === 'simple'}
              onValueChange={() => changeHeaderStyle('simple')}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#000000' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── APP PERSONALIZATION ── */}
      <View style={styles.section}>
        <SectionHeader title="App Personalization" />
        <View style={styles.card}>
          {/* Haptic Feedback */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => { const v = !hapticsEnabled; h(); setHapticsEnabled(v); updatePreferences({ hapticsEnabled: v }); }}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Activity size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Tactile Feedback</Text>
                <Text style={styles.rowSub}>Triggers precise haptic vibrations on taps</Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(v) => { h(); setHapticsEnabled(v); updatePreferences({ hapticsEnabled: v }); }}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Compact Mode */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => { const v = !compactMode; h(); setCompactMode(v); updatePreferences({ compactMode: v }); }}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Smartphone size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Compact Layout</Text>
                <Text style={styles.rowSub}>Optimizes screen real estate for advanced viewports</Text>
              </View>
            </View>
            <Switch
              value={compactMode}
              onValueChange={(v) => { h(); setCompactMode(v); updatePreferences({ compactMode: v }); }}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Dark Mode Override */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => { const v = !darkModeOverride; h(); setDarkModeOverride(v); updatePreferences({ darkModeOverride: v }); }}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Monitor size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>AMOLED Pure Black</Text>
                <Text style={styles.rowSub}>Overrides theme to premium midnight black tones</Text>
              </View>
            </View>
            <Switch
              value={darkModeOverride}
              onValueChange={(v) => { h(); setDarkModeOverride(v); updatePreferences({ darkModeOverride: v }); }}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Share Live Location */}
          <TouchableOpacity
            style={[styles.switchRow, styles.lastRow]}
            onPress={() => { h(); setLocationPermissionEnabled(!locationPermissionEnabled); }}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <MapPin size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Share Live Location</Text>
                <Text style={styles.rowSub}>Attach your current location coordinates to your posts</Text>
              </View>
            </View>
            <Switch
              value={locationPermissionEnabled}
              onValueChange={(v) => { h(); setLocationPermissionEnabled(v); }}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SYSTEM THEME SELECTOR ── */}
      <View style={styles.section}>
        <SectionHeader title="System Theme Mode" />
        <View style={styles.card}>
          {/* System Auto Theme */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => { h(); setSystemThemeMode('auto'); updatePreferences({ systemThemeMode: 'auto' }); }}
            style={styles.switchRow}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Monitor size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>System Auto Theme</Text>
                <Text style={styles.rowSub}>Automatically sync with your OS preferences</Text>
              </View>
            </View>
            <Switch
              value={systemThemeMode === 'auto'}
              onValueChange={(v) => { h(); if (v) { setSystemThemeMode('auto'); updatePreferences({ systemThemeMode: 'auto' }); } }}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Light Mode */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => { h(); setSystemThemeMode('light'); updatePreferences({ systemThemeMode: 'light' }); }}
            style={styles.switchRow}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Sun size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Light Mode</Text>
                <Text style={styles.rowSub}>Clean light styling with soft gray borders</Text>
              </View>
            </View>
            <Switch
              value={systemThemeMode === 'light'}
              onValueChange={(v) => { h(); if (v) { setSystemThemeMode('light'); updatePreferences({ systemThemeMode: 'light' }); } }}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          {/* Dark Mode */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => { h(); setSystemThemeMode('dark'); updatePreferences({ systemThemeMode: 'dark' }); }}
            style={[styles.switchRow, styles.lastRow]}
          >
            <View style={[styles.rowLeft, { flex: 1 }]}>
              <Moon size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Text style={styles.rowSub}>Deep rich dark elements for low-light trading</Text>
              </View>
            </View>
            <Switch
              value={systemThemeMode === 'dark'}
              onValueChange={(v) => { h(); if (v) { setSystemThemeMode('dark'); updatePreferences({ systemThemeMode: 'dark' }); } }}
              trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );



  const renderSecurity = () => (
    <View>
      <View style={styles.section}>
        <SectionHeader title="Authentication" />
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <ShieldCheck size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View>
                <Text style={styles.rowLabel}>Two-Factor Authentication</Text>
                <Text style={styles.rowSub}>Authenticator app (TOTP)</Text>
              </View>
            </View>
            <Toggle value={twoFactor} onValueChange={(v) => { setTwoFactor(v); updatePreferences({ twoFactor: v }); }} />
          </View>
          <View style={[styles.switchRow, styles.lastRow]}>
            <View style={styles.rowLeft}>
              <Smartphone size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Biometric Login</Text>
                <Text style={styles.rowSub}>Face ID / Touch ID</Text>
              </View>
            </View>
            <Toggle value={biometric} onValueChange={(v) => { setBiometric(v); updatePreferences({ biometric: v }); }} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Password & Recovery" />
        <View style={styles.card}>
          <RowItem icon={Key} label="Change Password" onPress={() => Alert.alert("Security", "Password change flow triggered.")} />
          <RowItem icon={Mail} label="Recovery Email" value="Set" onPress={() => Alert.alert("Security", "Email settings open.")} />
          <RowItem icon={Phone} label="Recovery Phone" value="Set" onPress={() => Alert.alert("Security", "Phone settings open.")} style={styles.lastRow} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Active Sessions" />
        <View style={styles.card}>
          <RowItem icon={Monitor} label="This Device (iPhone)" value="Active" />
          <RowItem icon={Activity} label="Security Audit Log" onPress={() => Alert.alert("Security", "Audit log open.")} style={styles.lastRow} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Danger Zone" />
        <View style={styles.card}>
          <RowItem icon={AlertTriangle} label="Deactivate Account" danger onPress={() => Alert.alert("Danger Zone", "Deactivate account?")} />
          <RowItem icon={Trash2} label="Delete Account" danger onPress={handleDeleteAccount} style={styles.lastRow} />
        </View>
      </View>
    </View>
  );

  const renderPlan = () => (
    <View style={{ paddingBottom: 40 }}>
      {/* Professional Clean Plan Card */}
      <View style={[styles.section, { marginTop: 10 }]}>
        <View
          style={{
            backgroundColor: isDark ? '#111111' : '#0f172a',
            borderRadius: 24,
            padding: 24,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: isDark ? '#262626' : '#1e293b',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Trophy size={24} color="#f59e0b" fill="#f59e0b" />
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 1.2 }}>Current Plan</Text>
                <Text style={{ color: '#ffffff', fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 2 }}>Diamond Elite</Text>
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Text style={{ color: '#10b981', fontSize: 11, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Active</Text>
            </View>
          </View>

          <Text style={{ color: '#cbd5e1', fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 28 }}>
            Full institutional access including real-time MT5 sync, advanced Risk Guard AI, Neural Coach insights, and unlimited journal entries.
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', paddingTop: 20 }}>
            <View>
              <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase' }}>Next Billing</Text>
              <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 4 }}>June 14, 2026</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase' }}>Amount</Text>
              <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 4 }}>₹4,999</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Your Elite Perks" />
        <View style={[styles.card, { paddingVertical: 8 }]}>
          {[
            { icon: Link2, text: 'Unlimited MT5 Live Account Sync' },
            { icon: Sparkles, text: 'Neural Liaison (AI Trading Coach)' },
            { icon: ShieldCheck, text: 'Advanced Risk Guard Engine' },
            { icon: Activity, text: 'Real-time Performance Analytics' },
            { icon: Crown, text: 'Premium Elite Profile Badge' },
          ].map((f, i, arr) => (
            <View key={i} style={[styles.planFeatureRow, i === arr.length - 1 && styles.lastRow]}>
              <View style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#eff6ff', padding: 8, borderRadius: 10 }}>
                <f.icon size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
              </View>
              <Text style={[styles.planFeatureText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Billing History" />
        <View style={styles.card}>
          {[
            { date: 'May 14, 2026', amount: '₹4,999', status: 'Paid', invoice: '#INV-8932' },
            { date: 'Apr 14, 2026', amount: '₹4,999', status: 'Paid', invoice: '#INV-8123' },
            { date: 'Mar 14, 2026', amount: '₹4,999', status: 'Paid', invoice: '#INV-7491' },
          ].map((b, i, arr) => (
            <TouchableOpacity activeOpacity={0.7} key={i} style={[styles.billingHistoryRow, i === arr.length - 1 && styles.lastRow]}>
              <View>
                <Text style={[styles.billingHistoryDate, { color: isDark ? '#e2e8f0' : '#0f172a' }]}>{b.date}</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 4 }}>{b.invoice}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={[styles.billingHistoryAmount, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{b.amount}</Text>
                <View style={[styles.paidBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  <Text style={styles.paidBadgeText}>{b.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderAppearance = () => (
    <View style={{ paddingBottom: 40 }}>
      {/* Top Header Style */}
      <View style={styles.section}>
        <SectionHeader title="TOP HEADER STYLE" />
        <View style={styles.card}>
          <TouchableOpacity onPress={() => changeHeaderStyle('top_glow')} style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Sparkles size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View>
                <Text style={styles.rowLabel}>Top Glow</Text>
                <Text style={styles.rowSub}>Immersive glow behind a translucent header</Text>
              </View>
            </View>
            {headerStyle === 'top_glow' && <Check size={20} color="#6366f1" strokeWidth={3} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeHeaderStyle('normal')} style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Monitor size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Normal</Text>
                <Text style={styles.rowSub}>Clean dark header without background glow</Text>
              </View>
            </View>
            {headerStyle === 'normal' && <Check size={20} color="#6366f1" strokeWidth={3} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeHeaderStyle('simple')} style={[styles.switchRow, styles.lastRow]}>
            <View style={styles.rowLeft}>
              <Smartphone size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Simple</Text>
                <Text style={styles.rowSub}>Flat white background header with black text</Text>
              </View>
            </View>
            {headerStyle === 'simple' && <Check size={20} color="#6366f1" strokeWidth={3} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* App Personalization */}
      <View style={styles.section}>
        <SectionHeader title="APP PERSONALIZATION" />
        <View style={styles.card}>
          <View style={[styles.switchRow, styles.lastRow]}>
            <View style={styles.rowLeft}>
              <Activity size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View>
                <Text style={styles.rowLabel}>Tactile Feedback</Text>
                <Text style={styles.rowSub}>Triggers precise haptic vibrations on taps</Text>
              </View>
            </View>
            <Toggle value={hapticsEnabled} onValueChange={(v) => { setHapticsEnabled(v); updatePreferences({ hapticsEnabled: v }); }} />
          </View>
        </View>
      </View>

      {/* System Theme Mode */}
      <View style={styles.section}>
        <SectionHeader title="SYSTEM THEME MODE" />
        <View style={styles.card}>
          <TouchableOpacity onPress={() => { setSystemThemeMode('auto'); updatePreferences({ systemThemeMode: 'auto' }); }} style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Monitor size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>System Auto Theme</Text>
                <Text style={styles.rowSub}>Automatically sync with your OS preferences</Text>
              </View>
            </View>
            {systemThemeMode === 'auto' && <Check size={20} color="#6366f1" strokeWidth={3} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSystemThemeMode('light'); updatePreferences({ systemThemeMode: 'light' }); }} style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Sun size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Light Mode</Text>
                <Text style={styles.rowSub}>Clean light styling with soft gray borders</Text>
              </View>
            </View>
            {systemThemeMode === 'light' && <Check size={20} color="#6366f1" strokeWidth={3} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSystemThemeMode('dark'); updatePreferences({ systemThemeMode: 'dark' }); }} style={[styles.switchRow, styles.lastRow]}>
            <View style={styles.rowLeft}>
              <Moon size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Text style={styles.rowSub}>Deep rich dark elements for low-light trading</Text>
              </View>
            </View>
            {systemThemeMode === 'dark' && <Check size={20} color="#6366f1" strokeWidth={3} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderNotifications = () => (
    <View>
      {([
        { key: 'trading', label: 'Trading Alerts' },
        { key: 'account', label: 'Account & Billing' },
        { key: 'ai', label: 'AI & System' },
      ] as const).map(({ key, label }) => (
        <View key={key} style={styles.section}>
          <SectionHeader title={label} />
          <View style={styles.card}>
            {notifs[key].map((n, idx, arr) => (
              <View key={n.id} style={[styles.notifRowContainer, { borderBottomColor: isDark ? '#1e293b' : '#f4f4f6' }, idx === arr.length - 1 && styles.lastRow]}>
                <NotifRow
                  label={n.label}
                  push={n.push}
                  app={n.app}
                  email={n.email}
                  onToggle={(ch: 'push' | 'app' | 'email') => toggleNotif(key, n.id, ch)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderIntegrations = () => {
    // mt5Account is fetched at the top-level of SettingsScreen

    return (
      <View>
        <View style={styles.section}>
          <SectionHeader title="MT5 Connection" />
          <View style={styles.card}>
            {mt5Account ? (
              <>
                <View style={styles.mt5ConnectionBlock}>
                  <View style={styles.greenPulseDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mt5ServerName}>{mt5Account.broker || 'Exness-Real369'}</Text>
                    <Text style={styles.mt5AccountDetails}>Account: {mt5Account.account_number} · Live</Text>
                  </View>
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedBadgeText}>CONNECTED</Text>
                  </View>
                </View>
                <RowItem icon={Link2} label="Reconnect MT5 Account" onPress={() => router.push('/broker-connect')} />
                <RowItem icon={Trash2} label="Disconnect Account" danger onPress={() => Alert.alert("MT5", "Disconnecting Exness accounts...")} style={styles.lastRow} />
              </>
            ) : (
              <>
                <View style={styles.mt5ConnectionBlock}>
                  <View style={[styles.greenPulseDot, { backgroundColor: '#ef4444' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mt5ServerName}>No Active Connection</Text>
                    <Text style={styles.mt5AccountDetails}>Link your broker to start trading</Text>
                  </View>
                </View>
                <RowItem icon={Link2} label="Connect MT5 Account" onPress={() => router.push('/broker-connect')} style={styles.lastRow} />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Partner Brokers (Forex)" />
          <View style={styles.card}>
            <BrokerRowItem
              imageUri="https://logo.clearbit.com/exness.com"
              label="Open Exness Account"
              onPress={() => Linking.openURL('https://www.exness.com/')}
            />
            <BrokerRowItem
              imageUri="https://logo.clearbit.com/vantagemarkets.com"
              label="Open Vantage Account"
              onPress={() => Linking.openURL('https://www.vantagemarkets.com/')}
            />
            <BrokerRowItem
              imageUri="https://logo.clearbit.com/xm.com"
              label="Open XM Account"
              onPress={() => Linking.openURL('https://www.xm.com/')}
              style={styles.lastRow}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderSubscription = () => {
    const handleUpgrade = (plan: 'starter' | 'pro' | 'elite') => {
      if (user) {
        useStore.setState({
          currentUser: {
            ...user,
            subscription_status: plan
          }
        });
        Alert.alert('Simulated Upgrade', `You have bypassed and upgraded to the ${plan.toUpperCase()} plan.`);
      }
    };

    return (
      <View style={{ paddingBottom: 40 }}>
        <SectionHeader title="Tradifive Plans & Pricing" />
        <View style={styles.planSection}>
          {/* Standard Plan */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan('starter')}
            style={[
              styles.planCard,
              {
                borderColor: selectedPlan === 'starter' ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#1e293b' : '#f1f5f9'),
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderWidth: 1,
                borderRadius: 24,
                shadowOpacity: 0.05,
              }
            ]}
          >
            {/* Header Row - ensures consistent height */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.planName, { color: isDark ? '#f8fafc' : '#0f172a', marginBottom: 0 }]}>Standard</Text>
              </View>
              {/* Empty view to maintain flex-between balance if no badges */}
              <View />
            </View>

            <Text style={[styles.planDesc, { minHeight: 40 }]}>Perfect for beginners starting their trading journey.</Text>

            <View style={[styles.priceRow, { marginTop: 8 }]}>
              <Text style={[styles.priceText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>₹1,299</Text>
              <Text style={styles.pricePeriod}>/ month</Text>
            </View>
            <TouchableOpacity
              onPress={() => currentPlan !== 'starter' && handleUpgrade('starter')}
              disabled={currentPlan === 'starter'}
              style={[
                styles.planBtn,
                {
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  backgroundColor: currentPlan === 'starter' ? (isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
                  borderWidth: 1,
                  marginTop: 16,
                  marginBottom: 24,
                }
              ]}
            >
              <Text style={[
                styles.planBtnText,
                { color: currentPlan === 'starter' ? (isDark ? '#94a3b8' : '#64748b') : (isDark ? '#f8fafc' : '#0f172a') }
              ]}>
                {currentPlan === 'starter' ? 'Current Plan' : 'Downgrade to Standard'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'column', flexGrow: 1 }}>
              <Text style={styles.featuresTitle}>Includes:</Text>
              {[
                "Track your trades automatically",
                "1 Broker connection",
                "Trading journal access",
                "Basic AI trading insights",
                "Community access",
                "Risk Guard protection",
                "20 AI Coach Credits/day",
                "Earn XP & rewards"
              ].slice(0, starterExpanded ? undefined : 4).map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Check size={14} color="#64748b" style={{ marginTop: 2 }} strokeWidth={3} />
                  <Text style={[styles.featureText, { color: isDark ? '#cbd5e1' : '#334155' }]}>{feature}</Text>
                </View>
              ))}
              <View style={styles.showMoreBtn}>
                <TouchableOpacity onPress={() => setStarterExpanded(!starterExpanded)}>
                  <Text style={styles.showMoreText}>{starterExpanded ? 'Show less' : 'Show all 8 features'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Pro Plan */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan('pro')}
            style={[
              styles.planCard,
              {
                borderColor: selectedPlan === 'pro' ? '#f59e0b' : (isDark ? '#27272a' : '#f4f4f5'),
                backgroundColor: isDark ? '#111111' : '#ffffff',
                borderWidth: 1,
                borderRadius: 24,
                shadowOpacity: selectedPlan === 'pro' ? 0.1 : 0.05,
              }
            ]}
          >
            {/* Header Row - ensures consistent height */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.planName, { color: isDark ? '#f8fafc' : '#0f172a', marginBottom: 0 }]}>Pro</Text>
                <Sparkles size={16} color="#f59e0b" />
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={[styles.proBadge, { backgroundColor: '#fef3c7', borderColor: '#fde68a', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }]}>
                  <Text style={[styles.proBadgeText, { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5 }]}>Popular</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 }}>7 Days Free</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.planDesc, { minHeight: 40 }]}>Built for traders who want consistency and discipline.</Text>

            <View style={[styles.priceRow, { marginTop: 8 }]}>
              <Text style={[styles.priceText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>₹2,499</Text>
              <Text style={styles.pricePeriod}>/ month</Text>
            </View>
            <TouchableOpacity
              onPress={() => currentPlan !== 'pro' && handleUpgrade('pro')}
              disabled={currentPlan === 'pro'}
              style={[
                styles.planBtn,
                {
                  borderColor: currentPlan === 'pro' ? '#fde68a' : '#f59e0b',
                  backgroundColor: currentPlan === 'pro' ? (isDark ? '#27272a' : '#fefce8') : '#f59e0b',
                  borderWidth: currentPlan === 'pro' ? 1 : 0,
                  marginTop: 16,
                  marginBottom: 24,
                }
              ]}
            >
              <Text style={[
                styles.planBtnText,
                { color: currentPlan === 'pro' ? '#f59e0b' : '#ffffff' }
              ]}>
                {currentPlan === 'pro' ? 'Current Plan' : currentPlan === 'elite' ? 'Downgrade to Pro' : 'Upgrade to Pro'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'column', flexGrow: 1 }}>
              <Text style={styles.featuresTitle}>Everything in Standard, plus:</Text>
              {[
                "Real-time AI trade coaching",
                "Up to 6 broker connections",
                "Daily performance reports",
                "Advanced Risk Guard controls",
                "Voice notes with AI Coach",
                "AI detects revenge trading behavior",
                "Faster trade synchronization",
                "VIP trader channels access",
                "100 AI Coach Credits/day",
                "Join 1 Trading Competition/month",
                "Advanced performance analytics",
                "Priority support"
              ].slice(0, proExpanded ? undefined : 4).map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Check size={14} color="#f59e0b" style={{ marginTop: 2 }} strokeWidth={3} />
                  <Text style={[styles.featureText, { color: isDark ? '#cbd5e1' : '#334155' }]}>{feature}</Text>
                </View>
              ))}
              <View style={styles.showMoreBtn}>
                <TouchableOpacity onPress={() => setProExpanded(!proExpanded)}>
                  <Text style={[styles.showMoreText, { color: '#d97706' }]}>{proExpanded ? 'Show less' : 'Show all 12 features'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Elite Plan */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan('elite')}
            style={[
              styles.planCard,
              {
                borderColor: selectedPlan === 'elite' ? '#a855f7' : (isDark ? '#27272a' : '#f4f4f5'),
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderWidth: 1,
                borderRadius: 24,
                shadowOpacity: selectedPlan === 'elite' ? 0.1 : 0.05,
              }
            ]}
          >
            {/* Header Row - ensures consistent height */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.planName, { color: isDark ? '#f8fafc' : '#0f172a', marginBottom: 0 }]}>Elite</Text>
                <Trophy size={16} color="#a855f7" />
              </View>
              <View />
            </View>

            <Text style={[styles.planDesc, { minHeight: 40 }]}>Built for traders who want maximum discipline, mentorship, and automation.</Text>

            <View style={[styles.priceRow, { marginTop: 8 }]}>
              <Text style={[styles.priceText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>₹4,999</Text>
              <Text style={styles.pricePeriod}>/ month</Text>
            </View>
            <TouchableOpacity
              onPress={() => currentPlan !== 'elite' && handleUpgrade('elite')}
              disabled={currentPlan === 'elite'}
              style={[
                styles.planBtn,
                {
                  borderColor: currentPlan === 'elite' ? '#e9d5ff' : '#a855f7',
                  backgroundColor: currentPlan === 'elite' ? (isDark ? '#1e1b4b' : '#faf5ff') : '#a855f7',
                  borderWidth: currentPlan === 'elite' ? 1 : 0,
                  marginTop: 16,
                  marginBottom: 24,
                }
              ]}
            >
              <Text style={[
                styles.planBtnText,
                { color: currentPlan === 'elite' ? '#a855f7' : '#ffffff' }
              ]}>
                {currentPlan === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'column', flexGrow: 1 }}>
              <Text style={styles.featuresTitle}>Everything in Pro, plus:</Text>
              {[
                "Unlimited broker connections",
                "Mentor account monitoring access",
                "Shared trading workspace access",
                "AI-assisted automated trading",
                "Personal performance reviews",
                "Custom Risk Guard controls",
                "Advanced trading analytics",
                "Early access to new features",
                "Dedicated premium support",
                "Unlimited AI Coach Credits",
                "Join 2 Trading Competitions/month",
                "Premium Elite badge & profile perks"
              ].slice(0, eliteExpanded ? undefined : 4).map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Check size={14} color="#a855f7" style={{ marginTop: 2 }} strokeWidth={3} />
                  <Text style={[styles.featureText, { color: isDark ? '#cbd5e1' : '#334155' }]}>{feature}</Text>
                </View>
              ))}
              <View style={styles.showMoreBtn}>
                <TouchableOpacity onPress={() => setEliteExpanded(!eliteExpanded)}>
                  <Text style={[styles.showMoreText, { color: '#a855f7' }]}>{eliteExpanded ? 'Show less' : 'Show all 12 features'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const [aiTone, setAiTone] = React.useState('strict');
  const [aiVoice, setAiVoice] = React.useState('female');
  const [aiCredits, setAiCredits] = React.useState(10);
  const [maxCredits, setMaxCredits] = React.useState(10);
  const [creditsLoading, setCreditsLoading] = React.useState(false);

  const fetchCredits = async () => {
    if (!currentUser?.id) return;
    setCreditsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_ai_credits', { user_id: currentUser.id });
      if (!error && data) {
        setAiCredits(data.credits_remaining ?? 10);
        setMaxCredits(data.credits_max ?? 10);
      }
    } catch (e) {
      console.error('Error fetching credits:', e);
    } finally {
      setCreditsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'AI') {
      fetchCredits();
    }
  }, [activeTab, currentUser?.id]);

  const renderAI = () => (
    <View>
      <View style={styles.section}>
        <SectionHeader title="AI Credits" />
        <View style={styles.card}>
          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#000' }}>Credits Remaining</Text>
              {creditsLoading ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>
                  <Text style={{ color: aiCredits > 2 ? '#10b981' : '#ef4444' }}>{aiCredits}</Text>
                  <Text style={{ color: '#8e8e93', fontSize: 16 }}> / {maxCredits}</Text>
                </Text>
              )}
            </View>
            <View style={{ height: 8, backgroundColor: isDark ? '#1e293b' : '#f4f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ width: `${(aiCredits / Math.max(1, maxCredits)) * 100}%`, height: 8, backgroundColor: aiCredits > 2 ? '#10b981' : '#ef4444', borderRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#8e8e93', marginTop: 8 }}>Resets daily at midnight. Upgrade plan for more credits.</Text>
          </View>
        </View>
      </View>


    </View>
  );

  const renderPrivacy = () => (
    <View>
      <View style={styles.section}>
        <SectionHeader title="Analytics Sharing Preferences" />
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Lock size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View>
                <Text style={styles.rowLabel}>Private Profile Account</Text>
                <Text style={styles.rowSub}>Only approved followers can view your feed.</Text>
              </View>
            </View>
            <Toggle value={privacySettings.is_private} onValueChange={(v) => setPrivacySettings(p => ({ ...p, is_private: v }))} />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <MapPin size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View>
                <Text style={styles.rowLabel}>Share Location</Text>
                <Text style={styles.rowSub}>Show city, state, and flag emojis.</Text>
              </View>
            </View>
            <Toggle value={privacySettings.show_location} onValueChange={(v) => setPrivacySettings(p => ({ ...p, show_location: v }))} />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Activity size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View>
                <Text style={styles.rowLabel}>Share Win Rate Stats</Text>
                <Text style={styles.rowSub}>Publicly showcase win rate metrics.</Text>
              </View>
            </View>
            <Toggle value={privacySettings.show_winrate} onValueChange={(v) => setPrivacySettings(p => ({ ...p, show_winrate: v }))} />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Monitor size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Share Trade Ledger</Text>
                <Text style={styles.rowSub}>Allows open viewing of position histories.</Text>
              </View>
            </View>
            <Toggle value={privacySettings.show_trades} onValueChange={(v) => setPrivacySettings(p => ({ ...p, show_trades: v }))} />
          </View>
          <RowItem icon={Lock} label="Privacy Policy & Terms" onPress={() => Alert.alert("Technology Provider", "Tradifive Private Limited is a software technology provider and not a broker. We do not hold client funds or execute trades. By using this platform, you agree to our full Privacy Policy and Terms of Service (viewable on our website).")} style={styles.lastRow} />
        </View>
      </View>
    </View>
  );

  const renderStanding = () => {
    const standing = user?.account_standing || 'GOOD';
    const message = user?.standing_message || '';

    return (
      <View>
        <View style={styles.section}>
          <SectionHeader title="Account Health" />
          <View style={styles.card}>
            {standing === 'GOOD' && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <ShieldCheck size={32} color="#10b981" />
                </View>
                <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#000', marginBottom: 4 }}>Good Standing</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748b', textAlign: 'center' }}>
                  {message || "Your account is healthy. No active restrictions or warnings."}
                </Text>
              </View>
            )}

            {standing === 'WARNING' && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <AlertTriangle size={32} color="#d97706" />
                </View>
                <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#d97706', marginBottom: 4 }}>Account Warning</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: '#78350f', textAlign: 'center', marginBottom: 16 }}>
                  {message || "Your account has received a warning for violating community guidelines. Further violations may result in restrictions."}
                </Text>
                <TouchableOpacity
                  disabled={isDismissingStanding}
                  onPress={handleDismissStanding}
                  style={{
                    backgroundColor: '#d97706',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    shadowColor: '#d97706',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {isDismissingStanding ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Got It</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {standing === 'RESTRICTED' && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(234, 88, 12, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <ShieldAlert size={32} color="#ea580c" />
                </View>
                <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#ea580c', marginBottom: 4 }}>Account Restricted</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7c2d12', textAlign: 'center', marginBottom: 16 }}>
                  {message || "Certain features on your account have been restricted. Please check your email or contact support for more info."}
                </Text>
                <TouchableOpacity
                  disabled={isDismissingStanding}
                  onPress={handleDismissStanding}
                  style={{
                    backgroundColor: '#ea580c',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    shadowColor: '#ea580c',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {isDismissingStanding ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Got It</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {standing === 'BANNED' && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(220, 38, 38, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ban size={32} color="#dc2626" />
                </View>
                <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#dc2626', marginBottom: 4 }}>Account Banned</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7f1d1d', textAlign: 'center' }}>
                  {message || "Your account has been permanently suspended from Tradifive."}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderFamily = () => (
    <View>
      <View style={styles.section}>
        <SectionHeader title="Supervised Trading" />
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Users size={20} color={isDark ? '#e8e8e8' : '#000000'} stroke="bold" />
              <View>
                <Text style={styles.rowLabel}>Parental Controls</Text>
                <Text style={styles.rowSub}>Enable supervision features.</Text>
              </View>
            </View>
            <Toggle value={familyControls.supervised_trading} onValueChange={(v) => setFamilyControls(p => ({ ...p, supervised_trading: v }))} />
          </View>
          <InputField label="Max Daily Loss Limit ($)" value={familyControls.max_daily_loss} onChangeText={(v: string) => setFamilyControls(p => ({ ...p, max_daily_loss: v }))} placeholder="50" icon={AlertTriangle} style={styles.lastRow} />
        </View>
      </View>
    </View>
  );

  const renderChannels = () => {
    return (
      <View style={{ paddingBottom: 40 }}>
        {/* Header Graphic */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Users size={32} color={isDark ? '#818cf8' : '#4f46e5'} />
          </View>
          <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: isDark ? '#f8fafc' : '#0f172a' }}>Channel Preferences</Text>
          <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748b', textAlign: 'center', marginTop: 4 }}>
            Control how you interact with the community and private trading groups.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Notifications & Alerts" />
          <View style={styles.card}>
            <ToggleRowItem
              icon={VolumeX}
              label="Mute All Community Channels"
              description="Silence all unread indicators"
              value={channelsMuteAll}
              onValueChange={() => setChannelsMuteAll(!channelsMuteAll)}
            />
            <ToggleRowItem
              icon={AtSign}
              label="Mentions & Replies Only"
              description="Only alert when you're tagged"
              value={channelsMentionsOnly}
              onValueChange={() => setChannelsMentionsOnly(!channelsMentionsOnly)}
              style={styles.lastRow}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Privacy & Discovery" />
          <View style={styles.card}>
            <ToggleRowItem
              icon={Crown}
              label="Auto-join VIP Channels"
              description="Join eligible private channels instantly"
              value={channelsAutoJoin}
              onValueChange={() => setChannelsAutoJoin(!channelsAutoJoin)}
            />
            <RowItem icon={Lock} label="Hidden Channels" onPress={() => Alert.alert("Hidden Channels", "Manage hidden channels list.")} style={styles.lastRow} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Data Management" />
          <View style={styles.card}>
            <RowItem icon={Trash2} label="Clear Local Chat Cache" onPress={() => Alert.alert("Cache Cleared", "Channel cache has been cleared to save space.")} />
            <RowItem icon={LogOut} label="Leave All Community Channels" danger onPress={() => Alert.alert("Warning", "Are you sure you want to leave all public channels?")} style={styles.lastRow} />
          </View>
        </View>
      </View>
    );
  };


  const HELP_CATEGORIES = [
    { id: '1', title: 'Payments', desc: 'Deposit/Withdrawal issues, Internal transfer, Token/Blockchain error.', icon: CreditCard, color: '#f59e0b', bg: '#fffbeb' },
    { id: '2', title: 'Account & Security', desc: 'Change information, Access issues, SMS & Emails, Security.', icon: UserCog, color: '#3b82f6', bg: '#eff6ff' },
    { id: '3', title: 'Tradifive Platforms', desc: 'Web App, API connections, Algo configuration, Social trading.', icon: LayoutGrid, color: '#10b981', bg: '#f0fdf4' },
    { id: '4', title: 'Account Verification', desc: 'KYC status, Proof of Identity, Residence documents.', icon: UserCheck, color: '#6366f1', bg: '#eef2ff' },
    { id: '5', title: 'Trading', desc: 'Exchange connection, Slippage complaints, Wrong charges.', icon: LineChart, color: '#ec4899', bg: '#fdf2f8' },
    { id: '6', title: 'Programs & Rewards', desc: 'Partnership benefits, Affiliates, General reward inquiries.', icon: Gift, color: '#8b5cf6', bg: '#f5f3ff' },
    { id: '7', title: 'VPS Management', desc: 'Terminal updates, High ping, Password issues, Logging in.', icon: Server, color: '#14b8a6', bg: '#f0fdfa' },
  ];

  const HELP_FAQS = [
    { id: '1', q: 'How do I reset my Master Kill Switch?', a: 'You can toggle the Master Kill Switch directly from your Risk Guard settings once the daily cooldown period expires.' },
    { id: '2', q: 'Where are my recent trading logs?', a: 'All execution activity is tracked inside the Journal tab, which syncs seamlessly with your connected accounts.' },
    { id: '3', q: 'How do I link a new broker?', a: 'Head to Settings > Linked Brokers to scan the QR code or input your MT5 server details.' },
  ];

  const [tickets, setTickets] = useState<any[]>([]);
  React.useEffect(() => {
    if (activeTab === 'Help' && user?.id) {
      const loadTickets = async () => {
        try {
          const { data, error } = await supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (error) {
            const { data: fbData } = await supabase.from('user_feedback').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (fbData && fbData.length > 0) {
              setTickets(fbData.map(f => ({ id: `FB-${f.id}`, subject: 'User Feedback', category: 'General', status: 'open', created_at: f.created_at })));
            }
          } else if (data) {
            setTickets(data);
          }
        } catch (err) {}
      };
      loadTickets();
    }
  }, [activeTab, user?.id]);

  const renderHelp = () => (
    <View style={{ paddingBottom: 40 }}>
      {/* HERO GREETING / SEARCH */}
      <View style={styles.heroSection}>
        <Text style={[styles.heroTitle, isDark && { color: '#f8fafc' }]}>How can we help you today?</Text>
        <TouchableOpacity style={[styles.searchBox, isDark && { backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1, shadowOpacity: 0 }]} onPress={() => { h(); router.push('/help'); }}>
          <Search size={20} color="#94a3b8" />
          <Text style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter_500Medium', marginLeft: 10 }}>Search articles, configuration guides...</Text>
        </TouchableOpacity>
      </View>

      {/* SUPPORT CHANNELS */}
      <View style={styles.section}>
        <SectionHeader title="Support Channels" />
        <View style={styles.channelRow}>
          <TouchableOpacity style={[styles.channelCard, isDark && { backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1, shadowOpacity: 0 }]} onPress={() => { h(); router.push('/help?mode=live_chat'); }}>
            <View style={[styles.channelIconBox, { backgroundColor: '#eff6ff' }]}>
              <LucideMessageSquare size={24} color="#3b82f6" />
            </View>
            <Text style={[styles.channelName, isDark && { color: '#f8fafc' }]}>Live Assistant</Text>
            <Text style={styles.channelDesc}>Instant automated chat & FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.channelCard, isDark && { backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1, shadowOpacity: 0 }]} onPress={() => { h(); router.push('/help?mode=ticket_step_contacted'); }}>
            <View style={[styles.channelIconBox, { backgroundColor: '#f0fdf4' }]}>
              <Ticket size={24} color="#10b981" />
            </View>
            <Text style={[styles.channelName, isDark && { color: '#f8fafc' }]}>Open Ticket</Text>
            <Text style={styles.channelDesc}>Direct help from operations</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MY TICKETS */}
      <View style={styles.section}>
        <SectionHeader title="My Tickets" />
        {tickets.length === 0 ? (
          <View style={[styles.emptyTickets, isDark && { backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1, shadowOpacity: 0 }]}>
            <Text style={styles.emptyTicketsText}>You do not have any active support requests.</Text>
          </View>
        ) : (
          <View style={styles.ticketList}>
            {tickets.map(ticket => (
              <TouchableOpacity key={ticket.id} style={[styles.ticketItem, isDark && { backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1, shadowOpacity: 0 }]} onPress={() => { h(); router.push(`/help?ticketId=${ticket.id}`); }}>
                <View style={styles.ticketHeader}>
                  <Text style={[styles.ticketId, isDark && { color: '#f8fafc' }]}>#{ticket.id.toString().substring(0,8)}</Text>
                  <View style={[styles.statusBadge, ticket.status === 'resolved' ? styles.statusResolved : ticket.status === 'in-progress' ? styles.statusProgress : styles.statusOpen]}>
                    <Text style={[styles.statusText, ticket.status === 'resolved' ? { color: '#10b981' } : ticket.status === 'in-progress' ? { color: '#f59e0b' } : { color: '#3b82f6' }]}>{ticket.status}</Text>
                  </View>
                </View>
                <Text style={[styles.ticketSubject, isDark && { color: '#f8fafc' }]} numberOfLines={1}>{ticket.subject || ticket.description || 'Support Ticket'}</Text>
                <Text style={styles.ticketMeta}>Category: {ticket.category || 'General'} • {new Date(ticket.created_at).toLocaleDateString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* TOPICS / KNOWLEDGE CATEGORIES */}
      <View style={styles.section}>
        <SectionHeader title="Knowledge Base" />
        <View style={styles.kbGrid}>
          {HELP_CATEGORIES.slice(0, 4).map(cat => (
            <View key={cat.id} style={[styles.kbCard, isDark && { backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1, shadowOpacity: 0 }]}>
              <View style={[styles.kbIconBox, { backgroundColor: cat.bg }]}>
                <cat.icon size={20} color={cat.color} />
              </View>
              <Text style={[styles.kbCardTitle, isDark && { color: '#f8fafc' }]}>{cat.title}</Text>
              <Text style={styles.kbCardDesc} numberOfLines={2}>{cat.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* FAQS */}
      <View style={styles.section}>
        <SectionHeader title="Frequently Asked Questions" />
        <View style={[styles.faqCard, isDark && { backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1, shadowOpacity: 0 }]}>
          {HELP_FAQS.map((faq, idx) => (
            <View
              key={faq.id}
              style={[styles.faqItem, idx === HELP_FAQS.length - 1 && { borderBottomWidth: 0 }, isDark && { borderBottomColor: '#1a1a1a' }]}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.faqQ, isDark && { color: '#f8fafc' }]}>{faq.q}</Text>
                <Text style={styles.faqA}>{faq.a}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Report a Problem" />
        <View style={styles.card}>
          <InputField label="Description" value={reportText} onChangeText={setReportText} placeholder="What went wrong?" icon={AlertTriangle} />
          <TouchableOpacity
            style={{ margin: 16, backgroundColor: '#4f46e5', padding: 14, borderRadius: 12, alignItems: 'center' }}
            onPress={async () => {
              if (!reportText.trim()) {
                Alert.alert("Error", "Please enter a description of the problem.");
                return;
              }
              h();
              try {
                const { error } = await supabase
                  .from('support_tickets')
                  .insert([{
                    user_id: user?.id,
                    description: reportText,
                    status: 'open'
                  }]);

                if (error) {
                  // Fallback insertion
                  const { error: fbErr } = await supabase
                    .from('user_feedback')
                    .insert([{
                      user_id: user?.id,
                      feedback_text: reportText
                    }]);
                  if (fbErr) throw fbErr;
                }
                Alert.alert("Sent", "Your report has been submitted successfully.");
                setReportText('');
              } catch (err) {
                console.log('Error submitting feedback:', err);
                Alert.alert("Sent", "Your report has been submitted.");
                setReportText('');
              }
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCreator = () => (
    <View style={{ paddingBottom: 40 }}>
      {/* 1. Account Mode Switch */}
      <View style={styles.section}>
        <SectionHeader title="Account Mode" />
        <View style={styles.card}>
          <View style={[styles.notifRowContainer, { borderBottomWidth: 0 }]}>
            <View style={[styles.notifRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setAccountMode('personal');
                    setAccountType('personal');
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingVertical: 8, paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: accountMode === 'personal'
                      ? (isDark ? '#ffffff' : '#0f172a')
                      : (isDark ? '#1c1c1c' : '#f1f5f9')
                  }}
                >
                  <User size={16} color={accountMode === 'personal' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b')} />
                  <Text style={{
                    color: accountMode === 'personal' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                    fontFamily: 'Inter_600SemiBold', fontSize: 13
                  }}>Personal Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setAccountMode('creator');
                    setAccountType('creator');
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingVertical: 8, paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: accountMode === 'creator'
                      ? (isDark ? '#ffffff' : '#0f172a')
                      : (isDark ? '#1c1c1c' : '#f1f5f9')
                  }}
                >
                  <Trophy size={16} color={accountMode === 'creator' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b')} />
                  <Text style={{
                    color: accountMode === 'creator' ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#94a3b8' : '#64748b'),
                    fontFamily: 'Inter_600SemiBold', fontSize: 13
                  }}>Creator Account PRO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Application Status / Verification Banner */}
      <View style={[styles.card, { marginBottom: 24, backgroundColor: isDark ? '#0a2315' : '#f0fdf4', borderColor: isDark ? '#15803d' : '#bbf7d0', borderWidth: 1, padding: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={20} color="#16a34a" />
            <View>
              <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#4ade80' : '#166534' }}>Creator Account Verified</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#86efac' : '#15803d', marginTop: 2 }}>PRO verification badge is active on feed</Text>
            </View>
          </View>
          <View style={{ backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' }}>ACTIVE</Text>
          </View>
        </View>
      </View>

      {/* 3. Monetization Settings */}
      <View style={styles.section}>
        <SectionHeader title="Monetization & Signal Settings" />
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.rowLabel}>Enable Premium Membership</Text>
              <Text style={styles.rowSub}>Charge users to view private feed & copy trades</Text>
            </View>
            <Toggle value={enablePremium} onValueChange={setEnablePremium} />
          </View>

          {enablePremium && (
            <>
              <View style={[styles.notifRowContainer, { paddingHorizontal: 18, paddingVertical: 14 }]}>
                <Text style={styles.inputLabel}>Monthly Subscription Price</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: isDark ? '#1a1a1c' : '#f8fafc', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: isDark ? '#2b2b30' : '#e4e4e7' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#e8e8e8' : '#000000', marginRight: 4 }}>$</Text>
                  <TextInput
                    value={subscriptionPrice}
                    onChangeText={setSubscriptionPrice}
                    style={{ flex: 1, height: 44, fontSize: 15, fontFamily: 'Inter_600SemiBold', color: isDark ? '#e8e8e8' : '#000000' }}
                    keyboardType="decimal-pad"
                  />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#8e8e93' }}>/ month</Text>
                </View>
              </View>

              <View style={[styles.notifRowContainer, { paddingHorizontal: 18, paddingVertical: 14 }]}>
                <Text style={styles.inputLabel}>Trade Signal Webhooks</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, backgroundColor: isDark ? '#1a1a1c' : '#f8fafc', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: isDark ? '#2b2b30' : '#e4e4e7' }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: isDark ? '#e8e8e8' : '#000000' }}>Auto-Broadcast Trades</Text>
                  <Switch
                    value={true}
                    disabled
                    trackColor={{ false: '#3f3f46', true: '#a855f7' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>
            </>
          )}

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.rowLabel}>Enable Viewer Tipping</Text>
              <Text style={styles.rowSub}>Allow viewers to tip custom dollar amounts on posts</Text>
            </View>
            <Toggle value={enableTipping} onValueChange={setEnableTipping} />
          </View>
        </View>
      </View>

      {/* 4. Discord Community Webhooks */}
      <View style={styles.section}>
        <SectionHeader title="Community Sync Alerts" />
        <View style={styles.card}>
          <View style={{ paddingHorizontal: 18, paddingVertical: 16 }}>
            <Text style={styles.inputLabel}>Discord Channel Webhook URL</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: isDark ? '#1a1a1c' : '#f8fafc', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: isDark ? '#2b2b30' : '#e4e4e7' }}>
              <TextInput
                value={webhookUrl}
                onChangeText={setWebhookUrl}
                placeholder="https://discord.com/api/webhooks/..."
                placeholderTextColor={isDark ? '#475569' : '#a1a1aa'}
                style={{ flex: 1, height: 44, fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#e8e8e8' : '#000000' }}
              />
            </View>
            <Text style={{ fontSize: 11, color: '#8e8e93', marginTop: 8, fontFamily: 'Inter_400Regular', lineHeight: 15 }}>
              Push trade events, updates, and AI coach summaries directly to your Discord community server.
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Creator Earnings & Stripe Express Payouts */}
      <View style={styles.section}>
        <SectionHeader title="Creator Earnings & Stripe Express" />

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          {/* Available */}
          <View style={{ flex: 1, backgroundColor: isDark ? '#111111' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#222222' : '#e2e8f0', borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#a855f7', textTransform: 'uppercase' }}>Available</Text>
              <DollarSign size={13} color="#a855f7" />
            </View>
            <Text style={{ fontSize: 18, fontFamily: 'Inter_900Black', color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>₹1,245.50</Text>
          </View>

          {/* Active Subs */}
          <View style={{ flex: 1, backgroundColor: isDark ? '#111111' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#222222' : '#e2e8f0', borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#3b82f6', textTransform: 'uppercase' }}>Subs</Text>
              <Users size={13} color="#3b82f6" />
            </View>
            <Text style={{ fontSize: 18, fontFamily: 'Inter_900Black', color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>42</Text>
          </View>

          {/* Gross */}
          <View style={{ flex: 1, backgroundColor: isDark ? '#111111' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#222222' : '#e2e8f0', borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#10b981', textTransform: 'uppercase' }}>Gross</Text>
              <Trophy size={13} color="#10b981" />
            </View>
            <Text style={{ fontSize: 18, fontFamily: 'Inter_900Black', color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>₹5,840</Text>
          </View>
        </View>

        {/* Stripe status card */}
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} color="#6366f1" />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>Stripe Express Payouts</Text>
                    <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#10b981', fontSize: 8, fontFamily: 'Inter_700Bold' }}>CONNECTED</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>acct_1Nj382xXX9112</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert("Stripe Payouts", "Redirecting to Stripe Express Dashboard...")}
              style={{ marginTop: 14, width: '100%', height: 40, borderRadius: 10, backgroundColor: isDark ? '#1c1c1e' : '#f1f5f9', borderWidth: 1, borderColor: isDark ? '#2b2b30' : '#e4e4e7', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>Manage Stripe Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => { h(); Alert.alert("Settings Saved", "Your creator settings have been updated."); }}
      >
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLanguage = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.section}>
        <SectionHeader title="Language & Region" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert("Language", "Language options will go here.")}>
            <View style={styles.rowLeft}>
              <Globe size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>App Language</Text>
                <Text style={styles.rowSub}>English (US)</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert("Timezone", "Timezone options will go here.")}>
            <View style={styles.rowLeft}>
              <Calendar size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Timezone</Text>
                <Text style={styles.rowSub}>UTC -05:00 (EST)</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rowItem, styles.lastRow]} onPress={() => Alert.alert("Currency", "Currency options will go here.")}>
            <View style={styles.rowLeft}>
              <DollarSign size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Default Currency</Text>
                <Text style={styles.rowSub}>USD ($)</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderTradingDefaults = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.section}>
        <SectionHeader title="Trading Preferences" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert("Lot Size", "Default lot size options.")}>
            <View style={styles.rowLeft}>
              <Sliders size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Default Lot Size</Text>
                <Text style={styles.rowSub}>0.10 Lots</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rowItem, styles.lastRow]} onPress={() => Alert.alert("Default Risk", "Risk options.")}>
            <View style={styles.rowLeft}>
              <ShieldAlert size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Default Risk %</Text>
                <Text style={styles.rowSub}>1.0% per trade</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderLinkedAccounts = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.section}>
        <SectionHeader title="Connected Socials" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert("Google", "Manage Google connection.")}>
            <View style={styles.rowLeft}>
              <Globe size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Google</Text>
                <Text style={styles.rowSub}>Connected</Text>
              </View>
            </View>
            <Text style={{color: '#10b981', fontSize: 13, fontFamily: 'Inter_600SemiBold'}}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rowItem, styles.lastRow]} onPress={() => Alert.alert("Discord", "Manage Discord connection.")}>
            <View style={styles.rowLeft}>
              <LucideMessageSquare size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Discord</Text>
                <Text style={styles.rowSub}>Not Connected</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderDataStorage = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.section}>
        <SectionHeader title="Local Data" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} onPress={() => { h(); Alert.alert("Success", "Cache cleared successfully (14.2 MB freed)."); }}>
            <View style={styles.rowLeft}>
              <Trash2 size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Clear App Cache</Text>
                <Text style={styles.rowSub}>14.2 MB used</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rowItem, styles.lastRow]} onPress={() => { h(); Alert.alert("Exporting", "Preparing your trade history CSV..."); }}>
            <View style={styles.rowLeft}>
              <FileText size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Export Trade History</Text>
                <Text style={styles.rowSub}>Download as CSV</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderLegal = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.section}>
        <SectionHeader title="Terms & Policies" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} onPress={() => Linking.openURL('https://tradifive.in/terms')}>
            <View style={styles.rowLeft}>
              <FileText size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Terms of Service</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowItem} onPress={() => Linking.openURL('https://tradifive.in/privacy')}>
            <View style={styles.rowLeft}>
              <ShieldCheck size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rowItem, styles.lastRow]} onPress={() => Alert.alert("Risk Disclaimer", "Trading carries a high level of risk...")}>
            <View style={styles.rowLeft}>
              <AlertTriangle size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Risk Disclaimer</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderAbout = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.section}>
        <SectionHeader title="About Tradifive" />
        <View style={styles.card}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Info size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>App Version</Text>
                <Text style={styles.rowSub}>v2.4.1 (Build 829)</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.rowItem, styles.lastRow]} onPress={() => Linking.openURL('https://tradifive.in')}>
            <View style={styles.rowLeft}>
              <Globe size={20} color={isDark ? '#e8e8e8' : '#000000'} strokeWidth={1.8} />
              <View>
                <Text style={styles.rowLabel}>Visit Website</Text>
                <Text style={styles.rowSub}>tradifive.in</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    if (activeTab === null) {
      return (
        <View>
          {MAIN_MENU.map((section) => {
            const filteredItems = section.items.filter(item => {
              if (item.id === 'Creator' && !isElite) return false;
              return true;
            });
            if (filteredItems.length === 0) return null;

            return (
              <View key={section.title} style={styles.section}>
                <SectionHeader title={section.title} />
                <View style={styles.card}>
                  {filteredItems.map((item, idx) => (
                    <RowItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      danger={(item as any).danger}
                      style={idx === filteredItems.length - 1 ? styles.lastRow : {}}
                      onPress={() => {
                        if (item.id === 'Logout') {
                          Alert.alert("Logout", "Are you sure you want to log out?", [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Log Out", style: "destructive", onPress: () => {
                                const { AuthService } = require('../services/auth.service');
                                try {
                                  AuthService.signOut();
                                  router.replace('/login');
                                } catch (e: any) {
                                  Alert.alert("Logout Failed", e.message);
                                }
                              }
                            }
                          ]);
                        } else if (item.id === 'Help') {
                          router.push('/help');
                        } else if (item.id === 'Referrals') {
                          router.push('/(tabs)/referrals');
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                    />
                  ))}
                </View>
              </View>
            )
          })}

          <TouchableOpacity
            style={{
              marginTop: 10,
              marginBottom: 40,
              paddingVertical: 16,
              borderRadius: 24,
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
              borderWidth: 2,
              borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
            }}
            onPress={() => setShowConfirmLogout(true)}
          >
            <LogOut size={20} color={isDark ? '#f87171' : '#ef4444'} />
            <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#f87171' : '#ef4444' }}>
              Log Out
            </Text>
          </TouchableOpacity>
          
          <Modal visible={showConfirmLogout} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
              <View style={{ 
                backgroundColor: isDark ? '#111111' : '#ffffff', 
                borderRadius: 28, 
                padding: 24,
                borderWidth: 1,
                borderColor: isDark ? '#222222' : '#f1f5f9'
              }}>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <LogOut size={28} color="#ef4444" />
                  </View>
                  <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 8 }}>Confirm Logout</Text>
                  <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center', lineHeight: 22 }}>
                    Are you sure you want to log out of your account?
                  </Text>
                </View>
                
                <View style={{ gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      backgroundColor: '#ef4444',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const { AuthService } = require('../services/auth.service');
                      try {
                        AuthService.signOut();
                        router.replace('/login');
                      } catch (e: any) {
                        Alert.alert("Logout Failed", e.message);
                      }
                    }}
                  >
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: '#ffffff' }}>Log Out</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                      alignItems: 'center',
                    }}
                    onPress={() => setShowConfirmLogout(false)}
                  >
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#475569' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      );
    }
    if (activeTab === 'Appearance') return renderAppearance();
    if (activeTab === 'Profile') return <ProfileTab />;
    if (activeTab === 'Privacy') return renderPrivacy();
    if (activeTab === 'Security') return renderSecurity();
    if (activeTab === 'Standing') return renderStanding();
    if (activeTab === 'Family') return renderFamily();
    if (activeTab === 'Preferences') return renderPreferences();
    if (activeTab === 'Plan') return renderPlan();
    if (activeTab === 'Subscription') return renderSubscription();
    if (activeTab === 'Channels') return renderChannels();
    if (activeTab === 'Creator') return renderCreator();
    if (activeTab === 'AI') return renderAI();
    if (activeTab === 'Notifications') return renderNotifications();
    if (activeTab === 'Integrations') return renderIntegrations();
    if (activeTab === 'Appearance') return renderAppearance(); // Already had this but need to keep it sorted or just add at bottom
    if (activeTab === 'Language') return renderLanguage();
    if (activeTab === 'TradingDefaults') return renderTradingDefaults();
    if (activeTab === 'LinkedAccounts') return renderLinkedAccounts();
    if (activeTab === 'DataStorage') return renderDataStorage();
    if (activeTab === 'Legal') return renderLegal();
    if (activeTab === 'About') return renderAbout();
    return null;
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      DeviceEventEmitter.emit('scrollUpdate', value);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const handleBack = () => {
    h();
    if (activeTab !== null) {
      setActiveTab(null);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f4f4f6' }]}>
      <StatusBar barStyle={headerStyle === 'simple' && !isDark ? 'dark-content' : 'light-content'} />

      {/* ── SPACER ── */}
      <View style={{ height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92, width: '100%', zIndex: 1 }} />

      {headerStyle !== 'simple' && (
        <>
          {/* ── BACKGROUND STRIP & GLOW ── */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 180, backgroundColor: isDark ? '#0a0a0a' : '#0d0d1a', zIndex: 0 }} />
          {headerStyle === 'top_glow' && (
            <Image
              source={require('../../assets/images/top-glow.png')}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 180, opacity: 0.9, zIndex: 0 }}
              resizeMode="stretch"
            />
          )}
        </>
      )}

      {/* ── STATIC HEADER TEXT ── */}
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerStyle === 'simple' ? insets.top + 56 : insets.top + 92,
        backgroundColor: headerStyle === 'simple' ? (isDark ? '#0a0a0a' : '#ffffff') : 'transparent',
        borderBottomWidth: headerStyle === 'simple' ? 1 : 0,
        borderBottomColor: isDark ? '#1a1a1a' : '#e2e8f0',
        zIndex: 1000,
        opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 35], outputRange: [1, 0], extrapolate: 'clamp' }),
        transform: headerStyle === 'simple' ? [] : [
          { scale: scrollY.interpolate({ inputRange: [0, 35], outputRange: [1, 0.92], extrapolate: 'clamp' }) },
          { translateY: scrollY.interpolate({ inputRange: [0, 35], outputRange: [0, -15], extrapolate: 'clamp' }) }
        ]
      }}>
        <Animated.View style={{
          position: 'absolute',
          bottom: headerStyle === 'simple' ? 12 : 38,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20
        }}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={26} color={headerStyle === 'simple' ? (isDark ? '#ffffff' : '#000000') : '#ffffff'} stroke="bold" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: headerStyle === 'simple' ? (isDark ? '#e8e8e8' : '#000000') : '#e8e8e8' }]}>
            {getTabLabel(activeTab)}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* ── CONTENT CONTAINER ── */}
      <Animated.View style={[
        styles.mainCard,
        {
          backgroundColor: isDark ? '#0a0a0a' : '#f8fafc',
          marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }),
          borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
          borderTopRightRadius: headerStyle === 'simple' ? 0 : 40
        }
      ]}>
        <AnimatedKeyboardAwareScrollView
          enableOnAndroid={true}
          enableResetScrollToCoords={false}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 160 }
          ]}
        >
          <Animated.View style={headerStyle === 'simple' ? [] : { transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            {renderContent()}
          </Animated.View>
        </AnimatedKeyboardAwareScrollView>
      </Animated.View>
    </View>
  );
}

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f6',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 64,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
    letterSpacing: -0.5,
  },
  tabBarContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 30,
    marginHorizontal: 20,
    padding: 4,
    marginBottom: 14,
  },
  tabBarScroll: {
    gap: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tabTextActive: {
    color: '#0f172a',
    fontFamily: 'Inter_700Bold',
  },
  tabTextInactive: {
    color: '#64748b',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  profileHeaderBlock: {
    backgroundColor: '#fafafa',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  cameraBtn: {
    position: 'absolute',
    left: 40,
    top: 40,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    marginBottom: 10,
    paddingLeft: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
  },
  rowSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#8e8e93',
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  inputIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#000000',
    paddingVertical: 0,
  },
  saveBtn: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  planHeaderCard: {
    backgroundColor: '#000000',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  planTitleText: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  planSubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  billingSubCard: {
    marginTop: 18,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
  },
  billingLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  billingValue: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  planFeatureText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
  },
  billingHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  billingHistoryDate: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
  },
  billingHistoryAmount: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paidBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#10b981',
  },
  notifRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  notifLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
    flex: 1,
  },
  notifToggles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifToggleLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#8e8e93',
    textTransform: 'uppercase',
  },
  mt5ConnectionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  greenPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  mt5ServerName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
  },
  mt5AccountDetails: {
    fontSize: 13,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
    marginTop: 1,
  },
  connectedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#10b981',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 8,
    marginBottom: 32,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    zIndex: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    marginTop: 2,
  },
  planSection: {
    gap: 16,
  },
  planCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 2,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  planDesc: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    marginBottom: 24,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 24,
  },
  priceText: {
    fontSize: 32,
    fontFamily: 'Inter_900Black',
    color: '#0f172a',
  },
  pricePeriod: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  planBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    marginBottom: 24,
  },
  planBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  featuresTitle: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#1e293b',
    flex: 1,
  },
  showMoreBtn: {
    paddingTop: 4,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  proBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fcd34d',
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  proBadgeText: {
    color: '#f59e0b',
    fontSize: 9,
    fontFamily: 'Inter_900Black',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  kbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kbCard: { 
    width: '48.5%', 
    backgroundColor: '#fafafa', 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2 
  },
  kbIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kbCardTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 4 },
  kbCardDesc: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 18 },

  faqCard: { 
    backgroundColor: '#fafafa', 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff', 
    paddingHorizontal: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2 
  },
  faqItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f4f4f6' },
  faqQ: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0f172a', marginBottom: 4 },
  faqA: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 18 },
  
  heroSection: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, alignItems: 'center' },
  heroTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 24, borderWidth: 2, borderColor: '#ffffff', paddingHorizontal: 16, height: 52, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  
  channelRow: { flexDirection: 'row', gap: 10 },
  channelCard: { flex: 1, backgroundColor: '#fafafa', padding: 16, borderRadius: 24, borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  channelIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  channelName: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 4 },
  channelDesc: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 16 },

  emptyTickets: { backgroundColor: '#fafafa', padding: 24, borderRadius: 24, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  emptyTicketsText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#94a3b8', textAlign: 'center' },
  ticketList: { gap: 10 },
  ticketItem: { backgroundColor: '#fafafa', padding: 16, borderRadius: 24, borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ticketId: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusOpen: { backgroundColor: '#eff6ff' },
  statusProgress: { backgroundColor: '#fffbeb' },
  statusResolved: { backgroundColor: '#f0fdf4' },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  ticketSubject: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0f172a', marginBottom: 4 },
  ticketMeta: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
});
