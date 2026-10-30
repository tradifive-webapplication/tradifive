import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, RefreshControl, Platform, DeviceEventEmitter, ScrollView } from 'react-native';
import { Bell, TrendingUp, Percent, Zap, BarChart2, Calendar, Info, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Eye, EyeOff, LayoutGrid } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getHeaderStyle, HeaderStyle } from '../utils/headerStore';
import { WinRateRing, ProfitFactorGauge, WinLossBar, TradingCalendar, SvgAreaChart, SvgBarChart, ChartCardWrapper, LegendRow } from '../components/JournalCharts';
import { useStore } from '../store';
import UpgradeGate from '../components/UpgradeGate';
import ComingSoonVeil from '../../components/ComingSoonVeil';

import { useAppTheme } from '../../hooks/useAppTheme';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
const hSelect = () => { if (Platform.OS !== 'web') Haptics.selectionAsync(); };


export default function JournalScreen() {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(getHeaderStyle());
  const [tradeTab, setTradeTab] = useState<'recent' | 'open'>('recent');
  const storeTrades = useStore(state => state.trades);
  const mt5Account = useStore(state => state.mt5Account);

  // Dynamic calculations based on real trades from Supabase
  const tradesCount = storeTrades.length;
  const winningTrades = storeTrades.filter(t => (t.profit || 0) > 0);
  const losingTrades = storeTrades.filter(t => (t.profit || 0) < 0);
  const winsCount = winningTrades.length;
  const lossesCount = losingTrades.length;
  const winRate = tradesCount > 0 ? (winsCount / tradesCount) * 100 : 0;

  const totalPnL = storeTrades.reduce((acc, t) => acc + (t.profit || 0), 0);

  let streakCount = 0;
  let streakType: 'win' | 'loss' | 'none' = 'none';
  if (tradesCount > 0) {
    const firstTradeProfit = storeTrades[0].profit || 0;
    if (firstTradeProfit > 0) {
      streakType = 'win';
      for (const t of storeTrades) {
        if ((t.profit || 0) > 0) streakCount++;
        else break;
      }
    } else if (firstTradeProfit < 0) {
      streakType = 'loss';
      for (const t of storeTrades) {
        if ((t.profit || 0) < 0) streakCount++;
        else break;
      }
    }
  }

  const totalWinAmount = winningTrades.reduce((acc, t) => acc + (t.profit || 0), 0);
  const totalLossAmount = losingTrades.reduce((acc, t) => acc + Math.abs(t.profit || 0), 0);
  const avgWin = winsCount > 0 ? totalWinAmount / winsCount : 0;
  const avgLoss = lossesCount > 0 ? totalLossAmount / lossesCount : 0;
  const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 99.9 : 0;

  // Build dynamic chart arrays chronologically
  const chronologicalTrades = [...storeTrades].sort(
    (a, b) => new Date(a.created_at || (a as any).open_time).getTime() - new Date(b.created_at || (b as any).open_time).getTime()
  );

  const dailyPnLMap: Record<string, number> = {};
  chronologicalTrades.forEach(t => {
    const dateObj = new Date(t.created_at || (t as any).open_time);
    const label = dateObj.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
    dailyPnLMap[label] = (dailyPnLMap[label] || 0) + (t.profit || 0);
  });

  const dailyPnLList = Object.entries(dailyPnLMap).map(([label, value]) => ({ label, value }));

  const defaultChartData = Array.from({ length: 7 }, (_, i) => ({ label: `${i + 1}`, value: 0 }));

  // 1. Cumulative P&L
  let runningCum = 0;
  const cumulativePnLList = dailyPnLList.map(item => {
    runningCum += item.value;
    return { label: item.label, value: Math.round(runningCum) };
  });
  const cumulativeChartData = cumulativePnLList.length > 0 ? cumulativePnLList : defaultChartData;

  // 2. Daily P&L List
  const dailyChartData = dailyPnLList.length > 0 ? dailyPnLList : defaultChartData;

  // 3. Account Balance
  const finalBalance = mt5Account?.balance || 0;
  let currentRunningBal = finalBalance - totalPnL;
  const balanceList = dailyPnLList.map(item => {
    currentRunningBal += item.value;
    return { label: item.label, value: Math.round(currentRunningBal) };
  });
  const balanceChartData = balanceList.length > 0 ? balanceList : Array.from({ length: 7 }, (_, i) => ({ label: `${i + 1}`, value: finalBalance }));

  // 4. Drawdown Max Curve
  let runningPeak = 0;
  let dRunningBal = finalBalance - totalPnL;
  const drawdownList = dailyPnLList.map(item => {
    dRunningBal += item.value;
    if (dRunningBal > runningPeak) runningPeak = dRunningBal;
    const dd = runningPeak > 0 ? ((runningPeak - dRunningBal) / runningPeak) * 100 : 0;
    return { label: item.label, value: Math.round(-dd) };
  });
  const drawdownChartData = drawdownList.length > 0 ? drawdownList : defaultChartData;

  const lastImportDate = storeTrades.length > 0
    ? new Date(storeTrades[0].created_at || (storeTrades[0] as any).open_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No Connected Trades';

  const localStyles = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      if (!(globalStyles as any)[key]) continue;
      shadowed[key] = { ...(globalStyles as any)[key] };
      const bg = shadowed[key].backgroundColor;
      if (bg === '#fff' || bg === '#ffffff' || bg === '#fafafa') shadowed[key].backgroundColor = theme.card;
      else if (bg === '#f8fafc' || bg === '#f4f4f6') shadowed[key].backgroundColor = theme.background;

      const c = shadowed[key].color;
      if (c === '#0f172a' || c === '#1e293b' || c === '#000000') shadowed[key].color = theme.text;
      else if (c === '#64748b' || c === '#475569' || c === '#94a3b8' || c === '#334155') shadowed[key].color = theme.textSecondary;

      const bc = shadowed[key].borderColor;
      if (bc === '#ffffff' || bc === '#f1f5f9' || bc === '#e2e8f0') shadowed[key].borderColor = theme.cardBorder;
    }
    // Custom overrides
    if (shadowed.actionBtn) {
      shadowed.actionBtn.backgroundColor = theme.cardAlt;
      shadowed.actionBtn.borderColor = theme.cardBorder;
    }
    if (shadowed.actionBtnActiveAmber) {
      shadowed.actionBtnActiveAmber.backgroundColor = '#451a03';
      shadowed.actionBtnActiveAmber.borderColor = '#78350f';
    }
    if (shadowed.actionBtnActivePurple) {
      shadowed.actionBtnActivePurple.backgroundColor = '#2e1065';
      shadowed.actionBtnActivePurple.borderColor = '#581c87';
    }
    if (shadowed.actionBtnActiveGreen) {
      shadowed.actionBtnActiveGreen.backgroundColor = '#064e3b';
      shadowed.actionBtnActiveGreen.borderColor = '#065f46';
    }
    return shadowed;
  }, [isDark, theme]);
  const styles = localStyles;


  const [hideBalance, setHideBalance] = useState(false);
  const [hideOnlyBalance, setHideOnlyBalance] = useState(false);
  const [percentageOnly, setPercentageOnly] = useState(false);
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$' });
  const [chartFilter, setChartFilter] = useState('All');

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => {
      setHeaderStyle(style);
    });
    return () => { subscription.remove(); };
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = insets.top + 72;
  const clampedScroll = Animated.diffClamp(scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' }), 0, headerHeight);
  const headerTranslateY = clampedScroll.interpolate({ inputRange: [0, headerHeight], outputRange: [0, -headerHeight], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' });

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => { DeviceEventEmitter.emit('scrollUpdate', value); });
    return () => scrollY.removeListener(listener);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#f4f4f6') : '#000' }]}>
      {/* ── TOP BACKSIDE GLOW / ARTWORK IMAGE ── */}
      {headerStyle !== 'simple' && (
        <Image
          source={require('../../assets/images/top-glow.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: insets.top + 160,
            zIndex: 0,
            opacity: 0.95,
          }}
          resizeMode="stretch"
          pointerEvents="none"
        />
      )}
      {/* ── SMART-REVEAL HEADER ── */}
      {headerStyle !== 'simple' && (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight, backgroundColor: '#000', zIndex: 2000, paddingTop: insets.top + 8, opacity: headerOpacity, transform: [{ translateY: headerTranslateY }], borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' }}>
          <Image source={require('../../assets/images/top-glow.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 80, opacity: 0.8 }} resizeMode="stretch" />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 56 }}>
            <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 }}>Journal</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><Bell size={22} color="#fff" /></TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ height: headerStyle === 'simple' ? insets.top + 74 : insets.top + 104, backgroundColor: headerStyle === 'simple' ? (isDark ? theme.background : '#ffffff') : 'transparent', borderBottomWidth: headerStyle === 'simple' ? 1 : 0, borderBottomColor: isDark ? '#1e2a3a' : '#e2e8f0', position: 'relative', transform: headerStyle === 'simple' ? [] : [{ scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }] }}>
        <Animated.View style={{ position: 'absolute', bottom: headerStyle === 'simple' ? 16 : 38, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, opacity: headerStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) }}>
          <Text style={{ color: headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}>Journal</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => { h(); router.push('/notifications' as any); }} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><Bell size={22} color={headerStyle === 'simple' ? (isDark ? theme.text : '#000000') : 'white'} /></TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── WHITE CONTENT CARD ── */}
      <Animated.View style={[styles.card, { marginTop: headerStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), borderTopLeftRadius: headerStyle === 'simple' ? 0 : 40, borderTopRightRadius: headerStyle === 'simple' ? 0 : 40 }]}>
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140, paddingTop: 24 }} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })} scrollEventThrottle={16} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E8E93" progressViewOffset={10} />}>
          <Animated.View pointerEvents="none" style={{ transform: headerStyle === 'simple' ? [] : [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>
            <View style={{ paddingHorizontal: 16 }}>

              {/* ═══ INACTIVE SUBSCRIPTION BANNER ═══ */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isDark ? '#4c0519' : '#fff1f2', borderColor: isDark ? '#881337' : 'rgba(244,63,94,0.2)', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontFamily: 'Inter_900Black', color: isDark ? '#e8e8e8' : '#0f172a' }}>$</Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: isDark ? '#fecdd3' : '#334155', flex: 1 }}>Your subscription is inactive. To continue journaling, <Text style={{ fontFamily: 'Inter_700Bold' }}>activate your subscription now.</Text></Text>
              </View>

              {/* ═══ LAST IMPORT BAR ═══ */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Last import:</Text>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>{lastImportDate}</Text>
                  <Text style={{ fontSize: 13, color: '#cbd5e1' }}>•</Text>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#10b981' }}>Resync</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ═══ ACTION TOGGLES (Scrollable) ═══ */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4, paddingBottom: 20 }}>
                <TouchableOpacity onPress={() => { hSelect(); setCurrency(currency.code === 'USD' ? {code: 'EUR', symbol: '€'} : {code: 'USD', symbol: '$'}); }} style={styles.actionBtn}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{currency.code}</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>{currency.symbol}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { hSelect(); setHideBalance(!hideBalance); }} style={[styles.actionBtn, hideBalance && styles.actionBtnActiveAmber]}>
                  {hideBalance ? <EyeOff size={13} color="#b45309" /> : <Eye size={13} color="#64748b" />}
                  <Text style={[styles.actionText, hideBalance && { color: isDark ? '#fbbf24' : '#b45309' }]}>{hideBalance ? "Hidden" : "Hide Balance"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { hSelect(); setHideOnlyBalance(!hideOnlyBalance); }} style={[styles.actionBtn, hideOnlyBalance && styles.actionBtnActivePurple]}>
                  {hideOnlyBalance ? <EyeOff size={13} color="#7c3aed" /> : <Eye size={13} color="#64748b" />}
                  <Text style={[styles.actionText, hideOnlyBalance && { color: isDark ? '#a78bfa' : '#7c3aed' }]}>{hideOnlyBalance ? "Hidden Bal" : "Hide Only Balance"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { hSelect(); setPercentageOnly(!percentageOnly); }} style={[styles.actionBtn, percentageOnly && styles.actionBtnActiveGreen]}>
                  <Percent size={13} color={percentageOnly ? "#059669" : "#64748b"} />
                  <Text style={[styles.actionText, percentageOnly && { color: isDark ? '#34d399' : '#059669' }]}>{percentageOnly ? "Only" : "Show %"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <LayoutGrid size={14} color="#64748b" />
                </TouchableOpacity>
              </ScrollView>

              {/* ═══ 5 METRIC CARDS ═══ */}
              {/* Account P&L - Full Width */}
              <View style={styles.metricCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.metricLabel}>ACCOUNT P&L</Text>
                      <Info size={12} color="#cbd5e1" />
                    </View>
                    <Text style={[styles.metricValue, (hideBalance || hideOnlyBalance || percentageOnly) && styles.blurredText]}>
                      {currency.symbol}{(mt5Account?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.metricSub, { color: totalPnL >= 0 ? '#10b981' : '#ef4444' }, hideBalance && styles.blurredText]}>
                      P&L: {percentageOnly 
                        ? `${totalPnL >= 0 ? '+' : ''}${(((mt5Account?.balance || 0) - totalPnL) > 0 ? (totalPnL / ((mt5Account?.balance || 0) - totalPnL)) * 100 : 0).toFixed(2)}%`
                        : `${totalPnL >= 0 ? '+' : '-'}${currency.symbol}${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      }
                    </Text>
                  </View>
                  <View style={[styles.iconBg, { backgroundColor: isDark ? '#082f49' : '#e0f2fe' }]}>
                    <TrendingUp size={20} color="#0284c7" />
                  </View>
                </View>
              </View>

              {/* 2x2 Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {/* Trade Win % */}
                <View style={[styles.metricCard, { width: '48%', padding: 12, minHeight: 120 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.metricLabel}>TRADE WIN %</Text>
                    </View>
                    <Info size={12} color="#cbd5e1" />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View style={{ flex: 1, paddingRight: 4 }}>
                      <Text style={[styles.metricValue, { fontSize: 22 }]} adjustsFontSizeToFit numberOfLines={1}>{winRate.toFixed(2)}%</Text>
                      <Text style={[styles.metricSub, { fontSize: 11, marginTop: 4 }]}>{winsCount} W / {lossesCount} L</Text>
                    </View>
                    <WinRateRing wins={winsCount} losses={lossesCount} />
                  </View>
                </View>

                {/* Current Streak */}
                <View style={[styles.metricCard, { width: '48%', padding: 12, minHeight: 120 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.metricLabel}>STREAK</Text>
                    </View>
                    <View style={[styles.iconBg, { backgroundColor: isDark ? '#064e3b' : '#dcfce7', width: 24, height: 24, borderRadius: 8 }]}>
                      <Zap size={12} color="#16a34a" />
                    </View>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Text style={[styles.metricValue, { fontSize: 20, marginBottom: 8 }]} adjustsFontSizeToFit numberOfLines={1}>
                      {streakCount} {streakType === 'win' ? 'Wins' : streakType === 'loss' ? 'Losses' : 'None'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#10b981' }}>{winsCount} W</Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#ef4444' }}>{lossesCount} L</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Avg Win/Loss */}
                <View style={[styles.metricCard, { width: '48%', padding: 12, minHeight: 120 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.metricLabel}>AVG W/L</Text>
                    </View>
                    <Info size={12} color="#cbd5e1" />
                  </View>
                  <View style={{ flexDirection: 'column', flex: 1 }}>
                    <Text style={[styles.metricValue, { fontSize: 22 }]} adjustsFontSizeToFit numberOfLines={1}>{avgWinLossRatio.toFixed(2)}</Text>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                      <WinLossBar avgWin={avgWin} avgLoss={avgLoss} blurred={hideBalance || percentageOnly} symbol={currency.symbol} />
                    </View>
                  </View>
                </View>

                {/* Profit Factor */}
                <View style={[styles.metricCard, { width: '48%', padding: 12, minHeight: 120 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.metricLabel}>PROFIT FCT</Text>
                    </View>
                    <Info size={12} color="#cbd5e1" />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View style={{ flex: 1, paddingRight: 4 }}>
                      <Text style={[styles.metricValue, { fontSize: 22 }]} adjustsFontSizeToFit numberOfLines={1}>{profitFactor.toFixed(2)}</Text>
                      <Text style={[styles.metricSub, { fontSize: 11, color: profitFactor >= 1.0 ? '#10b981' : '#ef4444', marginTop: 4 }]}>
                        {profitFactor >= 1.5 ? 'Strong Edge' : profitFactor >= 1.0 ? 'Healthy Edge' : 'Negative Edge'}
                      </Text>
                    </View>
                    <ProfitFactorGauge value={profitFactor} />
                  </View>
                </View>
              </View>

              {/* ═══ CHART CARDS ═══ */}
              {/* Cumulative P&L */}
              <ChartCardWrapper
                title="Daily Net Cumulative P&L"
                legend={<LegendRow items={[{ color: '#10b981', label: 'Cumulative P&L' }]} />}
                filterValue={chartFilter}
                onFilter={(f: string) => { hSelect(); setChartFilter(f); }}
                filters={['1W', '1M', 'All']}
              >
                <SvgAreaChart
                  data={cumulativeChartData.slice(chartFilter === '1W' ? -7 : chartFilter === '1M' ? -30 : 0).map(d => ({ label: d.label, value: d.value }))}
                  color="#10b981"
                  gradId="cumGrad"
                />
              </ChartCardWrapper>

              {/* Net Daily P&L */}
              <ChartCardWrapper
                title="Net Daily P&L"
                legend={<LegendRow items={[{ color: '#10b981', label: 'Profit' }, { color: '#ef4444', label: 'Loss' }]} />}
                filterValue={chartFilter}
                onFilter={(f: string) => { hSelect(); setChartFilter(f); }}
                filters={['1W', '1M', 'All']}
              >
                <SvgBarChart
                  data={dailyChartData.slice(chartFilter === '1W' ? -7 : chartFilter === '1M' ? -30 : 0).map(d => ({ label: d.label, value: d.value }))}
                />
              </ChartCardWrapper>

              {/* Account Balance */}
              <ChartCardWrapper
                title="Account Balance"
                legend={<LegendRow items={[{ color: '#10b981', label: 'Balance' }, { color: '#34d399', label: 'Deposits' }]} />}
                filterValue={chartFilter}
                onFilter={(f: string) => { hSelect(); setChartFilter(f); }}
                filters={['1W', '1M', 'All']}
              >
                <SvgAreaChart
                  data={balanceChartData.slice(chartFilter === '1W' ? -7 : chartFilter === '1M' ? -30 : 0).map(d => ({ label: d.label, value: d.value }))}
                  color="#10b981"
                  gradId="balGrad"
                />
              </ChartCardWrapper>

              {/* Drawdown */}
              <ChartCardWrapper
                title="Drawdown"
                legend={<LegendRow items={[{ color: '#ef4444', label: 'Max Drawdown Curve' }]} />}
                filterValue={chartFilter}
                onFilter={(f: string) => { hSelect(); setChartFilter(f); }}
                filters={['1W', '1M', 'All']}
              >
                <SvgAreaChart
                  data={drawdownChartData.slice(chartFilter === '1W' ? -7 : chartFilter === '1M' ? -30 : 0).map(d => ({ label: d.label, value: d.value }))}
                  color="#ef4444"
                  gradId="ddGrad"
                  showZeroLine
                />
              </ChartCardWrapper>

              {/* ═══ TRADING CALENDAR ═══ */}
              <View style={{ marginTop: 10, marginBottom: 10 }}>
                <TradingCalendar />
              </View>

              {/* ═══ TRADES TABLE ═══ */}
              <View style={[styles.chartCard, { padding: 0, overflow: 'hidden', marginBottom: 100 }]}>
                {/* Tabs */}
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
                  <TouchableOpacity onPress={() => { hSelect(); setTradeTab('recent'); }} style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: tradeTab === 'recent' ? 2.5 : 0, borderBottomColor: '#6366f1' }}>
                    <Text style={{ fontSize: 16, fontFamily: tradeTab === 'recent' ? 'Inter_700Bold' : 'Inter_500Medium', color: tradeTab === 'recent' ? '#6366f1' : '#94a3b8' }}>Recent Trades</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { hSelect(); setTradeTab('open'); }} style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: tradeTab === 'open' ? 2.5 : 0, borderBottomColor: '#6366f1' }}>
                    <Text style={{ fontSize: 16, fontFamily: tradeTab === 'open' ? 'Inter_700Bold' : 'Inter_500Medium', color: tradeTab === 'open' ? '#6366f1' : '#94a3b8' }}>Open Positions</Text>
                  </TouchableOpacity>
                </View>
                {/* Table Header */}
                <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#111111' : '#f8fafc', paddingVertical: 10, paddingHorizontal: 16 }}>
                  <Text style={{ flex: 1, fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>Date</Text>
                  <Text style={{ flex: 1, fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', textAlign: 'center' }}>Symbol</Text>
                  <Text style={{ flex: 0.6, fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', textAlign: 'center' }}>Side</Text>
                  <Text style={{ flex: 0.7, fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', textAlign: 'right' }}>Net P&L</Text>
                </View>
                {/* Rows */}
                {(tradeTab === 'recent' ? storeTrades : []).map((t, i) => {
                  const pnl = t.profit || 0;
                  const typeLabel = t.type === 'buy' ? 'BUY' : 'SELL';
                  
                  return (
                  <View key={t.id || i} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#1c1c1c' : '#f8fafc', alignItems: 'center' }}>
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {new Date(t.created_at || (t as any).open_time).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', textAlign: 'center' }}>{t.symbol}</Text>
                    <View style={{ flex: 0.6, alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: t.type === 'buy' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                        {t.type === 'buy' ? <ArrowUpRight size={10} color="#10b981" /> : <ArrowDownRight size={10} color="#ef4444" />}
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: t.type === 'buy' ? '#10b981' : '#ef4444' }}>{typeLabel}</Text>
                      </View>
                    </View>
                    <Text style={{ flex: 0.7, fontSize: 13, fontFamily: 'Inter_700Bold', color: pnl >= 0 ? '#10b981' : '#ef4444', textAlign: 'right' }}>
                      {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                    </Text>
                  </View>
                )})}
                {tradeTab === 'recent' && storeTrades.length === 0 && (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>No recent trades</Text>
                  </View>
                )}
                {tradeTab === 'open' && (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>No open positions</Text>
                  </View>
                )}
              </View>

            </View>
          </Animated.View>
        </Animated.ScrollView>
        <ComingSoonVeil featureTitle="Trading Journal" subtitle="Smart trade journaling, automated MT5 sync & psychology tagging are launching soon." />
        </Animated.View>
      </View>
  );
}


const globalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  card: { flex: 1, backgroundColor: '#f8fafc', zIndex: 5 },
  metricCard: {
    backgroundColor: '#fafafa', borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 2, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  metricLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
  metricValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#0f172a', marginTop: 2, fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  metricSub: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 },
  iconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chartCard: {
    backgroundColor: '#fafafa', borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 2, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 36, paddingHorizontal: 12, borderRadius: 14,
    backgroundColor: '#fafafa', borderWidth: 2, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  actionBtnActiveAmber: {
    backgroundColor: '#fffbeb', borderColor: '#fef3c7',
  },
  actionBtnActivePurple: {
    backgroundColor: '#faf5ff', borderColor: '#f3e8ff',
  },
  actionBtnActiveGreen: {
    backgroundColor: '#ecfdf5', borderColor: '#d1fae5',
  },
  actionText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#64748b' },
  blurredText: { color: 'transparent', textShadowColor: 'rgba(15,23,42,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
});
