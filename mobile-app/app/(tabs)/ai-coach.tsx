import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Bell,
  Sparkles,
  Brain,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Zap,
  BarChart2,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import ComingSoonVeil from '../../components/ComingSoonVeil';

const hSelect = () => {
  try {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  } catch (e) {}
};

export default function AiCoachScreen() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [headerStyle] = useState<HeaderStyle>(getHeaderStyle());

  // Butter-smooth whole-page native scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;
  const maxHeaderScroll = Math.max(0, (headerStyle === 'simple' ? insets.top + 74 : insets.top + 104) - insets.top);
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, maxHeaderScroll],
    outputRange: [0, -maxHeaderScroll],
    extrapolate: 'clamp',
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : (headerStyle === 'simple' ? '#f4f4f6' : '#000000') }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── BACKSIDE CONTAINER: INTERACTION & GESTURES FULLY DISABLED ── */}
      <View style={{ flex: 1 }} pointerEvents="none">
        {/* Top Background Glow Image */}
        {headerStyle !== 'simple' && (
          <Image
            source={require('../../assets/images/top-glow.png')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              width: '100%',
              height: insets.top + 170,
              zIndex: 0,
              opacity: 0.95,
            }}
            resizeMode="stretch"
          />
        )}

        {/* ── HEADER ── */}
        <Animated.View
          style={[
            styles.header,
            {
              zIndex: 10,
              height: headerStyle === 'simple' ? insets.top + 74 : insets.top + 104,
              backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#ffffff') : 'transparent',
              borderBottomWidth: headerStyle === 'simple' && !isDark ? 1 : 0,
              borderBottomColor: isDark ? theme.cardBorder : '#e2e8f0',
              position: 'relative',
              transform: headerStyle === 'simple' ? [] : [{ translateY: headerTranslateY }],
            },
          ]}
        >
          {headerStyle !== 'simple' && (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
          )}

          {/* Content Row */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: headerStyle === 'simple' ? 16 : 38,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
            }}
          >
            <View>
              <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#ffffff', letterSpacing: -0.5 }}>
                AI Coach
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
              <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#ffffff'} />
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* ── MAIN CONTENT CARD (Non-interactive Background) ── */}
        <Animated.View
          style={[
            styles.card,
            {
              marginTop: headerStyle === 'simple' ? 0 : -34,
              borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40,
              borderTopRightRadius: headerStyle === 'simple' ? 0 : 40,
              backgroundColor: isDark ? theme.background : '#f8fafc',
              transform: headerStyle === 'simple' ? [] : [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 160, paddingTop: 18, paddingHorizontal: 16 }}
          >
            {/* Top Hero Banner */}
            <View
              style={{
                backgroundColor: isDark ? '#11141c' : '#ffffff',
                borderRadius: 24,
                padding: 20,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.25 : 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(139, 92, 246, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={22} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a' }}>
                      TradiFive Neural Coach
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>
                      Personalized MT5 & Market Copilot
                    </Text>
                  </View>
                </View>
                <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#8b5cf6' }}>PRO</Text>
                </View>
              </View>

              <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 19 }}>
                Audits order fills, warns on psychological tilt, calculates risk-reward anomalies, and delivers personalized trade feedback directly to your mobile terminal.
              </Text>
            </View>

            {/* Feature Highlight Cards */}
            <View style={{ gap: 12, marginBottom: 16 }}>
              {/* Card 1 */}
              <View
                style={{
                  backgroundColor: isDark ? '#11141c' : '#ffffff',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(56, 189, 248, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} color="#38bdf8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 2 }}>
                    Real-Time Trade Audits
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b' }}>
                    Live slippage detection, spread tracking & execution speed analytics.
                  </Text>
                </View>
              </View>

              {/* Card 2 */}
              <View
                style={{
                  backgroundColor: isDark ? '#11141c' : '#ffffff',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 2 }}>
                    Psychology & Discipline Sentinel
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b' }}>
                    Identifies revenge trading, lot escalation, and session burnout in real time.
                  </Text>
                </View>
              </View>

              {/* Card 3 */}
              <View
                style={{
                  backgroundColor: isDark ? '#11141c' : '#ffffff',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(245, 158, 11, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={20} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? '#ffffff' : '#0f172a', marginBottom: 2 }}>
                    Tactical Strategy Back-Tester
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b' }}>
                    Replays your setup entries against institutional volatility models.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.ScrollView>
        </Animated.View>
      </View>

      {/* ── FULL SCREEN CENTERED COMING SOON VEIL (Backside completely non-operational) ── */}
      <ComingSoonVeil
        featureTitle="AI Coach"
        subtitle="Real-time trade auditing, behavioral psychology diagnostics & automated strategy copiloting are launching soon."
        topOffset={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'transparent',
    position: 'relative',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -34,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    zIndex: 5,
  },
});
