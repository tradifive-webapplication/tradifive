import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../hooks/useAppTheme';

interface ComingSoonVeilProps {
  featureTitle?: string;
  subtitle?: string;
}

export default function ComingSoonVeil({}: ComingSoonVeilProps) {
  const { isDark } = useAppTheme();

  return (
    <View style={styles.overlayContainer} pointerEvents="auto">
      {/* ── NATIVE BACKDROP BLUR ── */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 70 : 85}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Semi-transparent frosted tint overlay across all platforms */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: isDark ? 'rgba(9, 13, 22, 0.45)' : 'rgba(244, 246, 251, 0.55)',
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                } as any)
              : {}),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 999999,
    elevation: 99999,
  },
});
