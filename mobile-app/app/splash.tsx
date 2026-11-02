import React, { useEffect, useRef } from 'react';
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
  // Start at full opacity (1) — no fade-in blur effect on Android
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Immediately redirect if session exists on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hasSession = Object.keys(window.localStorage).some(
        k => k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      if (hasSession) {
        router.replace('/(tabs)');
        return;
      }
    }

    // Only animate scale (no opacity/blur) — crisp from first frame
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    const checkSession = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const isBypassedVal = await AsyncStorage.getItem('tradifive_is_bypassed');
        if (isBypassedVal === 'true') {
          AuthService.isBypassed = true;
          useStore.getState().setBypassed(true);
          useStore.getState().init().catch((e: any) => console.warn('[Init Error]:', e));
          router.replace('/(tabs)');
          return;
        }

        // Init in background so it doesn't block routing
        useStore.getState().init().catch((e: any) => console.warn('[Init Error]:', e));

        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch (err) {
        console.warn('[SplashScreen Session Error]:', err);
        router.replace('/onboarding');
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* TOP GLOW — non-animated, renders crisp immediately */}
        <Image
          source={topGlowSource}
          style={styles.topGlow}
          resizeMode="cover"
          fadeDuration={0}
        />

        {/* LOGO AREA — scale spring only, no opacity, no blur */}
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
    </View>
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
