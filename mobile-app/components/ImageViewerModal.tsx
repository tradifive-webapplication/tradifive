import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, View, Image, TouchableOpacity, Text, StyleSheet, Platform, SafeAreaView, Dimensions, FlatList, TouchableWithoutFeedback, Animated, ScrollView } from 'react-native';
import { Heart, Chat, Send, Bookmark } from 'react-native-iconly';
import { ChevronLeft, Play, Pause, MoreVertical, X } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../hooks/useAppTheme';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  onClose: () => void;
  posts: any[];
  initialPostId: string | null;
  onLike?: (postId: string) => void;
  onComment?: (postId: string | any) => void;
  onShare?: (postId: string) => void;
  isCommentOpen?: boolean;
  children?: React.ReactNode;
  customShift?: any;
  customScale?: any;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const VideoControls = ({ player, isPlaying, setIsPlaying }: { player: any, isPlaying: boolean, setIsPlaying: (val: boolean) => void }) => {
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('0:00');
  const [durationStr, setDurationStr] = useState('0:00');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      const duration = player.duration || 1;
      const current = player.currentTime || 0;
      setProgress(current / duration);
      setCurrentTimeStr(formatTime(current));
      setDurationStr(formatTime(duration));
    }, 100);
    return () => clearInterval(interval);
  }, [player]);

  const toggleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (player) {
      player.playbackRate = nextSpeed;
    }
  };

  if (!player) return null;

  return (
    <View style={{ marginTop: 8, marginBottom: 12 }}>
      {/* Progress Bar */}
      <View style={{ width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>
        <View style={{ height: '100%', backgroundColor: '#ffffff', width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
      </View>
      
      {/* Controls Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={{ padding: 4 }}>
            {isPlaying ? (
              <Pause size={20} color="#ffffff" fill="#ffffff" />
            ) : (
              <Play size={20} color="#ffffff" fill="#ffffff" />
            )}
          </TouchableOpacity>
          <Text style={{ color: '#ffffff', fontSize: 13, fontFamily: 'Inter_500Medium' }}>
            {currentTimeStr} / {durationStr}
          </Text>
        </View>
        
        <TouchableOpacity onPress={toggleSpeed} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: '#ffffff', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MediaItem = ({ post, isActive, onLike, onComment, onShare, onClose, commentsShift, commentsScale }: any) => {
  const { theme, isDark } = useAppTheme(); // Keep for any other uses if needed
  const router = useRouter();
  
  // Force dark colors for immersive view
  const textColor = '#ffffff';
  const iconColor = '#ffffff';
  const borderColor = 'rgba(255,255,255,0.3)';
  const shadowStyle = {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  };

  const [isPlaying, setIsPlaying] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);

  const imageUrl = post?.image || post?.media_url;
  const isVideo = post?.post_type === 'video' || post?.media_type === 'video' || (imageUrl && imageUrl.includes('.mp4'));

  // expo-video player (only used when it's a video)
  const player = useVideoPlayer(isVideo && imageUrl ? { uri: imageUrl } : null, p => {
    p.loop = true;
    if (isActive && isPlaying) p.play();
  });

  useEffect(() => {
    if (isVideo && player) {
      if (isActive && isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isActive, isPlaying, isVideo]);

  const lastTapTime = useRef(0);
  const bigHeartOpacity = useRef(new Animated.Value(0)).current;
  const bigHeartScale = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      // Double tap!
      if (!post.isLiked && onLike) onLike(post.id);
      
      // Animate big heart
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
      
      lastTapTime.current = 0; // reset
    } else {
      // Single tap
      lastTapTime.current = now;
      if (isVideo) {
        setIsPlaying(!isPlaying);
      }
    }
  };

  return (
    <View style={styles.itemContainer}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <Animated.View style={[styles.mediaWrapper, commentsShift && commentsScale && { transform: [{ translateY: commentsShift }, { scale: commentsScale }] }]}>
          {isVideo ? (
            <>
              <VideoView
                player={player}
                style={styles.media}
                contentFit="contain"
                nativeControls={false}
              />
              {!isPlaying && (
                <View style={styles.playPauseOverlay}>
                  <Pause size={48} color="rgba(255, 255, 255, 0.8)" fill="rgba(255, 255, 255, 0.8)" />
                </View>
              )}
            </>
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.media}
              resizeMode="contain"
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={[{ color: textColor, fontSize: 26, fontFamily: 'Inter_600SemiBold', textAlign: 'center', lineHeight: 36 }, shadowStyle]}>
                {post.content}
              </Text>
            </View>
          )}
          
          {/* Big Animated Heart Overlay for Double Tap */}
          <Animated.View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: bigHeartOpacity,
            transform: [{ scale: bigHeartScale }],
            pointerEvents: 'none',
          }}>
            <Heart size={100} color="#ef4444" fill="#ef4444" />
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Footer Actions Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.4, 1]}
        style={styles.footerOverlay}
        pointerEvents="box-none"
      >
        <View style={styles.footerContent}>
          {/* Left Side: User Info & Caption */}
          <View style={styles.footerLeft}>
            <View style={styles.userInfoRow}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                  const targetId = post?.user_id || post?.profiles?.id;
                  if (targetId) {
                    setTimeout(() => {
                      router.push(`/user/${targetId}`);
                    }, 100);
                  }
                }}
              >
                <Image source={{ uri: post?.avatar || post?.profiles?.avatar_url || 'https://via.placeholder.com/40' }} style={[styles.footerAvatar, { borderColor }]} />
                <Text style={[styles.footerUsername, { color: textColor }, shadowStyle]}>{post?.user || post?.profiles?.username || 'User'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.followButton, { borderColor: isFollowing ? 'rgba(255,255,255,0.5)' : textColor, backgroundColor: isFollowing ? 'rgba(255,255,255,0.2)' : 'transparent' }]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsFollowing(!isFollowing);
                }}
              >
                <Text style={[styles.followButtonText, { color: textColor }]}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
            </View>
            {post?.content ? (
              <View style={{ marginTop: 6 }}>
                <TouchableOpacity onPress={() => setIsDescriptionModalVisible(true)} activeOpacity={0.8}>
                  <Text
                    style={[styles.footerCaption, { color: textColor }, shadowStyle]}
                    numberOfLines={2}
                  >
                    {post.content}
                  </Text>
                  {post.content.length > 80 && (
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                      ... more
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Right Side: Actions Stack */}
          <View style={styles.footerRight}>
            <TouchableOpacity onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onLike) onLike(post.id);
            }} style={styles.actionButtonVertical}>
              <Heart size={28} color={post.isLiked ? "#ef4444" : iconColor} set={post.isLiked ? "bold" : "curved"} stroke="bold" />
              <Text style={[styles.actionTextVertical, { color: textColor }, shadowStyle, post.isLiked && styles.actionTextLiked]}>{post.likes || post.likes_count || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onComment) onComment(post.id);
            }} style={styles.actionButtonVertical}>
              <Chat size={28} color={iconColor} set="curved" stroke="bold" />
              <Text style={[styles.actionTextVertical, { color: textColor }, shadowStyle]}>{post.comments || post.comments_count || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onShare) onShare(post.id);
            }} style={styles.actionButtonVertical}>
              <Send size={28} color={iconColor} set="curved" stroke="bold" />
              <Text style={[styles.actionTextVertical, { color: textColor }, shadowStyle]}>{post.shares || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Assuming 'Save' functionality
            }} style={styles.actionButtonVertical}>
              <Bookmark size={28} color={iconColor} set="curved" stroke="bold" />
              <Text style={[styles.actionTextVertical, { color: textColor }, shadowStyle]}>{post.saves || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Controls & Progress Bar */}
        {isVideo && player && (
          <VideoControls 
            player={player} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying} 
          />
        )}
      </LinearGradient>

      {/* Description Bottom Sheet Modal */}
      <Modal
        visible={isDescriptionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDescriptionModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setIsDescriptionModalVisible(false)} 
          />
          <View style={{ 
            backgroundColor: isDark ? '#1e293b' : '#ffffff', 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            padding: 24,
            maxHeight: height * 0.6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>Description</Text>
              <TouchableOpacity onPress={() => setIsDescriptionModalVisible(false)} style={{ padding: 4 }}>
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Image 
                  source={{ uri: post?.avatar || post?.profiles?.avatar_url || 'https://via.placeholder.com/40' }} 
                  style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }} 
                />
                <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: isDark ? '#ffffff' : '#0f172a' }}>
                  {post?.user || post?.profiles?.username || 'User'}
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: isDark ? '#e2e8f0' : '#334155', lineHeight: 24 }}>
                {post?.content}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export function ImageViewerModal({
  visible,
  onClose,
  posts,
  initialPostId,
  onLike,
  onComment,
  onShare,
  isCommentOpen,
  children,
  customShift,
  customScale,
}: ImageViewerModalProps) {
  // Always use dark background for immersive media feed
  const bgColor = '#000000';
  const iconColor = '#ffffff';

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const internalCommentsShift = useRef(new Animated.Value(0)).current;
  const internalCommentsScale = useRef(new Animated.Value(1)).current;

  const commentsShift = customShift || internalCommentsShift;
  const commentsScale = customScale || internalCommentsScale;

  useEffect(() => {
    if (customShift && customScale) return; // Let parent control it dynamically
    Animated.parallel([
      Animated.spring(internalCommentsShift, {
        toValue: isCommentOpen ? -height * 0.15 : 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 14,
      }),
      Animated.spring(internalCommentsScale, {
        toValue: isCommentOpen ? 0.75 : 1,
        useNativeDriver: true,
        bounciness: 0,
        speed: 14,
      })
    ]).start();
  }, [isCommentOpen, customShift, customScale]);
  
  // Use all posts instead of filtering out text-only ones
  // const mediaPosts = posts.filter(p => p.image || p.media_url);

  useEffect(() => {
    if (visible && initialPostId && flatListRef.current) {
      const index = posts.findIndex(p => p.id === initialPostId);
      if (index >= 0) {
        setActiveIndex(index);
        // Small delay to ensure FlatList has layout
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 100);
      }
    }
  }, [visible, initialPostId]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor, zIndex: 9999, elevation: 9999 }]}>
        <FlatList
          ref={flatListRef}
          data={posts}
            keyExtractor={(item) => item.id.toString()}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialScrollIndex={
              posts.findIndex(p => p.id === initialPostId) >= 0
                ? posts.findIndex(p => p.id === initialPostId)
                : 0
            }
            getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
            renderItem={({ item, index }) => (
              <MediaItem
                post={item}
                isActive={index === activeIndex}
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
                onClose={onClose}
                commentsShift={commentsShift}
                commentsScale={commentsScale}
              />
            )}
          />
        
          {/* Header (Absolute positioned over list) */}
          <SafeAreaView style={styles.absoluteHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ChevronLeft size={28} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <MoreVertical size={24} color={iconColor} />
            </TouchableOpacity>
          </SafeAreaView>
          {children}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  itemContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  mediaWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  playPauseOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 120,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
  },
  footerUsername: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  footerCaption: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  footerRight: {
    alignItems: 'center',
    gap: 20,
    paddingBottom: 0,
  },
  actionButtonVertical: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextVertical: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  actionTextLiked: {
    color: '#ef4444',
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 12,
  },
  followButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  captionSheetContainer: {
    backgroundColor: '#1e1e24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.55,
    paddingBottom: 20,
  },
  captionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  captionSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  captionSheetContent: {
    padding: 20,
  },
  captionSheetText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
    marginTop: 12,
  },
  commentsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  commentsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentsSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.65,
    paddingBottom: 20,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  commentsClose: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
  commentsCloseText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  commentsBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsPlaceholder: {
    color: '#64748b',
    fontSize: 15,
  },
  commentsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  commentsAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentsInputWrapper: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentsInputPlaceholder: {
    color: '#94a3b8',
    fontSize: 14,
  }
});
