import { supabase } from '../utils/supabase';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Required by WebBrowser to cleanly dismiss the in-app modal and return to the application on redirect
WebBrowser.maybeCompleteAuthSession();

// Timeout helper with cleanup
const withTimeout = (promise: any, ms: number, label: string): Promise<any> => {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timer)),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    })
  ]);
};

export class AuthService {
  static isBypassed = false;

  static async getCurrentSession() {
    if (AuthService.isBypassed) {
      return {
        user: {
          id: 'mock-user-id-demo',
          email: 'demo@tradifive.com',
          user_metadata: {
            first_name: 'Demo',
            last_name: 'Trader',
            full_name: 'Demo Trader',
            username: 'demotrader',
          }
        }
      } as any;
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return session;
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async signInWithPassword(email: string, password: string) {
    return this.signInWithEmail(email, password);
  }

  static async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  static async signUp(email: string, password: string, metadata: { first_name: string; last_name: string }) {
    return this.signUpWithEmail(email, password, metadata.first_name, metadata.last_name);
  }

  static getRedirectUrl() {
    const AuthSession = require('expo-auth-session');
    // Default makeRedirectUri() is the most robust for Expo Go
    const appRedirectUrl = AuthSession.makeRedirectUri();
    console.log('[AuthService] Generated Redirect URL:', appRedirectUrl);
    return appRedirectUrl;
  }

  
  static async verifyOtp(email: string, otp: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });
    if (error) throw new Error(error.message);
    return data;
  }

  static async resendOtp(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  static async signUpWithEmail(email: string, password: string, firstName: string, lastName: string) {
    const appRedirectUrl = this.getRedirectUrl();
    console.log('[AuthService] Sign up redirect URL:', appRedirectUrl);

    // 1. Core Supabase user registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: appRedirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          username: email.split('@')[0], // Create a default username
        }
      }
    });
    
    if (error) throw new Error(error.message);
    
    // 2. Proactively insert into profiles if database triggers are not configured yet,
    // ensuring the user's profile exists immediately for live feeds/chats.
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        display_name: '',
        bio: '',
        username: email.split('@')[0],
        email: email,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/png?seed=${firstName}`
      });
      if (profileError) console.warn('[Profile Upsert Error]:', profileError.message);
    }

    return data;
  }

  static async resetPasswordForEmail(email: string) {
    const appRedirectUrl = this.getRedirectUrl();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: appRedirectUrl,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      // This checks the public profiles table for the email.
      // Make sure the 'profiles' table has an 'email' column and is readable.
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();
      
      if (error) {
        console.log('[checkEmailExists] Error checking email:', error.message);
        return false;
      }
      return !!data;
    } catch (e) {
      return false;
    }
  }

  static async signInWithGoogle() {
    const { Platform } = require('react-native');

    if (Platform.OS === 'web') {
      // --- WEB FLOW ---
      // On web, let Supabase handle the browser redirect natively
      const appRedirectUrl = this.getRedirectUrl();
      console.log('[AuthService] Web Redirect URL:', appRedirectUrl);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: appRedirectUrl,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw new Error(error.message);
      return data;
    }

    // --- MOBILE FLOW (Expo Go + Production) ---
    // The exp:// or mobileapp:// URL is used by WebBrowser to know when to dismiss the in-app browser.
    const appRedirectUrl = this.getRedirectUrl();
    console.log('[AuthService] Mobile App Redirect URL:', appRedirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: appRedirectUrl,
        skipBrowserRedirect: true,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error('No Google Authorization URL was generated.');

    console.log('[AuthService] Opening Google auth URL in browser...');

    // Open Google login in an in-app browser and wait for the redirect.
    // Timeout after 60 seconds to prevent infinite loading.
    let result: WebBrowser.WebBrowserAuthSessionResult;
    try {
      const authPromise = WebBrowser.openAuthSessionAsync(data.url, appRedirectUrl);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Google authentication timed out. Please try again.')), 60000)
      );
      result = await Promise.race([authPromise, timeoutPromise]);
    } catch (timeoutErr: any) {
      try { WebBrowser.dismissBrowser(); } catch (_) {}
      throw timeoutErr;
    }

    console.log('[AuthService] Browser result type:', result.type);
    if ('url' in result) {
      console.log('[AuthService] Browser result URL:', result.url?.substring(0, 100) + '...');
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Google login was cancelled.');
    }

    if (result.type === 'success' && result.url) {
      // Try query string first (parseQueryString handles both # and ? formats)
      const { params, errorCode } = parseQueryString(result.url);
      if (errorCode) throw new Error(`Auth callback error: ${errorCode}`);

      // 1. Try PKCE code exchange (Default in Supabase v2)
      if (params.code) {
        console.log('[AuthService] Found PKCE code, exchanging for session...');
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(params.code);
        if (sessionError) throw new Error(sessionError.message);
        console.log('[AuthService] Session established successfully via PKCE!');
        return data;
      }

      // 2. Fallback to Implicit Flow parsing (Legacy)
      let accessToken = params.access_token;
      let refreshToken = params.refresh_token;

      // Raw hash fragment parsing fallback (exp:// and mobileapp:// sometimes can't use URL constructor)
      if (!accessToken || !refreshToken) {
        const hashIndex = result.url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = result.url.substring(hashIndex + 1);
          const pairs = hash.split('&');
          for (const pair of pairs) {
            const [k, v] = pair.split('=');
            if (k && v) {
              const key = decodeURIComponent(k);
              const val = decodeURIComponent(v);
              if (key === 'access_token') accessToken = val;
              if (key === 'refresh_token') refreshToken = val;
            }
          }
        }
      }

      if (accessToken && refreshToken) {
        console.log('[AuthService] Setting Supabase session from implicit tokens...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw new Error(sessionError.message);
        console.log('[AuthService] Session established successfully via implicit flow!');
      } else {
        console.warn('[AuthService] No tokens or PKCE code found in callback URL. Full URL:', result.url);
        throw new Error('Authentication completed but no session tokens were received. Check your Supabase URL Redirect settings.');
      }
    }

    return data;
  }

  static async signOut() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('tradifive_is_bypassed');
    } catch (e) {
      console.warn('[SignOut Storage Warning]:', e);
    }
    AuthService.isBypassed = false;
    
    try {
      const { useStore } = require('../store');
      useStore.setState({ 
        currentUser: null, 
        hasRealSession: false,
        isBypassed: false,
        posts: [],
        channels: [],
        mt5Account: null,
        trades: [],
        notifications: [],
        followerCount: 0,
        followingIds: []
      });
      // Try to clean up real-time subscriptions immediately as well
      try {
        supabase.removeAllChannels();
      } catch (subErr) {
        console.warn('[Cleanup Subscriptions on SignOut Error]:', subErr);
      }
    } catch (e) {
      console.warn('[SignOut Local Reset Warning]:', e);
    }

    // Call Supabase signOut in the background without awaiting it to avoid blocking logout transitions
    supabase.auth.signOut().catch((e: any) => {
      console.warn('[Background Supabase SignOut Warning]:', e.message);
    });
  }

  static async checkUsernameExists(username: string, excludeUserId?: string) {

    try {
      const { useStore } = require('../store');
    } catch (e) {
      console.warn('[Bypass Check Warning]:', e);
    }

    const cleanUsername = username.toLowerCase().trim();
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query.maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return !!data;
  }

  static async updateUsername(userId: string, username: string) {
    const cleanUsername = username.toLowerCase().trim();

    // 1. Update profiles table (8-second timeout — generous for slow connections)
    try {
      const { error: profileError } = await withTimeout(
        supabase
          .from('profiles')
          .update({ username: cleanUsername, has_chosen_username: true })
          .eq('id', userId),
        8000,
        'Profile update'
      );
      if (profileError) {
        console.warn('[AuthService] Profile update returned error:', profileError.message);
        // Don't throw — let the caller proceed with local state update
      } else {
        console.log('[AuthService] Profile username updated successfully in DB');
      }
    } catch (profileErr: any) {
      console.warn('[AuthService] Profile DB update failed or timed out:', profileErr.message);
      // Don't re-throw — let the caller proceed with local state update
    }


  }

  static async updateProfile(userId: string, displayName: string, bio: string, bannerUrl?: string, avatarUrl?: string) {
    const updates: any = {
      display_name: displayName,
      bio: bio,
    };

    if (avatarUrl !== undefined) {
      updates.avatar_url = avatarUrl;
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (dbError) throw new Error(dbError.message);

    if (bannerUrl !== undefined) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error: authError } = await supabase.auth.updateUser({
            data: { banner_url: bannerUrl }
          });
          if (authError) console.warn('[Auth Update Error]:', authError.message);
        }
      } catch (e) {
        console.warn('[Auth Update Warning]: Failed to update banner auth metadata', e);
      }
    }
  }

  static onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}

// Custom Helper to extract tokens from deep-link callback URL
function parseQueryString(url: string) {
  const params: Record<string, string> = {};
  let errorCode = null;

  // Handle both hash and query parameters (Supabase sends OAuth credentials after '#' hash fragment)
  const splitted = url.split('#');
  const queryPart = splitted.length > 1 ? splitted[1] : url.split('?')[1];

  if (queryPart) {
    const pairs = queryPart.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
  }

  if (params.error) {
    errorCode = params.error_description || params.error;
  }

  return { params, errorCode };
}
