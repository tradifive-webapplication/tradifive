import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Platform, StatusBar, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Star, TrendingUp, BookOpen, Bot, Users, Tag, PackageOpen, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';
import { useStore } from '../store';
import { useAppTheme } from '../../hooks/useAppTheme';
import UpgradeGate from '../components/UpgradeGate';

const { width } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
const CATEGORIES = ['All', 'Signals', 'EAs', 'Courses', 'Tools', 'Templates'];

interface MarketplaceItem {
  id: string;
  category: string;
  title: string;
  provider: string;
  rating: number;
  reviews_count: number;
  price: string;
  is_featured: boolean;
  icon_type?: string;
}

const EmptyState = ({ isDark }: { isDark: boolean }) => (
  <View style={{ alignItems: 'center', paddingVertical: 70, gap: 14 }}>
    <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: isDark ? '#1e2535' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
      <ShoppingBag size={32} color={isDark ? '#475569' : '#94a3b8'} />
    </View>
    <Text style={{ fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>
      Marketplace coming soon
    </Text>
    <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#475569' : '#cbd5e1', textAlign: 'center', maxWidth: 260, lineHeight: 21 }}>
      Signals, EAs, tools and templates from verified providers will be listed here.
    </Text>
  </View>
);

export default function Marketplace() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useAppTheme();

  const [category, setCategory]   = useState('All');
  const [items, setItems]         = useState<MarketplaceItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  const onRefresh = () => { setRefreshing(true); fetchItems(); };

  const filtered = items.filter(i => category === 'All' || i.category === category);

  const s = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      shadowed[key] = { ...(globalStyles as any)[key] };
      const bg = shadowed[key].backgroundColor;
      if (bg === '#fff' || bg === '#ffffff') shadowed[key].backgroundColor = theme.card;
      else if (bg === '#f8fafc' || bg === '#f4f4f6') shadowed[key].backgroundColor = theme.background;
      const c = shadowed[key].color;
      if (c === '#0f172a' || c === '#1e293b') shadowed[key].color = theme.text;
      const bc = shadowed[key].borderColor;
      if (bc === '#f1f5f9' || bc === '#e2e8f0') shadowed[key].borderColor = theme.cardBorder;
    }
    if (shadowed.catActive) shadowed.catActive.backgroundColor = theme.text;
    if (shadowed.catTxtActive) shadowed.catTxtActive.color = theme.background;
    return shadowed;
  }, [isDark, theme]);

  return (
    <UpgradeGate feature="marketplace">
      <View style={s.container}>
        <StatusBar barStyle="light-content" />

        <View style={[s.header, { paddingTop: insets.top + 20 }]}>
          <Image source={require('../../assets/images/top-glow.png')}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: insets.top + 160 }} resizeMode="stretch" />
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={18} color="#fff" />
              </View>
              <Text style={s.headerTitle}>Marketplace</Text>
            </View>
            <Text style={s.headerSub}>Signals, EAs, tools & templates from top traders</Text>
          </View>
        </View>

        <View style={s.mainCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 14 }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[s.catPill, category === c && s.catActive]} onPress={() => { h(); setCategory(c); }}>
                <Text style={[s.catTxt, category === c && s.catTxtActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            >
              {filtered.length === 0 ? (
                <EmptyState isDark={isDark} />
              ) : (
                filtered.map(item => (
                  <TouchableOpacity key={item.id} style={s.itemCard} onPress={h}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        {item.is_featured && (
                          <Text style={s.featuredTag}>FEATURED</Text>
                        )}
                        <Text style={s.itemTitle}>{item.title}</Text>
                        <Text style={s.itemProvider}>{item.provider}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                          <Star size={13} color="#f59e0b" fill="#f59e0b" />
                          <Text style={s.metaTxt}>{item.rating?.toFixed(1)} ({item.reviews_count})</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Text style={s.itemPrice}>{item.price}</Text>
                        <ChevronRight size={16} color="#94a3b8" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </UpgradeGate>
  );
}

const globalStyles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },
  header:       { backgroundColor: 'transparent', zIndex: 10 },
  headerTitle:  { fontSize: 26, fontFamily: 'Inter_900Black', color: '#fff' },
  headerSub:    { fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  mainCard:     { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  catPill:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  catActive:    { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  catTxt:       { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' },
  catTxtActive: { color: '#fff' },
  itemCard:     { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  featuredTag:  { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#f59e0b', letterSpacing: 0.8, marginBottom: 4 },
  itemTitle:    { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 2 },
  itemProvider: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b' },
  itemPrice:    { fontSize: 15, fontFamily: 'Inter_800ExtraBold', color: '#0f172a' },
  metaTxt:      { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
});
