import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from './utils/supabase';
import { useStore } from './store';

export default function AuthCallback() {
  const router = useRouter();
  const deepLinkUrl = Linking.useURL();
  const [statusText, setStatusText] = useState('Verifying secure session...');

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async (url: string | null) => {
      console.log('[AuthCallback] Processing deep link URL:', url);
      try {
        if (url) {
          const parsed = parseUrl(url);
          if (parsed.error) {
            console.error('[AuthCallback] URL contained error:', parsed.error, parsed.errorDescription);
            Alert.alert('Verification Failed', parsed.errorDescription || parsed.error);
            if (isMounted) router.replace('/login');
            return;
          }

          // 1. Handle PKCE code exchange
          if (parsed.code) {
            setStatusText('Exchanging security token...');
            console.log('[AuthCallback] Found PKCE code, exchanging...');
            const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(parsed.code);
            if (exchangeErr) {
              console.warn('[AuthCallback] PKCE exchange warning:', exchangeErr.message);
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) throw exchangeErr;
            } else {
              console.log('[AuthCallback] PKCE session exchange succeeded!');
            }
          }
          // 2. Handle implicit tokens
          else if (parsed.accessToken && parsed.refreshToken) {
            setStatusText('Setting up your account...');
            console.log('[AuthCallback] Setting session from implicit tokens...');
            const { error: sessionErr } = await supabase.auth.setSession({
              access_token: parsed.accessToken,
              refresh_token: parsed.refreshToken,
            });
            if (sessionErr) throw sessionErr;
            console.log('[AuthCallback] Implicit token session set succeeded!');
          }
        }

        // Verify we now have an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('[AuthCallback] No session found, redirecting to login');
          if (isMounted) router.replace('/login');
          return;
        }

        // Proactively ensure profile exists
        try {
          if (session.user) {
            const user = session.user;
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
          console.warn('[AuthCallback] Profile creation warning:', profErr);
        }

        // Initialize the global store session
        setStatusText('Syncing settings...');
        await useStore.getState().init();

        // Route to tabs
        if (isMounted) {
          console.log('[AuthCallback] Success! Routing to tabs...');
          router.replace('/(tabs)');
        }
      } catch (err: any) {
        console.error('[AuthCallback Error]:', err);
        Alert.alert('Verification Error', err.message || 'An error occurred during verification.');
        if (isMounted) router.replace('/login');
      }
    };

    const init = async () => {
      if (deepLinkUrl) {
        await handleAuth(deepLinkUrl);
      } else {
        const initialUrl = await Linking.getInitialURL();
        await handleAuth(initialUrl);
      }
    };

    init();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[AuthCallback] Linking url event listener received:', url);
      handleAuth(url);
    });

    const safetyTimer = setTimeout(() => {
      console.warn('[AuthCallback] Safety timeout reached, checking session or redirecting');
      if (isMounted) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            useStore.getState().init().then(() => router.replace('/(tabs)'));
          } else {
            router.replace('/login');
          }
        });
      }
    }, 12000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.remove();
    };
  }, [deepLinkUrl]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.loadingText}>{statusText}</Text>
    </View>
  );
}

function parseUrl(url: string) {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let code: string | null = null;
  let error: string | null = null;
  let errorDescription: string | null = null;

  try {
    // Query params (?key=val)
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const queryStr = url.substring(queryIndex + 1).split('#')[0];
      const pairs = queryStr.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (!k || !v) continue;
        const key = decodeURIComponent(k);
        const val = decodeURIComponent(v);
        if (key === 'code') code = val;
        else if (key === 'access_token') accessToken = val;
        else if (key === 'refresh_token') refreshToken = val;
        else if (key === 'error') error = val;
        else if (key === 'error_description') errorDescription = val;
      }
    }

    // Hash fragment (#key=val)
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hashStr = url.substring(hashIndex + 1);
      const pairs = hashStr.split('&');
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (!k || !v) continue;
        const key = decodeURIComponent(k);
        const val = decodeURIComponent(v);
        if (key === 'code' && !code) code = val;
        else if (key === 'access_token') accessToken = val;
        else if (key === 'refresh_token') refreshToken = val;
        else if (key === 'error' && !error) error = val;
        else if (key === 'error_description' && !errorDescription) errorDescription = val;
      }
    }
  } catch (e) {
    console.warn('[parseUrl error]:', e);
  }

  return { code, accessToken, refreshToken, error, errorDescription };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});
