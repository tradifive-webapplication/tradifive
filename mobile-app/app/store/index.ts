import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { TradingService, MT5Account, Trade } from '../services/trading.service';
import { NotificationsService, Notification } from '../services/notifications.service';
import { ChannelsService, Channel } from '../services/channels.service';
import { setHeaderStyle } from '../utils/headerStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth.service';

export interface NotificationSetting {
  id: string;
  label: string;
  push: boolean;
  app: boolean;
  email: boolean;
}

export interface UserPreferences {
  headerStyle: 'top_glow' | 'normal' | 'simple';
  hapticsEnabled: boolean;
  compactMode: boolean;
  darkModeOverride: boolean;
  locationPermissionEnabled: boolean;
  systemThemeMode: 'auto' | 'light' | 'dark';
  twoFactor: boolean;
  biometric: boolean;
  notifs: {
    trading: NotificationSetting[];
    account: NotificationSetting[];
    ai: NotificationSetting[];
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  headerStyle: 'top_glow',
  hapticsEnabled: true,
  compactMode: false,
  darkModeOverride: false,
  locationPermissionEnabled: false,
  systemThemeMode: 'light',
  twoFactor: false,
  biometric: true,
  notifs: {
    trading: [
      { id: 'risk', label: 'Risk Guard Warnings', push: true, app: true, email: false },
      { id: 'trade', label: 'Trade Executed', push: true, app: true, email: true },
      { id: 'limit', label: 'Daily Limit Reached', push: true, app: true, email: true },
    ],
    account: [
      { id: 'challenge', label: 'Challenge Status Updates', push: true, app: true, email: true },
      { id: 'billing', label: 'Billing & Subscriptions', push: false, app: true, email: true },
      { id: 'security', label: 'Security & Login Alerts', push: true, app: true, email: true },
    ],
    ai: [
      { id: 'insights', label: 'Market Insights (AI)', push: true, app: true, email: false },
      { id: 'coach', label: 'AI Coach Tips', push: true, app: true, email: true },
      { id: 'updates', label: 'System Updates', push: false, app: true, email: false },
    ],
  }
};

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  username?: string;
  created_at: string;
  has_chosen_username?: boolean;
  display_name?: string;
  bio?: string;
  banner_url?: string;
  tags?: string[];
  preferences?: UserPreferences;
  account_type?: string;
  is_private?: boolean;
  country?: string;
  state?: string;
  city?: string;
  phone_number?: string;
  account_standing?: 'GOOD' | 'WARNING' | 'RESTRICTED' | 'BANNED';
  standing_message?: string | null;
  subscription_status?: string;
  xp_total?: number;
  xp_level?: number;
  streak_days?: number;
  referral_code?: string;
  website?: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles?: UserProfile;
  is_liked?: boolean;
}

interface AppState {
  currentUser: UserProfile | null;
  hasRealSession: boolean;
  isBypassed: boolean;
  setBypassed: (bypassed: boolean) => void;
  posts: Post[];
  mt5Account: MT5Account | null;
  trades: Trade[];
  notifications: Notification[];
  channels: Channel[];
  loading: boolean;
  init: () => Promise<void>;
  updateUsernameState: (username: string) => void;
  updateProfileState: (displayName: string, bio: string, bannerUrl?: string, avatarUrl?: string, tags?: string[], accountType?: string, isPrivate?: boolean, country?: string, state?: string, city?: string, username?: string, firstName?: string, lastName?: string, phone?: string, email?: string) => void;
  setAccountType: (type: string) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  fetchPosts: () => Promise<void>;
  createPost: (content: string, media_url?: string, media_type?: 'image' | 'video') => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string, shouldLike?: boolean) => Promise<void>;
  setupSubscriptions: () => void;
  fetchTradingData: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchChannels: () => Promise<void>;
  toggleAlgoStatus: (newState: boolean) => Promise<void>;
  locationPermissionEnabled: boolean;
  setLocationPermissionEnabled: (enabled: boolean) => void;
  getFollowerCount: () => number;
  getFollowingCount: () => number;
  getOwnPostsCount: () => number;
  followerCount: number;
  followingIds: string[];
  fetchFollowStats: () => Promise<void>;
  followUser: (targetId: string) => Promise<void>;
  unfollowUser: (targetId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  hasRealSession: false,
  isBypassed: false,
  setBypassed: (bypassed) => set({ isBypassed: bypassed }),
  posts: [],
  mt5Account: null,
  trades: [],
  notifications: [],
  channels: [],
  loading: false,
  locationPermissionEnabled: false,
  setLocationPermissionEnabled: (enabled) => {
    set({ locationPermissionEnabled: enabled });
    get().updatePreferences({ locationPermissionEnabled: enabled });
  },

  updatePreferences: async (prefs) => {
    const user = get().currentUser;
    if (!user) return;

    const currentPrefs = user.preferences || DEFAULT_PREFERENCES;
    const updatedPrefs = {
      ...currentPrefs,
      ...prefs,
      notifs: prefs.notifs ? { ...currentPrefs.notifs, ...prefs.notifs } : currentPrefs.notifs,
    };

    if (prefs.headerStyle) {
      setHeaderStyle(prefs.headerStyle);
    }

    // Update local state
    set((state) => {
      const updatedUser = state.currentUser
        ? { ...state.currentUser, preferences: updatedPrefs }
        : null;
      return {
        currentUser: updatedUser,
        locationPermissionEnabled: updatedPrefs.locationPermissionEnabled ?? state.locationPermissionEnabled,
      };
    });

    // Save to DB if not bypassed
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ preferences: updatedPrefs })
          .eq('id', user.id);
        
        if (error) {
          console.warn('[Store Preferences Sync Error]:', error.message);
        }
      } catch (err) {
        console.warn('[Store Preferences Sync Error]:', err);
      }
  },

  followerCount: 0,
  followingIds: [],

  getFollowerCount: () => get().followerCount,

  getFollowingCount: () => get().followingIds.length,

  getOwnPostsCount: () => {
    const user = get().currentUser;
    if (!user) return 0;
    return get().posts.filter(p => p.user_id === user.id).length;
  },

  init: async () => {
    // Always fetch public social posts & channels immediately so users (including guests and bypassed) see feed right away
    get().fetchPosts().catch(err => console.warn('[fetchPosts Error]:', err));
    get().fetchChannels().catch(err => console.warn('[fetchChannels Error]:', err));

    // Avoid double auth state listener subscription
    if ((useStore as any)._authListenerRegistered) return;
    
    (useStore as any)._authListenerRegistered = true;
    set({ loading: true });
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth State Changed]:', event, session?.user?.id);
      
      // If we are bypassed, keep public data loaded and ignore auth change unless a real session is started
      if (get().isBypassed && !session?.user) {
        set({ loading: false });
        get().fetchPosts().catch(err => console.warn('[fetchPosts Error]:', err));
        return;
      }
      
      try {
        if (session?.user) {
          set({ hasRealSession: true });
          
          let { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          
          if (!profile) {
            const email = session.user.email || '';
            const meta = session.user.user_metadata || {};
            const fullName = meta.full_name || '';
            const firstName = meta.first_name || meta.given_name || fullName.split(' ')[0] || email.split('@')[0] || 'User';
            const lastName = meta.last_name || meta.family_name || fullName.split(' ').slice(1).join(' ') || '';
            const avatarUrl = meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(email.trim().toLowerCase())}`;
            
            const newProfile = {
              id: session.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              display_name: fullName || firstName || 'New Trader',
              bio: '',
              username: (() => {
                const cleanFirst = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const cleanLast = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                let initialUsername = '';
                
                if (cleanFirst) {
                  if (cleanLast) {
                    initialUsername = `${cleanFirst}_${cleanLast}`;
                  } else {
                    initialUsername = cleanFirst;
                  }
                }

                // Ensure candidate meets criteria: 3-20 characters, lowercase, alphanumeric, underscores/dots
                if (initialUsername && initialUsername.length >= 3 && initialUsername.length <= 20) {
                  return initialUsername;
                }
                
                const emailPrefix = email.split('@')[0] || '';
                const cleanEmail = emailPrefix.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();
                if (cleanEmail && cleanEmail.length >= 3 && cleanEmail.length <= 20) {
                  return cleanEmail;
                }
                
                return `user_${session.user.id.slice(0, 5)}`;
              })(),
              avatar_url: avatarUrl,
              created_at: new Date().toISOString(),
              subscription_status: 'starter'
            };
            
            const { error: upsertError } = await supabase.from('profiles').upsert(newProfile);
            if (!upsertError) {
              profile = newProfile as any;
            }
          } else {
            const email = session.user.email || profile.email || '';
            const fallbackAvatar = `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(email.trim().toLowerCase())}`;
            const meta = session.user.user_metadata || {};
            const googleAvatar = meta.avatar_url || meta.picture;
            const targetAvatar = googleAvatar || profile.avatar_url || fallbackAvatar;

            if (targetAvatar !== profile.avatar_url) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: targetAvatar })
                .eq('id', session.user.id);
              if (!updateError) {
                profile.avatar_url = targetAvatar;
              }
            }
          }
          
          if (profile) {
            let rawPrefs = (profile as any).preferences;
            if (typeof rawPrefs === 'string') {
              try {
                rawPrefs = JSON.parse(rawPrefs);
              } catch (e) {
                rawPrefs = {};
              }
            }

            const preferences: UserPreferences = {
              ...DEFAULT_PREFERENCES,
              ...(rawPrefs || {}),
              notifs: {
                trading: [
                  ...DEFAULT_PREFERENCES.notifs.trading.map(def => {
                    const match = rawPrefs?.notifs?.trading?.find((n: any) => n.id === def.id);
                    return match ? { ...def, ...match } : def;
                  })
                ],
                account: [
                  ...DEFAULT_PREFERENCES.notifs.account.map(def => {
                    const match = rawPrefs?.notifs?.account?.find((n: any) => n.id === def.id);
                    return match ? { ...def, ...match } : def;
                  })
                ],
                ai: [
                  ...DEFAULT_PREFERENCES.notifs.ai.map(def => {
                    const match = rawPrefs?.notifs?.ai?.find((n: any) => n.id === def.id);
                    return match ? { ...def, ...match } : def;
                  })
                ],
              }
            };

            set({ 
              currentUser: { 
                ...profile, 
                has_chosen_username: profile.has_chosen_username ?? !!session.user.user_metadata?.has_chosen_username,
                banner_url: profile.banner_url || session.user.user_metadata?.banner_url || '',
                preferences,
              },
              locationPermissionEnabled: preferences.locationPermissionEnabled,
            });
            if (preferences.headerStyle) {
              setHeaderStyle(preferences.headerStyle);
            }
          }
          await Promise.all([
            get().fetchPosts(),
            get().fetchTradingData(),
            get().fetchNotifications(),
            get().fetchChannels(),
            get().fetchFollowStats()
          ]);
          
          get().setupSubscriptions();
        } else {
          set({ 
            hasRealSession: false, 
            currentUser: null,
            mt5Account: null,
            trades: [],
            notifications: [],
            followerCount: 0,
            followingIds: []
          });
          
          // Re-fetch public posts & channels for unauthenticated / guest user
          get().fetchPosts().catch(err => console.warn('[fetchPosts Error]:', err));
          get().fetchChannels().catch(err => console.warn('[fetchChannels Error]:', err));
          
          try {
            supabase.removeAllChannels();
          } catch (subErr) {
            console.warn('[Cleanup Subscriptions Error]:', subErr);
          }
        }
      } catch (error: any) {
        console.error('[Initialization Error in Listener]:', error.message);
      } finally {
        set({ loading: false });
      }
    });
  },

  updateUsernameState: (username: string) => {
    const user = get().currentUser;
    if (user) {
      set({
        currentUser: {
          ...user,
          username,
          has_chosen_username: true
        }
      });
    }
  },

  setAccountType: (type: string) => {
    const user = get().currentUser;
    if (user) {
      set({
        currentUser: {
          ...user,
          account_type: type
        }
      });
    }
  },

  updateProfileState: (displayName: string, bio: string, bannerUrl?: string, avatarUrl?: string, tags?: string[], accountType?: string, isPrivate?: boolean, country?: string, state?: string, city?: string, username?: string, firstName?: string, lastName?: string, phone?: string, email?: string) => {
    const user = get().currentUser;
    if (user) {
      const updatedUser = {
        ...user,
        display_name: displayName,
        bio: bio,
        banner_url: bannerUrl || '',
        avatar_url: avatarUrl !== undefined ? avatarUrl : user.avatar_url,
        tags: tags !== undefined ? tags : user.tags,
        account_type: accountType !== undefined ? accountType : user.account_type,
        is_private: isPrivate !== undefined ? isPrivate : user.is_private,
        country: country !== undefined ? country : user.country,
        state: state !== undefined ? state : user.state,
        city: city !== undefined ? city : user.city,
        username: username !== undefined ? username : user.username,
        first_name: firstName !== undefined ? firstName : user.first_name,
        last_name: lastName !== undefined ? lastName : user.last_name,
        phone_number: phone !== undefined ? phone : user.phone_number,
        email: email !== undefined ? email : user.email
      };
      
      set({
        currentUser: updatedUser,
        posts: get().posts.map(post => {
          if (post.user_id === user.id) {
            return {
              ...post,
              profiles: post.profiles ? {
                ...post.profiles,
                ...updatedUser
              } : undefined
            };
          }
          return post;
        })
      });
    }
  },

  setupSubscriptions: () => {
    const user = get().currentUser;
    
    // Clean up any existing active channels first to prevent duplicate channel subscription errors
    supabase.removeAllChannels();

    // Social Feed Listener
    supabase
      .channel('public:social_posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'social_posts' },
        async (payload) => {
          // When a new post arrives, fetch its profile data and inject it into the feed instantly!
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', (payload.new as any).user_id).single();
          const newPost = { ...payload.new as any, profiles: profile };
          set((state) => {
            // Prevent duplicates if we already created it locally
            if (state.posts.some(p => p.id === newPost.id)) return state;
            return { posts: [newPost as any, ...state.posts] };
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'social_posts' },
        (payload) => {
          set((state) => ({
            posts: state.posts.filter((p) => p.id !== payload.old.id)
          }));
        }
      )
      .subscribe();

    // Community Channels Listener
    supabase
      .channel('public:community_channels')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_channels' },
        (payload) => {
          set((state) => ({ channels: [payload.new as unknown as Channel, ...state.channels] }));
        }
      )
      .subscribe();

    // Trading Engine Listeners (Only if user exists)
    if (user) {
      supabase
        .channel(`trading_engine_${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mt5_accounts', filter: `user_id=eq.${user.id}` },
          (payload) => {
            set({ mt5Account: payload.new as unknown as MT5Account });
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` },
          (payload) => {
            set((state) => ({ trades: [payload.new as unknown as Trade, ...state.trades] }));
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            set((state) => ({ notifications: [payload.new as unknown as Notification, ...state.notifications] }));
          }
        )
        .subscribe();

      // Social Follows Listener: sync with DB in real-time on any insert/delete/update
      supabase
        .channel('public:social_follows')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'social_follows' },
          (payload: any) => {
            console.log('[Real-time Follow Event]:', payload.eventType);
            get().fetchFollowStats();
          }
        )
        .subscribe();
    }
  },

  fetchFollowStats: async () => {
    const user = get().currentUser;
    if (!user) return;


    try {
      // Get follower count
      const { count: followerCount, error: err1 } = await supabase
        .from('social_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      // Get following IDs
      const { data: followingData, error: err2 } = await supabase
        .from('social_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!err1 && !err2) {
        set({ 
          followerCount: followerCount || 0, 
          followingIds: followingData?.map(f => f.following_id) || [] 
        });
      }
    } catch (e) {
      console.error('[Fetch Follow Stats Error]:', e);
    }
  },

  followUser: async (targetId: string) => {
    const user = get().currentUser;
    if (!user) return;


    // Optimistic UI
    set(state => ({
      followingIds: [...state.followingIds, targetId]
    }));

    try {
      const { error } = await supabase
        .from('social_follows')
        .insert({ follower_id: user.id, following_id: targetId });
      
      if (error) throw error;
    } catch (e) {
      console.error('[Follow Error]:', e);
      // Revert optimistic update
      set(state => ({
        followingIds: state.followingIds.filter(id => id !== targetId)
      }));
    }
  },

  unfollowUser: async (targetId: string) => {
    const user = get().currentUser;
    if (!user) return;


    // Optimistic UI
    set(state => ({
      followingIds: state.followingIds.filter(id => id !== targetId)
    }));

    try {
      const { error } = await supabase
        .from('social_follows')
        .delete()
        .match({ follower_id: user.id, following_id: targetId });
      
      if (error) throw error;
    } catch (e) {
      console.error('[Unfollow Error]:', e);
      // Revert optimistic update
      set(state => ({
        followingIds: [...state.followingIds, targetId]
      }));
    }
  },

  fetchNotifications: async () => {
    const user = get().currentUser;
    if (!user) return;
    try {
      const notes = await NotificationsService.getNotifications(user.id);
      set({ notifications: notes || [] });
    } catch (e) {
      set({ notifications: [] });
    }
  },

  fetchChannels: async () => {
    const ch = await ChannelsService.getChannels();
    set({ channels: ch });
  },

  fetchTradingData: async () => {
    const user = get().currentUser;
    if (!user) return;


    try {
      const [account, recentTrades] = await Promise.all([
        TradingService.getAccountMetrics(user.id),
        TradingService.getRecentTrades(user.id)
      ]);
      set({ mt5Account: account, trades: recentTrades });
    } catch (e) {
      console.error('[Trading Error]', e);
    }
  },

  toggleAlgoStatus: async (newState: boolean) => {
    const user = get().currentUser;
    if (!user) return;
    // Optimistic UI Update
    set((state) => ({ 
      mt5Account: state.mt5Account ? { ...state.mt5Account, algo_status: newState } : null 
    }));
    try {
      await TradingService.toggleAlgoStatus(user.id, newState);
    } catch (e) {
      // Revert on failure
      set((state) => ({ 
        mt5Account: state.mt5Account ? { ...state.mt5Account, algo_status: !newState } : null 
      }));
    }
  },

  fetchPosts: async () => {
    set({ loading: true });
    const user = get().currentUser;


    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from('social_posts')
      .select(`
        *,
        profiles:user_id (id, first_name, last_name, avatar_url, username, display_name, bio, banner_url)
      `)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('[Supabase API Error]: Failed to fetch posts', postsError.message);
    }

    // Fetch user's likes
    let likedPostIds: string[] = [];
    if (user && postsData && postsData.length > 0) {
      const { data: likesData, error: likesError } = await supabase
        .from('social_post_likes')
        .select('post_id')
        .eq('user_id', user.id);
      
      if (!likesError && likesData) {
        likedPostIds = likesData.map((l: any) => l.post_id);
      }
    }

    const postsWithLikes = (postsData || []).map((p: any) => ({
      ...p,
      is_liked: likedPostIds.includes(p.id)
    }));

    // Sort real posts by created_at descending
    postsWithLikes.sort((a: any, b: any) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

    if (!postsError && postsData) {
      set({ posts: postsWithLikes as unknown as Post[], loading: false });
    } else {
      set({ loading: false });
    }
  },

  createPost: async (content, media_url, media_type) => {
    const user = get().currentUser;
    if (!user) {
      throw new Error("You must be logged in to create a post.");
    }


    const newPost = {
      user_id: user.id,
      content,
      media_url,
      post_type: media_type || 'text',
    };

    console.log('[Store createPost] Inserting post:', JSON.stringify(newPost));
    console.log('[Store createPost] User ID:', user.id, 'Email:', user.email);

    // Create a 10 second timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Post creation timed out after 10 seconds. Please check your internet connection and try again.')), 10000);
    });

    const insertPromise = supabase.from('social_posts').insert([newPost]).select('*, profiles(*)').single();
    
    // Race the insert against the timeout
    const { data, error } = await Promise.race([
      insertPromise,
      timeoutPromise
    ]) as any;

    if (error) {
      console.error('[Store createPost] SUPABASE ERROR:', error.message, error.code, error.details, error.hint);
      throw new Error(error.message);
    } 
    
    console.log('[Store createPost] SUCCESS! Post ID:', data?.id);
    if (data) {
      set(state => ({ posts: [data as unknown as Post, ...state.posts] }));
    }
  },

  deletePost: async (id) => {
    set(state => ({ posts: state.posts.filter(p => p.id !== id) }));
    await supabase.from('social_posts').delete().eq('id', id);
  },

  likePost: async (id, shouldLike) => {
    const user = get().currentUser;
    if (!user) return;
    
    let targetLiked = shouldLike;
    if (targetLiked === undefined) {
      targetLiked = true;
    }

    if (targetLiked) {
      set(state => ({
        posts: state.posts.map(p => p.id === id ? { ...p, likes_count: p.likes_count + 1, is_liked: true } : p)
      }));
      await supabase.from('social_post_likes').insert([{ post_id: id, user_id: user.id }]);
    } else {
      set(state => ({
        posts: state.posts.map(p => p.id === id ? { ...p, likes_count: Math.max(0, p.likes_count - 1), is_liked: false } : p)
      }));
      await supabase.from('social_post_likes').delete().eq('post_id', id).eq('user_id', user.id);
    }
  }
}));
