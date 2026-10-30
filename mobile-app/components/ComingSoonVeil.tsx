import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Sparkles, ArrowRight, Activity, Home } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface ComingSoonVeilProps {
  featureTitle: string;
  subtitle?: string;
}

export default function ComingSoonVeil({ featureTitle, subtitle }: ComingSoonVeilProps) {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const hSelect = () => {
    try {
      if (Platform.OS !== 'web') Haptics.selectionAsync();
    } catch (e) {}
  };

  return (
    <View style={styles.overlayContainer} pointerEvents="auto">
      {/* ── NATIVE BACKDROP BLUR ── */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 95}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Semi-transparent frosted tint overlay to guarantee 100% visible depth across all platforms */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: isDark ? 'rgba(9, 13, 22, 0.82)' : 'rgba(244, 246, 251, 0.85)',
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                } as any)
              : {}),
          },
        ]}
      />

      {/* ── DEAD-CENTERED FROSTED CARD ── */}
      <View style={styles.centerWrapper} pointerEvents="box-none">
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(17, 22, 37, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0, 0, 0, 0.1)',
              shadowColor: isDark ? '#000000' : '#0f172a',
            },
          ]}
        >
          {/* Status Badge */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.4)',
              },
            ]}
          >
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>COMING SOON</Text>
            <Sparkles size={11} color="#f59e0b" />
          </View>

          {/* Feature Title */}
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0f172a' }]}>
            {featureTitle}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            {subtitle || "We're actively finalizing this module for public launch. In the meantime, explore live Auto Trade or our community feed."}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonStack}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                hSelect();
                router.push('/(tabs)/auto-trade-setup' as any);
              }}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: '#38bdf8',
                },
              ]}
            >
              <Activity size={16} color="#0f172a" strokeWidth={2.5} />
              <Text style={[styles.primaryBtnText, { color: '#0f172a' }]}>
                Go to Auto Trade
              </Text>
              <ArrowRight size={15} color="#0f172a" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                hSelect();
                router.push({ pathname: '/(tabs)', params: { view: 'feed' } } as any);
              }}
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
                },
              ]}
            >
              <Home size={15} color={isDark ? '#e2e8f0' : '#334155'} />
              <Text style={[styles.secondaryBtnText, { color: isDark ? '#e2e8f0' : '#334155' }]}>
                View Home Feed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  centerWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000000,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    borderWidth: 1.5,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 25,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#d97706',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19.5,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 48,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    width: '100%',
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontFamily: 'Inter_600SemiBold',
  },
});
