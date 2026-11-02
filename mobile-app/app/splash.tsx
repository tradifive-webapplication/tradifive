import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './store';
import { AuthService } from './services/auth.service';

const { width, height } = Dimensions.get('window');

// Pre-calculate glow heights at module level (avoids recalculation on each render)
const topGlowSource = require('../assets/images/top-glow.png');
const bottomGlowSource = require('../assets/images/bottom-glow.png');

export default function SplashScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const navigateNext = (target: string) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    try {
      router.replace(target as any);
    } catch (e) {
      setTimeout(() => {
        try {
          router.replace(target as any);
        } catch (err) {}
      }, 100);
    }
  };

  useEffect(() => {
    // Immediately redirect if session exists on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hasSession = Object.keys(window.localStorage).some(
        k => k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      if (hasSession) {
        navigateNext('/(tabs)');
        return;
      }
    }

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Safety fallback: if session check takes > 1.2s, proceed to onboarding
    const safetyTimer = setTimeout(() => {
      navigateNext('/onboarding');
    }, 1200);

    const checkSession = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const isBypassedVal = await AsyncStorage.getItem('tradifive_is_bypassed');
        if (isBypassedVal === 'true') {
          clearTimeout(safetyTimer);
          AuthService.isBypassed = true;
          useStore.getState().setBypassed(true);
          useStore.getState().init().catch((e: any) => console.warn('[Init Error]:', e));
          navigateNext('/(tabs)');
          return;
        }

        // Init in background
        useStore.getState().init().catch((e: any) => console.warn('[Init Error]:', e));

        const session = await AuthService.getCurrentSession();
        clearTimeout(safetyTimer);
        if (session?.user) {
          navigateNext('/(tabs)');
        } else {
          navigateNext('/onboarding');
        }
      } catch (err) {
        clearTimeout(safetyTimer);
        console.warn('[SplashScreen Session Error]:', err);
        navigateNext('/onboarding');
      }
    };

    checkSession();

    return () => clearTimeout(safetyTimer);
  }, []);

  return (
    <Pressable style={styles.container} onPress={() => navigateNext('/onboarding')}>
      <SafeAreaView style={styles.safeArea}>
        {/* TOP GLOW */}
        <Image
          source={topGlowSource}
          style={styles.topGlow}
          resizeMode="cover"
          fadeDuration={0}
        />

        {/* LOGO AREA */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={require('../assets/images/Logo_only.png')}
            style={styles.logoSymbol}
            resizeMode="contain"
            fadeDuration={0}
          />
          <Image
            source={require('../assets/images/dark-mode-logo.png')}
            style={styles.logoText}
            resizeMode="contain"
            fadeDuration={0}
          />
        </Animated.View>

        {/* BOTTOM GLOW */}
        <Image
          source={bottomGlowSource}
          style={styles.bottomGlow}
          resizeMode="cover"
          fadeDuration={0}
        />
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    width: width,
    height: Math.round((width * 571) / 1134),
    opacity: 0.85,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: Math.round((width * 571) / 1134),
    opacity: 0.85,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoSymbol: {
    width: 50,
    height: 50,
  },
  logoText: {
    width: 180,
    height: 38,
  },
});
