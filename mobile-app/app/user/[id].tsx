import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { getAvatarUrl } from '../utils/avatar';
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
  Keyboard,
  Share,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BlurView } from 'expo-blur';
import { ImageViewerModal } from '../../components/ImageViewerModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  Crown as CrownIcon,
  Link2,
  ChevronDown,
  Calendar as CalendarIcon,
  RotateCw
} from 'lucide-react-native';
import { Heart, Chat, Send } from '../../components/Iconly';
import { supabase } from '../utils/supabase';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FollowListModal } from '../../components/FollowListModal';

const { width, height } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

// Custom fallback stats mapping based on User IDs
const getUserStats = (userId: string) => {
  // Lauralee Quintero: '70ae04b5-351a-4273-8a22-99289e68f253'
  // Mike Taravella: '314cfff7-f243-4d04-83a3-f703fcb91ba8'
  // TradiFive AI: 'f02d51e0-9e74-4ee5-9b66-4ee2fd6e919e'
  // Anna B: '96985917-5a97-4cd7-bcd8-1ae13a1aef6a'
  // mark ting: 'fac9bab1-9fc7-44ab-9c96-c412ed12b4f2'
  // nikhil: '77c0873e-6f2c-469a-96f5-4ba29c4e1650'

  if (userId === '70ae04b5-351a-4273-8a22-99289e68f253') {
    return {
      streakVal: 18,
      bestStreak: 25,
      winRate: '72%',
      profitFactor: '2.8',
      avgWin: '$620',
      avgLoss: '$150',
      roleTag: 'RISK DESK',
      streakDots: [
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' }
      ],
      calendarMap: { '02': 'green', '05': 'green', '08': 'green', '12': 'green', '14': 'green', '18': 'green', '22': 'green', '27': 'green' }
    };
  } else if (userId === '314cfff7-f243-4d04-83a3-f703fcb91ba8') {
    return {
      streakVal: 24,
      bestStreak: 30,
      winRate: '78%',
      profitFactor: '3.2',
      avgWin: '$850',
      avgLoss: '$210',
      roleTag: 'MENTOR',
      streakDots: [
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' }
      ],
      calendarMap: { '02': 'green', '05': 'green', '08': 'green', '12': 'green', '14': 'green', '18': 'green', '22': 'green', '27': 'green' }
    };
  } else if (userId === '77c0873e-6f2c-469a-96f5-4ba29c4e1650') {
    return {
      streakVal: 12,
      bestStreak: 15,
      winRate: '65%',
      profitFactor: '2.1',
      avgWin: '$340',
      avgLoss: '$130',
      roleTag: 'STAFF',
      streakDots: [
        { status: 'green' }, { status: 'green' }, { status: 'red' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' },
        { status: 'red' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' }
      ],
      calendarMap: { '02': 'green', '05': 'red', '08': 'green', '12': 'green', '14': 'red', '18': 'green', '22': 'green', '27': 'red' }
    };
  } else {
    return {
      streakVal: 8,
      bestStreak: 12,
      winRate: '60%',
      profitFactor: '1.9',
      avgWin: '$280',
      avgLoss: '$140',
      roleTag: 'TRADER',
      streakDots: [
        { status: 'green' }, { status: 'green' }, { status: 'red' },
        { status: 'green' }, { status: 'green' }, { status: 'gray' },
        { status: 'gray' }, { status: 'green' }, { status: 'green' },
        { status: 'green' }, { status: 'red' }, { status: 'green' },
        { status: 'green' }, { status: 'green' }, { status: 'green' }
      ],
      calendarMap: { '02': 'green', '05': 'red', '08': 'green', '12': 'green', '14': 'red', '18': 'green', '22': 'green', '27': 'red' }
    };
  }
};



export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useAppTheme();

  const currentUser = useStore(state => state.currentUser);
  const followingIds = useStore(state => state.followingIds);
  const followUser = useStore(state => state.followUser);
  const unfollowUser = useStore(state => state.unfollowUser);

  const [viewedUser, setViewedUser] = useState<any>(null);
  const [viewedFollowers, setViewedFollowers] = useState(0);
  const [viewedFollowing, setViewedFollowing] = useState(0);
  const [viewedPostsCount, setViewedPostsCount] = useState(0);
  const [viewedPosts, setViewedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [followModalState, setFollowModalState] = useState<{ isVisible: boolean; type: 'followers' | 'following' }>({ isVisible: false, type: 'followers' });

  // Styling and tab state
  const [activeTab, setActiveTab] = useState('Activity');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Interactive local states for posts
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likesOffset, setLikesOffset] = useState<Record<string, number>>({});
  const [commentsOffset, setCommentsOffset] = useState<Record<string, number>>({});
  const [sharesOffset, setSharesOffset] = useState<Record<string, number>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [userChannel, setUserChannel] = useState<any>(null);

  // Comments and Viewer modal states
  const [activeViewerPostId, setActiveViewerPostId] = useState<string | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<{ commentId: string; username: string } | null>(null);
  const commentInputRef = useRef<TextInput>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSheetFullyOpen, setIsSheetFullyOpen] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});

  // Side Drawer Slider State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTranslateX = useRef(new Animated.Value(width)).current;

  // Scroll offset for parallax header
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchUserData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);

    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) console.warn('Profile fetch error:', profileError);
      if (profileData) setViewedUser(profileData);

      // Fetch follower count
      const { count: followers } = await supabase
        .from('social_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', id);
      setViewedFollowers(followers || 0);

      // Fetch following count
      const { count: following } = await supabase
        .from('social_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', id);
      setViewedFollowing(following || 0);

      // Fetch user channel
      const { data: channelData } = await supabase
        .from('channels')
        .select('*')
        .eq('created_by', id)
        .single();
      if (channelData) {
        setUserChannel(channelData);
      }

      // Fetch posts
      const { data: posts, count: postsCount } = await supabase
        .from('social_posts')
        .select('*, profiles(*)', { count: 'exact' })
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20);
      setViewedPosts(posts || []);
      setViewedPostsCount(postsCount || 0);
    } catch (err) {
      console.error('Error in fetchUserData:', err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();

    // Real-time subscription for follows
    const channelName = 'user_profile_follows_' + id + '_' + Date.now();
    const sub = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_follows' }, async (payload: any) => {
        try {
          const { count: followers } = await supabase
            .from('social_follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', id);
          setViewedFollowers(followers || 0);

          const { count: following } = await supabase
            .from('social_follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', id);
          setViewedFollowing(following || 0);
        } catch (err) {
          console.error('[Real-time Profile Follow Refresh Error]:', err);
        }
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [id]);

  // Keyboard listeners for comments input
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const isFollowing = typeof id === 'string' && followingIds.includes(id);
  const isOwnProfile = currentUser?.id === id;

  const handleFollowToggle = async () => {
    if (typeof id !== 'string') return;
    h();
    if (isFollowing) {
      await unfollowUser(id);
    } else {
      await followUser(id);
    }
  };

  const getPostTimeStr = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // Drawer slider actions
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
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        if (gestureState.dx > 0) {
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

  // Viewed User fallbacks
  const displayName = viewedUser?.display_name ||
    (viewedUser?.first_name ? `${viewedUser.first_name} ${viewedUser.last_name || ''}`.trim() : null) ||
    viewedUser?.username || 'User';
  const usernameText = viewedUser?.username ? `@${viewedUser.username}` : '';
  const avatarUrl = getAvatarUrl(viewedUser?.avatar_url, viewedUser?.email, viewedUser?.username);
  const bannerUrl = viewedUser?.banner_url || 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&auto=format&fit=crop';
  const bio = viewedUser?.bio || '';
  const website = viewedUser?.website || '';
  const city = viewedUser?.city || 'New York, USA';
  const joinDate = viewedUser?.created_at ? new Date(viewedUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024';

  // Get dynamic fallback metrics customized to viewed user
  const targetId = typeof id === 'string' ? id : '';
  const stats = getUserStats(targetId);

  // Generate calendar cells for streak view
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

    const todayStr = (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; })();

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayStr = String(day).padStart(2, '0');
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${dayStr}`;
      const status = stats.calendarMap[dayStr as keyof typeof stats.calendarMap];
      const isToday = key === todayStr;

      let bgColor = '#1A1A1A';
      let borderColor = '#262626';

      if (status === 'green') {
        bgColor = 'rgba(16, 185, 129, 0.8)';
        borderColor = 'transparent';
      } else if (status === 'red') {
        bgColor = 'rgba(239, 68, 68, 0.2)';
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

  // Local interaction handlers
  const handleLikePost = (postId: string) => {
    h();
    const isCurrentlyLiked = likedPosts[postId] ?? false;
    setLikedPosts(prev => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setLikesOffset(prev => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + (!isCurrentlyLiked ? 1 : -1)
    }));
  };

  const handleSharePost = (postId: string) => {
    h();
    const post = viewedPosts.find(p => p.id === postId);
    const content = post ? `"${post.content}" - shared from Tradifive` : 'Shared from Tradifive';
    Share.share({ message: content })
      .then(result => {
        if (result.action === Share.sharedAction) {
          setSharesOffset(prev => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
        }
      })
      .catch(err => console.log('Error sharing post:', err));
  };

  const handleCommentSubmit = () => {
    if (!commentInput.trim() || !activeCommentPost) return;
    h();
    const newComment = {
      id: `c_${Date.now()}`,
      user: currentUser?.display_name || currentUser?.username || 'You',
      avatar: getAvatarUrl(currentUser?.avatar_url, currentUser?.email),
      content: commentInput.trim(),
      time: 'Just now',
      likes: 0
    };
    setCommentsMap(prev => ({
      ...prev,
      [activeCommentPost.id]: [...(prev[activeCommentPost.id] || []), newComment]
    }));
    setCommentsOffset(prev => ({
      ...prev,
      [activeCommentPost.id]: (prev[activeCommentPost.id] ?? 0) + 1
    }));
    setCommentInput('');
    Keyboard.dismiss();
  };

  // Parallax calculations
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

  // Filter posts based on active tab
  const filteredPosts = viewedPosts.filter(p => {
    let displayContent = p.content || '';
    if (displayContent.includes('\n\n[LOC:')) {
      displayContent = displayContent.split('\n\n[LOC:')[0];
    }
    if (activeTab === 'Activity') return true;
    if (activeTab === 'Post') return p.media_url === null || p.media_url === undefined;
    if (activeTab === 'Media') return p.media_url !== null && p.media_url !== undefined;
    return true;
  });

  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y < 0) {
      setPullProgress(Math.min(Math.abs(y) / 30, 1));

      if (y < -30 && !isRefreshing) {
        setIsRefreshing(true);
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (typeof id === 'string') {
          fetchUserData();
        }
        setTimeout(() => {
          setIsRefreshing(false);
        }, 2000);
      }
    } else {
      setPullProgress(0);
    }
  };

  const tabs = ['Activity', 'Post', 'Tagged', 'Media'];

  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: onScroll }
        )}
        scrollEventThrottle={16}
      >
        {/* Cover Image Parallax Banner */}
        <Animated.View style={styles.coverImageContainer}>
          <Animated.Image
            source={{ uri: bannerUrl }}
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

          {/* Header Row (Back, Username, Actions) */}
          <View style={{
            position: 'absolute',
            top: 135,
            left: 16,
            right: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => { h(); router.back(); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' }}>
                {viewedUser?.username || viewedUser?.display_name || viewedUser?.first_name || 'Profile'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  h();
                  if (typeof id === 'string') {
                    // Trigger reload by re-triggering effect or state
                    setViewedUser(null);
                    setLoading(true);
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <RotateCw size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Search size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  h();
                  Share.share({ message: `Check out ${viewedUser?.display_name || 'this user'} on Tradifive!` });
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ShareIcon size={20} color="#fff" />
              </TouchableOpacity>

              {isOwnProfile && (
                <TouchableOpacity
                  onPress={() => {
                    h();
                    // router.push('/edit-profile'); 
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Pencil size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Profile Details Wrapper */}
        <View style={{ position: 'relative', marginTop: -32, marginBottom: 10 }}>
          {/* Profile Card & Details */}
          <View style={[styles.profileDetails, { marginTop: 0, marginBottom: 0 }]}>
          {/* Avatar Row */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            </View>

            {/* Public Statistics */}
            <View style={styles.statsGroup}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{viewedPostsCount}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => {
                  if (viewedUser?.is_private && !isFollowing && !isOwnProfile) {
                    Alert.alert("Private Account", "Follow to see their followers.");
                    return;
                  }
                  setFollowModalState({ isVisible: true, type: 'followers' });
                }}
              >
                <Text style={styles.statValue}>{viewedFollowers}</Text>
                <Text style={styles.statLabel}>followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => {
                  if (viewedUser?.is_private && !isFollowing && !isOwnProfile) {
                    Alert.alert("Private Account", "Follow to see who they are following.");
                    return;
                  }
                  setFollowModalState({ isVisible: true, type: 'following' });
                }}
              >
                <Text style={styles.statValue}>{viewedFollowing}</Text>
                <Text style={styles.statLabel}>following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name & Bio section */}
          <View style={styles.nameSection}>
            <Text style={styles.profileName}>{displayName}</Text>
            {usernameText ? <Text style={styles.profileSubtitle}>{usernameText}</Text> : null}
            {bio ? <Text style={styles.profileBio}>{bio}</Text> : null}

            {/* Trading Style Tags */}
            {Array.isArray(viewedUser?.tags) && viewedUser.tags.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {viewedUser.tags.map((tag: string, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e1e2d' : '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, color: isDark ? '#f8fafc' : '#334155', fontFamily: 'Inter_500Medium' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Meta row details */}
            <View style={{ marginTop: 12, gap: 6 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="#64748b" />
                  <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_500Medium' }}>{city}</Text>
                </View>
                {website ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Link2 size={12} color="#3b82f6" />
                    <Text style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'Inter_500Medium' }}>{website.replace(/^https?:\/\//, '')}</Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color="#64748b" />
                  <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_500Medium' }}>Joined {joinDate}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Follow, Message, and Channel Actions */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity
              onPress={handleFollowToggle}
              style={[
                styles.instaButton,
                { backgroundColor: isFollowing ? '#1e293b' : '#0095f6' }
              ]}
            >
              <Text style={[styles.instaButtonText, { color: '#fff' }]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                h();
                router.push({ pathname: '/inbox', params: { targetUserId: id } });
              }}
              style={styles.instaButton}
            >
              <Text style={styles.instaButtonText}>Message</Text>
            </TouchableOpacity>

            {userChannel && (
              <TouchableOpacity
                onPress={() => {
                  h();
                  router.push({ pathname: '/(tabs)/channels', params: { openChannelId: userChannel.id } });
                }}
                style={styles.instaButton}
              >
                <Text style={styles.instaButtonText}>Channel</Text>
              </TouchableOpacity>
            )}
          </View>


        </View>
        </View>

        {/* Tab Selection Row */}
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 30, padding: 4 }}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: activeTab === tab ? '#fff' : 'transparent',
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
                  color: activeTab === tab ? '#0f172a' : '#64748b',
                  fontFamily: activeTab === tab ? 'Inter_700Bold' : 'Inter_600SemiBold'
                }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Viewed User Posts Feed */}
        <View style={styles.feedContainer}>
          {filteredPosts.map(post => {
            let displayContent = post.content || '';
            if (displayContent.includes('\n\n[LOC:')) {
              displayContent = displayContent.split('\n\n[LOC:')[0];
            }
            const isLiked = likedPosts[post.id] ?? false;
            const finalLikes = (post.likes_count || 0) + (likesOffset[post.id] || 0);
            const finalComments = (post.comments_count || 0) + (commentsOffset[post.id] || 0);
            const finalShares = (post.shares_count || 0) + (sharesOffset[post.id] || 0);

            return (
              <View key={post.id} style={styles.postCard}>
                {/* Header */}
                <View style={styles.postHeader}>
                  <Image source={{ uri: avatarUrl }} style={styles.postAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postUserName}>{displayName}</Text>
                    <Text style={styles.postTime}>{getPostTimeStr(post.created_at)}</Text>
                  </View>
                  <TouchableOpacity style={{ padding: 4 }}>
                    <MoreVertical size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                {displayContent ? (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.postContent, { marginBottom: 0 }]}>
                      {displayContent.length > 150 && !expandedPosts[post.id]
                        ? `${displayContent.substring(0, 150)}...`
                        : displayContent}
                    </Text>
                    {displayContent.length > 150 && (
                      <TouchableOpacity onPress={() => setExpandedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ marginTop: 4 }}>
                        <Text style={{ color: expandedPosts[post.id] ? '#64748b' : '#3b82f6', fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                          {expandedPosts[post.id] ? 'Show less' : 'Read more'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}

                {/* Image */}
                {post.media_url ? (
                  <TouchableOpacity onPress={() => setActiveViewerPostId(post.id)} activeOpacity={0.9} style={{ width: '100%', height: 350, backgroundColor: isDark ? '#090d16' : '#f8f9fa', borderRadius: 8, overflow: 'hidden', marginTop: 12 }}>
                    <Image source={{ uri: post.media_url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </TouchableOpacity>
                ) : null}

                {/* Interactive Footer Actions */}
                <View style={styles.postActions}>
                  <View style={{ flexDirection: 'row', gap: 20 }}>
                    <TouchableOpacity onPress={() => handleLikePost(post.id)} style={styles.actionBtnRow}>
                      <Heart size={18} color={isLiked ? '#ef4444' : '#64748b'} set={isLiked ? "bold" : "curved"} stroke="bold" />
                      <Text style={[styles.actionText, isLiked && { color: '#ef4444' }]}>{finalLikes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveCommentPost(post)} style={styles.actionBtnRow}>
                      <Chat size={18} color="#64748b" set="curved" stroke="bold" />
                      <Text style={styles.actionText}>{finalComments}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleSharePost(post.id)} style={styles.actionBtnRow}>
                    <Send size={16} color="#64748b" set="curved" stroke="bold" style={{ transform: [{ rotate: '-15deg' }] }} />
                    <Text style={styles.actionText}>{finalShares}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {filteredPosts.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, color: '#64748b', fontFamily: 'Inter_500Medium', textAlign: 'center' }}>
                No posts found.
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Follow Modals */}
      <ImageViewerModal
        visible={!!activeViewerPostId}
        onClose={() => setActiveViewerPostId(null)}
        posts={viewedPosts}
        initialPostId={activeViewerPostId}
        onLike={handleLikePost}
        onComment={(postId) => {
          const post = viewedPosts.find(p => p.id === postId);
          if (post) setActiveCommentPost(post);
        }}
        onShare={handleSharePost}
      />

      {/* Slide-out drawer trigger handle */}
      {!isDrawerOpen && (
        <Animated.View style={styles.sideHandleTrigger}>
          <TouchableOpacity onPress={openDrawer} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Eye size={16} color="#cbd5e1" style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Sliding Stats Drawer */}
      <Animated.View
        style={[
          styles.slidingDrawer,
          { transform: [{ translateX: drawerTranslateX }] }
        ]}
        {...drawerPanResponder.panHandlers}
      >
        <View style={styles.drawerDragHandle} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30 }}>
            <View style={styles.drawerTitleIconContainer}>
              <Text style={{ fontSize: 18 }}>📈</Text>
            </View>
            <View>
              <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0f172a' }}>Analytics & Stats</Text>
              <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium', marginTop: 2 }}>{displayName}'s performance metrics</Text>
            </View>
          </View>

          {/* Trading Streak Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Flame size={16} color="#f97316" />
                <Text style={styles.widgetTitle}>Trading Streak</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#f97316' }}>{stats.streakVal}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
              <Text style={styles.widgetSubtext}>Current Streak</Text>
              <Text style={styles.widgetSubtext}>Best: <Text style={{ color: '#0f172a', fontWeight: '800' }}>{stats.bestStreak} Days</Text></Text>
            </View>

            <View style={styles.streakDotsRow}>
              {stats.streakDots.map((dot, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.streakDot,
                    { backgroundColor: dot.status === 'green' ? '#10b981' : (dot.status === 'red' ? '#ef4444' : '#e2e8f0') }
                  ]}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</Text>
              <Text style={styles.dateLabel}>Today</Text>
            </View>
          </View>

          {/* Advanced Metrics Widget */}
          <View style={styles.widgetCard}>
            <View style={[styles.widgetHeader, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Briefcase size={16} color="#8b5cf6" />
                <Text style={styles.widgetTitle}>Advanced Metrics</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Win Rate</Text>
                <Text style={styles.metricValue}>{stats.winRate}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Profit Factor</Text>
                <Text style={styles.metricValue}>{stats.profitFactor}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Avg Win</Text>
                <Text style={[styles.metricValue, { color: '#10b981' }]}>{stats.avgWin}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Avg Loss</Text>
                <Text style={[styles.metricValue, { color: '#ef4444' }]}>{stats.avgLoss}</Text>
              </View>
            </View>
          </View>

          {/* Achievements Widget */}
          <View style={styles.widgetCard}>
            <View style={[styles.widgetHeader, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CrownIcon size={16} color="#eab308" />
                <Text style={styles.widgetTitle}>Achievements</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <View style={styles.badgeItem}>
                <View style={[styles.badgeCircle, { backgroundColor: '#fef3c7', borderColor: '#fde047' }]}>
                  <CrownIcon size={22} color="#ca8a04" />
                </View>
                <Text style={styles.badgeText}>Pro Trader</Text>
              </View>
              <View style={styles.badgeItem}>
                <View style={[styles.badgeCircle, { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }]}>
                  <Check size={22} color="#059669" />
                </View>
                <Text style={styles.badgeText}>100 Wins</Text>
              </View>
              <View style={styles.badgeItem}>
                <View style={[styles.badgeCircle, { backgroundColor: '#eff6ff', borderColor: '#93c5fd' }]}>
                  <Flame size={22} color="#2563eb" />
                </View>
                <Text style={styles.badgeText}>Hot Streak</Text>
              </View>
              <View style={styles.badgeItem}>
                <View style={[styles.badgeCircle, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderStyle: 'dashed' }]}>
                  <Gift size={22} color="#94a3b8" />
                </View>
                <Text style={[styles.badgeText, { color: '#94a3b8' }]}>Locked</Text>
              </View>
            </ScrollView>
          </View>

          {/* Calendar Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CalendarIcon size={15} color="#3b82f6" />
                <Text style={styles.widgetTitle}>Calendar</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <TouchableOpacity
                  onPress={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}
                  style={{ padding: 4 }}
                >
                  <ChevronDown size={14} color="#94a3b8" style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>

                <View style={styles.calendarMonthPill}>
                  <Text style={styles.calendarMonthTxt}>
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

            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <Text key={d} style={styles.weekLabel}>{d.substring(0, 1)}</Text>
                ))}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {generateCalendarCells()}
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* COMMENTS MODAL */}
      <Modal
        visible={activeCommentPost !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveCommentPost(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveCommentPost(null)}>
          <View style={styles.commentsOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.commentsSheet}
              >
                {/* Header */}
                <View style={styles.commentsHeader}>
                  <View style={styles.commentsDragHandle} />
                  <Text style={styles.commentsTitle}>Comments</Text>
                </View>

                {/* List */}
                <FlatList
                  data={commentsMap[activeCommentPost?.id] || []}
                  keyExtractor={item => item.id}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ padding: 16 }}
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.commentUser}>{item.user}</Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                        <Text style={styles.commentTime}>{item.time}</Text>
                      </View>
                    </View>
                  )}
                  ListEmptyComponent={() => (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                      <Text style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter_500Medium' }}>No comments yet. Be the first to comment!</Text>
                    </View>
                  )}
                />

                {/* Input Bar */}
                <View style={[styles.commentInputBar, { paddingBottom: keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 12) }]}>
                  <TextInput
                    ref={commentInputRef}
                    value={commentInput}
                    onChangeText={setCommentInput}
                    placeholder="Write a comment..."
                    placeholderTextColor="#94a3b8"
                    style={styles.commentInputField}
                    multiline
                  />
                  <TouchableOpacity
                    onPress={handleCommentSubmit}
                    disabled={!commentInput.trim()}
                    style={[styles.commentPostBtn, { backgroundColor: commentInput.trim() ? '#0095f6' : '#e2e8f0' }]}
                  >
                    <Text style={[styles.commentPostBtnTxt, { color: commentInput.trim() ? '#fff' : '#94a3b8' }]}>Post</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <FollowListModal
        isVisible={followModalState.isVisible}
        onClose={() => setFollowModalState(prev => ({ ...prev, isVisible: false }))}
        userId={typeof id === 'string' ? id : ''}
        type={followModalState.type}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  eliteBadge: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
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
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 36,
    marginTop: -32,
    marginBottom: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    marginLeft: 20,
    alignSelf: 'center',
    marginBottom: 12
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
  feedContainer: {
    marginTop: 0,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  postUserName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  postTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  postContent: {
    fontSize: 15,
    color: '#334155',
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Inter_500Medium',
  },
  sideHandleTrigger: {
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
  },
  slidingDrawer: {
    position: 'absolute',
    top: 168,
    bottom: 0,
    right: 0,
    width: '90%',
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 9999,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  drawerDragHandle: {
    position: 'absolute',
    left: 6,
    top: '45%',
    width: 4,
    height: 40,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
  },
  drawerTitleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    marginBottom: 4,
  },
  widgetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  widgetSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  streakDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  streakDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '800',
  },
  badgeItem: {
    alignItems: 'center',
    width: 70,
  },
  badgeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  calendarMonthPill: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minWidth: 105,
    alignItems: 'center',
  },
  calendarMonthTxt: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weekLabel: {
    width: '13%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  commentsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentsSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '75%',
  },
  commentsHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commentsDragHandle: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#cbd5e1',
    marginBottom: 8,
  },
  commentsTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  commentUser: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#0f172a',
  },
  commentText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    lineHeight: 18,
  },
  commentTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  commentInputField: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 100,
  },
  commentPostBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentPostBtnTxt: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});
