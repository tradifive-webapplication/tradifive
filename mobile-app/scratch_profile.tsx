import React, { useState, useRef, useEffect } from 'react';
import { useStore } from './store';
import { getAvatarUrl } from './utils/avatar';
import { AuthService } from './services/auth.service';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Share,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Search,
  MoreHorizontal,
  MoreVertical,
  Plus, Eye,
  MessageCircle,
  Repeat,
  Share as ShareIcon,
  MapPin,
  Calendar,
  Briefcase,
  Check,
  ArrowDown,
  Flame,
  Gift,
  Diamond,
  Bookmark,
  Pencil,
  Pin,
  Sparkles,
  Play,
  Video,
  Crown,
  Link2,
  ChevronDown,
  Calendar as CalendarIcon,
  CheckCircle2,
  Shield,
  Star
} from 'lucide-react-native';
import { Heart, Chat, Send } from '../components/Iconly';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

const { width, height } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const ProfilePostCard = ({
  post,
  isActive,
  anyCardActive,
  onActive,
  onInactive,
  onGestureMove,
  onGestureRelease,
  onLike,
  onComment,
  onShare
}: {
  post: any;
  isActive: boolean;
  anyCardActive: boolean;
  onActive: (x: number, y: number) => void;
  onInactive: () => void;
  onGestureMove: (x: number, y: number) => void;
  onGestureRelease: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}) => {
  const { isDark, theme } = useAppTheme();
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const pressTimeout = useRef<any>(null);
  const isHolding = useRef(false);

  const cardRotate = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', parseInt(post.id) % 2 === 0 ? '4deg' : '-4deg']
  });

  const cardScale = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94]
  });

  const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const handlePressIn = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    if (pressTimeout.current) clearTimeout(pressTimeout.current);
    isHolding.current = false;

    pressTimeout.current = setTimeout(() => {
      isHolding.current = true;
      h();
      onActive(pageX, pageY);
      Animated.spring(tiltAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start();
    }, 200); // 200ms short hold
  };

  const handleResponderMove = (event: any) => {
    if (isHolding.current) {
      const { pageX, pageY } = event.nativeEvent;
      onGestureMove(pageX, pageY);
    }
  };

  const handleResponderRelease = () => {
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
      pressTimeout.current = null;
    }

    if (isHolding.current) {
      onGestureRelease();
      Animated.spring(tiltAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start();
      isHolding.current = false;
    }
  };

  const handleResponderTerminate = () => {
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
      pressTimeout.current = null;
    }
    if (isHolding.current) {
      onInactive();
      Animated.spring(tiltAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start();
      isHolding.current = false;
    }
  };

  return (
    <View style={{ position: 'relative', zIndex: isActive ? 100 : 1 }}>
      <Animated.View
        style={{
          marginBottom: 10,
          backgroundColor: isDark ? theme.card : '#fff',
          padding: 16,
          borderRadius: 24,
          marginHorizontal: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isActive ? 0.2 : 0.05,
          shadowRadius: isActive ? 16 : 8,
          elevation: isActive ? 12 : 2,
          zIndex: isActive ? 100 : 1,
          opacity: anyCardActive && !isActive ? 0.15 : 1,
          borderWidth: 1,
          borderColor: isDark ? theme.cardBorder : '#f1f5f9',
          transform: [
            { rotate: cardRotate },
            { scale: cardScale }
          ]
        }}
      >
        {/* Header (OUTSIDE holdable area) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: post.avatar }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }} />
            <View>
              <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>{post.user}</Text>
              <Text style={{ fontSize: 13, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_400Regular', marginTop: 2 }}>{post.time}</Text>
            </View>
          </View>
          <TouchableOpacity style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
            <MoreVertical size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Holdable Body Content */}
        <View
          onStartShouldSetResponder={() => true}
          onResponderGrant={handlePressIn}
          onResponderMove={handleResponderMove}
          onResponderRelease={handleResponderRelease}
          onResponderTerminate={handleResponderTerminate}
        >
          {/* Content */}
          <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_400Regular', marginBottom: 12, lineHeight: 22 }}>
            {post.content}
          </Text>

          {/* Image / Video Media */}
          {!!post.image && (
            <View style={{ marginHorizontal: -16, marginBottom: 16 }}>
              {post.media_type === 'video' ? (
                Platform.OS === 'web' ? (
                  <video
                    src={post.image}
                    controls
                    style={{ width: '100%', height: 280, objectFit: 'cover', backgroundColor: '#090d16' }}
                    poster="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop"
                  />
                ) : (
                  <View style={{ width: '100%', height: 280, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <Image
                      source={{ uri: post.image.startsWith('http') ? post.image : 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop' }}
                      style={{ width: '100%', height: '100%', opacity: 0.7 }}
                      resizeMode="cover"
                    />
                    {/* Glassmorphic Play button */}
                    <View style={{
                      position: 'absolute',
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6
                    }}>
                      <Play size={24} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
                    </View>
                    {/* Simulated Player Controls overlay */}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(9, 13, 22, 0.6)'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Play size={12} color="#ffffff" fill="#ffffff" />
                        {/* Progress Bar Track */}
                        <View style={{ flex: 1, height: 4, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 2 }}>
                          <View style={{ width: '45%', height: '100%', backgroundColor: '#0095f6', borderRadius: 2 }} />
                        </View>
                      </View>
                      <Text style={{ color: '#ffffff', fontSize: 10, fontFamily: 'Inter_600SemiBold', marginLeft: 12 }}>
                        0:18 / 1:05
                      </Text>
                    </View>
                    {/* Video Tag in corner */}
                    <View style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(9, 13, 22, 0.75)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Video size={12} color="#ffffff" />
                      <Text style={{ color: '#ffffff', fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>VIDEO</Text>
                    </View>
                  </View>
                )
              ) : (
                <Image source={{ uri: post.image }} style={{ width: '100%', height: 280 }} resizeMode="cover" />
              )}
            </View>
          )}

          {/* Location */}
          {post.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <MapPin size={16} color="#64748b" />
              <Text style={{ fontSize: 13, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_400Regular' }}>{post.location}</Text>
            </View>
          ) : null}
        </View>

        {/* Action Bar (OUTSIDE holdable area) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          {/* Left: Like & Comment */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity
              onPress={onLike}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Heart size={20} color={post.isLiked ? "#ef4444" : "#64748b"} set={post.isLiked ? "bold" : "curved"} stroke="bold" />
              <Text style={{ fontSize: 14, color: post.isLiked ? "#ef4444" : "#64748b", fontFamily: 'Inter_500Medium' }}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onComment}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Chat size={20} color="#64748b" set="curved" stroke="bold" />
              <Text style={{ fontSize: 14, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_500Medium' }}>{post.comments}</Text>
            </TouchableOpacity>
          </View>

          {/* Right: Share */}
          <TouchableOpacity
            onPress={onShare}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Send size={18} color="#64748b" set="curved" stroke="bold" style={{ transform: [{ rotate: '-15deg' }] }} />
            <Text style={{ fontSize: 14, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_500Medium' }}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

interface PostComment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  replies?: PostComment[];
}

const INITIAL_COMMENTS_MAP: Record<string, PostComment[]> = {};

const getBgColor = (factor: number) => {
  const r = Math.round(28 + (255 - 28) * factor);
  const g = Math.round(28 + (255 - 28) * factor);
  const b = Math.round(30 + (255 - 30) * factor);
  const a = 0.85 + (1.0 - 0.85) * factor;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const getIconColor = (factor: number) => {
  const c = Math.round(255 - 255 * factor);
  return `rgb(${c}, ${c}, ${c})`;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ProfileScreen() {
  
  const { isDark, theme } = useAppTheme();
  const styles = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const s = JSON.parse(JSON.stringify(globalStyles));
    for (const key of Object.keys(s)) {
      const block = s[key];
      if (block.backgroundColor === '#fff' || block.backgroundColor === '#ffffff' || block.backgroundColor === '#FFFFFF') block.backgroundColor = theme.card;
      if (block.backgroundColor === '#f8fafc' || block.backgroundColor === '#f1f5f9') block.backgroundColor = theme.background;
      if (block.backgroundColor === '#000' || block.backgroundColor === '#000000') block.backgroundColor = theme.text;
      
      if (block.color === '#000' || block.color === '#0f172a' || block.color === '#000000') block.color = theme.text;
      if (block.color === '#64748b' || block.color === '#334155' || block.color === '#475569') block.color = theme.textSecondary;
      if (block.color === '#fff' || block.color === '#ffffff') block.color = theme.background;

      if (block.borderColor === '#e2e8f0' || block.borderColor === '#f1f5f9' || block.borderColor === '#cbd5e1' || block.borderColor === '#fff' || block.borderColor === '#ffffff') block.borderColor = theme.cardBorder;
      
      if (block.borderBottomColor === '#e2e8f0' || block.borderBottomColor === '#f8fafc' || block.borderBottomColor === '#f1f5f9') block.borderBottomColor = theme.cardBorder;
      if (block.borderTopColor === '#e2e8f0' || block.borderTopColor === '#f8fafc' || block.borderTopColor === '#f1f5f9') block.borderTopColor = theme.cardBorder;
      if (block.borderLeftColor === '#e2e8f0' || block.borderLeftColor === '#f8fafc' || block.borderLeftColor === '#f1f5f9') block.borderLeftColor = theme.cardBorder;
      if (block.borderRightColor === '#e2e8f0' || block.borderRightColor === '#f8fafc' || block.borderRightColor === '#f1f5f9') block.borderRightColor = theme.cardBorder;
    }
    return s;
  }, [isDark, theme]);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  const streakVal = 10;
  const streakDots = [
    { date: '2023-10-01', status: 'green' }, { date: '2023-10-02', status: 'green' },
    { date: '2023-10-03', status: 'red' }, { date: '2023-10-04', status: 'green' },
    { date: '2023-10-05', status: 'green' }, { date: '2023-10-06', status: 'gray' },
    { date: '2023-10-07', status: 'gray' }, { date: '2023-10-08', status: 'green' },
    { date: '2023-10-09', status: 'green' }, { date: '2023-10-10', status: 'green' },
    { date: '2023-10-11', status: 'red' }, { date: '2023-10-12', status: 'green' },
    { date: '2023-10-13', status: 'green' }, { date: '2023-10-14', status: 'green' },
    { date: '2023-10-15', status: 'green' }
  ];
  
  const todayStr = (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`; })();
  
  const calendarDayMap: Record<string, 'green'|'red'|undefined> = {
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-02`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-05`]: 'red',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-08`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-12`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-14`]: 'red',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-18`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-22`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-27`]: 'red',
    [todayStr]: 'green'
  };

  const generateCalendarCells = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday=0
    const cells = [];
    
    for (let i = 0; i < startOffset; i++) {
      cells.push(<View key={`empty-${i}`} style={{ width: '13%', aspectRatio: 1, margin: '0.6%' }} />);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const status = calendarDayMap[key];
      const isToday = key === todayStr;
      
      let bgColor = isDark ? '#1A1A1A' : '#f1f5f9';
      let borderColor = isDark ? '#262626' : '#e2e8f0';
      
      if (status === 'green') {
        bgColor = isDark ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.5)';
        borderColor = 'transparent';
      } else if (status === 'red') {
        bgColor = isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.3)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
      }
      
      cells.push(
        <View 
          key={key} 
          style={{
            width: '13%', 
            aspectRatio: 1, 
            margin: '0.6%',
            borderRadius: 4,
            backgroundColor: bgColor,
            borderWidth: status === 'red' ? 1 : (status === 'green' ? 0 : 1),
            borderColor: borderColor,
            ...(isToday ? { borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.5)' } : {})
          }}
        />
      );
    }
    return cells;
  };

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useStore(state => state.currentUser);
  const followerCount = useStore(state => state.getFollowerCount());
  const followingCount = useStore(state => state.getFollowingCount());
  const ownPostsCount = useStore(state => state.getOwnPostsCount());
  const [activeTab, setActiveTab] = useState('Activity');

  // Calculate Trading Stats
  const trades = useStore(state => state.trades) || [];
  const mt5Account = useStore(state => state.mt5Account);

  const totalTrades = trades.length;
  const wins = trades.filter(t => Number(t.profit) > 0).length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const pnlSum = trades.reduce((acc, t) => acc + Number(t.profit || 0), 0);
  const balance = mt5Account?.balance || 10000;
  const roi = balance > 0 ? ((pnlSum / balance) * 100).toFixed(2) : "0.00";

  let bestStreak = 0;
  let runLen = 0;
  const chronoTrades = [...trades].sort((a: any, b: any) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime());
  for (const t of chronoTrades) {
    if (Number(t.profit) > 0) { runLen++; if (runLen > bestStreak) bestStreak = runLen; } else { runLen = 0; }
  }
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

    // Side Drawer Slider State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTranslateX = useRef(new Animated.Value(width)).current;
  
  const openDrawer = () => {
    setIsDrawerOpen(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(drawerTranslateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40, friction: 8
    }).start();
  };

  const closeDrawer = () => {
    Keyboard.dismiss();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(drawerTranslateX, {
      toValue: width,
      useNativeDriver: true,
      tension: 40, friction: 8
    }).start(() => setIsDrawerOpen(false));
  };

  const drawerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) { // Only allow sliding to the right (to close)
          drawerTranslateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50 || gestureState.vx > 0.5) {
          closeDrawer();
        } else {
          Animated.spring(drawerTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40, friction: 8
          }).start();
        }
      }
    })
  ).current;

  const updateProfileState = useStore(state => state.updateProfileState);

  const uriToBase64 = (uri: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (e) => {
          reject(e);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        reject(err);
      }
    });
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'error') => {
    if (Platform.OS === 'web') return;
    try {
      if (type === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {
      console.log('Haptic feedback failed:', e);
    }
  };


  // Interaction offsets
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likesOffset, setLikesOffset] = useState<Record<string, number>>({});
  const [commentsOffset, setCommentsOffset] = useState<Record<string, number>>({});
  const [sharesOffset, setSharesOffset] = useState<Record<string, number>>({});

  // Comments Bottom Sheet State
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>(INITIAL_COMMENTS_MAP);
  const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ commentId: string; username: string } | null>(null);
  const commentInputRef = useRef<TextInput>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSheetFullyOpen, setIsSheetFullyOpen] = useState(false);

  const lastTranslateY = useRef(SCREEN_HEIGHT * 0.90);
  const crossedMidToFull = useRef(false);
  const crossedMidToClose = useRef(false);

  // Gesture Animation Constants for comments sheet
  const SHEET_HEIGHT = SCREEN_HEIGHT * 0.90;
  const SNAP_POINTS = {
    FULL: 0,
    MID: SCREEN_HEIGHT * 0.35, // covers ~65% of screen height
    CLOSE: SHEET_HEIGHT
  };

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const inputTranslateY = translateY.interpolate({
    inputRange: [SNAP_POINTS.FULL, SNAP_POINTS.MID, SNAP_POINTS.CLOSE],
    outputRange: [0, 0, SHEET_HEIGHT - SNAP_POINTS.MID],
    extrapolate: 'clamp'
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
        Keyboard.dismiss();
      },
      onPanResponderMove: (_, gestureState) => {
        const nextY = lastTranslateY.current + gestureState.dy;

        if (lastTranslateY.current === SNAP_POINTS.MID) {
          if (gestureState.dy < -60 && !crossedMidToFull.current) {
            crossedMidToFull.current = true;
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
          if (gestureState.dy > 60 && !crossedMidToClose.current) {
            crossedMidToClose.current = true;
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }

        if (nextY >= SNAP_POINTS.FULL && nextY <= SNAP_POINTS.CLOSE) {
          translateY.setValue(nextY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = lastTranslateY.current + gestureState.dy;
        const dragVelocity = gestureState.vy;

        let targetY = SNAP_POINTS.CLOSE;

        if (dragVelocity < -0.5) {
          targetY = SNAP_POINTS.FULL;
        } else if (dragVelocity > 0.5) {
          targetY = currentY < SNAP_POINTS.MID ? SNAP_POINTS.MID : SNAP_POINTS.CLOSE;
        } else {
          const distToFull = Math.abs(currentY - SNAP_POINTS.FULL);
          const distToMid = Math.abs(currentY - SNAP_POINTS.MID);
          const distToClose = Math.abs(currentY - SNAP_POINTS.CLOSE);

          const minDist = Math.min(distToFull, distToMid, distToClose);
          if (minDist === distToFull) {
            targetY = SNAP_POINTS.FULL;
          } else if (minDist === distToMid) {
            targetY = SNAP_POINTS.MID;
          } else {
            targetY = SNAP_POINTS.CLOSE;
          }
        }

        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        if (targetY === SNAP_POINTS.CLOSE) {
          Keyboard.dismiss();
          setIsSheetFullyOpen(false);
        }

        Animated.spring(translateY, {
          toValue: targetY,
          useNativeDriver: true,
          tension: 40, friction: 8
        }).start(() => {
          lastTranslateY.current = targetY;
          crossedMidToFull.current = false;
          crossedMidToClose.current = false;
          if (targetY === SNAP_POINTS.CLOSE) {
            setActiveCommentPost(null);
            setReplyingToComment(null);
            setCommentInput('');
          } else {
            setIsSheetFullyOpen(true);
          }
        });
      }
    })
  ).current;

  useEffect(() => {
    if (activeCommentPost) {
      Keyboard.dismiss();
      setIsSheetFullyOpen(false);
      translateY.setValue(SHEET_HEIGHT);
      lastTranslateY.current = SHEET_HEIGHT;
      Animated.spring(translateY, {
        toValue: SNAP_POINTS.MID,
        useNativeDriver: true,
        tension: 40, friction: 8
      }).start(() => {
        lastTranslateY.current = SNAP_POINTS.MID;
        setIsSheetFullyOpen(true);
      });
    } else {
      Keyboard.dismiss();
      setIsSheetFullyOpen(false);
      Animated.spring(translateY, {
        toValue: SNAP_POINTS.CLOSE,
        useNativeDriver: true,
        tension: 40, friction: 8
      }).start(() => {
        lastTranslateY.current = SNAP_POINTS.CLOSE;
      });
    }
  }, [activeCommentPost]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;

  const [touchCoords, setTouchCoords] = useState<{ x: number, y: number } | null>(null);
  const touchCoordsRef = useRef<{ x: number, y: number } | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const selectedActionRef = useRef<string>('');

  // Magnetic pulls
  const [savePull, setSavePull] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [sharePull, setSharePull] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [analysePull, setAnalysePull] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Refs for smooth organic easing (lerp)
  const saveFactorRef = useRef(0);
  const shareFactorRef = useRef(0);
  const analyseFactorRef = useRef(0);

  const savePullRef = useRef({ x: 0, y: 0 });
  const sharePullRef = useRef({ x: 0, y: 0 });
  const analysePullRef = useRef({ x: 0, y: 0 });

  // Native Animated Values for hardware-accelerated fluid performance
  const saveFactorAnim = useRef(new Animated.Value(0)).current;
  const shareFactorAnim = useRef(new Animated.Value(0)).current;
  const analyseFactorAnim = useRef(new Animated.Value(0)).current;

  const savePullAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const sharePullAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const analysePullAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const saveBgColor = saveFactorAnim.interpolate({
    inputRange: [0, 0.74, 0.75, 1],
    outputRange: ['#1c1c1e', '#1c1c1e', '#ffffff', '#ffffff'],
  });
  const shareBgColor = shareFactorAnim.interpolate({
    inputRange: [0, 0.74, 0.75, 1],
    outputRange: ['#1c1c1e', '#1c1c1e', '#ffffff', '#ffffff'],
  });
  const analyseBgColor = analyseFactorAnim.interpolate({
    inputRange: [0, 0.74, 0.75, 1],
    outputRange: ['#1c1c1e', '#1c1c1e', '#ffffff', '#ffffff'],
  });

  const saveScale = saveFactorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.12],
  });
  const shareScale = shareFactorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.12],
  });
  const analyseScale = analyseFactorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.12],
  });

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // keep refs updated
  touchCoordsRef.current = touchCoords;
  selectedActionRef.current = selectedAction;

  // Proximity factors (0 = far, 1 = touching) for smooth color/scale interpolation
  const [saveFactor, setSaveFactor] = useState(0);
  const [shareFactor, setShareFactor] = useState(0);
  const [analyseFactor, setAnalyseFactor] = useState(0);

  const handleCardActive = (id: string, x: number, y: number) => {
    setActiveCardId(id);
    setTouchCoords({ x, y });
    Animated.spring(backdropAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const handleCardInactive = () => {
    Animated.spring(backdropAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
    setActiveCardId(null);
    setTouchCoords(null);
    setSelectedAction('');
    setSavePull({ x: 0, y: 0 });
    setSharePull({ x: 0, y: 0 });
    setAnalysePull({ x: 0, y: 0 });
    setSaveFactor(0);
    setShareFactor(0);
    setAnalyseFactor(0);
    saveFactorRef.current = 0;
    shareFactorRef.current = 0;
    analyseFactorRef.current = 0;
    savePullRef.current = { x: 0, y: 0 };
    sharePullRef.current = { x: 0, y: 0 };
    analysePullRef.current = { x: 0, y: 0 };

    Animated.parallel([
      Animated.spring(saveFactorAnim, { toValue: 0, useNativeDriver: true, tension: 180, friction: 18 }),
      Animated.spring(shareFactorAnim, { toValue: 0, useNativeDriver: true, tension: 180, friction: 18 }),
      Animated.spring(analyseFactorAnim, { toValue: 0, useNativeDriver: true, tension: 180, friction: 18 }),
      Animated.spring(savePullAnim, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 180, friction: 18 }),
      Animated.spring(sharePullAnim, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 180, friction: 18 }),
      Animated.spring(analysePullAnim, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 180, friction: 18 }),
    ]).start();
  };

  const updateFingerPosition = (fingerX: number, fingerY: number) => {
    const coords = touchCoordsRef.current;
    if (!coords) return;

    const isLeftTouch = coords.x < width / 2;

    // Button centers (Spacious sweet spot - perfectly balanced layout!)
    const saveCenterX = coords.x + (isLeftTouch ? 25 : -85) + 30;
    const saveCenterY = coords.y - 74 + 30;

    const shareCenterX = coords.x + (isLeftTouch ? 76 : -136) + 30;
    const shareCenterY = coords.y - 20 + 30;

    const analyseCenterX = coords.x + (isLeftTouch ? 57 : -117) + 30;
    const analyseCenterY = coords.y + 53 + 30;

    // Distances
    const distSave = Math.hypot(fingerX - saveCenterX, fingerY - saveCenterY);
    const distShare = Math.hypot(fingerX - shareCenterX, fingerY - shareCenterY);
    const distAnalyse = Math.hypot(fingerX - analyseCenterX, fingerY - analyseCenterY);

    const minDist = Math.min(distSave, distShare, distAnalyse);

    // Dynamic Independent Physics (ONLY the closest button within range moves and grows, others stay still!)
    const maxMagnetDist = 120;

    let targetSaveX = 0, targetSaveY = 0, targetSaveF = 0;
    let targetShareX = 0, targetShareY = 0, targetShareF = 0;
    let targetAnalyseX = 0, targetAnalyseY = 0, targetAnalyseF = 0;

    const distFromOrigin = Math.hypot(fingerX - coords.x, fingerY - coords.y);

    if (distFromOrigin >= 45 && minDist < maxMagnetDist) {
      const rawFactor = (maxMagnetDist - minDist) / maxMagnetDist;
      const factor = Math.min(rawFactor * 1.5, 1.0); // Snaps to 100% white and scale 1.5x faster!

      const saveDx = isLeftTouch ? 25 : -85;
      const saveDy = -74;
      const saveD = Math.hypot(saveDx, saveDy);

      const shareDx = isLeftTouch ? 76 : -136;
      const shareDy = -20;
      const shareD = Math.hypot(shareDx, shareDy);

      const analyseDx = isLeftTouch ? 57 : -117;
      const analyseDy = 53;
      const analyseD = Math.hypot(analyseDx, analyseDy);

      if (minDist === distSave) {
        targetSaveF = factor;
        targetSaveX = (saveDx / saveD) * 28 * factor;
        targetSaveY = (saveDy / saveD) * 28 * factor;
      } else if (minDist === distShare) {
        targetShareF = factor;
        targetShareX = (shareDx / shareD) * 28 * factor;
        targetShareY = (shareDy / shareD) * 28 * factor;
      } else if (minDist === distAnalyse) {
        targetAnalyseF = factor;
        targetAnalyseX = (analyseDx / analyseD) * 28 * factor;
        targetAnalyseY = (analyseDy / analyseD) * 28 * factor;
      }
    }

    // Apply smooth easing transitions (lerp - accelerated for instant snappy feedback!)
    const nextSaveF = saveFactorRef.current + (targetSaveF - saveFactorRef.current) * 0.22;
    const nextShareF = shareFactorRef.current + (targetShareF - shareFactorRef.current) * 0.22;
    const nextAnalyseF = analyseFactorRef.current + (targetAnalyseF - analyseFactorRef.current) * 0.22;

    const nextSaveX = savePullRef.current.x + (targetSaveX - savePullRef.current.x) * 0.22;
    const nextSaveY = savePullRef.current.y + (targetSaveY - savePullRef.current.y) * 0.22;

    const nextShareX = sharePullRef.current.x + (targetShareX - sharePullRef.current.x) * 0.22;
    const nextShareY = sharePullRef.current.y + (targetShareY - sharePullRef.current.y) * 0.22;

    const nextAnalyseX = analysePullRef.current.x + (targetAnalyseX - analysePullRef.current.x) * 0.22;
    const nextAnalyseY = analysePullRef.current.y + (targetAnalyseY - analysePullRef.current.y) * 0.22;

    // Save refs
    saveFactorRef.current = nextSaveF;
    shareFactorRef.current = nextShareF;
    analyseFactorRef.current = nextAnalyseF;

    savePullRef.current = { x: nextSaveX, y: nextSaveY };
    sharePullRef.current = { x: nextShareX, y: nextShareY };
    analysePullRef.current = { x: nextAnalyseX, y: nextAnalyseY };

    saveFactorAnim.setValue(nextSaveF);
    shareFactorAnim.setValue(nextShareF);
    analyseFactorAnim.setValue(nextAnalyseF);

    savePullAnim.setValue({ x: nextSaveX, y: nextSaveY });
    sharePullAnim.setValue({ x: nextShareX, y: nextShareY });
    analysePullAnim.setValue({ x: nextAnalyseX, y: nextAnalyseY });

    // Update states (Omitted to bypass JS thread bridge and run 100% on GPU/Native driver!)

    let currentActive: 'Save' | 'Share' | 'Analyse' | '' = '';
    if (nextSaveF >= 0.75) {
      currentActive = 'Save';
    } else if (nextShareF >= 0.75) {
      currentActive = 'Share';
    } else if (nextAnalyseF >= 0.75) {
      currentActive = 'Analyse';
    }

    if (currentActive !== selectedActionRef.current) {
      setSelectedAction(currentActive);
      selectedActionRef.current = currentActive;
      if (currentActive !== '' && Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };

  const handleGestureRelease = () => {
    if (selectedActionRef.current !== '') {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Action Triggered", `Successfully executed ${selectedActionRef.current} action!`);
    }
    handleCardInactive();
  };

  const parseCount = (val: string | number | undefined): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const str = val.toString().trim().toLowerCase();
    if (str.endsWith('m')) return parseFloat(str.slice(0, -1)) * 1000000;
    if (str.endsWith('k')) return parseFloat(str.slice(0, -1)) * 1000;
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace('.0', '') + 'm';
    if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    return count.toString();
  };

  const getPostTimeStr = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  const handleLikePost = (postId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const isCurrentlyLiked = likedPosts[postId] ?? filteredPosts.find(p => p.id === postId)?.isLiked ?? false;
    const nextLiked = !isCurrentlyLiked;

    setLikedPosts(prev => ({ ...prev, [postId]: nextLiked }));

    if (postId.length > 8) {
      useStore.getState().likePost(postId, nextLiked);
    } else {
      setLikesOffset(prev => ({
        ...prev,
        [postId]: (prev[postId] ?? 0) + (nextLiked ? 1 : -1)
      }));
    }
  };

  const handleCommentPost = (postId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const postItem = filteredPosts.find(p => p.id === postId);
    if (postItem) {
      setActiveCommentPost(postItem);
    }
  };

  const handleSharePost = (postId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const post = filteredPosts.find(p => p.id === postId);
    const contentToShare = post ? `"${post.content}" - shared via Tradifive` : 'Shared via Tradifive';

    Share.share({
      message: contentToShare
    })
      .then((result) => {
        if (result.action === Share.sharedAction) {
          setSharesOffset(prev => ({
            ...prev,
            [postId]: (prev[postId] ?? 0) + 1
          }));
        }
      })
      .catch((error) => console.log('Error sharing:', error));
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCommentsMap(prev => {
      const list = prev[postId] || [];
      const updated = list.map(c => {
        if (c.id === commentId) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: c.likes + (nextLiked ? 1 : -1)
          };
        }
        return c;
      });
      return { ...prev, [postId]: updated };
    });
  };

  const handleLikeReply = (postId: string, commentId: string, replyId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCommentsMap(prev => {
      const list = prev[postId] || [];
      const updated = list.map(c => {
        if (c.id === commentId) {
          const updatedReplies = (c.replies || []).map(r => {
            if (r.id === replyId) {
              const nextLiked = !r.isLiked;
              return {
                ...r,
                isLiked: nextLiked,
                likes: r.likes + (nextLiked ? 1 : -1)
              };
            }
            return r;
          });
          return { ...c, replies: updatedReplies };
        }
        return c;
      });
      return { ...prev, [postId]: updated };
    });
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim() || !activeCommentPost) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const currentUserName = currentUser?.display_name || currentUser?.username || 'You';
    const currentUserAvatar = getAvatarUrl(currentUser?.avatar_url, currentUser?.email);

    if (replyingToComment) {
      const newReply = {
        id: `r_${Date.now()}`,
        user: currentUserName,
        avatar: currentUserAvatar,
        content: commentInput.trim(),
        time: 'Just now',
        likes: 0,
        isLiked: false
      };

      setCommentsMap(prev => {
        const list = prev[activeCommentPost.id] || [];
        const updated = list.map(c => {
          if (c.id === replyingToComment.commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        });
        return { ...prev, [activeCommentPost.id]: updated };
      });
      setReplyingToComment(null);
    } else {
      const newComment: PostComment = {
        id: `c_${Date.now()}`,
        user: currentUserName,
        avatar: currentUserAvatar,
        content: commentInput.trim(),
        time: 'Just now',
        likes: 0,
        isLiked: false,
        replies: []
      };

      setCommentsMap(prev => ({
        ...prev,
        [activeCommentPost.id]: [...(prev[activeCommentPost.id] || []), newComment]
      }));
    }

    setCommentsOffset(prev => ({
      ...prev,
      [activeCommentPost.id]: (prev[activeCommentPost.id] ?? 0) + 1
    }));

    setCommentInput('');
    Keyboard.dismiss();
  };

  const storePosts = useStore(state => state.posts);

  const mappedPosts = storePosts.map(p => {
    let displayContent = p.content;
    let postLocation = '';
    if (p.content && p.content.includes('\n\n[LOC:')) {
      const parts = p.content.split('\n\n[LOC:');
      displayContent = parts[0];
      postLocation = parts[1].split(']')[0];
    }

    const isLiked = likedPosts[p.id] ?? p.is_liked ?? false;
    const finalLikes = Math.max(0, p.likes_count + (likesOffset[p.id] ?? 0));
    const finalComments = Math.max(0, p.comments_count + (commentsOffset[p.id] ?? 0));
    const finalShares = Math.max(0, (sharesOffset[p.id] ?? 0));

    return {
      id: p.id,
      user_id: p.user_id,
      user: p.profiles?.display_name || (p.profiles?.first_name ? `${p.profiles.first_name} ${p.profiles.last_name}`.trim() : null) || p.profiles?.username || 'User',
      handle: p.profiles?.username ? `@${p.profiles.username}` : '@user',
      avatar: getAvatarUrl(p.profiles?.avatar_url, p.profiles?.email, p.profiles?.username || p.profiles?.display_name),
      time: getPostTimeStr(p.created_at),
      content: displayContent,
      location: postLocation || undefined,
      image: p.media_url,
      likes: formatCount(finalLikes),
      comments: formatCount(finalComments),
      shares: formatCount(finalShares),
      isLiked,
      media_type: p.media_type,
      media_url: p.media_url,
      raw_content: p.content
    };
  });

  const filteredPosts = mappedPosts.filter(p => {
    const isOwnPost = currentUser ? p.user_id === currentUser.id : false;
    const isTagged = (currentUser && p.raw_content)
      ? p.raw_content.toLowerCase().includes('@' + (currentUser.username || '').toLowerCase())
      : false;

    if (activeTab === 'Activity') {
      return isOwnPost || isTagged;
    } else if (activeTab === 'Post') {
      return isOwnPost && p.media_type !== 'video';
    } else if (activeTab === 'Tagged') {
      return isTagged;
    } else if (activeTab === 'Media') {
      return isOwnPost && p.media_type === 'video';
    }
    return false;
  });


  const tabs = ['Activity', 'Post', 'Tagged', 'Media'];

  const onScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y < 0) {
      setPullProgress(Math.min(Math.abs(y) / 30, 1));

      if (y < -30 && !isRefreshing) {
        setIsRefreshing(true);
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => {
          setIsRefreshing(false);
        }, 2000);
      }
    } else {
      setPullProgress(0);
    }
  };

  const onScrollEndDrag = (event: any) => {
    // Refresh is handled in onScroll for immediate action
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [-50, 0],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  return (
    <Animated.View style={[{
      flex: 1,
      backgroundColor: activeCardId ? '#090d16' : (isDark ? theme.background : '#f8fafc')
    }]}>
      <StatusBar barStyle="light-content" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={!activeCardId}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: onScroll }
        )}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
      >
        {/* Cover Image */}
        <Animated.View style={[styles.coverImageContainer, { opacity: activeCardId ? 0.15 : 1 }]}>
          <Animated.Image
            source={currentUser?.banner_url ? { uri: currentUser.banner_url } : { uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&fit=crop' }}
            style={[
              styles.coverImage,
              {
                transform: [
                  { translateY: headerTranslateY },
                  { scale: headerScale }
                ]
              }
            ]}
            resizeMode="cover"
            blurRadius={pullProgress * 15}
          />

          {/* Cover Banner Crown pill status */}
          <View style={{
            position: 'absolute',
            bottom: 12,
            left: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 10,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }}>
            <Crown size={14} color="#facc15" fill="#facc15" />
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold', marginLeft: 6 }}>Elite Trader</Text>
          </View>

          {/* Add Banner overlay button */}
          <TouchableOpacity
            onPress={() => { h(); router.push('/profile-information' as any); }}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: 10,
              gap: 4
            }}
          >
            <Plus size={14} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
              {currentUser?.banner_url ? 'Change Banner' : 'Add Banner'}
            </Text>
          </TouchableOpacity>

          {/* Pull to Refresh Indicator */}
          {(pullProgress > 0 || isRefreshing) && (
            <View style={[styles.refreshIndicator, { opacity: isRefreshing ? 1 : pullProgress }]}>
              {isRefreshing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={{ transform: [{ rotate: `${pullProgress * 180}deg` }] }}>
                  <ArrowDown size={20} color="#fff" strokeWidth={3} />
                </View>
              )}
            </View>
          )}
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
                <ChevronLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' }}>{currentUser?.username || 'user'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.iconCircle}>
                <Search size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <ShareIcon size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { h(); router.push('/profile-information' as any); }} style={styles.iconCircle}>
                <Pencil size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Profile Details */}
        <View style={{ position: 'relative', marginTop: -32, marginBottom: 10 }}>
          {/* Profile Details */}
          <Animated.View style={[styles.profileDetails, { marginTop: 0, marginBottom: 0, opacity: activeCardId ? 0.15 : 1 }]} pointerEvents={isDrawerOpen ? 'none' : 'auto'}>
          {/* Avatar & Stats Row (Instagram Style) */}
          <View style={styles.avatarRow}>
            {/* Avatar with Badge */}
            <View style={{ position: 'relative' }}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.avatarBadge}>
                <Plus size={12} color="#fff" />
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginLeft: 20, alignSelf: 'center', marginBottom: 12 }}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ownPostsCount}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{followerCount}</Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{followingCount}</Text>
                <Text style={styles.statLabel}>following</Text>
              </View>
            </View>
          </View>

          {/* Name and Bio Section */}
          <View style={styles.nameSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.profileName}>
                {currentUser?.display_name || ''}
              </Text>
              {currentUser?.account_type === 'creator' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3e8ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#e9d5ff' }}>
                  <Crown size={12} color="#9333ea" />
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#9333ea', textTransform: 'uppercase' }}>Creator</Text>
                </View>
              )}
            </View>
            {currentUser?.bio ? (
              <Text style={styles.profileBio}>
                {currentUser.bio}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => { h(); router.push('/profile-information' as any); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 6,
                  alignSelf: 'flex-start',
                }}
              >
                <Plus size={14} color="#0095f6" />
                <Text style={{
                  fontSize: 14,
                  color: '#0095f6',
                  fontFamily: 'Inter_600SemiBold',
                  marginLeft: 4
                }}>
                  add banner
                </Text>
              </TouchableOpacity>
            )}

            {/* Extended Profile Details */}
            <View style={{ marginTop: 12, gap: 6 }}>
              {Array.isArray(currentUser?.tags) && currentUser.tags.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {currentUser.tags.map((tag: string, idx: number) => {
                    const isPurple = idx % 4 === 0;
                    const isBlue = idx % 4 === 1;
                    const isEmerald = idx % 4 === 2;
                    const isOrange = idx % 4 === 3;
                    
                    const bgColor = isPurple ? '#f3e8ff' : isBlue ? '#eff6ff' : isEmerald ? '#ecfdf5' : '#fff7ed';
                    const borderColor = isPurple ? '#e9d5ff' : isBlue ? '#bfdbfe' : isEmerald ? '#a7f3d0' : '#fed7aa';
                    const textColor = isPurple ? '#9333ea' : isBlue ? '#2563eb' : isEmerald ? '#059669' : '#ea580c';
                    
                    return (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: bgColor, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: borderColor }}>
                        {isPurple && <Crown size={12} color={textColor} />}
                        {isBlue && <Star size={12} color={textColor} />}
                        {isEmerald && <Shield size={12} color={textColor} />}
                        {isOrange && <Star size={12} color={textColor} />}
                        <Text style={{ fontSize: 11, color: textColor, fontFamily: 'Inter_700Bold' }}>{tag}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="#64748b" />
                  <Text style={{ fontSize: 12, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_500Medium' }}>{currentUser?.city || 'Mumbai, India'}</Text>
                </View>
                {!!currentUser?.website && (
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Link2 size={12} color="#3b82f6" />
                    <Text style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'Inter_500Medium' }}>{currentUser.website.replace(/^https?:\/\//, '')}</Text>
                  </TouchableOpacity>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color="#64748b" />
                  <Text style={{ fontSize: 12, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_500Medium' }}>Joined Jan 2024</Text>
                </View>
              </View>
            </View>


          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity style={styles.instaButton}>
              <Text style={styles.instaButtonText}>Channel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.instaButton}>
              <Text style={styles.instaButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        

          </Animated.View>



          
        </View>

        {/* Tabs Bar */}
        <Animated.View style={{ paddingHorizontal: 16, marginBottom: 10, marginTop: 0, opacity: activeCardId ? 0.15 : 1 }}>
          <View style={{ flexDirection: 'row', backgroundColor: isDark ? theme.background : '#f1f5f9', borderRadius: 30, padding: 4 }}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: activeTab === tab ? (isDark ? theme.card : '#fff') : 'transparent',
                  borderRadius: 26,
                  shadowColor: activeTab === tab ? '#000' : 'transparent',
                  shadowOffset: activeTab === tab ? { width: 0, height: 2 } : { width: 0, height: 0 },
                  shadowOpacity: activeTab === tab ? 0.05 : 0,
                  shadowRadius: activeTab === tab ? 4 : 0,
                  elevation: activeTab === tab ? 2 : 0,
                }}
              >
                <Text style={{
                  fontSize: 15,
                  color: activeTab === tab ? (isDark ? theme.text : '#0f172a') : (isDark ? theme.textSecondary : '#64748b'),
                  fontFamily: activeTab === tab ? 'Inter_700Bold' : 'Inter_600SemiBold'
                }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Feed (Tweets) */}
        <View style={styles.feedContainer}>
          {filteredPosts.map(post => (
            <ProfilePostCard
              key={post.id}
              post={post}
              isActive={activeCardId === post.id}
              anyCardActive={activeCardId !== null}
              onActive={(x, y) => handleCardActive(post.id, x, y)}
              onInactive={handleCardInactive}
              onGestureMove={updateFingerPosition}
              onGestureRelease={handleGestureRelease}
              onLike={() => handleLikePost(post.id)}
              onComment={() => handleCommentPost(post.id)}
              onShare={() => handleSharePost(post.id)}
            />
          ))}
          {filteredPosts.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_500Medium', textAlign: 'center' }}>
                No posts found in this tab.
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      

      {/* Side Handle Trigger (Instagram style) */}
          {!isDrawerOpen && (
            <Animated.View
              style={{
                position: 'absolute',
                right: 0,
                top: 250,
                width: 32,
                height: 72,
                backgroundColor: '#1e293b',
                borderTopLeftRadius: 24,
                borderBottomLeftRadius: 24,
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingLeft: 8,
                shadowColor: '#000',
                shadowOffset: { width: -2, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
                zIndex: 9000,
              }}
              {...drawerPanResponder.panHandlers}
            >
              <TouchableOpacity onPress={openDrawer} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Eye size={16} color="#cbd5e1" style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Slide-Out Profile Stats Drawer */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 168,
              bottom: 0,
              right: 0,
              width: '90%',
              backgroundColor: isDark ? theme.background : '#f8fafc',
              shadowColor: '#000',
              shadowOffset: { width: -5, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 20,
              zIndex: 9999,
              transform: [{ translateX: drawerTranslateX }],
              borderRadius: 36,
              borderWidth: 1,
              borderColor: isDark ? theme.cardBorder : '#e2e8f0',
              overflow: 'hidden',
            }}
            {...drawerPanResponder.panHandlers}
          >
            {/* Vertical Drag Handle */}
            <View style={{ position: 'absolute', left: 6, top: '45%', width: 4, height: 40, backgroundColor: '#cbd5e1', borderRadius: 2 }} />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? theme.card : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18 }}>📈</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a' }}>Analytics & Stats</Text>
                  <Text style={{ fontSize: 13, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_500Medium', marginTop: 2 }}>Your trading performance</Text>
                </View>
              </View>

              {/* Trading Streak Widget */}
              <View
                style={{
                  backgroundColor: isDark ? theme.card : '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: isDark ? theme.cardBorder : '#f1f5f9',
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? theme.cardBorder : '#f8fafc', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Flame size={16} color="#f97316" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? theme.text : '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Trading Streak</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#f97316' }}>{streakVal}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? theme.textSecondary : '#64748b' }}>Current Streak</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? theme.textSecondary : '#64748b' }}>Best: <Text style={{ color: isDark ? theme.text : '#0f172a', fontWeight: '800' }}>{bestStreak} Days</Text></Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                  {streakDots.map((dot, idx) => (
                    <View 
                      key={idx}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.05)',
                        backgroundColor: dot.status === 'green' ? '#10b981' : (dot.status === 'red' ? '#ef4444' : '#e2e8f0')
                      }}
                    />
                  ))}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{streakDots.length > 0 ? new Date(streakDots[0].date).toLocaleDateString('en-US', {day: 'numeric', month: 'short'}) : ''}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Today</Text>
                </View>
              </View>

              {/* Advanced Metrics Widget */}
              <View
                style={{
                  backgroundColor: isDark ? theme.card : '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: isDark ? theme.cardBorder : '#f1f5f9',
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? theme.cardBorder : '#f8fafc', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Briefcase size={16} color="#8b5cf6" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? theme.text : '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Advanced Metrics</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <View style={{ width: '48%', backgroundColor: isDark ? theme.background : '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: isDark ? 1 : 0, borderColor: theme.cardBorder }}>
                    <Text style={{ fontSize: 11, color: isDark ? theme.textSecondary : '#64748b', fontWeight: '600', marginBottom: 4 }}>Win Rate</Text>
                    <Text style={{ fontSize: 18, color: isDark ? theme.text : '#0f172a', fontWeight: '800' }}>68%</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: isDark ? theme.background : '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: isDark ? 1 : 0, borderColor: theme.cardBorder }}>
                    <Text style={{ fontSize: 11, color: isDark ? theme.textSecondary : '#64748b', fontWeight: '600', marginBottom: 4 }}>Profit Factor</Text>
                    <Text style={{ fontSize: 18, color: isDark ? theme.text : '#0f172a', fontWeight: '800' }}>2.4</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: isDark ? theme.background : '#f8fafc', padding: 12, borderRadius: 12, borderWidth: isDark ? 1 : 0, borderColor: theme.cardBorder }}>
                    <Text style={{ fontSize: 11, color: isDark ? theme.textSecondary : '#64748b', fontWeight: '600', marginBottom: 4 }}>Avg Win</Text>
                    <Text style={{ fontSize: 18, color: '#10b981', fontWeight: '800' }}>₹450</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: isDark ? theme.background : '#f8fafc', padding: 12, borderRadius: 12, borderWidth: isDark ? 1 : 0, borderColor: theme.cardBorder }}>
                    <Text style={{ fontSize: 11, color: isDark ? theme.textSecondary : '#64748b', fontWeight: '600', marginBottom: 4 }}>Avg Loss</Text>
                    <Text style={{ fontSize: 18, color: '#ef4444', fontWeight: '800' }}>₹180</Text>
                  </View>
                </View>
              </View>

              {/* Achievements Widget */}
              <View
                style={{
                  backgroundColor: isDark ? theme.card : '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: isDark ? theme.cardBorder : '#f1f5f9',
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? theme.cardBorder : '#f8fafc', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Crown size={16} color="#eab308" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? theme.text : '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Achievements</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: '600' }}>View All</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: '#fde047' }}>
                      <Crown size={22} color="#ca8a04" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#334155', fontWeight: '600', textAlign: 'center' }}>Pro Trader</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: '#6ee7b7' }}>
                      <Check size={22} color="#059669" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#334155', fontWeight: '600', textAlign: 'center' }}>100 Wins</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: '#93c5fd' }}>
                      <Flame size={22} color="#2563eb" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#334155', fontWeight: '600', textAlign: 'center' }}>Hot Streak</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: isDark ? theme.background : '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: isDark ? theme.cardBorder : '#e2e8f0', borderStyle: 'dashed' }}>
                      <Gift size={22} color="#94a3b8" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textAlign: 'center' }}>Locked</Text>
                  </View>
                </ScrollView>
              </View>

              {/* Performance Calendar Widget */}
              <View
                style={{
                  backgroundColor: isDark ? theme.card : '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: isDark ? theme.cardBorder : '#f1f5f9',
                  marginBottom: 40,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? theme.cardBorder : '#f8fafc', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CalendarIcon size={15} color="#3b82f6" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? theme.text : '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Calendar</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TouchableOpacity 
                      onPress={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}
                      style={{ padding: 4 }}
                    >
                      <ChevronDown size={14} color="#94a3b8" style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                    
                    <View
                      style={{
                        backgroundColor: isDark ? theme.background : '#f8fafc',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 99,
                        borderWidth: 1,
                        borderColor: isDark ? theme.cardBorder : '#f1f5f9',
                        minWidth: 105,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: isDark ? theme.text : '#0f172a', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))}
                      style={{ padding: 4 }}
                    >
                      <ChevronDown size={14} color="#94a3b8" style={{ transform: [{ rotate: '-90deg' }] }} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                      <Text key={d} style={{ width: '13%', textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{d.substring(0,1)}</Text>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    {generateCalendarCells()}
                  </View>
                </View>
              </View>
</ScrollView>
          </Animated.View>

      {/* PINTEREST-STYLE MENU OVERLAY */}
      {!!activeCardId && !!touchCoords && (() => {
        const isLeftTouch = touchCoords.x < width / 2;

        return (
          <View
            style={[StyleSheet.absoluteFillObject, { zIndex: 10000, backgroundColor: 'transparent' }]}
          >
            {/* Save Button */}
            <Animated.View style={[
              styles.circleBtn,
              {
                left: touchCoords.x + (isLeftTouch ? 25 : -85),
                top: touchCoords.y - 74,
                backgroundColor: saveBgColor,
                borderColor: saveFactorAnim.interpolate({
                  inputRange: [0, 0.74, 0.75, 1],
                  outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)', 'transparent', 'transparent'],
                }),
                borderWidth: 1,
                transform: [
                  { scale: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                  { scale: saveScale },
                  { translateX: savePullAnim.x },
                  { translateY: savePullAnim.y }
                ]
              }
            ]}>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: saveFactorAnim.interpolate({ inputRange: [0, 0.74, 0.75, 1], outputRange: [1, 1, 0, 0] }) }]}>
                <Pin size={26} color="#ffffff" />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: saveFactorAnim.interpolate({ inputRange: [0, 0.74, 0.75, 1], outputRange: [0, 0, 1, 1] }) }]}>
                <Pin size={26} color="#000000" />
              </Animated.View>
            </Animated.View>

            {/* Share Button */}
            <Animated.View style={[
              styles.circleBtn,
              {
                left: touchCoords.x + (isLeftTouch ? 76 : -136),
                top: touchCoords.y - 20,
                backgroundColor: shareBgColor,
                borderColor: shareFactorAnim.interpolate({
                  inputRange: [0, 0.74, 0.75, 1],
                  outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)', 'transparent', 'transparent'],
                }),
                borderWidth: 1,
                transform: [
                  { scale: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                  { scale: shareScale },
                  { translateX: sharePullAnim.x },
                  { translateY: sharePullAnim.y }
                ]
              }
            ]}>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: shareFactorAnim.interpolate({ inputRange: [0, 0.74, 0.75, 1], outputRange: [1, 1, 0, 0] }) }]}>
                <Send size={26} color="#ffffff" />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: shareFactorAnim.interpolate({ inputRange: [0, 0.74, 0.75, 1], outputRange: [0, 0, 1, 1] }) }]}>
                <Send size={26} color="#000000" />
              </Animated.View>
            </Animated.View>

            {/* Analyse Button */}
            <Animated.View style={[
              styles.circleBtn,
              {
                left: touchCoords.x + (isLeftTouch ? 57 : -117),
                top: touchCoords.y + 53,
                backgroundColor: analyseBgColor,
                borderColor: analyseFactorAnim.interpolate({
                  inputRange: [0, 0.74, 0.75, 1],
                  outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)', 'transparent', 'transparent'],
                }),
                borderWidth: 1,
                transform: [
                  { scale: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                  { scale: analyseScale },
                  { translateX: analysePullAnim.x },
                  { translateY: analysePullAnim.y }
                ]
              }
            ]}>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: analyseFactorAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] }) }]}>
                <Sparkles size={26} color="#ffffff" />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: analyseFactorAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] }) }]}>
                <Sparkles size={26} color="#000000" />
              </Animated.View>
            </Animated.View>

            {/* Active Action Text Indicator */}
            {selectedAction !== '' && (
              <View style={{ position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 }}>
                <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' }}>{selectedAction}</Text>
              </View>
            )}
          </View>
        );
      })()}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>


      {/* COMMENTS DRAWER MODAL */}
      <Modal
        visible={activeCommentPost !== null}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          Animated.spring(translateY, {
            toValue: SNAP_POINTS.CLOSE,
            useNativeDriver: true,
            tension: 40, friction: 8
          }).start(() => {
            setActiveCommentPost(null);
            setReplyingToComment(null);
            setCommentInput('');
          });
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          {/* Transparent click-to-close backdrop */}
          <TouchableWithoutFeedback
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Animated.spring(translateY, {
                toValue: SNAP_POINTS.CLOSE,
                useNativeDriver: true,
                tension: 40, friction: 8
              }).start(() => {
                setActiveCommentPost(null);
                setReplyingToComment(null);
                setCommentInput('');
              });
            }}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(9, 13, 22, 0.4)' }} />
          </TouchableWithoutFeedback>

          {/* Draggable Sheet */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: SHEET_HEIGHT,
              backgroundColor: isDark ? theme.card : '#ffffff',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              transform: [{ translateY }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 24,
            }}
          >
            <View style={{ flex: 1 }}>
              {/* Header Handle (holds PanResponder to drag) */}
              <View
                {...panResponder.panHandlers}
                style={{
                  width: '100%',
                  height: 54,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: '#f1f5f9'
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: '#cbd5e1',
                    marginBottom: 6
                  }}
                />
                <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#1e293b' }}>
                  Comments ({(commentsMap[activeCommentPost?.id]?.length || 0) + (commentsMap[activeCommentPost?.id]?.reduce((sum, c) => sum + (c.replies?.length || 0), 0) || 0)})
                </Text>
              </View>

              {/* Comments List */}
              <FlatList
                data={commentsMap[activeCommentPost?.id] || []}
                keyExtractor={item => item.id}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 18 }}>
                    {/* Top-Level Comment Row */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Image source={{ uri: item.avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#1e293b' }}>{item.user}</Text>
                        <Text style={{ fontSize: 13, color: '#334155', fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 18 }}>{item.content}</Text>

                        {/* Action Links under Comment */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 }}>
                          <Text style={{ fontSize: 12, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_400Regular' }}>{item.time}</Text>
                          <TouchableOpacity onPress={() => handleLikeComment(activeCommentPost.id, item.id)}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: item.isLiked ? '#ef4444' : '#64748b' }}>
                              {item.likes > 0 ? `${item.likes} Like` : 'Like'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {
                            setReplyingToComment({ commentId: item.id, username: item.user });
                          }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.textSecondary : '#64748b' }}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Like Heart Icon on Right */}
                      <TouchableOpacity onPress={() => handleLikeComment(activeCommentPost.id, item.id)} style={{ padding: 4 }}>
                        <Heart size={14} color={item.isLiked ? '#ef4444' : '#94a3b8'} set={item.isLiked ? "bold" : "curved"} stroke="bold" />
                      </TouchableOpacity>
                    </View>

                    {/* Replies (Indent nested list) */}
                    {item.replies && item.replies.map(reply => (
                      <View key={reply.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginLeft: 42, marginTop: 12 }}>
                        <Image source={{ uri: reply.avatar }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#1e293b' }}>{reply.user}</Text>
                          <Text style={{ fontSize: 12, color: '#334155', fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 16 }}>{reply.content}</Text>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
                            <Text style={{ fontSize: 11, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_400Regular' }}>{reply.time}</Text>
                            <TouchableOpacity onPress={() => handleLikeReply(activeCommentPost.id, item.id, reply.id)}>
                              <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: reply.isLiked ? '#ef4444' : '#64748b' }}>
                                {reply.likes > 0 ? `${reply.likes} Like` : 'Like'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Like Heart Icon for Reply */}
                        <TouchableOpacity onPress={() => handleLikeReply(activeCommentPost.id, item.id, reply.id)} style={{ padding: 4 }}>
                          <Heart size={12} color={reply.isLiked ? '#ef4444' : '#94a3b8'} set={reply.isLiked ? "bold" : "curved"} stroke="bold" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              />

            </View>
          </Animated.View>

          {/* Comment Input Bar */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: isDark ? theme.card : '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#f1f5f9',
              transform: [{ translateY: inputTranslateY }],
              paddingBottom: keyboardHeight > 0
                ? keyboardHeight + (Platform.OS === 'ios' ? 8 : 12)
                : Math.max(insets.bottom, 12),
              zIndex: 10,
              elevation: 10,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 8
            }}
          >
            {/* Emoji Row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#f8fafc',
                backgroundColor: isDark ? theme.card : '#ffffff'
              }}
            >
              {['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    setCommentInput(prev => prev + emoji);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  style={{ paddingHorizontal: 12, paddingVertical: 4 }}
                >
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Replying To Indicator */}
            {replyingToComment ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isDark ? theme.background : '#f8fafc',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f1f5f9'
                }}
              >
                <Text style={{ fontSize: 12, color: isDark ? theme.textSecondary : '#64748b', fontFamily: 'Inter_400Regular' }}>
                  Replying to <Text style={{ fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a' }}>@{replyingToComment.username}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyingToComment(null)}>
                  <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_600SemiBold', padding: 2 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Input Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: isDark ? theme.card : '#ffffff'
              }}
            >
              <Image source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }} style={{ width: 34, height: 34, borderRadius: 17 }} />

              {isSheetFullyOpen ? (
                <TextInput
                  ref={commentInputRef}
                  value={commentInput}
                  onChangeText={setCommentInput}
                  onFocus={() => {
                    Animated.spring(translateY, {
                      toValue: SNAP_POINTS.FULL,
                      useNativeDriver: true,
                      tension: 40, friction: 8
                    }).start(() => {
                      lastTranslateY.current = SNAP_POINTS.FULL;
                    });
                  }}
                  placeholder={replyingToComment ? `Reply to @${replyingToComment.username}...` : "What do you think of this?"}
                  placeholderTextColor="#94a3b8"
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? theme.background : '#f1f5f9',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    fontSize: 14,
                    color: isDark ? theme.text : '#0f172a',
                    fontFamily: 'Inter_400Regular',
                    maxHeight: 80
                  }}
                  multiline={true}
                />
              ) : (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setIsSheetFullyOpen(true);
                    Animated.spring(translateY, {
                      toValue: SNAP_POINTS.FULL,
                      useNativeDriver: true,
                      tension: 40, friction: 8
                    }).start(() => {
                      lastTranslateY.current = SNAP_POINTS.FULL;
                    });
                    setTimeout(() => {
                      commentInputRef.current?.focus();
                    }, 50);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? theme.background : '#f1f5f9',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    height: 36,
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'Inter_400Regular' }}>
                    {replyingToComment ? `Reply to @${replyingToComment.username}...` : "What do you think of this?"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!commentInput.trim()}
                style={{
                  backgroundColor: commentInput.trim() ? '#10b981' : '#e2e8f0',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: commentInput.trim() ? '#ffffff' : '#94a3b8' }}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const globalStyles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  tiltedCard: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtn: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  circleBtnActive: {
    backgroundColor: '#007aff',
    borderColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coverImageContainer: {
    height: 200,
    position: 'relative',
    zIndex: 2,
    elevation: 2,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  refreshIndicator: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  profileDetails: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 36,
    marginTop: -32,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  toolsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  toolsIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  toolsText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#0f172a',
  },
  nameSection: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  profileBio: {
    fontSize: 15,
    color: '#0f172a',
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    textTransform: 'lowercase',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
  },
  editProfileButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginLeft: 16,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0095f6',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instaButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instaButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  highlightsScroll: {
    marginTop: 15,
    marginBottom: 0,
  },
  highlightsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  highlightItem: {
    alignItems: 'center',
    width: 64,
  },
  highlightCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  highlightNew: {
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  highlightImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  highlightTitle: {
    fontSize: 12,
    color: '#0f172a',
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  tabsScroll: {
    marginTop: 15,
  },
  tabBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTabBox: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  tabBoxText: {
    fontSize: 15,
    color: '#64748b',
    fontFamily: 'Inter_600SemiBold',
  },
  activeTabBoxText: {
    color: '#fff',
  },
  feedContainer: {
    marginTop: 0,
  },
  tweetContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eff3f4',
  },
  tweetLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  tweetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tweetLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#eff3f4',
    marginTop: 4,
  },
  tweetRight: {
    flex: 1,
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tweetUserName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  tweetHandle: {
    fontSize: 15,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  tweetDot: {
    color: '#64748b',
  },
  tweetTime: {
    fontSize: 15,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  tweetContent: {
    fontSize: 16,
    color: '#0f172a',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    lineHeight: 20,
  },
  tweetImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  tweetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingRight: 20,
  },
  tweetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tweetActionText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1d9bf0',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalKeyboardView: {
    width: '100%',
    height: '92%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#000000',
  },
  modalCloseButton: {
    paddingVertical: 4,
  },
  modalCloseText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#0095f6',
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  modalAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalAvatarSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0095f6',
    marginTop: 10,
  },
  modalForm: {
    gap: 16,
    marginBottom: 28,
  },
  modalInputGroup: {
    width: '100%',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 72,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
  },
  modalInputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    marginBottom: 4,
  },
  modalInputText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    padding: 0,
    height: 24,
  },
  modalSaveButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  modalSaveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
  },
});
