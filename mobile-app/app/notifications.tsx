import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar, Animated, Image, DeviceEventEmitter, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ShieldAlert, CheckCircle, X, Trash2, Heart, Sparkles, Activity, CheckCheck, Volume2, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { getHeaderStyle, HeaderStyle } from './utils/headerStore';
import { useStore } from './store';
import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const [filter, setFilter] = useState('ALL');
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());
  const [viewMode, setViewMode] = useState<'feed' | 'settings'>('feed');

  // Notification preference toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [socialAlerts, setSocialAlerts] = useState(false);
  const [aiCoachAlerts, setAiCoachAlerts] = useState(true);

  const filters = ['ALL', 'AI COACH', 'SOCIAL', 'RISK GUARD', 'SYSTEM'];

  const notifications = useStore(state => state.notifications) || [];

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  useEffect(() => {
    const l1 = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => setHeaderStyleState(style));
    return () => { l1.remove(); };
  }, []);

  const filtered = filter === 'ALL' ? notifications : notifications.filter((n: any) => n.type === filter);

  const getIcon = (type: string, read: boolean) => {
    switch (type) {
      case 'RISK GUARD': return <ShieldAlert size={18} color={read ? '#f59e0b80' : '#f59e0b'} />;
      case 'SYSTEM': return <Activity size={18} color={read ? '#10b98180' : '#10b981'} />;
      case 'SOCIAL': return <Heart size={18} color={read ? '#f43f5e80' : '#f43f5e'} />;
      case 'AI COACH': return <Sparkles size={18} color={read ? '#8b5cf680' : '#8b5cf6'} />;
      default: return <Bell size={18} color={read ? '#94a3b8' : '#0f172a'} />;
    }
  };

  const getIconBg = (type: string, read: boolean) => {
    if (read) return isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
    switch (type) {
      case 'RISK GUARD': return 'rgba(245, 158, 11, 0.12)';
      case 'SYSTEM': return 'rgba(16, 185, 129, 0.12)';
      case 'SOCIAL': return 'rgba(244, 63, 94, 0.12)';
      case 'AI COACH': return 'rgba(139, 92, 246, 0.12)';
      default: return isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9';
    }
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      DeviceEventEmitter.emit('scrollUpdate', value);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const bgColor = isDark ? '#000' : '#f4f4f6';
  const cardBg = isDark ? '#111' : '#ffffff';
  const cardBorder = isDark ? '#222' : '#f0f0f0';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const filterBg = isDark ? '#1a1a1a' : '#ffffff';
  const filterActiveBg = isDark ? '#2a2a2a' : '#0f172a';
  const filterActiveTxt = isDark ? '#ffffff' : '#ffffff';
  const filterBorder = isDark ? '#2a2a2a' : '#e2e8f0';
  const sectionBg = isDark ? '#111' : '#fff';
  const sectionBorder = isDark ? '#1e1e1e' : '#f1f5f9';
  const trackFalse = isDark ? '#3f3f46' : '#e4e4e7';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Drag Handle */}
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 2, zIndex: 2000 }}>
        <View style={{ width: 36, height: 5, borderRadius: 2.5, backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1' }} />
      </View>

      {/* Header */}
      <View style={{
        marginTop: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
      }}>
        <Text style={{ fontSize: 28, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>
          Notifications
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} color={isDark ? '#fff' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <Animated.View style={{
        flex: 1,
        backgroundColor: 'transparent',
        marginTop: 12,
        overflow: 'hidden',
      }}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
        >
          <View>

            {viewMode === 'feed' ? (
              <>
            {/* ── FILTERS BAR ── */}
            <View style={{ paddingBottom: 12 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 20 }}>
                Recent
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
                {filters.map(f => {
                  const isActive = filter === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => { h(); setFilter(f); }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: isActive ? filterActiveBg : filterBg,
                        borderWidth: 1.5,
                        borderColor: isActive ? filterActiveBg : filterBorder,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: isActive ? filterActiveTxt : textSecondary }}>
                        {f}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── NOTIFICATIONS FEED ── */}
            <View style={{ paddingHorizontal: 20, gap: 12 }}>
              {filtered.map((n: any) => {
                const isUnread = !n.is_read;
                const avatarSrc = n.avatar || n.sender_avatar || n.metadata?.avatar || n.metadata?.sender_avatar;
                
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={{
                      backgroundColor: isDark
                        ? (isUnread ? '#1a1a1a' : '#111')
                        : (isUnread ? '#ffffff' : '#fcfcfc'),
                      borderRadius: 16,
                      padding: 12,
                      borderWidth: isDark ? 1 : 0,
                      borderColor: isDark ? '#333' : 'transparent',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isDark ? 0.3 : (isUnread ? 0.06 : 0.02),
                      shadowRadius: 12,
                      elevation: isUnread ? 3 : 1,
                    }}
                    onPress={h}
                  >
                    <View style={{ gap: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{
                          width: 36, height: 36, borderRadius: 10,
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: getIconBg(n.type, n.is_read),
                          overflow: 'hidden',
                        }}>
                          {avatarSrc ? (
                            <Image source={{ uri: avatarSrc }} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            getIcon(n.type, n.is_read)
                          )}
                        </View>
                        
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isUnread ? textPrimary : textSecondary }} numberOfLines={1}>
                            {n.title}
                          </Text>
                          <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: textMuted, marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {n.type} • {timeAgo(n.created_at)}
                          </Text>
                        </View>
                        
                        {isUnread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' }} />}
                      </View>

                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, color: isUnread ? textSecondary : textMuted, paddingLeft: 46 }}>
                        {n.message}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
              </>
            ) : (
            <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 16 }}>
              {/* ── SETTINGS VIEW ── */}
              <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Global Preferences
              </Text>
              
              <View style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                borderRadius: 24,
                padding: 16,
                borderWidth: 1.5,
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
                gap: 16
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                      <Volume2 size={20} color={isDark ? '#fff' : '#0f172a'} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: textPrimary, marginBottom: 2 }}>Push Notifications</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: textSecondary }}>Master toggle for all alerts</Text>
                    </View>
                  </View>
                  <Switch 
                    value={pushEnabled} 
                    onValueChange={(v) => { h(); setPushEnabled(v); }} 
                    trackColor={{ false: trackFalse, true: '#3b82f6' }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 8 }}>
                Alert Types
              </Text>

              <View style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                borderRadius: 24,
                padding: 16,
                borderWidth: 1.5,
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
                gap: 20
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pushEnabled ? 1 : 0.5 }} pointerEvents={pushEnabled ? 'auto' : 'none'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} color="#10b981" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: textPrimary, marginBottom: 2 }}>Trade Alerts</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: textSecondary }}>Updates on executions</Text>
                    </View>
                  </View>
                  <Switch value={tradeAlerts} onValueChange={(v) => { h(); setTradeAlerts(v); }} trackColor={{ false: trackFalse, true: '#10b981' }} thumbColor="#fff" />
                </View>

                <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pushEnabled ? 1 : 0.5 }} pointerEvents={pushEnabled ? 'auto' : 'none'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(245, 158, 11, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldAlert size={20} color="#f59e0b" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: textPrimary, marginBottom: 2 }}>Risk Guard</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: textSecondary }}>Warnings & threshold hits</Text>
                    </View>
                  </View>
                  <Switch value={riskAlerts} onValueChange={(v) => { h(); setRiskAlerts(v); }} trackColor={{ false: trackFalse, true: '#f59e0b' }} thumbColor="#fff" />
                </View>

                <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pushEnabled ? 1 : 0.5 }} pointerEvents={pushEnabled ? 'auto' : 'none'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(244, 63, 94, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={20} color="#f43f5e" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: textPrimary, marginBottom: 2 }}>Social</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: textSecondary }}>Follows and interactions</Text>
                    </View>
                  </View>
                  <Switch value={socialAlerts} onValueChange={(v) => { h(); setSocialAlerts(v); }} trackColor={{ false: trackFalse, true: '#f43f5e' }} thumbColor="#fff" />
                </View>

                <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pushEnabled ? 1 : 0.5 }} pointerEvents={pushEnabled ? 'auto' : 'none'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.12)', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color="#8b5cf6" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: textPrimary, marginBottom: 2 }}>AI Coach</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: textSecondary }}>Insights and patterns</Text>
                    </View>
                  </View>
                  <Switch value={aiCoachAlerts} onValueChange={(v) => { h(); setAiCoachAlerts(v); }} trackColor={{ false: trackFalse, true: '#8b5cf6' }} thumbColor="#fff" />
                </View>

              </View>
            </View>
            )}

          </View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}
