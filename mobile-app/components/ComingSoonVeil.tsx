import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

interface ComingSoonVeilProps {
  featureTitle?: string;
  subtitle?: string;
  topOffset?: number;
}

export default function ComingSoonVeil({ topOffset }: ComingSoonVeilProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  // If topOffset is not specified, default to right below the header (insets.top + 72).
  // This ensures the top backside glow artwork and header remain 100% visible, vibrant & interactive!
  const top = topOffset !== undefined ? topOffset : insets.top + 72;

  return (
    <View
      style={[
        styles.overlayContainer,
        {
          top,
          borderTopLeftRadius: topOffset === 0 ? 0 : 36,
          borderTopRightRadius: topOffset === 0 ? 0 : 36,
          overflow: 'hidden',
        },
      ]}
      pointerEvents="auto"
    >
      {/* ── NATIVE BACKDROP BLUR ── */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 70 : 85}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />

      {/* Semi-transparent frosted tint overlay across all platforms */}
      <View
        style={[
          StyleSheet.absoluteFill,
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
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    zIndex: 999999,
    elevation: 99999,
  },
});
