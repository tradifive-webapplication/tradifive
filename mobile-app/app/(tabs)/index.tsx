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
  DeviceEventEmitter,
  RefreshControl,
  Switch,
  PanResponder,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Share,
  FlatList
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import React, { useState, useRef, useEffect } from 'react';

// Safe Cross-Platform Svg Wrapper to prevent any Expo Web or Native compilation crashes!
const WebSvg = ({ children, ...props }: any) => <svg {...props}>{children}</svg>;
const WebPath = (props: any) => <path {...props} />;
const WebCircle = (props: any) => <circle {...props} />;
const WebDefs = ({ children }: any) => <defs>{children}</defs>;
const WebLinearGradient = ({ children, ...props }: any) => <linearGradient {...props}>{children}</linearGradient>;
const WebStop = (props: any) => <stop {...props} />;

const SafeSvg = Platform.OS === 'web' ? WebSvg : (Svg || View);
const SafePath = Platform.OS === 'web' ? WebPath : (Path || View);
const SafeCircle = Platform.OS === 'web' ? WebCircle : (Circle || View);
const SafeDefs = Platform.OS === 'web' ? WebDefs : (Defs || View);
const SafeLinearGradient = Platform.OS === 'web' ? WebLinearGradient : (LinearGradient || View);
const SafeStop = Platform.OS === 'web' ? WebStop : (Stop || View);
import { useRouter, useGlobalSearchParams, useNavigation } from 'expo-router';
import { ImageViewerModal } from '../../components/ImageViewerModal';
import {
  Search,
  LayoutGrid,
  Home,
  Users,
  Menu,
  Bot,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  BookOpen,
  Trophy,
  Gift,
  Cpu,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  Zap,
  Plus,
  ArrowUpDown,
  SlidersHorizontal,
  MessageCircle,
  MessageCircleMore,
  Check,
  MoreHorizontal,
  MoreVertical,
  MapPin,
  Diamond,
  Bookmark,
  Repeat,
  Send,
  Heart,
  Share2,
  Info,
  Flame,
  BarChart2,
  ShieldAlert,
  TrendingDown,
  Activity,
  Target,
  BrainCircuit,
  Brain,
  Focus,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Pin,
  Play,
  Video,
  Camera,
  Clock,
  Globe,
  Calendar,
  Image as ImageIcon,
  Undo2,
  Redo2,
  CircleSlash,
  Quote,
  Circle as CircleIcon,
  PlusCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useStore } from '../store';
import { getAvatarUrl } from '../utils/avatar';
import { useAppTheme } from '../../hooks/useAppTheme';
import ComingSoonVeil from '../../components/ComingSoonVeil';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useChannelData } from '../../hooks/useChannelData';
import { useInboxData } from '../../hooks/useInboxData';
import { Heart as IconlyHeart, Chat as IconlyChat, Send as IcolySend, Bookmark as IconlyBookmark, Notification as Bell, Image as IconlyImage, Camera as IconlyCamera, Video as IconlyVideo, Document as IconlyDocument, Plus as IconlyPlus, Hide as IconlyHide, PaperPlus as IconlyPaperPlus } from '../../components/Iconly';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  { label: 'Rewards', icon: Gift, hasChevron: false },
  { label: 'Channels', icon: Users, hasChevron: true, subItems: ['Channels', 'Messages'] },
  { label: 'Learning', icon: BookOpen, hasChevron: true, subItems: ['Courses', 'Webinars'] },
  { label: 'Contests', icon: Trophy, hasChevron: true, subItems: ['Contests', 'Profile', 'Leaderboard'] },
  { label: 'Finance', icon: CreditCard, hasChevron: true, subItems: ['Wallet', 'Deposit'] },
  { label: 'Marketplace', icon: ShoppingBag, hasChevron: true, subItems: ['Indicators', 'EAs'] },
];

const INITIAL_COMMENTS_MAP: Record<string, PostComment[]> = {};

interface CommentReply {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  isLiked: boolean;
}

interface PostComment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replies: CommentReply[];
}



const CURATED_FEED_POSTS = [
  {
    id: 'bfa1c52f-0ebc-4061-8171-b531db199bc6',
    user_id: '20567383-2957-4b9c-88b2-4f5ade623bef',
    content: "Tradifive's First Fialgo v1 \nwhich generates daily 2-5% 🫡",
    media_url: "https://rylwyxhupwpwsdbvuoej.supabase.co/storage/v1/object/public/attachments/20567383-2957-4b9c-88b2-4f5ade623bef/xisz570ylo_1792845161312.png",
    media_urls: ["https://rylwyxhupwpwsdbvuoej.supabase.co/storage/v1/object/public/attachments/20567383-2957-4b9c-88b2-4f5ade623bef/xisz570ylo_1792845161312.png"],
    media_type: 'image',
    post_type: 'text',
    likes_count: 24,
    comments_count: 6,
    shares_count: 3,
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    profiles: {
      id: '20567383-2957-4b9c-88b2-4f5ade623bef',
      display_name: 'Nikhil Harake',
      first_name: 'Nikhil',
      last_name: 'Harake',
      username: 'nik_trader',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIh2WGq5YRLuKCW0lnIeJQU2thO2Bq4mxOCQCj6Szsqxy-ZTGU=s96-c',
    }
  },
  {
    id: 'eca1a358-4087-49a3-a152-404f13cc7cec',
    user_id: '20567383-2957-4b9c-88b2-4f5ade623bef',
    content: "Its me",
    media_url: "https://rylwyxhupwpwsdbvuoej.supabase.co/storage/v1/object/public/attachments/20567383-2957-4b9c-88b2-4f5ade623bef/cditiakhum_1792845206181.jpeg",
    media_urls: ["https://rylwyxhupwpwsdbvuoej.supabase.co/storage/v1/object/public/attachments/20567383-2957-4b9c-88b2-4f5ade623bef/cditiakhum_1792845206181.jpeg"],
    media_type: 'image',
    post_type: 'text',
    likes_count: 32,
    comments_count: 9,
    shares_count: 4,
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    profiles: {
      id: '20567383-2957-4b9c-88b2-4f5ade623bef',
      display_name: 'Nikhil Harake',
      first_name: 'Nikhil',
      last_name: 'Harake',
      username: 'nik_trader',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIh2WGq5YRLuKCW0lnIeJQU2thO2Bq4mxOCQCj6Szsqxy-ZTGU=s96-c',
    }
  },
  {
    id: 'curated-fialgo-01',
    user_id: 'tradifive-official-sys',
    content: "🚀 FIALGO MT5 Continuous Bridge Status: 14ms latency verified. Target return 2.0% - 5.0% active with automated Risk Guard cap at 4.5% max drawdown.\n\nAll MT5 connected accounts running on optimal settings for the session! 📊⚡",
    media_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
    media_urls: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop"],
    media_type: 'image',
    post_type: 'text',
    likes_count: 58,
    comments_count: 17,
    shares_count: 11,
    created_at: new Date(Date.now() - 3600 * 1000 * 9).toISOString(),
    profiles: {
      id: 'tradifive-official-sys',
      display_name: 'TradiFive Algo Desk',
      first_name: 'TradiFive',
      last_name: 'Algo',
      username: 'tradifive',
      avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    }
  },
  {
    id: 'curated-fialgo-02',
    user_id: 'elena-fx-trader',
    content: "Gold ($XAUUSD) 15-minute liquidity grab closed with +62 pips profit on the Fialgo breakout strategy. Risk reward ratio 1:3.2 executed cleanly without slippage. Always stick to your risk management! 📈🔥",
    media_url: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop",
    media_urls: ["https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop"],
    media_type: 'image',
    post_type: 'text',
    likes_count: 41,
    comments_count: 11,
    shares_count: 6,
    created_at: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    profiles: {
      id: 'elena-fx-trader',
      display_name: 'Elena FX',
      first_name: 'Elena',
      last_name: 'Rostova',
      username: 'elena_fx',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    }
  }
];

const HomePostCard = ({
  post,
  isActive,
  anyCardActive,
  onActive,
  onInactive,
  activePostMenu,
  setActivePostMenu,
  onGestureMove,
  onGestureRelease,
  onLike,
  onComment,
  onShare,
  onImagePress
}: {
  post: any;
  isActive: boolean;
  anyCardActive: boolean;
  onActive: (x: number, y: number) => void;
  onInactive: () => void;
  activePostMenu: string | null;
  setActivePostMenu: (id: string | null) => void;
  onGestureMove: (x: number, y: number) => void;
  onGestureRelease: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onImagePress?: (postId: string) => void;
}) => {
  const { isDark, theme } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const likeScale = useRef(new Animated.Value(1)).current;
  const commentScale = useRef(new Animated.Value(1)).current;
  const shareScale = useRef(new Animated.Value(1)).current;
  const bigHeartScale = useRef(new Animated.Value(0)).current;
  const bigHeartOpacity = useRef(new Animated.Value(0)).current;

  const triggerSpring = (animatedVal: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animatedVal, {
        toValue: 0.82,
        duration: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(animatedVal, {
        toValue: 1.0,
        friction: 3,
        tension: 160,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  };

  const handleLikePress = () => {
    triggerSpring(likeScale);
    
    if (!post.isLiked) {
      bigHeartScale.setValue(0);
      bigHeartOpacity.setValue(1);
      
      Animated.parallel([
        Animated.spring(bigHeartScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bigHeartOpacity, {
          toValue: 0,
          duration: 800,
          delay: 400,
          useNativeDriver: true,
        })
      ]).start();
    }

    if (onLike) onLike();
  };

  const handleCommentPress = () => {
    triggerSpring(commentScale);
    if (onComment) onComment();
  };

  const handleSharePress = () => {
    triggerSpring(shareScale);
    if (onShare) onShare();
  };

  const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const mediaUrl = post.media_url || post.image;
  const isVideo = post.post_type === 'video' || post.media_type === 'video';

  return (
    <View style={{ marginBottom: 12, marginHorizontal: 8 }}>
      <View
        style={{
          backgroundColor: isDark ? '#14171f' : '#ffffff',
          borderRadius: 24,
          padding: 16,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.35 : 0.06,
          shadowRadius: 14,
          elevation: 3,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}
            activeOpacity={0.7}
            onPress={() => {
              if (post.user_id) {
                require('expo-router').router.push(`/user/${post.user_id}`);
              }
            }}
          >
            <Image
              source={post.avatar ? { uri: post.avatar } : require('../../assets/images/avatar.png')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                marginRight: 12,
                backgroundColor: isDark ? '#1e2433' : '#f1f5f9',
                borderWidth: 1.5,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
              }}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontFamily: 'Inter_700Bold',
                  }}
                  numberOfLines={1}
                >
                  {post.user}
                </Text>
              </View>
              <Text style={{ fontSize: 12.5, color: '#64748b', fontFamily: 'Inter_500Medium', marginTop: 2 }}>
                {post.handle} · {post.time}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              h();
              setActivePostMenu(activePostMenu === post.id ? null : post.id);
            }}
            style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9' }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Text Content */}
        {post.content ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 15, color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'Inter_400Regular', lineHeight: 22 }}>
              {post.content && post.content.length > 200 && !isExpanded
                ? `${post.content.substring(0, 200)}...`
                : post.content}
            </Text>
            {post.content && post.content.length > 200 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={{ marginTop: 6 }}>
                <Text style={{ color: isExpanded ? '#94a3b8' : '#38bdf8', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
                  {isExpanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        

        {/* Media */}
        {mediaUrl ? (
          <View style={{ marginBottom: 14 }}>
            {isVideo ? (
              Platform.OS === 'web' ? (
                <video
                  src={mediaUrl}
                  controls
                  style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 18, backgroundColor: '#090d16' }}
                />
              ) : (
                <TouchableOpacity onPress={() => onImagePress && onImagePress(post.id)} activeOpacity={0.9}>
                  <View style={{ width: '100%', height: 260, backgroundColor: '#0a0f1e', borderRadius: 18, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <View style={{
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Play size={26} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 10 }}>Tap to play video</Text>
                  </View>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                activeOpacity={0.94}
                onPress={() => onImagePress && onImagePress(post.id)}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: isDark ? '#080a10' : '#f8fafc',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={{ uri: mediaUrl }}
                  style={{ width: '100%', height: 340 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}

            {/* Big Heart Overlay */}
            <Animated.View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: bigHeartOpacity,
              transform: [{ scale: bigHeartScale }],
              pointerEvents: 'none',
              zIndex: 10,
            }}>
              <Heart size={90} color="#ef4444" fill="#ef4444" />
            </Animated.View>
          </View>
        ) : null}

        {/* Location if present */}
        {post.location ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <MapPin size={14} color="#64748b" />
            <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_400Regular' }}>{post.location}</Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9', marginBottom: 14 }} />

        {/* Action Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            {/* Like */}
            <TouchableOpacity
              onPress={handleLikePress}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <IconlyHeart size={20} color={post.isLiked ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b')} set={post.isLiked ? 'bold' : 'curved'} stroke="bold" />
              </Animated.View>
              <Text style={{ fontSize: 13, color: post.isLiked ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b'), fontFamily: 'Inter_600SemiBold' }}>{post.likes}</Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity
              onPress={handleCommentPress}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: commentScale }] }}>
                <IconlyChat size={20} color={isDark ? '#94a3b8' : '#64748b'} set="curved" stroke="bold" />
              </Animated.View>
              <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'Inter_600SemiBold' }}>{post.comments}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              onPress={handleSharePress}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: shareScale }] }}>
                <IcolySend size={18} color={isDark ? '#94a3b8' : '#64748b'} set="curved" stroke="bold" />
              </Animated.View>
              {post.shares && post.shares !== '0' ? (
                <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'Inter_600SemiBold' }}>{post.shares}</Text>
              ) : null}
            </TouchableOpacity>
          </View>

          {/* Bookmark */}
          <TouchableOpacity
            onPress={() => {
              h();
              setIsBookmarked(prev => !prev);
            }}
            style={{ paddingVertical: 4 }}
            activeOpacity={0.7}
          >
            <IconlyBookmark size={20} color={isBookmarked ? '#f59e0b' : (isDark ? '#94a3b8' : '#64748b')} set={isBookmarked ? 'bold' : 'curved'} stroke="bold" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { isDark, theme } = useAppTheme();
  
  const { feeds, loading: feedsLoading, refetch: refetchFeeds } = useSocialFeed();
  const { recentTrades, balance: dashboardBalance, winRate } = useDashboardData();
  const { channels, loading: channelsLoading } = useChannelData();
  const { conversations: messages, loading: messagesLoading } = useInboxData();

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
    // Shared Custom Overrides
    if (shadowed.filterPillActive) { shadowed.filterPillActive.backgroundColor = theme.text; shadowed.filterPillActive.borderColor = theme.text; }
    if (shadowed.catPillActive) { shadowed.catPillActive.backgroundColor = theme.text; shadowed.catPillActive.borderColor = theme.text; }
    if (shadowed.filterPillTxtActive) shadowed.filterPillTxtActive.color = theme.background;
    if (shadowed.catPillTxtActive) shadowed.catPillTxtActive.color = theme.background;
    if (shadowed.unreadTxt) shadowed.unreadTxt.color = theme.background;
    return shadowed;
  }, [isDark, theme]);
  
  const styles = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      if (!(globalStyles as any)[key]) continue;
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
    return shadowed;
  }, [isDark, theme]);

  const { view } = useGlobalSearchParams();
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyleState(style);
    });
    return () => listener.remove();
  }, []);

  /* ─── tabs ─── */
  type Tab = 'feed' | 'dashboard' | 'community' | 'contests';
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  type FeedSubTab = 'for_you' | 'following';
  const [feedSubTab, setFeedSubTab] = useState<FeedSubTab>('for_you');

  const mt5Account = useStore(state => state.mt5Account);
  const trades = useStore(state => state.trades);
  const notifications = useStore(state => state.notifications);
  const currentUser = useStore(state => state.currentUser);

  const balance = mt5Account?.balance || 0;
  const equity = mt5Account?.equity || 0;
  const margin = mt5Account?.margin || 0;
  const profit = equity - balance;

  const formatMoney = (val: number) => {
    return `$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const profitPrefix = profit >= 0 ? '+' : '-';
  const profitColor = profit >= 0 ? '#10b981' : '#ef4444';

  type CommView = 'messages' | 'channels';
  const [commView, setCommView] = useState<CommView>('messages');

  // Real-time post creation state & actions
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [visibilityModalVisible, setVisibilityModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
  const [createPostType, setCreatePostType] = useState<'twit' | 'image' | 'video'>('twit');
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [selectedMediaMime, setSelectedMediaMime] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const createPostAction = useStore(state => state.createPost);
  const locationPermissionEnabled = useStore(state => state.locationPermissionEnabled);

  // Interaction tracking state (likes, comments, shares offsets)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    'h1': true,
  });
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
  
  // Media Viewer State
  const [activeViewerPostId, setActiveViewerPostId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Tab Bar Visibility based on ImageViewerModal
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Hide global custom floating tab bar in _layout
    router.setParams({ mediaViewerOpen: !!activeViewerPostId ? 'true' : 'false' });
  }, [activeViewerPostId, router]);

  // ---------------------------------------------------------------------------

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

  const customMediaScale = translateY.interpolate({
    inputRange: [SNAP_POINTS.MID, SNAP_POINTS.CLOSE],
    outputRange: [0.75, 1],
    extrapolate: 'clamp'
  });

  const customMediaShift = translateY.interpolate({
    inputRange: [SNAP_POINTS.MID, SNAP_POINTS.CLOSE],
    outputRange: [-SCREEN_HEIGHT * 0.15, 0],
    extrapolate: 'clamp'
  });

  const backdropOpacity = translateY.interpolate({
    inputRange: [SNAP_POINTS.MID, SNAP_POINTS.CLOSE],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
        Keyboard.dismiss();
      },
      onPanResponderMove: (_, gestureState) => {
        let nextY = lastTranslateY.current + gestureState.dy;

        // Clamp with tension when pulling above full screen
        if (nextY < SNAP_POINTS.FULL) {
          nextY = SNAP_POINTS.FULL + (gestureState.dy * 0.2);
        }

        translateY.setValue(nextY);

        // Haptic feedback thresholds
        const thresholdFull = (SNAP_POINTS.MID + SNAP_POINTS.FULL) / 2;
        const thresholdClose = (SNAP_POINTS.MID + SNAP_POINTS.CLOSE) / 2;

        if (nextY < thresholdFull) {
          if (!crossedMidToFull.current) {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            crossedMidToFull.current = true;
          }
        } else {
          crossedMidToFull.current = false;
        }

        if (nextY > thresholdClose) {
          if (!crossedMidToClose.current) {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            crossedMidToClose.current = true;
          }
        } else {
          crossedMidToClose.current = false;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = lastTranslateY.current + gestureState.dy;
        const dragVelocity = gestureState.vy;

        let targetY = SNAP_POINTS.MID;

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
          tension: 65,
          friction: 11
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
        tension: 65,
        friction: 11
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
        tension: 65,
        friction: 11
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
          const updatedReplies = c.replies.map(r => {
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

  const handleLikePost = (postId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const isCurrentlyLiked = likedPosts[postId] ?? feedPostsToRender.find(p => p.id === postId)?.isLiked ?? false;
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
    const postItem = feedPostsToRender.find(p => p.id === postId);
    if (postItem) {
      setActiveCommentPost(postItem);
    }
  };

  const handleSharePost = (postId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const post = feedPostsToRender.find(p => p.id === postId);
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

  const pickMedia = async (type: 'image' | 'video') => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setCreatePostType(type);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to your media library to upload photos and videos.');
        return;
      }

      const mediaOptions = type === 'image'
        ? ['images']
        : ['videos'];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaOptions as any,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedMediaUri(asset.uri);
        setSelectedMediaMime(asset.mimeType || (type === 'image' ? 'image/jpeg' : 'video/mp4'));
      }
    } catch (err: any) {
      console.log('Error picking media:', err);
      Alert.alert('Error', 'Failed to pick media: ' + err.message);
    }
  };

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

  const handleCreatePost = async () => {
    Keyboard.dismiss();
    if (!newPostContent.trim() && !selectedMediaUri) {
      if (Platform.OS === 'web') {
        window.alert('Please enter some content for your post.');
      } else {
        Alert.alert('Error', 'Please enter some content for your post.');
      }
      return;
    }

    setIsSubmittingPost(true);
    console.log('[handleCreatePost] Starting post creation...');
    console.log('[handleCreatePost] currentUser:', currentUser?.id, currentUser?.email);
    console.log('[handleCreatePost] content length:', newPostContent.trim().length);
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      let finalContent = newPostContent.trim();
      if (locationPermissionEnabled) {
        try {
          const controller = new AbortController();
          const fetchPromise = fetch('https://ipapi.co/json/', { signal: controller.signal });
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              controller.abort();
              reject(new Error('timeout'));
            }, 2000);
          });
          const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;
          if (res.ok) {
            const info = await res.json();
            if (info.city && info.region && info.country_name) {
              finalContent += `\n\n[LOC: ${info.city}, ${info.region}, ${info.country_name}]`;
            } else if (info.city && info.country_name) {
              finalContent += `\n\n[LOC: ${info.city}, ${info.country_name}]`;
            } else {
              finalContent += `\n\n[LOC: Mumbai, MH, India]`;
            }
          } else {
            finalContent += `\n\n[LOC: Mumbai, MH, India]`;
          }
        } catch (e) {
          finalContent += `\n\n[LOC: Mumbai, MH, India]`;
        }
      }

      let mediaUrl = undefined;
      let mediaType = undefined;

      if (createPostType !== 'twit' && selectedMediaUri) {
        const { supabase } = require('../utils/supabase');
        const { useStore } = require('../store');
        const currentUser = useStore.getState().currentUser;
        const userId = currentUser?.id || 'unknown';
        const fileExt = createPostType === 'image' ? 'jpg' : 'mp4';
        const contentType = createPostType === 'image' ? 'image/jpeg' : 'video/mp4';
        const fileName = `${userId}/post_${Date.now()}.${fileExt}`;

        try {
          const { decode } = require('base64-arraybuffer');
          const FileSystem = require('expo-file-system/legacy');

          console.log('[Post Media] Reading file as base64:', selectedMediaUri);
          const base64 = await FileSystem.readAsStringAsync(selectedMediaUri, {
            encoding: 'base64',
          });

          const arrayBuffer = decode(base64);
          console.log('[Post Media] Uploading to Supabase storage, path:', fileName, 'size:', arrayBuffer.byteLength);

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, arrayBuffer, { contentType, upsert: false });

          if (uploadError) {
            throw new Error(`Supabase error: ${uploadError.message}`);
          }

          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          mediaUrl = urlData.publicUrl;
          mediaType = createPostType;
          console.log('[Post Media] Uploaded successfully:', mediaUrl);
        } catch (err: any) {
          console.error('[Post Media Upload Error]:', err.message);
          throw new Error(`Media upload failed: ${err.message}`);
        }
      }


      console.log('[handleCreatePost] Calling createPostAction...');
      await createPostAction(
        finalContent,
        mediaUrl,
        mediaType
      );
      console.log('[handleCreatePost] Post created successfully!');
      setNewPostContent('');
      setNewPostMediaUrl('');
      setSelectedMediaUri(null);
      setSelectedMediaMime(null);
      setCreatePostType('twit');
      setCreatePostVisible(false);
    } catch (err: any) {
      console.error('[handleCreatePost] ERROR:', err.message, err);
      if (Platform.OS === 'web') {
        window.alert('Post Error: ' + (err.message || 'Failed to create post'));
      } else {
        Alert.alert('Error', err.message || 'Failed to create post');
      }
    } finally {
      setIsSubmittingPost(false);
    }
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

  const storePosts = useStore(state => state.posts);
  const storeLoading = useStore(state => state.loading);
  const fetchPosts = useStore(state => state.fetchPosts);
  const followingIds = useStore(state => state.followingIds);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Combine storePosts with feeds from useSocialFeed and CURATED_FEED_POSTS as reliable fallback
  const combinedPosts = React.useMemo(() => {
    const postMap = new Map<string, any>();

    // 1. First add real posts from Supabase store
    if (storePosts && storePosts.length > 0) {
      storePosts.forEach((p: any) => {
        if (p?.id) postMap.set(p.id, p);
      });
    }

    // 2. Merge with useSocialFeed
    if (feeds && feeds.length > 0) {
      feeds.forEach((f: any) => {
        if (f?.id && !postMap.has(f.id)) {
          postMap.set(f.id, {
            ...f,
            likes_count: f.likes_count ?? f.like_count ?? 0,
            comments_count: f.comments_count ?? f.comment_count ?? 0,
            shares_count: f.shares_count ?? f.share_count ?? 0,
            profiles: f.profiles ? {
              id: f.user_id,
              display_name: f.profiles.full_name || f.profiles.username || 'User',
              username: f.profiles.username,
              avatar_url: f.profiles.avatar_url,
            } : undefined
          });
        }
      });
    }

    // 3. If there are fewer than 5 total posts, supplement with curated posts so feed is never empty
    CURATED_FEED_POSTS.forEach((seedPost) => {
      if (!postMap.has(seedPost.id)) {
        postMap.set(seedPost.id, seedPost);
      }
    });

    const sorted = Array.from(postMap.values());
    sorted.sort((a: any, b: any) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });
    return sorted;
  }, [storePosts, feeds]);

  const mappedPosts = combinedPosts.map((p: any) => {
    let displayContent = p.content;
    let postLocation = '';
    if (p.content && p.content.includes('\n\n[LOC:')) {
      const parts = p.content.split('\n\n[LOC:');
      displayContent = parts[0];
      postLocation = parts[1].split(']')[0];
    }

    const isLiked = likedPosts[p.id] ?? p.is_liked ?? false;
    const rawLikes = p.likes_count ?? p.like_count ?? 0;
    const rawComments = p.comments_count ?? p.comment_count ?? 0;
    const rawShares = p.shares_count ?? p.share_count ?? 0;
    const finalLikes = Math.max(0, rawLikes + (likesOffset[p.id] ?? 0));
    const finalComments = Math.max(0, rawComments + (commentsOffset[p.id] ?? 0));
    const finalShares = Math.max(0, rawShares + (sharesOffset[p.id] ?? 0));
    let rawUrls = p.media_urls;
    if (typeof rawUrls === 'string') {
      try { rawUrls = JSON.parse(rawUrls); } catch (e) { rawUrls = [rawUrls]; }
    }
    let mediaResolved = p.media_url || (Array.isArray(rawUrls) && rawUrls[0]) || p.image || null;
    if (typeof mediaResolved === 'string' && (mediaResolved.startsWith('[') || mediaResolved.startsWith('{'))) {
      try {
        const parsed = JSON.parse(mediaResolved);
        mediaResolved = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch (e) {}
    }
    if (typeof mediaResolved === 'string' && !mediaResolved.startsWith('http') && !mediaResolved.startsWith('file:') && !mediaResolved.startsWith('data:')) {
      mediaResolved = null;
    }

    return {
      id: p.id,
      user_id: p.user_id,
      user: p.profiles?.display_name || (p.profiles?.first_name ? `${p.profiles.first_name} ${p.profiles.last_name || ''}`.trim() : null) || p.profiles?.full_name || p.profiles?.username || 'Trader',
      handle: p.profiles?.username ? `@${p.profiles.username}` : (p.profiles?.display_name ? `@${p.profiles.display_name.toLowerCase().replace(/\s+/g, '_')}` : '@trader'),
      avatar: getAvatarUrl(p.profiles?.avatar_url, p.profiles?.email, p.profiles?.username || p.profiles?.display_name || p.profiles?.first_name),
      time: getPostTimeStr(p.created_at || new Date().toISOString()),
      content: displayContent,
      location: postLocation || undefined,
      image: mediaResolved,
      media_url: mediaResolved,
      media_urls: p.media_urls || (mediaResolved ? [mediaResolved] : []),
      likes: formatCount(finalLikes),
      comments: formatCount(finalComments),
      shares: formatCount(finalShares),
      isLiked,
      media_type: p.media_type || (p as any).post_type,
      post_type: (p as any).post_type,
    };
  });

  const feedPostsToRender = mappedPosts;

  const displayedPosts = React.useMemo(() => {
    if (feedSubTab === 'following') {
      const filtered = feedPostsToRender.filter((p: any) => followingIds.includes(p.user_id));
      return filtered;
    }
    return feedPostsToRender;
  }, [feedSubTab, feedPostsToRender, followingIds]);

  type ContestView = 'contests' | 'profile' | 'leaderboard';
  const [contestView, setContestView] = useState<ContestView>('contests');

  type DashboardTab = 'Overview' | 'Performance' | 'Execution' | 'Analytics';
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('Overview');
  const toggleAlgoStatus = useStore(state => state.toggleAlgoStatus);
  const isAlgoRunning = useStore(state => state.mt5Account?.algo_status ?? true);
  const emergencyStop = !isAlgoRunning;

  // --- Pinterest long-press drag states ---
  const [touchCoords, setTouchCoords] = useState<{ x: number, y: number } | null>(null);
  const touchCoordsRef = useRef<{ x: number, y: number } | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const selectedActionRef = useRef<string>('');

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
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: ['#1c1c1e', '#1c1c1e', '#ffffff', '#ffffff'],
  });
  const shareBgColor = shareFactorAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: ['#1c1c1e', '#1c1c1e', '#ffffff', '#ffffff'],
  });
  const analyseBgColor = analyseFactorAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
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

  touchCoordsRef.current = touchCoords;
  selectedActionRef.current = selectedAction;

  // Proximity factors (0 = far, 1 = touching) for smooth color/scale interpolation
  const [saveFactor, setSaveFactor] = useState(0);
  const [shareFactor, setShareFactor] = useState(0);
  const [analyseFactor, setAnalyseFactor] = useState(0);

  const handleCardActive = (id: string, x: number, y: number) => {
    setActiveCardId(id);
    setTouchCoords({ x, y });
    router.setParams({ cardActive: 'true' });
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
    router.setParams({ cardActive: 'false' });
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

    const isLeftTouch = coords.x < SCREEN_WIDTH / 2;

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

  /* opacities */
  const dashOp = useRef(new Animated.Value(0)).current;
  const commOp = useRef(new Animated.Value(0)).current;
  const contOp = useRef(new Animated.Value(0)).current;
  const feedOp = useRef(new Animated.Value(1)).current;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    h(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPosts(),
        refetchFeeds ? refetchFeeds() : Promise.resolve(),
      ]);
    } catch (e) {
      console.warn('Error refreshing feed:', e);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPosts, refetchFeeds]);

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 64;

  // Native DiffClamp for butter-smooth directional reveal
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [140, 180],
    outputRange: [0, 1], // Smoothly fades in over 40px
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      DeviceEventEmitter.emit('scrollUpdate', value);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const switchTab = (tab: Tab) => {
    hSelect();
    setActiveTab(tab);
    if (tab === 'community' || tab === 'contests') {
      setLastMainTab(tab as 'community' | 'contests');
    }
    if (tab === 'dashboard' || tab === 'feed') {
      closeDropdown();
    }

    // Instant switch as requested
    dashOp.setValue(tab === 'dashboard' ? 1 : 0);
    commOp.setValue(tab === 'community' ? 1 : 0);
    contOp.setValue(tab === 'contests' ? 1 : 0);
    feedOp.setValue(tab === 'feed' ? 1 : 0);
  };

  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeNavItem, setActiveNavItem] = useState({ label: 'Channels', icon: Users });
  const [lastMainTab, setLastMainTab] = useState<Tab>('community');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('All');

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
      // If on Dashboard, decide where to go based on the view type
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

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('switchHomeTab', (tab: Tab) => {
      switchTab(tab);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (view === 'community' || view === 'messages') {
      switchTab('community');
      setCommView('messages');
    } else if (view === 'contests') {
      switchTab('contests');
      setContestView('contests');
    } else if (view === 'dashboard') {
      switchTab('dashboard');
    } else {
      switchTab('feed');
    }
  }, [view]);

  const [contestTab, setContestTab] = useState<'Upcoming' | 'In Progress' | 'Finished'>('Upcoming');

  /* messages filter */
  const [msgTab, setMsgTab] = useState<'All' | 'Unread' | 'Favourites'>('All');
  const filtered = msgTab === 'Unread' ? messages.filter((m: any) => m.unread > 0) : messages;

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

  const headerTitle = commView === 'channels' ? 'Channels' : 'Messages';
  /* dropdown top = status bar height + inset + header content height */
  const dropdownTop = insets.top + 24 + 40 + 8; // top padding + marginTop + logo height + gap

  return (
    /* Root must NOT clip overflow so dropdown can escape header */
    <View style={{ flex: 1, backgroundColor: activeCardId ? '#090d16' : 'transparent' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top Backside Glow / Artwork Image */}
      <Image
        source={require('../../assets/images/top-glow.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: insets.top + 170,
          zIndex: 0,
          opacity: headerStyle === 'simple' ? 0 : 0.95,
        }}
        resizeMode="stretch"
        pointerEvents="none"
      />

      {/* ── HEADER ── */}
      {(activeTab === 'dashboard' || activeTab === 'feed' || activeTab === 'community' || activeTab === 'contests') && (
        <Animated.View style={[
          styles.header,
          {
            zIndex: 10,
            opacity: activeCardId ? 0.15 : 1,
            height: headerStyle === 'simple' ? insets.top + 74 : insets.top + 104,
            backgroundColor: headerStyle === 'simple' ? (activeCardId ? (isDark ? '#000' : '#090d16') : (isDark ? theme.background : '#ffffff')) : 'transparent',
            borderBottomWidth: headerStyle === 'simple' && !isDark ? 1 : 0,
            borderBottomColor: isDark ? theme.cardBorder : '#e2e8f0',
            position: 'relative',
            transform: headerStyle === 'simple' ? [] : [{
              scale: scrollY.interpolate({
                inputRange: [0, 80],
                outputRange: [1, 0.85],
                extrapolate: 'clamp'
              })
            }, {
              translateY: scrollY.interpolate({
                inputRange: [0, 80],
                outputRange: [0, -60],
                extrapolate: 'clamp'
              })
            }]
          }
        ]}>
          {headerStyle !== 'simple' && (
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
          )}

          {/* Static Header Row — sitting cleanly right above the white card */}
          <Animated.View style={{
            position: 'absolute',
            bottom: headerStyle === 'simple' ? 16 : 38,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            opacity: headerStyle === 'simple' ? 1 : Animated.multiply(
              aiHeaderFade,
              scrollY.interpolate({
                inputRange: [0, 140],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              })
            )
          }}>
            {activeTab === 'community' ? (
              <TouchableOpacity
                onPress={dropdownOpen ? closeDropdown : openDropdown}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Text style={{ color: headerStyle === 'simple' ? '#000000' : '#fff', fontSize: 22, fontFamily: 'Inter_600SemiBold' }}>{headerTitle}</Text>
                {dropdownOpen
                  ? <ChevronUp size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
                  : <ChevronDown size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />}
              </TouchableOpacity>
            ) : activeTab === 'contests' ? (
              <TouchableOpacity
                onPress={dropdownOpen ? closeDropdown : openDropdown}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Text style={{ color: headerStyle === 'simple' ? '#000000' : '#fff', fontSize: 22, fontFamily: 'Inter_600SemiBold' }}>
                  {contestView === 'contests' ? 'Contests' : contestView === 'profile' ? 'Profile' : 'Leaderboard'}
                </Text>
                {dropdownOpen
                  ? <ChevronUp size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />
                  : <ChevronDown size={18} color={headerStyle === 'simple' ? '#000000' : '#fff'} />}
              </TouchableOpacity>
            ) : (
              <Text style={{ color: headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>
                {activeTab === 'dashboard' ? 'Dashboard' : 'Home'}
              </Text>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : 'white'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.setParams({ openProfile: 'true' })}
                style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: headerStyle === 'simple' ? (isDark ? theme.cardBorder : 'rgba(0,0,0,0.1)') : 'rgba(255,255,255,0.2)', overflow: 'hidden' }}
              >
                <Image source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}

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
          opacity: headerOpacity,
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
              {activeTab === 'dashboard' ? 'Dashboard' :
                activeTab === 'feed' ? 'Home' :
                  activeTab === 'community' ? (commView === 'channels' ? 'Channels' : 'Messages') :
                    (contestView === 'contests' ? 'Contests' : contestView === 'profile' ? 'Profile' : 'Leaderboard')}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.setParams({ openProfile: 'true' })}
                style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <Image source={currentUser?.avatar_url ? { uri: currentUser.avatar_url } : require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
      {/* ── WHITE CONTENT CARD ── */}
      <Animated.View style={[
        styles.card,
        {
          marginTop: headerStyle === 'simple' ? 0 : (activeTab === 'dashboard' || activeTab === 'feed'
            ? scrollY.interpolate({
                inputRange: [0, 150],
                outputRange: [-34, -184],
                extrapolate: 'clamp',
              })
            : insets.top + 80),
          borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
          borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
          backgroundColor: activeCardId ? '#090d16' : (isDark ? theme.background : (activeTab === 'feed' ? '#f8fafc' : '#fff')),
        }
      ]}>
        {activeTab === 'dashboard' && (
          <View style={{ flex: 1, width: '100%', position: 'relative' }}>
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 140, paddingTop: 24 }}
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
            <Animated.View pointerEvents="none" style={{
              flex: 1,
              transform: headerStyle === 'simple' ? [] : [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, 150],
                  extrapolate: 'clamp',
                }),
              }],
            }}>
              {/* ── IMAGE DASHBOARD REPLICATION ── */}

              {/* Total Equity Card */}
              <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                <View style={{
                  backgroundColor: isDark ? '#111111' : '#fff',
                  borderRadius: 32,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: isDark ? '#222222' : '#f1f5f9',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.05,
                  shadowRadius: 20,
                  elevation: 5
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold' }}>Total Equity</Text>
                    <View style={{ backgroundColor: profit >= 0 ? '#eefcf6' : '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14, color: profitColor, fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] }}>
                        {balance > 0 ? `${profitPrefix}${Math.abs((profit / balance) * 100).toFixed(1)}%` : '+0.0%'}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 34, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', marginBottom: 12, fontVariant: ['tabular-nums'] }}>{formatMoney(equity)}</Text>

                  <View style={{ height: 1, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', marginBottom: 12 }} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Balance</Text>
                      <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] }}>{formatMoney(balance)}</Text>
                    </View>
                    <View style={{ width: 1, height: '100%', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9' }} />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Margin</Text>
                      <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] }}>{formatMoney(margin)}</Text>
                    </View>
                    <View style={{ width: 1, height: '100%', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9' }} />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Profit</Text>
                      <Text style={{ fontSize: 16, color: profitColor, fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] }}>{profitPrefix}{formatMoney(profit)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Tabs & MT5 Badge Rebuilt (No ScrollView) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }}>
                {/* Segmented Control Tabs */}
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 30, padding: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                  {['Overview', 'Performance', 'Execution'].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => {
                        hSelect();
                        setActiveDashboardTab(tab as DashboardTab);
                      }}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: activeDashboardTab === tab ? '#fff' : 'transparent',
                        borderRadius: 26,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: activeDashboardTab === tab ? 0.1 : 0,
                        shadowRadius: 2,
                        elevation: activeDashboardTab === tab ? 1 : 0,
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: activeDashboardTab === tab ? '#0f172a' : '#64748b',
                        fontFamily: activeDashboardTab === tab ? 'Inter_700Bold' : 'Inter_600SemiBold'
                      }}>{tab}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* MT5 Connected Badge */}
                <TouchableOpacity onPress={() => router.push('/broker-connect')} style={{ backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 30, padding: 4, marginLeft: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? (mt5Account ? '#042f1a' : '#4c0519') : (mt5Account ? '#eefcf6' : '#fee2e2'), paddingHorizontal: 12, paddingVertical: 10, borderRadius: 26 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: mt5Account ? '#10b981' : '#ef4444', marginRight: 6 }} />
                    <Text style={{ fontSize: 14, color: mt5Account ? '#10b981' : '#ef4444', fontFamily: 'Inter_700Bold' }}>MT5</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {activeDashboardTab === 'Overview' && (
                <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                  {/* Live Risk Monitor Card */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: mt5Account ? '#10b981' : '#ef4444' }} />
                        <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Live Risk Monitor</Text>
                      </View>
                    </View>

                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>
                        {mt5Account ? 'No active risk data available.' : 'Connect MT5 to view live risk.'}
                      </Text>
                    </View>

                    {/* Tactical Alerts */}
                    <View style={{ borderTopWidth: 1, borderTopColor: isDark ? '#222222' : '#f1f5f9', paddingTop: 16, marginTop: 16 }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: emergencyStop ? '#ef4444' : (isDark ? '#111111' : '#ffffff'),
                        padding: 12,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: emergencyStop ? '#ef4444' : (isDark ? '#222222' : '#f1f5f9')
                      }}>
                        <View>
                          <Text style={{ fontSize: 16, color: emergencyStop ? '#fff' : '#0f172a', fontFamily: 'Inter_700Bold' }}>Emergency Stop</Text>
                          <Text style={{ fontSize: 13, color: emergencyStop ? '#fecaca' : '#64748b', fontFamily: 'Inter_500Medium', marginTop: 1 }}>Kill all active trades</Text>
                        </View>
                        <Switch
                          value={emergencyStop}
                          onValueChange={async (value) => {
                            if (value) alert('EMERGENCY STOP ACTIVATED! Automations paused.');
                            await toggleAlgoStatus(!value);
                          }}
                          trackColor={{ false: isDark ? '#3f3f46' : '#e2e8f0', true: '#fff' }}
                          thumbColor={emergencyStop ? '#ef4444' : '#fff'}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Journal Preview */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 10, marginTop: 10 }}>
                    <View style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Journal Preview</Text>
                    </View>

                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No journal entries yet.</Text>
                    </View>

                    {/* Open Full Journal */}
                    <TouchableOpacity style={{ marginTop: 15, paddingVertical: 10, alignItems: 'center', backgroundColor: isDark ? '#111111' : '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}>
                      <Text style={{ fontSize: 14, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold' }}>View Full Journal</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Alert Center */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>Alert Center</Text>
                        <View style={{ backgroundColor: isDark ? '#4c0519' : '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 6 }}>
                          <Text style={{ fontSize: 11, color: '#ef4444', fontFamily: 'Inter_700Bold' }}>{notifications.filter((n: any) => !n.is_read).length}</Text>
                        </View>
                      </View>
                      <TouchableOpacity>
                        <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_600SemiBold' }}>View All &gt;</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ gap: 10 }}>
                      {notifications.slice(0, 4).map((alert: any, idx) => {
                        let icon = '⚡';
                        let bg = '#fef3c7';
                        let color = '#f59e0b';
                        if (alert.type === 'SECURITY') { icon = '🛡️'; bg = isDark ? '#1f2937' : '#f3f4f6'; color = '#4b5563'; }
                        if (alert.type === 'TRADE') { icon = '📈'; bg = isDark ? '#042f1a' : '#eefcf6'; color = '#10b981'; }
                        if (alert.priority === 'high') { icon = '⚠️'; bg = isDark ? '#4c0519' : '#fee2e2'; color = '#ef4444'; }

                        return (
                          <View key={alert.id || idx} style={{ flexDirection: 'row', alignItems: 'flex-start', opacity: alert.is_read ? 0.6 : 1 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                              <Text style={{ color, fontSize: 14 }}>{icon}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold' }}>{alert.title}</Text>
                                <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>
                                  {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </View>
                              <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium', marginTop: 2 }}>{alert.message}</Text>
                            </View>
                          </View>
                        );
                      })}
                      {notifications.length === 0 && (
                        <Text style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'Inter_500Medium', padding: 10 }}>No new alerts</Text>
                      )}
                    </View>
                  </View>

                  {/* AI Coach Insights Card */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>AI Coach Insights</Text>
                      </View>
                      <View style={{ backgroundColor: isDark ? '#3b0764' : '#f3e8ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 11, color: '#a855f7', fontFamily: 'Inter_700Bold' }}>AI</Text>
                      </View>
                    </View>

                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No insights generated yet.</Text>
                    </View>

                    {/* Ask AI Coach Button */}
                    <TouchableOpacity style={{ backgroundColor: '#8b5cf6', borderRadius: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20, flexDirection: 'row' }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' }}>Ask AI Coach</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeDashboardTab === 'Performance' && (
                <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>

                  {/* Performance Metrics Grid (2x2) - AT THE TOP */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 }}>
                    {/* Win Rate */}
                    <View style={{ width: '48.5%', backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 12, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>Win Rate</Text>
                        <Trophy size={14} color="#3b82f6" />
                      </View>
                      <Text style={{ fontSize: 22, color: '#3b82f6', fontFamily: 'Inter_700Bold', marginBottom: 2 }}>--%</Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No data</Text>
                    </View>

                    {/* Daily Goal */}
                    <View style={{ width: '48.5%', backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 12, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>Daily Goal</Text>
                        <Flame size={14} color="#f59e0b" />
                      </View>
                      <Text style={{ fontSize: 22, color: '#f59e0b', fontFamily: 'Inter_700Bold', marginBottom: 2 }}>--%</Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No data</Text>
                    </View>

                    {/* Total XP */}
                    <View style={{ width: '48.5%', backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 12, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>Total XP</Text>
                        <Diamond size={14} color="#a855f7" />
                      </View>
                      <Text style={{ fontSize: 22, color: '#a855f7', fontFamily: 'Inter_700Bold', marginBottom: 2 }}>0</Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No level data</Text>
                    </View>

                    {/* Max Discipline Score */}
                    <View style={{ width: '48.5%', backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 12, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>Discipline Score</Text>
                        <ShieldCheck size={14} color="#10b981" />
                      </View>
                      <Text style={{ fontSize: 22, color: '#10b981', fontFamily: 'Inter_700Bold', marginBottom: 2 }}>--</Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No score data</Text>
                    </View>
                  </View>

                  {/* Daily Net Cumulative P&L (Chart) - AT THE BOTTOM */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <View>
                        <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold' }}>Daily Net Cumulative P&L</Text>
                      </View>
                      <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 12, padding: 2 }}>
                        <TouchableOpacity
                          onPress={() => setChartTimeframe('1W')}
                          style={{ backgroundColor: chartTimeframe === '1W' ? '#fff' : 'transparent', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: chartTimeframe === '1W' ? 0.1 : 0, shadowRadius: 2, elevation: chartTimeframe === '1W' ? 1 : 0 }}
                        >
                          <Text style={{ fontSize: 11, color: chartTimeframe === '1W' ? '#0f172a' : '#64748b', fontFamily: chartTimeframe === '1W' ? 'Inter_700Bold' : 'Inter_600SemiBold' }}>1W</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setChartTimeframe('1M')}
                          style={{ backgroundColor: chartTimeframe === '1M' ? '#fff' : 'transparent', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: chartTimeframe === '1M' ? 0.1 : 0, shadowRadius: 2, elevation: chartTimeframe === '1M' ? 1 : 0 }}
                        >
                          <Text style={{ fontSize: 11, color: chartTimeframe === '1M' ? '#0f172a' : '#64748b', fontFamily: chartTimeframe === '1M' ? 'Inter_700Bold' : 'Inter_600SemiBold' }}>1M</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setChartTimeframe('All')}
                          style={{ backgroundColor: chartTimeframe === 'All' ? '#fff' : 'transparent', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: chartTimeframe === 'All' ? 0.1 : 0, shadowRadius: 2, elevation: chartTimeframe === 'All' ? 1 : 0 }}
                        >
                          <Text style={{ fontSize: 11, color: chartTimeframe === 'All' ? '#0f172a' : '#64748b', fontFamily: chartTimeframe === 'All' ? 'Inter_700Bold' : 'Inter_600SemiBold' }}>All</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                      <Text style={{ color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No performance data available.</Text>
                    </View>
                  </View>

                  {/* Account Balance Card (New) */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginTop: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <View>
                        <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold' }}>Account Balance</Text>
                      </View>
                      <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 12, padding: 2 }}>
                        <TouchableOpacity style={{ backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }}>
                          <Text style={{ fontSize: 11, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold' }}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: 'transparent', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter_600SemiBold' }}>1M</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: 'transparent', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter_600SemiBold' }}>1W</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                      <Text style={{ color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No balance history available.</Text>
                    </View>
                  </View>

                </View>
              )}

              {activeDashboardTab === 'Execution' && (
                <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                  {/* Session Intensity */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 16, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>Session Intensity</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 4 }} />
                      <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium' }}>LIVE EXECUTION VELOCITY</Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={{ height: 16, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 8, width: '100%', marginBottom: 15 }} />

                    {/* Warning Box Placeholder */}
                    <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                      <Text style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No active execution velocity data.</Text>
                    </View>
                  </View>

                  {/* Terminal Defense */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 16, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>Terminal Defense</Text>
                      </View>
                      <View style={{ backgroundColor: isDark ? '#042f1a' : '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 11, color: '#10b981', fontFamily: 'Inter_700Bold' }}>ALL SYSTEMS ARMED</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      {/* Risk Guard */}
                      <View style={{ width: '48.5%', backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}>
                        <View>
                          <Text style={{ fontSize: 14, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>Risk Guard</Text>
                          <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_400Regular' }}>Auto-Flatten</Text>
                        </View>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                      </View>

                      {/* Drawdown */}
                      <View style={{ width: '48.5%', backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}>
                        <View>
                          <Text style={{ fontSize: 14, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>Drawdown</Text>
                          <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_400Regular' }}>Hard Limit Active</Text>
                        </View>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                      </View>

                      {/* Slippage */}
                      <View style={{ width: '48.5%', backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}>
                        <View>
                          <Text style={{ fontSize: 14, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>Slippage</Text>
                          <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_400Regular' }}>Max 2.0 Pips</Text>
                        </View>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                      </View>

                      {/* News Filter */}
                      <View style={{ width: '48.5%', backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}>
                        <View>
                          <Text style={{ fontSize: 14, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>News Filter</Text>
                          <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_400Regular' }}>Block ±15m</Text>
                        </View>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                      </View>
                    </View>
                  </View>

                  {/* Positions & Account Metrics */}
                  <View style={{ backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 16, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>

                    {/* Tabs */}
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9', marginBottom: 15 }}>
                      <View style={{ borderBottomWidth: 2, borderBottomColor: '#3b82f6', paddingBottom: 8, marginRight: 15 }}>
                        <Text style={{ fontSize: 14, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_700Bold' }}>Positions (0)</Text>
                      </View>
                      <View style={{ paddingBottom: 8, marginRight: 15 }}>
                        <Text style={{ fontSize: 14, color: '#64748b', fontFamily: 'Inter_500Medium' }}>Pending (0)</Text>
                      </View>
                      <View style={{ paddingBottom: 8 }}>
                        <Text style={{ fontSize: 14, color: '#64748b', fontFamily: 'Inter_500Medium' }}>Closed</Text>
                      </View>
                    </View>

                    {/* Positions List Placeholder */}
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>No open positions.</Text>
                    </View>

                    {/* View Full Execution History */}

                    <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, color: '#3b82f6', fontFamily: 'Inter_700Bold', textTransform: 'uppercase' }}>View Full Execution History</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </Animated.View>
          </Animated.ScrollView>
            <ComingSoonVeil featureTitle="Trading Dashboard" subtitle="Real-time multi-asset portfolio, live PnL & automated broker terminal is launching soon." />
          </View>
        )}

        {/* ── COMMUNITY VIEW ── */}
        {activeTab === 'community' && (
          <View style={{ flex: 1, width: '100%' }}>
          {activeChannel ? (
            <View style={{ flex: 1, backgroundColor: isDark ? '#111111' : '#fff' }}>
              {/* Channel Header */}
              <View style={{ height: 60, backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
                <TouchableOpacity onPress={() => setActiveChannel(null)} style={{ marginRight: 15 }}>
                  <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter_500Medium' }}>{activeChannel}</Text>
              </View>
              {/* Channel Content (Chat) */}
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={{ color: '#64748b', textAlign: 'center' }}>Welcome to {activeChannel}!</Text>
                {/* Add dummy messages */}
                <View style={{ marginTop: 20 }}>
                  <View style={{ backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', padding: 12, borderRadius: 12, maxWidth: '80%', marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: isDark ? theme.text : '#0f172a' }}>Hello everyone! Welcome to the channel.</Text>
                  </View>
                  <View style={{ backgroundColor: '#0f172a', padding: 12, borderRadius: 12, maxWidth: '80%', alignSelf: 'flex-end', marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: '#fff' }}>Thanks! Glad to be here.</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          ) : (
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
            >
              {/* Top Gainers Section */}
              <Text style={{ fontSize: 18, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>Top Gainers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                {[1, 2, 3, 4].map(i => (
                  <View key={i} style={{ width: 120, backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9', alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', marginBottom: 8 }} />
                    <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_500Medium' }}>User {i}</Text>
                    <Text style={{ fontSize: 13, color: '#10b981', fontFamily: 'Inter_600SemiBold', marginTop: 2 }}>+{(Math.random() * 100).toFixed(1)}%</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Top Disciplineers Section */}
              <Text style={{ fontSize: 18, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>Top Disciplineers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                {[1, 2, 3, 4].map(i => (
                  <View key={i} style={{ width: 120, backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9', alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', marginBottom: 8 }} />
                    <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_500Medium' }}>User {i}</Text>
                    <Text style={{ fontSize: 13, color: '#3b82f6', fontFamily: 'Inter_600SemiBold', marginTop: 2 }}>Score: {Math.floor(Math.random() * 100)}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Top Channels Section */}
              <Text style={{ fontSize: 18, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold', marginBottom: 12 }}>Top Channels</Text>
              {[1, 2, 3].map(i => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveChannel(`Channel Name ${i}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#111111' : '#fff', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}
                >
                  <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>Channel Name {i}</Text>
                    <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_400Regular', marginTop: 2 }}>{(Math.random() * 10).toFixed(1)}k members</Text>
                  </View>
                  <View style={{ backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Join</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>
          )}
          </View>
        )}

        {/* ── CONTESTS VIEW ── */}
        {activeTab === 'contests' && (
          <View style={{ flex: 1, width: '100%' }}>
            {contestView === 'contests' ? (
              <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" progressViewOffset={10} />}
            >
              <Animated.View style={{
              flex: 1,
              transform: headerStyle === 'simple' ? [] : [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, 150],
                  extrapolate: 'clamp',
                }),
              }],
            }}>
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
                  <Text style={{ fontSize: 22, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_600SemiBold' }}>Join Competitions <Text style={{ color: '#f97316' }}>Now!</Text></Text>
                  <Text style={{ color: '#64748b', fontSize: 14, marginTop: 6, fontFamily: 'Inter_400Regular' }}>Join the hottest Competition happening right now on our platform!</Text>
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 24, borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
                  {(['Upcoming', 'In Progress', 'Finished'] as const).map(t => (
                    <TouchableOpacity key={t} onPress={() => setContestTab(t)} style={{ paddingVertical: 12, marginRight: 24, borderBottomWidth: contestTab === t ? 2 : 0, borderBottomColor: '#0f172a' }}>
                      <Text style={{ fontSize: 15, fontWeight: contestTab === t ? '700' : '500', color: contestTab === t ? '#0f172a' : '#64748b', fontFamily: 'Inter_600SemiBold' }}>{t}</Text>
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
                        <Text style={{ color: '#94a3b8', fontSize: 10, fontFamily: 'Inter_500Medium' }}>SOON</Text>
                      </View>
                    </View>

                    <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 20, marginBottom: 20 }}>
                      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                          <LayoutGrid size={20} color="#94a3b8" />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Start / End</Text>
                          <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' }}>Oct 1, 2025 - Oct 31, 2025</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={20} color="#94a3b8" />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Prize Pool</Text>
                          <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' }}>₹1,000 Cash - Competitions Accounts</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={20} color="#94a3b8" />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4, fontFamily: 'Inter_500Medium' }}>Contestants</Text>
                          <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_400Regular' }}>6507</Text>
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
                            <Text style={{ color: '#94a3b8', fontSize: 9, marginTop: 4, fontFamily: 'Inter_500Medium' }}>{c.label}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 2, fontFamily: 'Inter_500Medium' }}>Time Remaining</Text>
                        <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_500Medium' }}>(GMT +3:00)</Text>
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
              </Animated.View>
            </Animated.ScrollView>
          ) : contestView === 'profile' ? (
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 140 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
            >
              <Animated.View style={{
              flex: 1,
              transform: headerStyle === 'simple' ? [] : [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, 150],
                  extrapolate: 'clamp',
                }),
              }],
            }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                  <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#000', marginRight: 16 }} />
                      <View>
                        <Text style={{ color: '#fff', fontSize: 24, fontFamily: 'Inter_600SemiBold', lineHeight: 30 }}>Hello Nikhil!</Text>
                        <Text style={{ color: '#f97316', fontSize: 14, marginTop: 4, fontFamily: 'Inter_400Regular' }}>Current Rank N/A</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      <View style={{ backgroundColor: '#0f172a', padding: 12, borderRadius: 12 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Current Balance: <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] }}>₹10,000.00</Text></Text>
                      </View>
                      <View style={{ backgroundColor: '#0f172a', padding: 12, borderRadius: 12 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Initial Balance: <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] }}>₹100,000.00</Text></Text>
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
                            <Text style={{ color: '#64748b', fontSize: 10, marginTop: 2, fontFamily: 'Inter_500Medium' }}>{c.label}</Text>
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
              </Animated.View>
            </Animated.ScrollView>
          ) : (
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 140 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
            >
              <Animated.View style={{
              flex: 1,
              transform: headerStyle === 'simple' ? [] : [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 150],
                  outputRange: [0, 150],
                  extrapolate: 'clamp',
                }),
              }],
            }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                  <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 20 }}>
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                      {/* Podium */}
                      <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' }}>
                          <View>
                            <Text style={{ color: '#fff', fontSize: 18, fontVariant: ['tabular-nums'], marginBottom: 4, fontFamily: 'Inter_500Medium' }}>₹3,000</Text>
                            <Text style={{ color: '#64748b', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Cash Prize</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#94a3b8', fontSize: 32, fontVariant: ['tabular-nums'], fontFamily: 'Inter_700Bold', lineHeight: 38 }}>#2</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#3b82f6' }}>
                          <View>
                            <Text style={{ color: '#fff', fontSize: 20, fontVariant: ['tabular-nums'], marginBottom: 4, fontFamily: 'Inter_600SemiBold' }}>₹5,000</Text>
                            <Text style={{ color: '#3b82f6', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Cash Prize</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#fff', fontSize: 42, fontVariant: ['tabular-nums'], fontFamily: 'Inter_700Bold', lineHeight: 38 }}>#1</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' }}>
                          <View>
                            <Text style={{ color: '#fff', fontSize: 18, fontVariant: ['tabular-nums'], marginBottom: 4, fontFamily: 'Inter_500Medium' }}>₹2,000</Text>
                            <Text style={{ color: '#64748b', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Cash Prize</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: '#64748b', fontSize: 28, fontVariant: ['tabular-nums'], fontFamily: 'Inter_600SemiBold', lineHeight: 30 }}>#3</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={{ marginTop: 30, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 16, fontFamily: 'Inter_500Medium' }}>All three winners also get:</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                        <View style={{ backgroundColor: '#f97316', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_500Medium' }}>One-year subcription of FX REPLAY</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{ backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Youtube Interview</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
                  <View style={{ backgroundColor: '#1e293b', borderRadius: 28, padding: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Inter_500Medium' }}>235 players</Text>
                      <Text style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter_500Medium' }}>Shows top 50 players</Text>
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
              </Animated.View>
            </Animated.ScrollView>
          )}
          </View>
        )}

        {/* ── FEED VIEW ── */}
        {activeTab === 'feed' && (
          <View style={{ flex: 1, width: '100%', backgroundColor: activeCardId ? '#090d16' : (isDark ? theme.background : '#f8fafc') }}>
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              style={{ flex: 1, width: '100%', backgroundColor: isDark ? theme.background : '#f8fafc' }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 160, paddingTop: 16, backgroundColor: isDark ? theme.background : '#f8fafc' }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              onScrollBeginDrag={() => {
                setActivePostMenu(null);
              }}
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
              <Animated.View style={{
                width: '100%',
                transform: headerStyle === 'simple' ? [] : [{
                  translateY: scrollY.interpolate({
                    inputRange: [0, 150],
                    outputRange: [0, 150],
                    extrapolate: 'clamp',
                  }),
                }],
              }}>

              {/* Quick Post Prompt Card */}
              <View
                style={{
                  marginHorizontal: 8,
                  marginBottom: 12,
                  backgroundColor: isDark ? '#14171f' : '#ffffff',
                  borderRadius: 20,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  shadowColor: '#0f172a',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    hSelect();
                    setCreatePostVisible(true);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Image
                    source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: isDark ? '#1e2433' : '#f1f5f9',
                      borderWidth: 1.5,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                    }}
                  />
                  <View style={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  }}>
                    <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                      Share your trade setup or thought...
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Quick Action Shortcuts */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 12,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                }}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      hSelect();
                      setCreatePostType('image');
                      setCreatePostVisible(true);
                      pickMedia();
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8 }}
                  >
                    <IconlyImage size={18} color="#10b981" set="bold" />
                    <Text style={{ fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: isDark ? '#cbd5e1' : '#475569' }}>
                      Photo / Chart
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      hSelect();
                      setCreatePostType('video');
                      setCreatePostVisible(true);
                      pickMedia();
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8 }}
                  >
                    <IconlyVideo size={18} color="#f59e0b" set="bold" />
                    <Text style={{ fontSize: 12.5, fontFamily: 'Inter_600SemiBold', color: isDark ? '#cbd5e1' : '#475569' }}>
                      Video
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      hSelect();
                      setCreatePostType('twit');
                      setCreatePostVisible(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: isDark ? '#ffffff' : '#0f172a',
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                    }}
                  >
                    <Send size={13} color={isDark ? '#000000' : '#ffffff'} />
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#000000' : '#ffffff' }}>
                      Post
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Feed Sub Tabs: For You, Following, Setups */}
              <View style={{
                flexDirection: 'row',
                paddingHorizontal: 16,
                marginBottom: 16,
                alignItems: 'center',
                gap: 8,
              }}>
                {[
                  { key: 'for_you', label: 'For You' },
                  { key: 'following', label: 'Following' },
                  { key: 'setups', label: 'Verified Setups' }
                ].map(tab => {
                  const isActive = feedSubTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => {
                        hSelect();
                        setFeedSubTab(tab.key as any);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: isActive
                          ? (isDark ? '#ffffff' : '#0f172a')
                          : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff'),
                        borderWidth: 1,
                        borderColor: isActive
                          ? 'transparent'
                          : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'),
                      }}
                    >
                      <Text style={{
                        fontSize: 13,
                        fontFamily: isActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
                        color: isActive
                          ? (isDark ? '#000000' : '#ffffff')
                          : (isDark ? '#94a3b8' : '#64748b'),
                      }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Posts */}
              {(feedsLoading || storeLoading) && displayedPosts.length === 0 ? (
                <View style={{ padding: 60, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#0f172a'} />
                  <Text style={{ marginTop: 14, color: '#94a3b8', fontSize: 14, fontFamily: 'Inter_500Medium' }}>
                    Loading latest market posts...
                  </Text>
                </View>
              ) : displayedPosts.length > 0 ? (
                displayedPosts.map((post: any) => (
                  <HomePostCard
                    key={post.id}
                    post={post}
                    isActive={activeCardId === post.id}
                    anyCardActive={false}
                    onActive={(x, y) => handleCardActive(post.id, x, y)}
                    onInactive={handleCardInactive}
                    activePostMenu={activePostMenu}
                    setActivePostMenu={setActivePostMenu}
                    onGestureMove={updateFingerPosition}
                    onGestureRelease={handleGestureRelease}
                    onLike={() => handleLikePost(post.id)}
                    onComment={() => handleCommentPost(post.id)}
                    onShare={() => handleSharePost(post.id)}
                    onImagePress={(postId) => setActiveViewerPostId(postId)}
                  />
                ))
              ) : (
                <View style={{
                  padding: 24,
                  marginHorizontal: 14,
                  marginTop: 10,
                  backgroundColor: isDark ? '#14171f' : '#f8fafc',
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  alignItems: 'center',
                }}>
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#eff6ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <Users size={22} color={isDark ? '#ffffff' : '#0f172a'} />
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Inter_700Bold',
                    color: isDark ? '#ffffff' : '#0f172a',
                    marginBottom: 6,
                    textAlign: 'center',
                  }}>
                    {feedSubTab === 'following' ? 'Suggested Traders to Follow' : 'No posts yet'}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    fontFamily: 'Inter_400Regular',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: 18,
                    marginBottom: 16,
                  }}>
                    {feedSubTab === 'following'
                      ? 'Follow active creators to customize your stream with real-time setups and signals.'
                      : 'Share your first market insight, trade setup, or analysis with the TradiFive community!'}
                  </Text>

                  {feedSubTab === 'following' ? (
                    <View style={{ width: '100%', gap: 10, marginBottom: 16 }}>
                      {[
                        { id: '20567383-2957-4b9c-88b2-4f5ade623bef', name: 'Nikhil Harake', handle: '@nik_trader', bio: 'Founder · Fialgo Creator' },
                        { id: 'tradifive-official-sys', name: 'TradiFive Algo Desk', handle: '@tradifive', bio: 'Bot Operations & Bridge' },
                        { id: 'elena-fx-trader', name: 'Elena FX', handle: '@elena_fx', bio: 'Gold Breakout Specialist' },
                      ].map((creator) => {
                        const isFollowed = followingIds.includes(creator.id);
                        return (
                          <View
                            key={creator.id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: 10,
                              borderRadius: 14,
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                              borderWidth: 1,
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <View style={{ flex: 1, marginRight: 10 }}>
                              <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                                {creator.name}
                              </Text>
                              <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94a3b8' }}>
                                {creator.handle} · {creator.bio}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                h(Haptics.ImpactFeedbackStyle.Light);
                                if (isFollowed) {
                                  useStore.getState().unfollowUser(creator.id);
                                } else {
                                  useStore.getState().followUser(creator.id);
                                }
                              }}
                              style={{
                                paddingHorizontal: 14,
                                paddingVertical: 7,
                                borderRadius: 10,
                                backgroundColor: isFollowed ? 'rgba(255, 255, 255, 0.12)' : (isDark ? '#ffffff' : '#0f172a'),
                              }}
                            >
                              <Text style={{
                                fontSize: 12,
                                fontFamily: 'Inter_700Bold',
                                color: isFollowed ? '#94a3b8' : (isDark ? '#000000' : '#ffffff'),
                              }}>
                                {isFollowed ? 'Following' : 'Follow'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          hSelect();
                          setFeedSubTab('new');
                        }}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                          alignItems: 'center',
                          marginTop: 6,
                        }}
                      >
                        <Text style={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                          Explore All New Posts
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setCreatePostVisible(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#ffffff' : '#0f172a',
                      }}
                    >
                      <Plus size={16} color={isDark ? '#000000' : '#ffffff'} />
                      <Text style={{ color: isDark ? '#000000' : '#ffffff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                        Create Post
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Animated.View>
          </Animated.ScrollView>

          {activePostMenu && (
            <TouchableOpacity
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }]}
              activeOpacity={1}
              onPress={() => setActivePostMenu(null)}
            >
              <TouchableWithoutFeedback>
                <View style={{
                  backgroundColor: isDark ? '#111111' : '#fff',
                  borderRadius: 16,
                  padding: 16,
                  width: '80%',
                  maxWidth: 300,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 10,
                }}>
                  <TouchableOpacity onPress={() => setActivePostMenu(null)} style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
                    <Text style={{ color: isDark ? theme.text : '#0f172a', fontSize: 16, textAlign: 'center', fontFamily: 'Inter_500Medium' }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActivePostMenu(null)} style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
                    <Text style={{ color: '#ef4444', fontSize: 16, textAlign: 'center', fontFamily: 'Inter_500Medium' }}>Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActivePostMenu(null)} style={{ padding: 12 }}>
                    <Text style={{ color: isDark ? theme.text : '#0f172a', fontSize: 16, textAlign: 'center', fontFamily: 'Inter_500Medium' }}>About this acc</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          )}
          </View>
        )}
      </Animated.View>

      {dropdownOpen && (
        <>
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={{
              position: 'absolute',
              top: dropdownTop,
              left: 20,
              backgroundColor: isDark ? '#111111' : '#fff',
              borderRadius: 16,
              minWidth: 190,
              zIndex: 9999,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 4 },
              elevation: 20,
              opacity: dropAnim,
              transform: [{
                translateY: dropAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
              }],
            }}
          >
            {activeTab === 'community' ? (
              <>
                <TouchableOpacity onPress={() => selectView('channels')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, gap: 14 }}>
                  <Users size={18} color="#0f172a" />
                  <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_400Regular' }}>Channels</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectView('messages')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, gap: 14 }}>
                  <MessageCircle size={18} color="#0f172a" />
                  <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_400Regular' }}>Messages</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => selectView('contests')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, gap: 14 }}>
                  <Trophy size={18} color="#0f172a" />
                  <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_400Regular' }}>Contests</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectView('profile')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, gap: 14 }}>
                  <Users size={18} color="#0f172a" />
                  <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_400Regular' }}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectView('leaderboard')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, gap: 14 }}>
                  <Trophy size={18} color="#0f172a" />
                  <Text style={{ fontSize: 15, color: isDark ? theme.text : '#0f172a', fontFamily: 'Inter_400Regular' }}>Leaderboard</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </>
      )}
      {/* PINTEREST-STYLE MENU OVERLAY */}
      {activeCardId && touchCoords && (() => {
        const isLeftTouch = touchCoords.x < SCREEN_WIDTH / 2;

        return (
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { zIndex: 10000, backgroundColor: 'transparent', opacity: backdropAnim }]}
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
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: analyseFactorAnim.interpolate({ inputRange: [0, 0.74, 0.75, 1], outputRange: [1, 1, 0, 0] }) }]}>
                <Sparkles size={26} color="#ffffff" />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', opacity: analyseFactorAnim.interpolate({ inputRange: [0, 0.74, 0.75, 1], outputRange: [0, 0, 1, 1] }) }]}>
                <Sparkles size={26} color="#000000" />
              </Animated.View>
            </Animated.View>

            {/* Active Action Text Indicator */}
            {selectedAction !== '' && (
              <View style={{ position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 }}>
                <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' }}>{selectedAction}</Text>
              </View>
            )}
          </Animated.View>
        );
      })()}

      {/* Create Post Modal */}
      <Modal
        visible={createPostVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreatePostVisible(false)}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000000" animated={true} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: '#000000' }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: '#000000',
              paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 16) : 16,
              paddingHorizontal: 16,
              paddingBottom: Platform.OS === 'ios' ? 0 : 16,
            }}
          >
            {/* Pinned Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Keyboard.dismiss();
                  setCreatePostVisible(false);
                }}
                style={{ padding: 4 }}
              >
                <Text style={{ fontSize: 17, fontFamily: 'Inter_400Regular', color: '#ffffff' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={isSubmittingPost || (!newPostContent.trim() && !selectedMediaUri)}
                style={{
                  backgroundColor: (newPostContent.trim() || selectedMediaUri) ? '#3b82f6' : '#1e3a8a',
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                {isSubmittingPost ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: (newPostContent.trim() || selectedMediaUri) ? '#ffffff' : '#94a3b8' }}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardDismissMode="none"
            >
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Image
                  source={{ uri: getAvatarUrl(currentUser?.avatar_url, currentUser?.email) }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
                <TextInput
                  placeholder="What's happening?"
                  placeholderTextColor="#64748b"
                  selectionColor="#3b82f6"
                  multiline
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  autoFocus
                  style={{
                    flex: 1,
                    fontSize: 18,
                    fontFamily: 'Inter_400Regular',
                    color: '#ffffff',
                    minHeight: 120,
                    textAlignVertical: 'top',
                    paddingTop: 6,
                  }}
                />
              </View>

              {/* Selected Media Preview */}
              {selectedMediaUri && (
                <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1e2a3a', marginBottom: 16, marginLeft: 48 }}>
                  {createPostType === 'image' ? (
                    <View style={{ position: 'relative' }}>
                      <View style={{ width: '100%', height: 260, backgroundColor: isDark ? '#090d16' : '#f8f9fa', borderRadius: 12, overflow: 'hidden' }}>
                        <Image source={{ uri: selectedMediaUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedMediaUri(null);
                          setSelectedMediaMime(null);
                          setCreatePostType('twit');
                        }}
                        style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(15, 23, 42, 0.7)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ position: 'relative' }}>
                      <View style={{ width: '100%', height: 260, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={24} color="#ffffff" style={{ marginLeft: 2 }} />
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedMediaUri(null);
                          setSelectedMediaMime(null);
                          setCreatePostType('twit');
                        }}
                        style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(15, 23, 42, 0.7)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom Toolbar Section */}
            <View style={{ marginTop: 'auto' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setVisibilityModalVisible(true);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 }}
                >
                  <Globe size={12} color="#3b82f6" />
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#3b82f6' }}>Everyone</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity>
                    <Undo2 size={20} color="#334155" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Redo2 size={20} color="#334155" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: '#1e293b', marginHorizontal: -16 }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity onPress={() => pickMedia('image')}>
                    <IconlyImage size={22} color="#3b82f6" set="bold" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => pickMedia('video')}>
                    <IconlyVideo size={22} color="#3b82f6" set="bold" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <IconlyDocument size={22} color="#3b82f6" set="bold" />
                  </TouchableOpacity>

                  <TouchableOpacity style={{ borderWidth: 1.5, borderColor: '#3b82f6', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 }}>
                    <Text style={{ color: '#3b82f6', fontSize: 9, fontFamily: 'Inter_700Bold' }}>GIF</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ width: 1, height: 24, backgroundColor: '#1e293b' }} />
                  <TouchableOpacity style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 4 }}>
                    <IconlyPlus size={16} color="#3b82f6" set="bold" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Visibility Modal */}
      <Modal
        visible={visibilityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisibilityModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisibilityModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: isDark ? '#111111' : '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 24) : 24 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', alignSelf: 'center', marginBottom: 24 }} />
                <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a', marginBottom: 24 }}>Who can see your post?</Text>

                <TouchableOpacity onPress={() => { setVisibilityModalVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={24} color="#475569" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a', marginBottom: 2 }}>Anyone</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748b' }}>Anyone on or off LinkedIn</Text>
                    </View>
                  </View>
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#059669', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#059669' }} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setVisibilityModalVisible(false); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} color="#475569" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a', marginBottom: 2 }}>Connections only</Text>
                    </View>
                  </View>
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1' }} />
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <View>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a', marginBottom: 2 }}>Comment control</Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748b' }}>Anyone</Text>
                  </View>
                  <ChevronRight size={20} color="#64748b" />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#0f172a' }}>Brand partnership</Text>
                    <Info size={16} color="#64748b" />
                  </View>
                  <Switch value={false} disabled trackColor={{ false: isDark ? '#3f3f46' : '#cbd5e1' }} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ImageViewerModal
        visible={!!activeViewerPostId}
        onClose={() => setActiveViewerPostId(null)}
        posts={feedPostsToRender}
        initialPostId={activeViewerPostId}
        onLike={handleLikePost}
        onComment={handleCommentPost}
        onShare={handleSharePost}
        isCommentOpen={!!activeCommentPost}
        customScale={customMediaScale}
        customShift={customMediaShift}
      />

      {/* Comments Bottom Sheet Drawer Modal */}
      <Modal
        visible={!!activeCommentPost}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          Animated.spring(translateY, {
            toValue: SNAP_POINTS.CLOSE,
            useNativeDriver: true,
            tension: 65,
            friction: 11
          }).start(() => {
            setActiveCommentPost(null);
            setReplyingToComment(null);
            setCommentInput('');
          });
        }}
      >
        <View style={{ flex: 1 }}>
          {/* Backdrop mask (tap to close) */}
          <TouchableWithoutFeedback
            onPress={() => {
              Animated.spring(translateY, {
                toValue: SNAP_POINTS.CLOSE,
                useNativeDriver: true,
                tension: 65,
                friction: 11
              }).start(() => {
                setActiveCommentPost(null);
                setReplyingToComment(null);
                setCommentInput('');
              });
            }}
          >
            <Animated.View style={{ flex: 1, backgroundColor: 'rgba(9, 13, 22, 0.4)', opacity: backdropOpacity }} />
          </TouchableWithoutFeedback>

          {/* Draggable Sheet */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: SHEET_HEIGHT,
              backgroundColor: isDark ? '#111111' : '#ffffff',
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
                  borderBottomColor: isDark ? '#222222' : '#f1f5f9'
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
                <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#1e293b' }}>
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
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#1e293b' }}>{item.user}</Text>
                        <Text style={{ fontSize: 13, color: '#334155', fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 18 }}>{item.content}</Text>

                        {/* Action Links under Comment */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 }}>
                          <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_400Regular' }}>{item.time}</Text>
                          <TouchableOpacity onPress={() => handleLikeComment(activeCommentPost.id, item.id)}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: item.isLiked ? '#ef4444' : '#64748b' }}>
                              {item.likes > 0 ? `${item.likes} Like` : 'Like'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {
                            setReplyingToComment({ commentId: item.id, username: item.user });
                          }}>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Like Heart Icon on Right */}
                      <TouchableOpacity onPress={() => handleLikeComment(activeCommentPost.id, item.id)} style={{ padding: 4 }}>
                        <IconlyHeart size={14} color={item.isLiked ? '#ef4444' : '#94a3b8'} set={item.isLiked ? 'bold' : 'curved'} stroke="bold" />
                      </TouchableOpacity>
                    </View>

                    {/* Replies (Indent nested list) */}
                    {item.replies && item.replies.map(reply => (
                      <View key={reply.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginLeft: 42, marginTop: 12 }}>
                        <Image source={{ uri: reply.avatar }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: isDark ? theme.text : '#1e293b' }}>{reply.user}</Text>
                          <Text style={{ fontSize: 12, color: '#334155', fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 16 }}>{reply.content}</Text>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
                            <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter_400Regular' }}>{reply.time}</Text>
                            <TouchableOpacity onPress={() => handleLikeReply(activeCommentPost.id, item.id, reply.id)}>
                              <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: reply.isLiked ? '#ef4444' : '#64748b' }}>
                                {reply.likes > 0 ? `${reply.likes} Like` : 'Like'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Like Heart Icon for Reply */}
                        <TouchableOpacity onPress={() => handleLikeReply(activeCommentPost.id, item.id, reply.id)} style={{ padding: 4 }}>
                          <IconlyHeart size={12} color={reply.isLiked ? '#ef4444' : '#94a3b8'} set={reply.isLiked ? 'bold' : 'curved'} stroke="bold" />
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
              backgroundColor: isDark ? '#111111' : '#ffffff',
              borderTopWidth: 1,
              borderTopColor: isDark ? '#222222' : '#f1f5f9',
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
                backgroundColor: isDark ? '#111111' : '#ffffff'
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
                  backgroundColor: isDark ? '#111111' : '#f8fafc',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#222222' : '#f1f5f9'
                }}
              >
                <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter_400Regular' }}>
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
                backgroundColor: isDark ? '#111111' : '#ffffff'
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
                      tension: 65,
                      friction: 11
                    }).start(() => {
                      lastTranslateY.current = SNAP_POINTS.FULL;
                    });
                  }}
                  placeholder={replyingToComment ? `Reply to @${replyingToComment.username}...` : "What do you think of this?"}
                  placeholderTextColor="#94a3b8"
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9',
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
                      tension: 65,
                      friction: 11
                    }).start(() => {
                      lastTranslateY.current = SNAP_POINTS.FULL;
                    });
                    setTimeout(() => {
                      commentInputRef.current?.focus();
                    }, 50);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9',
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

      
    </View>
  );
}

const globalStyles = StyleSheet.create({
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
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -34,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    zIndex: 5,
  },
  /* Dashboard Specific Styles */
  hudCard: {
    backgroundColor: '#ffffffe8',
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOpacity: 0.02, shadowRadius: 20, elevation: 10,
  },
  hudTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hudLabel: { color: '#64748b', fontSize: 10, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1 },
  hudTitle: { color: '#fff', fontSize: 20, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
  xpText: { color: '#f59e0b', fontSize: 12, fontFamily: 'Inter_500Medium', fontVariant: ['tabular-nums'] },
  hudProgress: { marginTop: 20 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 3 },
  hudMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  hudMetricText: { color: '#94a3b8', fontSize: 11, fontFamily: 'Inter_500Medium', fontVariant: ['tabular-nums'] },
  connectionBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
  },
  connStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  connText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#0f172a' },
  liveBadge: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveText: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#10b981' },
  connDetails: { alignItems: 'flex-end' },
  detailText: { fontSize: 11, color: '#64748b', fontFamily: 'Inter_600SemiBold', fontVariant: ['tabular-nums'] },
  metricsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: 22, fontFamily: 'Inter_600SemiBold', color: '#0f172a', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  metricSubValue: { fontSize: 11, color: '#94a3b8', fontFamily: 'Inter_500Medium', marginTop: 4, fontVariant: ['tabular-nums'] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: '#0f172a' },
  statusBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  statusText: { color: '#10b981', fontSize: 10, fontFamily: 'Inter_500Medium', letterSpacing: 1 },
  riskCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 15, elevation: 5, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 20 },
  riskMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  riskCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 6, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  riskPct: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: '#3b82f6', fontVariant: ['tabular-nums'] },
  riskLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#94a3b8', textTransform: 'uppercase' },
  riskStats: { flex: 1, marginLeft: 24, gap: 12 },
  riskStatItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f8fafc', paddingBottom: 8 },
  statLabel: { fontSize: 11, color: '#64748b', fontFamily: 'Inter_500Medium' },
  statValue: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#0f172a', fontVariant: ['tabular-nums'] },
  emergencyBtn: { backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 8, shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  emergencyText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },

  /* Navigation Styles */
  pill: {
    width: 52, height: 52,
    backgroundColor: '#ffffff', borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  cluster: {
    backgroundColor: '#ffffff', borderRadius: 32,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
    borderWidth: 1, borderColor: '#f1f5f9', gap: 4,
  },
  clusterActive: {
    width: 44, height: 44, backgroundColor: '#f1f5f9',
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  clusterBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  aiHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  aiCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#0f172a' },
  aiContent: { padding: 24 },
  aiBotMsg: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, borderTopLeftRadius: 4, marginBottom: 20 },
  aiMsgText: { color: '#0f172a', fontSize: 14, fontFamily: 'Inter_400Regular' },
  aiSuggest: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8 },
  aiSuggestText: { color: '#64748b', fontSize: 13, fontFamily: 'Inter_500Medium' },
  aiInputRow: { padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiInput: { flex: 1, height: 44, backgroundColor: '#f1f5f9', borderRadius: 22, paddingHorizontal: 20, color: '#0f172a', fontFamily: 'Inter_400Regular' },
  aiSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }
});
