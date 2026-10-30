import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Heart, Chat, Send, Bookmark } from './Iconly';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getAvatarUrl } from '../app/utils/avatar';
import { FeedPost } from '../hooks/useSocialFeed';
import { useAppTheme } from '../hooks/useAppTheme';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

const FeedVideo: React.FC<{ uri: string; style: any }> = ({ uri, style }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  return (
    <VideoView
      style={style}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
};

interface FeedCardProps {
  post: FeedPost;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, onLike, onComment, onShare, onBookmark }) => {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const [isLiked, setIsLiked] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const bigHeartScale = React.useRef(new Animated.Value(0)).current;
  const bigHeartOpacity = React.useRef(new Animated.Value(0)).current;
  
  const handleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    if (nextState) {
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
  
  const isVideo = post.media_url?.match(/\.(mp4|mov|webm)$/i);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111111' : '#ffffff', borderColor: isDark ? '#222222' : '#f1f5f9', position: 'relative' }]}>
      {/* Big Animated Heart Overlay */}
      <Animated.View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: bigHeartOpacity,
        transform: [{ scale: bigHeartScale }],
        pointerEvents: 'none',
        zIndex: 100,
      }}>
        <Heart size={100} color="#ef4444" fill="#ef4444" />
      </Animated.View>

      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => router.push(`/user/${post.user_id}`)}
      >
        <Image 
          source={{ uri: getAvatarUrl(post.profiles?.avatar_url || undefined, post.profiles?.username || undefined) }} 
          style={styles.avatar} 
        />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: isDark ? '#e8e8e8' : '#0f172a' }]}>
            {post.profiles?.display_name || post.profiles?.full_name || post.profiles?.username || 'User'}
          </Text>
          <Text style={styles.time}>{formatDate(post.created_at)}</Text>
        </View>
      </TouchableOpacity>

      {/* Content */}
      {post.content ? (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={[styles.content, { paddingHorizontal: 0, marginBottom: 0, color: isDark ? '#d1d5db' : '#334155' }]}>
            {post.content.length > 150 && !isExpanded 
              ? `${post.content.substring(0, 150)}...` 
              : post.content}
          </Text>
          {post.content.length > 150 && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={{ marginTop: 4 }}>
              <Text style={{ color: isExpanded ? '#64748b' : '#3b82f6', fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                {isExpanded ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Media */}
      {post.media_url && (
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <FeedVideo
              uri={post.media_url}
              style={styles.media}
            />
          ) : (
            <Image 
              source={{ uri: post.media_url }} 
              style={styles.media} 
              resizeMode="contain"
            />
          )}
        </View>
      )}

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: isDark ? '#222222' : '#f8fafc' }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Animated.View style={[
            { transform: [{ scale: scaleAnim }] },
            isLiked && {
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
              elevation: 8,
            }
          ]}>
            <Heart
              size={22}
              color={isLiked ? '#ef4444' : '#64748b'}
              set={isLiked ? 'bold' : 'curved'}
              stroke="bold"
            />
          </Animated.View>
          <Text style={[styles.actionText, isLiked && { color: '#ef4444', fontWeight: 'bold' }]}>
            {(post.like_count || 0) + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onComment?.(); }} activeOpacity={0.7}>
          <Chat size={22} color='#64748b' set="curved" stroke="bold" />
          <Text style={styles.actionText}>{post.comment_count || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onShare?.(); }} activeOpacity={0.7}>
          <Send size={22} color='#64748b' set="curved" stroke="bold" />
          <Text style={styles.actionText}>{post.share_count || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, { marginLeft: 'auto', marginRight: 0 }]} onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onBookmark?.(); }} activeOpacity={0.7}>
          <Bookmark size={22} color='#64748b' set="curved" stroke="bold" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 8,
    marginBottom: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },
  content: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  mediaContainer: {
    width: '100%',
    height: 340, backgroundColor: "#080a10", // 4:3 aspect ratio roughly
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Inter_500Medium',
  },
});
