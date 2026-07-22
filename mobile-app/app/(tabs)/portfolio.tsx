import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, StatusBar, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PackageOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store';
import { useAppTheme } from '../../hooks/useAppTheme';

const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs < 24) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diffHrs < 48) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

const EmptyState = ({ isDark, label }: { isDark: boolean; label: string }) => (
  <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
    <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: isDark ? '#1e2535' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
      <PackageOpen size={28} color={isDark ? '#475569' : '#94a3b8'} />
    </View>
    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>
      No {label} trades
    </Text>
    <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: isDark ? '#475569' : '#cbd5e1', textAlign: 'center', maxWidth: 240, lineHeight: 20 }}>
      Connect your MT5 broker account to see your trade history here.
    </Text>
  </View>
);

export default function Portfolio() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const storeTrades  = useStore(state => state.trades);
  const fetchTrades  = useStore(state => state.fetchTradingData);

  const filters = ['All', 'Open', 'Closed'];

  const onRefresh = async () => {
    setRefreshing(true);
    try { await (fetchTrades as any)?.(); } catch {}
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const base = storeTrades.map(t => ({
      id:           t.id,
      pair:         t.symbol,
      type:         t.type === 'buy' ? 'Buy' : 'Sell',
      volume:       t.volume?.toFixed(2) ?? '—',
      pnl:          t.profit ?? 0,
      time:         formatDate(t.closed_at || t.created_at),
      status:       t.closed_at ? 'Closed' : 'Open',
    }));

    if (filter === 'All') return base;
    return base.filter(t => t.status === filter);
  }, [storeTrades, filter]);

  const totalPnL  = storeTrades.reduce((a, t) => a + (t.profit ?? 0), 0);
  const winCount  = storeTrades.filter(t => (t.profit ?? 0) > 0).length;
  const winRate   = storeTrades.length > 0 ? Math.round((winCount / storeTrades.length) * 100) : 0;

  const s = useMemo(() => {
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
    if (shadowed.filterActive) { shadowed.filterActive.backgroundColor = theme.text; }
    if (shadowed.filterTxtActive) { shadowed.filterTxtActive.color = theme.background; }
    return shadowed;
  }, [isDark, theme]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { paddingTop: insets.top + 20 }]}>
        <Image source={require('../../assets/images/top-glow.png')}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: insets.top + 140 }} resizeMode="stretch" />
        <View style={{ paddingHorizontal: 28, marginTop: 10, paddingBottom: 24 }}>
          <Text style={s.headerTitle}>Trade History</Text>
          <Text style={s.headerSub}>Review your portfolio performance and past executions.</Text>
        </View>
      </View>

      <View style={s.mainCard}>
        {/* Summary Bar — real data */}
        <View style={s.summaryBox}>
          <View style={{ flex: 1 }}>
            <Text style={s.summaryLabel}>Total P&L</Text>
            <Text style={[s.summaryVal, { color: totalPnL >= 0 ? '#10b981' : '#ef4444' }]}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </Text>
          </View>
          <View style={{ width: 1, height: 40, backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9' }} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={s.summaryLabel}>Win Rate</Text>
            <Text style={[s.summaryVal, { color: isDark ? '#e8e8e8' : '#0f172a' }]}>
              {storeTrades.length > 0 ? `${winRate}%` : '—'}
            </Text>
          </View>
        </View>

        <View style={s.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
            {filters.map(f => (
              <TouchableOpacity key={f} onPress={() => { h(); setFilter(f); }}
                style={[s.filterPill, filter === f && s.filterActive]}>
                <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        >
          {filtered.length === 0 ? (
            <EmptyState isDark={isDark} label={filter === 'All' ? '' : filter} />
          ) : (
            <View style={{ paddingHorizontal: 24, gap: 12 }}>
              {filtered.map(t => {
                const isProfit = t.pnl >= 0;
                const PnlIcon = isProfit ? ArrowUpRight : ArrowDownRight;
                return (
                  <View key={t.id} style={s.tradeCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[s.iconBox, { backgroundColor: t.type === 'Buy' ? '#eefcf6' : '#fef2f2' }]}>
                          {t.type === 'Buy' ? <TrendingUp size={18} color="#10b981" /> : <TrendingDown size={18} color="#ef4444" />}
                        </View>
                        <View>
                          <Text style={s.pairTxt}>{t.pair}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <Text style={[s.typeTxt, { color: t.type === 'Buy' ? '#10b981' : '#ef4444' }]}>{t.type}</Text>
                            <Text style={s.metaTxt}>• {t.volume} Lots</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <PnlIcon size={14} color={isProfit ? '#10b981' : '#ef4444'} />
                          <Text style={[s.pnlTxt, { color: isProfit ? '#10b981' : '#ef4444' }]}>
                            {isProfit ? '+' : ''}{t.pnl.toFixed(2)}
                          </Text>
                        </View>
                        <View style={[s.statusBadge, { backgroundColor: t.status === 'Open' ? '#eef2ff' : '#f8fafc' }]}>
                          <Text style={[s.statusTxt, { color: t.status === 'Open' ? '#6366f1' : '#64748b' }]}>{t.status}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={s.tradeFooter}>
                      <Text style={s.metaTxt}>{t.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const globalStyles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#000' },
  header:         { backgroundColor: 'transparent', zIndex: 10 },
  headerTitle:    { fontSize: 26, fontFamily: 'Inter_900Black', color: '#fff' },
  headerSub:      { fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  mainCard:       { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  summaryBox:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, gap: 20 },
  summaryLabel:   { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  summaryVal:     { fontSize: 22, fontFamily: 'Inter_900Black', color: '#10b981' },
  filtersContainer: { paddingVertical: 8 },
  filterPill:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  filterActive:   { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  filterTxt:      { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' },
  filterTxtActive: { color: '#fff' },
  tradeCard:      { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  iconBox:        { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pairTxt:        { fontSize: 16, fontFamily: 'Inter_800ExtraBold', color: '#0f172a' },
  typeTxt:        { fontSize: 12, fontFamily: 'Inter_700Bold' },
  metaTxt:        { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  pnlTxt:         { fontSize: 17, fontFamily: 'Inter_800ExtraBold' },
  statusBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  statusTxt:      { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  tradeFooter:    { borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 10, marginTop: 4 },
});
