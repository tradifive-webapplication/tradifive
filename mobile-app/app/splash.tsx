import React, { useEffect, useState, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './store';
import { AuthService } from './services/auth.service';

const { width, height } = Dimensions.get('window');

const topGlowSource = require('../assets/images/top-glow.png');
const topGlowAsset = typeof (Image as any)?.resolveAssetSource === 'function' ? (Image as any).resolveAssetSource(topGlowSource) : null;
const topGlowHeight = topGlowAsset?.width ? (width * topGlowAsset.height) / topGlowAsset.width : Math.round((width * 571) / 1134);

const bottomGlowSource = require('../assets/images/bottom-glow.png');
const bottomGlowAsset = typeof (Image as any)?.resolveAssetSource === 'function' ? (Image as any).resolveAssetSource(bottomGlowSource) : null;
const bottomGlowHeight = bottomGlowAsset?.width ? (width * bottomGlowAsset.height) / bottomGlowAsset.width : Math.round((width * 571) / 1134);

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [isReady, setIsReady] = useState(false);
  const [canTapToStart, setCanTapToStart] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hasSession = Object.keys(window.localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      if (hasSession) {
        router.replace('/(tabs)');
        return;
      }
    }
    
    setIsReady(true);

    // Coordinated Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 10,
        useNativeDriver: true,
      })
    ]).start();

    const checkSession = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const isBypassedVal = await AsyncStorage.getItem('tradifive_is_bypassed');
        if (isBypassedVal === 'true') {
          AuthService.isBypassed = true;
          useStore.getState().setBypassed(true);
          useStore.getState().init().catch((e) => console.warn('[Init Error]:', e));
          router.replace('/(tabs)');
          return;
        }

        // Start init in the background so it doesn't block routing
        useStore.getState().init().catch((e) => console.warn('[Init Error]:', e));
        
        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          router.replace('/(tabs)');
        } else {
          // Instead of setTimeout, allow the user to tap to continue
          setCanTapToStart(true);
        }
      } catch (err) {
        console.warn('[SplashScreen Session Error]:', err);
        setCanTapToStart(true);
      }
    };

    checkSession();

    // No timer to clear, but we return a no-op cleanup
    return () => {};
  }, []);

  if (!isReady) {
    return <View style={styles.fallbackContainer} />;
  }

  const handlePress = () => {
    if (canTapToStart) {
      router.replace('/onboarding');
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <SafeAreaView style={styles.safeArea}>
        {/* TOP GLOW */}
        <Image 
          source={topGlowSource} 
          style={styles.topGlow}
          resizeMode="contain"
        />

        {/* LOGO AREA - Breathing Animation */}
        <Animated.View style={[styles.logoContainer, { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }]}>
          {/* Logo Symbol */}
          <Image 
            source={require('../assets/images/Logo_only.png')} 
            style={styles.logoSymbol}
            resizeMode="contain"
          />
          {/* Logo Text */}
          <Image 
            source={require('../assets/images/dark-mode-logo.png')} 
            style={styles.logoText}
            resizeMode="contain"
          />
        </Animated.View>

        {/* BOTTOM GLOW */}
        <Image 
          source={bottomGlowSource} 
          style={styles.bottomGlow}
          resizeMode="contain"
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
  fallbackContainer: {
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
    height: topGlowHeight,
    opacity: 0.8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: bottomGlowHeight,
    opacity: 0.8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 0,
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
