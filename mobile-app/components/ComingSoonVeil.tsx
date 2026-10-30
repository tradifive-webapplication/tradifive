import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../hooks/useAppTheme';

interface ComingSoonVeilProps {
  featureTitle?: string;
  subtitle?: string;
  topOffset?: number;
}

export default function ComingSoonVeil({ featureTitle, subtitle, topOffset }: ComingSoonVeilProps) {
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

      {/* ── FIXED "COMING SOON" INDICATOR IN MIDDLE OF PAGE (PERSISTS ON SCROLL) ── */}
      <View style={styles.badgeWrapper} pointerEvents="none">
        <View
          style={[
            styles.badgePill,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.40)' : 'rgba(56, 189, 248, 0.45)',
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.45 : 0.12,
            },
          ]}
        >
          <View style={styles.pulseDot} />
          <Text style={[styles.badgeText, { color: isDark ? '#ffffff' : '#0f172a' }]}>
            {featureTitle ? `${featureTitle} · ` : ''}Coming Soon
          </Text>
        </View>

        {subtitle ? (
          <Text
            style={[
              styles.badgeSubtitle,
              { color: isDark ? 'rgba(226, 232, 240, 0.85)' : 'rgba(71, 85, 105, 0.85)' },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
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
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40, // Optical center above bottom floating navigation bar
    zIndex: 1000000,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 8,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38bdf8',
  },
  badgeText: {
    fontSize: 13.5,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  badgeSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    maxWidth: 290,
    marginTop: 10,
    lineHeight: 18,
  },
});
