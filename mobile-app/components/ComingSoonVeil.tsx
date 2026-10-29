import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../hooks/useAppTheme';

interface ComingSoonVeilProps {
  featureTitle: string;
}

export default function ComingSoonVeil({ featureTitle }: ComingSoonVeilProps) {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const hSelect = () => {
    try {
      if (Platform.OS !== 'web') Haptics.selectionAsync();
    } catch (e) {}
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Soft blur overlay */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 25 : 40}
        tint={isDark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.45)' }]}
      />

      {/* Centered Glass Card */}
      <View style={styles.centerContainer} pointerEvents="box-none">
        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(20, 22, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
          {/* Status Tag */}
          <View style={styles.tag}>
            <View style={styles.pulseDot} />
            <Text style={styles.tagText}>COMING SOON</Text>
          </View>

          {/* Feature Title */}
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0f172a' }]}>{featureTitle}</Text>

          {/* Description */}
          <Text style={[styles.desc, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            We're actively finalizing this feature for launch. In the meantime, you can explore Auto Trade or check the community feed.
          </Text>

          {/* Actions */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                hSelect();
                router.push('/(tabs)/auto-trade-setup' as any);
              }}
              style={[styles.primaryBtn, { backgroundColor: isDark ? '#ffffff' : '#0f172a' }]}
            >
              <Text style={[styles.primaryBtnText, { color: isDark ? '#0f172a' : '#ffffff' }]}>Go to Auto Trade</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hSelect();
                router.push({ pathname: '/(tabs)', params: { view: 'feed' } } as any);
              }}
              style={styles.secondaryBtn}
            >
              <Text style={[styles.secondaryBtnText, { color: isDark ? '#cbd5e1' : '#475569' }]}>View Feed →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: 14,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  tagText: {
    fontSize: 10,
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
  desc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  primaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});

