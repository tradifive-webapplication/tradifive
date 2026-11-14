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
          borderTopLeftRadius: topOffset === 0 ? 0 : 40,
          borderTopRightRadius: topOffset === 0 ? 0 : 40,
          overflow: 'hidden',
        },
      ]}
      pointerEvents="auto"
    >
      {/* ── NATIVE BACKDROP BLUR (Soft Subtle Dark-Blue Frosted Glass Blur) ── */}
      <BlurView
        intensity={Platform.OS === 'android' ? 70 : 50}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={[
          StyleSheet.absoluteFill,
          {
            borderTopLeftRadius: topOffset === 0 ? 0 : 40,
          borderTopRightRadius: topOffset === 0 ? 0 : 40,
            overflow: 'hidden',
          },
        ]}
      />

      {/* Subtle translucent dark-blue glass tint — zero white colour, gentle blue-tinted blur */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? 'rgba(7, 13, 26, 0.58)' : 'rgba(15, 23, 42, 0.42)',
            borderTopLeftRadius: topOffset === 0 ? 0 : 40,
          borderTopRightRadius: topOffset === 0 ? 0 : 40,
            borderWidth: 1,
            borderColor: 'rgba(56, 189, 248, 0.18)',
            overflow: 'hidden',
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                } as any)
              : {}),
          },
        ]}
      />

      {/* ── FIXED "COMING SOON" INDICATOR IN MIDDLE OF PAGE ── */}
      <View style={styles.badgeWrapper}>
        <View
          style={[
            styles.badgePill,
            {
              backgroundColor: 'rgba(10, 20, 38, 0.94)',
              borderColor: 'rgba(56, 189, 248, 0.55)',
              shadowColor: '#000',
              shadowOpacity: 0.45,
            },
          ]}
        >
          <View style={styles.pulseDot} />
          <Text style={[styles.badgeText, { color: '#ffffff' }]}>
            {featureTitle ? `${featureTitle} · ` : ''}Coming Soon
          </Text>
        </View>

        {subtitle ? (
          <Text
            style={[
              styles.badgeSubtitle,
              { color: 'rgba(186, 215, 248, 0.90)' },
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
    paddingBottom: 0,
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
