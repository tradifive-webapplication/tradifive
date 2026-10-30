import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../hooks/useAppTheme';

interface ComingSoonVeilProps {
  featureTitle?: string;
  subtitle?: string;
  topOffset?: number;
}

export default function ComingSoonVeil({ topOffset }: ComingSoonVeilProps) {
  const { isDark } = useAppTheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.overlayContainer,
        topOffset !== undefined && { top: topOffset },
      ]}
      pointerEvents="auto"
    >
      {/* ── NATIVE BACKDROP BLUR (Soft Intensity 15) ── */}
      <BlurView
        intensity={15}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle translucent frosted tint so images, cards & text remain clearly visible */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? 'rgba(9, 13, 22, 0.12)' : 'rgba(255, 255, 255, 0.15)',
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
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
    zIndex: 999999,
    elevation: 99999,
  },
});
