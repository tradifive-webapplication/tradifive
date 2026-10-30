import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import '../global.css';

import { useFonts, Inter_900Black, Inter_800ExtraBold, Inter_700Bold, Inter_600SemiBold, Inter_500Medium, Inter_400Regular } from '@expo-google-fonts/inter';

// CRITICAL: Must be called at the app root BEFORE any component renders.
// This allows the in-app browser to properly dismiss after OAuth redirect.
WebBrowser.maybeCompleteAuthSession();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_900Black,
    Inter_800ExtraBold,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        if (window.innerWidth > 768) {
          window.location.href = '/';
        }
      };
      
      // Check initially
      handleResize();
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={Platform.OS === 'web' ? { maxWidth: 450, width: '100%', height: '100%', alignSelf: 'center', backgroundColor: '#000', overflow: 'hidden', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#1e293b' } : { flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="broker-connect" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="help" options={{ animation: 'none' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="user/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}
