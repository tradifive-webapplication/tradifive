import { supabase } from '../utils/supabase';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Required by WebBrowser to cleanly dismiss the in-app modal and return to the application on redirect
try {
  WebBrowser.maybeCompleteAuthSession();
} catch (e) {}

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
          email: 'demo@tradifive.in',
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
    const { Platform } = require('react-native');
    const Constants = require('expo-constants').default;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return `${window.location.origin}/auth-callback`;
      }
      return 'https://www.tradifive.in/auth-callback';
    }

    // Check if running inside Expo Go client vs Standalone / Development build
    const isExpoGo = Constants?.appOwnership === 'expo' || Constants?.executionEnvironment === 'storeClient';

    if (isExpoGo) {
      // In Expo Go, custom native schemes (like mobileapp://) are not registered in AndroidManifest.
      // Expo Go requires an exp:// redirect URI to route back into the active Expo Go session.
      const expoRedirectUrl = AuthSession.makeRedirectUri({
        path: 'auth-callback',
      });
      console.log('[AuthService] Expo Go Redirect URL:', expoRedirectUrl);
      return expoRedirectUrl;
    }

    // On standalone native mobile (Standalone APK / iOS App):
    // Use the registered app scheme 'mobileapp' with path 'auth-callback'
    const appRedirectUrl = AuthSession.makeRedirectUri({
      scheme: 'mobileapp',
      path: 'auth-callback',
    });
    console.log('[AuthService] Standalone Mobile App Redirect URL:', appRedirectUrl);
    return appRedirectUrl;
  }

  static async verifyOtp(email: string, otp: string) {
    const cleanToken = otp.trim();
    const cleanEmail = email.trim();
    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup'
    });
    // Dual fallback: also try 'email' type if 'signup' type fails
    if (error) {
      const fallback = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }
    if (error) throw new Error(error.message);
    return data;
  }

  static async resendOtp(email: string) {
    const appRedirectUrl = this.getRedirectUrl();
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: appRedirectUrl,
      }
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
    
    // 2. Proactively insert into profiles if database triggers are not configured yet
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

    // --- MOBILE FLOW (Expo Go + Standalone iOS/Android) ---
    const nativeCallbackUrl = this.getRedirectUrl();
    console.log('[AuthService] Mobile App Native Callback URL:', nativeCallbackUrl);

    // Direct Native Redirect:
    // Pass nativeCallbackUrl directly so Google OAuth redirects straight back into the mobile app
    // (exp:// for Expo Go, mobileapp:// for standalone APK) without ever opening or loading any webpage!
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: nativeCallbackUrl,
        skipBrowserRedirect: true,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error('No Google Authorization URL was generated.');

    console.log('[AuthService] Opening Google auth URL in browser...');

    // Open Google login in an in-app browser and wait for the native redirect.
    // When Supabase redirects to nativeCallbackUrl, openAuthSessionAsync immediately
    // captures the URL, automatically CLOSES the browser, and returns the auth code into the app!
    let result: WebBrowser.WebBrowserAuthSessionResult;
    try {
      const authPromise = WebBrowser.openAuthSessionAsync(data.url, nativeCallbackUrl);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Google authentication timed out. Please try again.')), 75000)
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
      console.log('[AuthService] Browser was dismissed/cancelled. Verifying if session was captured via deep link...');
      // Poll for up to 3.5 seconds to allow background deep-link PKCE exchange to complete
      for (let i = 0; i < 7; i++) {
        await new Promise(r => setTimeout(r, 500));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[AuthService] Active session found after browser dismissal! Login successful.');
          return data;
        }
      }
      throw new Error('Google login was cancelled.');
    }

    if (result.type === 'success' && result.url) {
      const { params, errorCode } = parseQueryString(result.url);
      if (errorCode) throw new Error(`Auth callback error: ${errorCode}`);

      // 1. Try PKCE code exchange (Standard in Supabase v2)
      if (params.code) {
        console.log('[AuthService] Found PKCE code, exchanging for session...');
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(params.code);
        if (sessionError) {
          console.warn('[AuthService] PKCE exchange warning:', sessionError.message);
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error(sessionError.message);
        } else {
          console.log('[AuthService] Session established successfully via PKCE!');
        }
      } else if (params.access_token && params.refresh_token) {
        // 2. Implicit Flow tokens fallback
        console.log('[AuthService] Setting Supabase session from implicit tokens...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (sessionError) throw new Error(sessionError.message);
        console.log('[AuthService] Session established successfully via implicit flow!');
      } else {
        // 3. Fallback check: see if session is already active
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('[AuthService] No tokens or PKCE code found in callback URL. Full URL:', result.url);
          throw new Error('Authentication completed but no session tokens were received. Check your Supabase URL Redirect settings.');
        }
      }

      // Proactively ensure profile exists
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userMeta = user.user_metadata || {};
          const firstName = userMeta.first_name || userMeta.full_name?.split(' ')[0] || userMeta.name?.split(' ')[0] || 'Trader';
          const lastName = userMeta.last_name || userMeta.full_name?.split(' ').slice(1).join(' ') || '';
          const defaultUsername = (user.email ? user.email.split('@')[0] : `user_${user.id.substring(0, 6)}`).toLowerCase().replace(/[^a-z0-9_]/g, '');

          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            display_name: userMeta.full_name || `${firstName} ${lastName}`.trim(),
            username: defaultUsername,
            avatar_url: userMeta.avatar_url || userMeta.picture || `https://api.dicebear.com/7.x/adventurer/png?seed=${firstName}`,
          }, { onConflict: 'id', ignoreDuplicates: true });
        }
      } catch (profErr) {
        console.warn('[AuthService] Profile auto-create non-blocking warning:', profErr);
      }

      return data;
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
      try {
        supabase.removeAllChannels();
      } catch (subErr) {
        console.warn('[Cleanup Subscriptions on SignOut Error]:', subErr);
      }
    } catch (e) {
      console.warn('[SignOut Local Reset Warning]:', e);
    }

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
      } else {
        console.log('[AuthService] Profile username updated successfully in DB');
      }
    } catch (profileErr: any) {
      console.warn('[AuthService] Profile DB update failed or timed out:', profileErr.message);
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

// Custom Helper to extract tokens and code from deep-link callback URL
function parseQueryString(url: string) {
  const params: Record<string, string> = {};
  let errorCode: string | null = null;

  try {
    // 1. Parse Query parameters (?key=val)
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const queryStr = url.substring(queryIndex + 1).split('#')[0];
      const pairs = queryStr.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k && v) {
          params[decodeURIComponent(k)] = decodeURIComponent(v);
        }
      }
    }

    // 2. Parse Hash parameters (#key=val)
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hashStr = url.substring(hashIndex + 1);
      const pairs = hashStr.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k && v) {
          const key = decodeURIComponent(k);
          const val = decodeURIComponent(v);
          if (!params[key] || val) {
            params[key] = val;
          }
        }
      }
    }

    if (params.error) {
      errorCode = params.error_description || params.error;
    }
  } catch (e: any) {
    console.warn('[parseQueryString Error]:', e);
  }

  return { params, errorCode };
}
