import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, Alert, Share, Clipboard, DeviceEventEmitter, Dimensions, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Gift, Copy, Share2, Users, DollarSign, CheckCircle,
  ChevronRight, Award, Clock, Zap, UserPlus, Trophy, Bell
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { useStore } from '../store';
import { supabase } from '../utils/supabase';

import { useAppTheme } from '../../hooks/useAppTheme';
const { width: SW } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const REFERRED_USERS: any[] = [];

const getStatusConfig = (isDark: boolean) => ({
  active: { label: 'Active', color: isDark ? '#34d399' : '#10b981', bg: isDark ? 'rgba(16,185,129,0.15)' : '#dcfce7' },
  pending: { label: 'Pending', color: isDark ? '#fbbf24' : '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.15)' : '#fef9c3' },
});

const HOW_IT_WORKS = [
  { step: '1', icon: Share2, title: 'Share Your Link', desc: 'Send your unique referral link or code to a friend who wants to trade smarter.', color: '#6366f1' },
  { step: '2', icon: UserPlus, title: 'Friend Signs Up', desc: 'They create a Tradifive account using your link and connect their broker.', color: '#3b82f6' },
  { step: '3', icon: Gift, title: 'Both Earn Rewards', desc: 'You earn ₹50 per active referral. 3 referrals unlocks 1 month Pro for FREE!', color: '#10b981' },
];

export default function Referrals() {
  const { isDark, theme } = useAppTheme();
  
  const s = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      shadowed[key] = { ...(globalStyles as any)[key] };
      const bg = shadowed[key].backgroundColor;
      if (bg === '#fff' || bg === '#ffffff' || bg === '#fafafa' || bg === '#f8fafc') shadowed[key].backgroundColor = theme.card;
      else if (bg === '#f4f4f6' || bg === '#090d16' || bg === '#f1f5f9') shadowed[key].backgroundColor = theme.background;
      
      const c = shadowed[key].color;
      if (c === '#0f172a' || c === '#1e293b' || c === '#000' || c === '#000000') shadowed[key].color = theme.text;
      else if (c === '#64748b' || c === '#475569' || c === '#94a3b8' || c === '#334155') shadowed[key].color = theme.textSecondary;
      
      const bc = shadowed[key].borderColor;
      if (bc === '#f1f5f9' || bc === '#eef0f3' || bc === '#e2e8f0' || bc === '#ffffff') shadowed[key].borderColor = theme.cardBorder;

      const btc = shadowed[key].borderTopColor;
      if (btc === '#f1f5f9' || btc === '#eef0f3' || btc === '#e2e8f0' || btc === '#ffffff') shadowed[key].borderTopColor = theme.cardBorder;

      const bbc = shadowed[key].borderBottomColor;
      if (bbc === '#f1f5f9' || bbc === '#eef0f3' || bbc === '#e2e8f0' || bbc === '#ffffff' || bbc === '#f4f4f6') shadowed[key].borderBottomColor = theme.cardBorder;
    }
    // Overrides
    if (shadowed.actionBtn) shadowed.actionBtn.backgroundColor = theme.text;
    if (shadowed.actionBtnTxt) shadowed.actionBtnTxt.color = theme.background;
    if (shadowed.progressTitle) shadowed.progressTitle.color = theme.text;
    if (shadowed.stepTitle) shadowed.stepTitle.color = theme.text;
    if (shadowed.historyName) shadowed.historyName.color = theme.text;
    if (shadowed.historyEarned) shadowed.historyEarned.color = theme.text;
    if (shadowed.progressTrack) shadowed.progressTrack.backgroundColor = theme.cardBorder;
    if (shadowed.historyAvatar) {
      shadowed.historyAvatar.backgroundColor = 'rgba(99,102,241,0.15)';
    }
    
    return shadowed;
  }, [isDark, theme]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);
  const [copied, setCopied] = useState(false);
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());

  // Dynamic Referral Link calculation
  const referralCode = currentUser?.referral_code || 'TF-NIKIL2024';
  const referralLink = `https://tradifive.in/signup?ref=${referralCode}`;

  const [referredUsers, setReferredUsers] = useState<any[]>([]);

  React.useEffect(() => {
    const l1 = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => setHeaderStyleState(style));
    return () => { l1.remove(); };
  }, []);

  React.useEffect(() => {
    if (!currentUser?.id) return;
    const fetchReferrals = async () => {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select(`
            id,
            status,
            earned,
            created_at,
            profiles!referrals_referred_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('referrer_id', currentUser.id);

        if (error) throw error;
        if (data) {
          setReferredUsers(data);
        }
      } catch (err) {
        console.error('Error fetching referrals:', err);
      }
    };
    fetchReferrals();
  }, [currentUser]);

  const referredList = referredUsers.length > 0 ? referredUsers.map((ref) => ({
    id: ref.id,
    name: ref.profiles?.full_name || 'Anonymous Trader',
    avatar: (ref.profiles?.full_name || 'AN').substring(0, 2).toUpperCase(),
    date: new Date(ref.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    status: ref.status || 'pending',
    earned: ref.status === 'active' ? `$${(ref.earned || 50.0).toFixed(2)}` : '₹0.00'
  })) : REFERRED_USERS;

  const handleCopy = () => {
    h();
    Clipboard.setString(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    h();
    try {
      await Share.share({
        message: `🚀 Join me on Tradifive — the AI-powered trading terminal!\n\nUse my referral link to get started:\n${referralLink}\n\nCode: ${referralCode}`,
        url: referralLink,
      });
    } catch (e) {
      Alert.alert('Share Error', 'Could not open share sheet.');
    }
  };

  const totalEarned = referredList.filter(u => u.status === 'active').reduce((s, u) => s + parseFloat(u.earned.replace('$', '')), 0);
  const activeCount = referredList.filter(u => u.status === 'active').length;

  const scrollY = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      DeviceEventEmitter.emit('scrollUpdate', value);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  return (
    <View style={[s.container, { backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#f4f4f6') : '#000000' }]}>
      <StatusBar barStyle={headerStyle === 'simple' ? "dark-content" : "light-content"} />

      <Image
        source={require('../../assets/images/top-glow.png')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 150, opacity: headerStyle === 'simple' ? 0 : 0.8 }}
        resizeMode="stretch"
      />

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ 
        height: headerStyle === 'simple' ? insets.top + 74 : insets.top + 104, 
        backgroundColor: headerStyle === 'simple' ? '#ffffff' : 'transparent', 
        borderBottomWidth: headerStyle === 'simple' ? 1 : 0, 
        borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0', 
        position: 'relative', 
        zIndex: 1000, 
        transform: headerStyle === 'simple' ? [] : [
          { scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, 
          { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }
        ] 
      }}>
        <Animated.View style={{ 
          position: 'absolute', 
          bottom: headerStyle === 'simple' ? 16 : 38, 
          left: 0, 
          right: 0, 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: 20, 
          opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) 
        }}>
          <Text style={{ color: headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Refer a Friend</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} color={headerStyle === 'simple' ? '#000000' : 'white'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { h(); router.setParams({ openProfile: 'true' }); }}
              style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: headerStyle === 'simple' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)', overflow: 'hidden' }}
            >
              {currentUser?.avatar_url ? (
                <Image source={{ uri: currentUser.avatar_url }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Image source={require('../../assets/images/avatar.png')} style={{ width: '100%', height: '100%' }} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── CONTENT CONTAINER ── */}
      <Animated.View style={[
        s.mainCard, 
        { 
          marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), 
          borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40, 
          borderTopRightRadius: headerStyle === 'simple' ? 0 : 40 
        }
      ]}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 250 }}
        >
          <Animated.View style={headerStyle === 'simple' ? [] : { transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            
            {/* Header Description */}
            <View style={[s.card, { flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 20 }]}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: '#e0e7ff' }}>
                <Gift size={26} color="#6366f1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#0f172a', marginBottom: 4 }}>Invite & Earn Rewards</Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 18 }}>Earn ₹50 per active referral. 3 friends = 1 month Pro FREE!</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 }}>
              {[
                { icon: Users, label: 'Total Referred', value: referredList.length.toString(), color: isDark ? '#818cf8' : '#6366f1', bg: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff' },
                { icon: DollarSign, label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, color: isDark ? '#34d399' : '#10b981', bg: isDark ? 'rgba(16,185,129,0.15)' : '#dcfce7' },
                { icon: Trophy, label: 'Active', value: activeCount.toString(), color: isDark ? '#fbbf24' : '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.15)' : '#fef9c3' },
              ].map(stat => {
                const IconComp = stat.icon;
                return (
                  <View key={stat.label} style={[s.statBox, { flex: 1 }]}>
                    <View style={[s.statIcon, { backgroundColor: stat.bg }]}><IconComp size={14} color={stat.color} /></View>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statLabel}>{stat.label}</Text>
                  </View>
                );
              })}
            </View>

            {/* Referral Link Card */}
            <View style={[s.card, { padding: 18, marginBottom: 16 }]}>
              <Text style={s.linkLabel}>YOUR REFERRAL CODE</Text>
              <View style={s.codeBox}>
                <Text style={s.code}>{referralCode}</Text>
              </View>
              <Text style={s.linkUrl} numberOfLines={1}>{referralLink}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity style={[s.actionBtn, { flex: 1 }]} onPress={handleCopy}>
                  {copied ? <CheckCircle size={16} color="#10b981" /> : <Copy size={16} color="#fff" />}
                  <Text style={s.actionBtnTxt}>{copied ? 'Copied!' : 'Copy Link'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { flex: 1, backgroundColor: '#6366f1' }]} onPress={handleShare}>
                  <Share2 size={16} color="#fff" />
                  <Text style={s.actionBtnTxt}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress toward free month */}
            <View style={[s.card, { padding: 18, marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <Text style={s.progressTitle}>Progress to Free Month</Text>
                <Text style={s.progressCount}>{activeCount}/3 active</Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${Math.min((activeCount / 3) * 100, 100)}%` }]} />
              </View>
              <Text style={s.progressSub}>
                {activeCount >= 3 ? '🎉 You\'ve unlocked 1 month Pro for FREE!' : `${3 - activeCount} more active referral${3 - activeCount !== 1 ? 's' : ''} to unlock 1 month Pro`}
              </Text>
            </View>

            {/* How It Works */}
            <Text style={s.sectionTitle}>How It Works</Text>
            <View style={{ marginBottom: 16 }}>
              {HOW_IT_WORKS.map((step) => {
                const IconComp = step.icon;
                return (
                  <View key={step.step} style={s.stepRow}>
                    <View style={[s.stepNum, { backgroundColor: `${step.color}18` }]}>
                      <IconComp size={16} color={step.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={s.stepTitle}>{step.title}</Text>
                      <Text style={s.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Referral History */}
            <Text style={s.sectionTitle}>Referred Users</Text>
            <View style={s.historyCard}>
              {referredList.map((user, idx) => {
                const statusConf = getStatusConfig(isDark)[user.status as 'active' | 'pending'];
                return (
                  <View key={user.id} style={[s.historyRow, { borderLeftColor: statusConf.color, borderLeftWidth: 4 }, idx < referredList.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }]}>
                    <View style={s.historyAvatar}>
                      <Text style={s.historyAvatarTxt}>{user.avatar}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.historyName}>{user.name}</Text>
                      <Text style={s.historyDate}>{user.date}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={[s.historyEarned, { color: user.status === 'active' ? '#10b981' : '#94a3b8' }]}>{user.earned}</Text>
                      <View style={[s.statusBadge, { backgroundColor: statusConf.bg }]}>
                        <Text style={[s.statusTxt, { color: statusConf.color }]}>{statusConf.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const globalStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  headerSub: { 
    fontSize: 13, 
    fontFamily: 'Inter_500Medium', 
    color: '#64748b',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)'
  },
  heroBannerTitle: {
    fontSize: 17,
    fontFamily: 'Inter_800ExtraBold',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroBannerSub: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#94a3b8',
    lineHeight: 18,
  },
  mainCard: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    overflow: 'hidden' 
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statBox: { 
    backgroundColor: '#fafafa', 
    borderRadius: 24, 
    padding: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'center' 
  },
  statIcon: { 
    width: 28, 
    height: 28, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 6 
  },
  statValue: { 
    fontSize: 18, 
    fontFamily: 'Inter_700Bold', 
    color: '#0f172a' 
  },
  statLabel: { 
    fontSize: 9, 
    fontFamily: 'Inter_700Bold', 
    color: '#94a3b8', 
    marginTop: 4, 
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkLabel: { 
    fontSize: 10, 
    fontFamily: 'Inter_700Bold', 
    color: '#94a3b8', 
    letterSpacing: 1, 
    textTransform: 'uppercase', 
    marginBottom: 10 
  },
  codeBox: { 
    backgroundColor: '#f8fafc', 
    borderRadius: 16, 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  code: { 
    fontSize: 26, 
    fontFamily: 'Inter_900Black', 
    color: '#6366f1', 
    letterSpacing: 3 
  },
  linkUrl: { 
    fontSize: 12, 
    fontFamily: 'Inter_500Medium', 
    color: '#64748b',
    textAlign: 'center'
  },
  actionBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: '#0f172a', 
    paddingVertical: 12, 
    borderRadius: 16 
  },
  actionBtnTxt: { 
    fontSize: 13, 
    fontFamily: 'Inter_700Bold', 
    color: '#fff' 
  },
  progressTitle: { 
    fontSize: 14, 
    fontFamily: 'Inter_700Bold', 
    color: '#0f172a' 
  },
  progressCount: { 
    fontSize: 14, 
    fontFamily: 'Inter_700Bold', 
    color: '#6366f1' 
  },
  progressTrack: { 
    height: 10, 
    backgroundColor: '#e2e8f0', 
    borderRadius: 5, 
    overflow: 'hidden', 
    marginBottom: 12,
    marginTop: 6
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#6366f1', 
    borderRadius: 5 
  },
  progressSub: { 
    fontSize: 11, 
    fontFamily: 'Inter_500Medium', 
    color: '#64748b' 
  },
  sectionTitle: { 
    fontSize: 10, 
    fontFamily: 'Inter_700Bold', 
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 10,
    paddingLeft: 4,
  },
  stepRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: '#fafafa', 
    borderRadius: 20, 
    padding: 16, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10 
  },
  stepNum: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  stepTitle: { 
    fontSize: 14, 
    fontFamily: 'Inter_700Bold', 
    color: '#0f172a', 
    marginBottom: 4 
  },
  stepDesc: { 
    fontSize: 12, 
    fontFamily: 'Inter_500Medium', 
    color: '#64748b', 
    lineHeight: 18 
  },
  historyCard: { 
    backgroundColor: '#fafafa', 
    borderRadius: 24, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20
  },
  historyRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14 
  },
  historyAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#eef2ff', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  historyAvatarTxt: { 
    fontSize: 13, 
    fontFamily: 'Inter_700Bold', 
    color: '#6366f1' 
  },
  historyName: { 
    fontSize: 14, 
    fontFamily: 'Inter_700Bold', 
    color: '#0f172a' 
  },
  historyDate: { 
    fontSize: 11, 
    fontFamily: 'Inter_500Medium', 
    color: '#94a3b8', 
    marginTop: 2 
  },
  historyEarned: { 
    fontSize: 14, 
    fontFamily: 'Inter_700Bold' 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 8 
  },
  statusTxt: { 
    fontSize: 10, 
    fontFamily: 'Inter_700Bold', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
});
