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
        {
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          overflow: 'hidden',
        },
      ]}
      pointerEvents="none"
    >
      {/* ── NATIVE BACKDROP BLUR (Soft Intensity 10) ── */}
      <BlurView
        intensity={10}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={[
          StyleSheet.absoluteFill,
          {
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            overflow: 'hidden',
          },
        ]}
      />

      {/* Subtle translucent frosted tint so images, cards & text remain clearly visible & scrollable */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? 'rgba(9, 13, 22, 0.08)' : 'rgba(255, 255, 255, 0.10)',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            overflow: 'hidden',
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(3px)',
                  WebkitBackdropFilter: 'blur(3px)',
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
