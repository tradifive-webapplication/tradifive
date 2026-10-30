import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../hooks/useAppTheme';

interface ComingSoonVeilProps {
  featureTitle?: string;
  subtitle?: string;
  topOffset?: number;
}

export default function ComingSoonVeil({ featureTitle, topOffset }: ComingSoonVeilProps) {
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

      {/* ── FLOATING "COMING SOON" INDICATOR BADGE ── */}
      <View style={styles.badgeWrapper} pointerEvents="none">
        <View
          style={[
            styles.badgePill,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.92)',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.40)',
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.35 : 0.08,
            },
          ]}
        >
          <View style={styles.pulseDot} />
          <Text style={[styles.badgeText, { color: isDark ? '#ffffff' : '#0f172a' }]}>
            {featureTitle ? `${featureTitle} · ` : ''}Coming Soon
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    zIndex: 999999,
    elevation: 99999,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000000,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
});
