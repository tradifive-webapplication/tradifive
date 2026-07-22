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
      console.log('[AuthCallback] Processing URL:', url);
      try {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        if (url) {
          const parsed = parseUrl(url);
          if (parsed.error) {
            console.error('[AuthCallback] URL contained error:', parsed.error, parsed.errorDescription);
            Alert.alert('Verification Failed', parsed.errorDescription || parsed.error);
            if (isMounted) router.replace('/login');
            return;
          }
          accessToken = parsed.accessToken;
          refreshToken = parsed.refreshToken;
        }

        // Set the Supabase session if we have tokens
        if (accessToken && refreshToken) {
          setStatusText('Setting up your account...');
          console.log('[AuthCallback] Setting session from tokens...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error('[AuthCallback] setSession error:', error.message);
            throw error;
          }
          console.log('[AuthCallback] Session set successfully');
        } else {
          console.log('[AuthCallback] No tokens found in URL, checking current session...');
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.log('[AuthCallback] No session found, redirecting to login');
            if (isMounted) router.replace('/login');
            return;
          }
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

    // Run authentication logic on the current deepLinkUrl or fallback to getInitialURL
    const init = async () => {
      if (deepLinkUrl) {
        await handleAuth(deepLinkUrl);
      } else {
        const initialUrl = await Linking.getInitialURL();
        await handleAuth(initialUrl);
      }
    };

    init();

    // Safety timeout: if auth takes more than 15 seconds, redirect to login
    const safetyTimer = setTimeout(() => {
      console.warn('[AuthCallback] Safety timeout reached, redirecting to login');
      if (isMounted) {
        Alert.alert('Timeout', 'Verification timed out. Please try again.');
        router.replace('/login');
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [deepLinkUrl]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ff4d4d" />
      <Text style={styles.loadingText}>{statusText}</Text>
    </View>
  );
}

function parseUrl(url: string) {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let error: string | null = null;
  let errorDescription: string | null = null;

  // Query params
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const queryStr = url.substring(queryIndex + 1).split('#')[0];
    const pairs = queryStr.split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (!k || !v) continue;
      const key = decodeURIComponent(k);
      const val = decodeURIComponent(v);
      if (key === 'access_token') accessToken = val;
      else if (key === 'refresh_token') refreshToken = val;
      else if (key === 'error') error = val;
      else if (key === 'error_description') errorDescription = val;
    }
  }

  // Hash fragment
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    const hashStr = url.substring(hashIndex + 1);
    const pairs = hashStr.split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (!k || !v) continue;
      const key = decodeURIComponent(k);
      const val = decodeURIComponent(v);
      if (key === 'access_token') accessToken = val;
      else if (key === 'refresh_token') refreshToken = val;
      else if (key === 'error') error = val;
      else if (key === 'error_description') errorDescription = val;
    }
  }

  return { accessToken, refreshToken, error, errorDescription };
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
