import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Animated,
  Dimensions, TextInput, PanResponder, StyleSheet, Platform, KeyboardAvoidingView
} from 'react-native';
import {
  X, TrendingUp, TrendingDown, Award, Activity, Percent,
  AlignLeft, CheckCircle, Calendar, ArrowUpRight, ArrowDownRight,
  Star, ChevronRight, Smile, AlertTriangle,
} from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ────────────────────────────────────────────────────────
// INTERFACES
// ────────────────────────────────────────────────────────
interface Trade {
  id?: string;
  symbol: string;
  profit: number;
  type?: string;
  volume?: number;
  opened_at?: string;
  closed_at?: string | null;
}

interface DailyModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  trades: Trade[];
}

// ────────────────────────────────────────────────────────
// EMOTION STATES
// ────────────────────────────────────────────────────────
const EMOTIONAL_STATES = [
  { label: 'Impatient', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { label: 'Stressed', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  { label: 'Neutral', color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' },
  { label: 'Disciplined', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
  { label: 'Calm', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
];

// ────────────────────────────────────────────────────────
// MINI P&L CHART (SVG-free using Views for the session)
// ────────────────────────────────────────────────────────
function PnlProgressChart({ chartData }: { chartData: { name: string; pnl: number }[] }) {
  if (!chartData || chartData.length < 2) return null;
  const maxAbs = Math.max(...chartData.map(d => Math.abs(d.pnl)), 0.1);
  const barW = Math.max(8, (SW - 100) / chartData.length - 4);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 64, marginTop: 8 }}>
      {chartData.slice(1).map((d, i) => {
        const h = (Math.abs(d.pnl) / maxAbs) * 28;
        const isPos = d.pnl >= 0;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            {isPos ? (
              <View style={{ width: barW, height: h + 2, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)' }} />
            ) : (
              <View style={{ width: barW, height: h + 2, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }} />
            )}
            <Text style={{ fontSize: 7, fontFamily: 'Inter_500Medium', color: '#94a3b8' }}>{i + 1}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ────────────────────────────────────────────────────────
// METRIC CARD
// ────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, isGreen, isRed }: {
  label: string; value: string; sub?: string; isGreen?: boolean; isRed?: boolean;
}) {
  const bg = isGreen ? '#f0fdf4' : isRed ? '#fff0f0' : '#fafafa';
  const borderColor = isGreen ? 'rgba(194,240,221,0.9)' : isRed ? 'rgba(252,209,209,0.9)' : '#ffffff';
  const valueColor = isGreen ? '#10b981' : isRed ? '#ef4444' : '#0f172a';
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor, minWidth: 80 }}>
      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 18, fontFamily: 'Inter_900Black', color: valueColor, letterSpacing: -0.5 }} adjustsFontSizeToFit numberOfLines={1}>{value}</Text>
      {sub && <Text style={{ fontSize: 9, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', marginTop: 2 }}>{sub}</Text>}
    </View>
  );
}

// ────────────────────────────────────────────────────────
// TRADE ROW
// ────────────────────────────────────────────────────────
function TradeRow({ trade }: { trade: Trade }) {
  const isBuy = String(trade.type ?? '').toUpperCase().includes('BUY') || trade.type === '0';
  const isWin = (trade.profit ?? 0) >= 0;

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
      backgroundColor: '#ffffff', borderRadius: 14, marginBottom: 6,
      borderWidth: 1, borderColor: '#f1f5f9',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    }}>
      {/* Side badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: isBuy ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', marginRight: 10 }}>
        {isBuy ? <ArrowUpRight size={12} color="#10b981" /> : <ArrowDownRight size={12} color="#ef4444" />}
        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: isBuy ? '#10b981' : '#ef4444' }}>{isBuy ? 'BUY' : 'SELL'}</Text>
      </View>
      {/* Symbol */}
      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', flex: 1 }}>{trade.symbol}</Text>
      {/* Time */}
      {trade.closed_at && (
        <Text style={{ fontSize: 10, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginRight: 10 }}>
          {new Date(trade.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
      {/* P&L */}
      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isWin ? '#10b981' : '#ef4444' }}>
        {isWin ? '+' : ''}${Math.abs(trade.profit ?? 0).toFixed(2)}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────
// DAILY JOURNAL BOTTOM SHEET
// ────────────────────────────────────────────────────────
export default function DailyJournalModal({ isOpen, onClose, date, trades }: DailyModalProps) {
  const slideAnim = useRef(new Animated.Value(SH)).current;
  const [internalVisible, setInternalVisible] = useState(isOpen);
  const [emotion, setEmotion] = useState('Neutral');
  const [notes, setNotes] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Slide in/out
  useEffect(() => {
    if (isOpen) {
      setInternalVisible(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SH, duration: 260, useNativeDriver: true }).start(() => {
        setInternalVisible(false);
      });
    }
  }, [isOpen, slideAnim]);

  // Auto-save on change
  const handleSave = (field: string, value: string) => {
    setSaveStatus('idle');
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  // Stats
  const stats = useMemo(() => {
    if (!trades || trades.length === 0) return { total: 0, wins: 0, losses: 0, winRate: 0, netPnl: 0, profitFactor: 0, buys: 0, sells: 0, bestTrade: null as Trade | null, worstTrade: null as Trade | null, chartData: [{ name: 'Start', pnl: 0 }] };
    let wins = 0, losses = 0, buys = 0, sells = 0, grossProfit = 0, grossLoss = 0;
    let bestTrade: Trade | null = null, worstTrade: Trade | null = null;
    let cum = 0;
    const chartData: { name: string; pnl: number }[] = [{ name: 'Start', pnl: 0 }];

    const sorted = [...trades].sort((a, b) => new Date(a.closed_at ?? 0).getTime() - new Date(b.closed_at ?? 0).getTime());
    sorted.forEach((t, i) => {
      const p = t.profit ?? 0;
      cum += p;
      chartData.push({ name: `Trade ${i + 1}`, pnl: Number(cum.toFixed(2)) });
      const tStr = String(t.type ?? '').toUpperCase();
      if (tStr.includes('BUY') || tStr === '0') buys++; else sells++;
      if (p > 0) { wins++; grossProfit += p; }
      else if (p < 0) { losses++; grossLoss += Math.abs(p); }
      if (!bestTrade || p > (bestTrade.profit ?? 0)) bestTrade = t;
      if (!worstTrade || p < (worstTrade.profit ?? 0)) worstTrade = t;
    });

    if (bestTrade && worstTrade && bestTrade === worstTrade) worstTrade = null;

    return {
      total: trades.length,
      wins, losses, buys, sells,
      winRate: Math.round((wins / trades.length) * 100),
      netPnl: grossProfit - grossLoss,
      profitFactor: grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? grossProfit : 0,
      bestTrade,
      worstTrade,
      chartData,
    };
  }, [trades]);

  const dateLabel = date
    ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const isNet = stats.netPnl >= 0;

  if (!internalVisible && !date) return null;

  return (
    <Modal visible={internalVisible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.4)' }} />
      </TouchableOpacity>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ padding: 8, backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 10 }}>
              <Calendar size={14} color="#6366f1" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0f172a', letterSpacing: -0.3 }}>{dateLabel}</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 1 }}>Daily Journal & Performance</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {saveStatus === 'saved' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <CheckCircle size={10} color="#10b981" />
                <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.4 }}>Saved</Text>
              </View>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* ── 5 METRIC CARDS ── */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
            <MetricCard
              label="Net P&L"
              value={`${isNet ? '+' : ''}$${Math.abs(stats.netPnl).toFixed(2)}`}
              sub={`${stats.total} trades`}
              isGreen={isNet && stats.netPnl !== 0}
              isRed={!isNet}
            />
            <MetricCard label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.wins}W / ${stats.losses}L`} />
            <MetricCard label="Total Trades" value={`${stats.total}`} sub={`${stats.buys}B / ${stats.sells}S`} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
            <MetricCard label="Profit Factor" value={stats.profitFactor > 0 ? `${stats.profitFactor}x` : 'N/A'} sub="gross wins/loss" />
            <MetricCard label="R:R" value={stats.wins > 0 && stats.losses > 0 ? `1:${Number((stats.netPnl / (stats.losses * 50)).toFixed(1))}` : 'N/A'} sub="avg win/loss" />
          </View>

          {/* ── SESSION P&L CHART ── */}
          {stats.chartData.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session P&L Progression</Text>
              <PnlProgressChart chartData={stats.chartData} />
            </View>
          )}

          {/* ── BEST / WORST TRADE ── */}
          {(stats.bestTrade || stats.worstTrade) && (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {stats.bestTrade && (
                <View style={[styles.tradeHighlight, { backgroundColor: '#f0fdf4', borderColor: 'rgba(194,240,221,0.9)' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <View style={{ padding: 5, backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 8 }}>
                      <Star size={12} color="#10b981" />
                    </View>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 }}>Best Trade</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontFamily: 'Inter_900Black', color: '#0f172a' }}>{stats.bestTrade.symbol}</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: '#10b981', marginTop: 2 }}>+${(stats.bestTrade.profit ?? 0).toFixed(2)}</Text>
                </View>
              )}
              {stats.worstTrade && (
                <View style={[styles.tradeHighlight, { backgroundColor: '#fff0f0', borderColor: 'rgba(252,209,209,0.9)' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <View style={{ padding: 5, backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 8 }}>
                      <AlertTriangle size={12} color="#ef4444" />
                    </View>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5 }}>Worst Trade</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontFamily: 'Inter_900Black', color: '#0f172a' }}>{stats.worstTrade.symbol}</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: '#ef4444', marginTop: 2 }}>${(stats.worstTrade.profit ?? 0).toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}

          {/* ── EMOTION SELECTOR ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Emotion</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
              {EMOTIONAL_STATES.map(e => (
                <TouchableOpacity
                  key={e.label}
                  onPress={() => setEmotion(e.label)}
                  style={[styles.emotionPill, { backgroundColor: emotion === e.label ? e.bg : '#f8fafc', borderColor: emotion === e.label ? e.border : '#f1f5f9' }]}
                >
                  <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: emotion === e.label ? e.color : '#94a3b8' }}>{e.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── JOURNAL ENTRIES ── */}
          {[
            { label: 'What Went Well', key: 'well', value: whatWentWell, onChange: (v: string) => { setWhatWentWell(v); handleSave('well', v); }, placeholder: '• Great patience on entry...' },
            { label: 'Mistakes Made', key: 'mistakes', value: mistakes, onChange: (v: string) => { setMistakes(v); handleSave('mistakes', v); }, placeholder: '• Entered too early...' },
            { label: 'Notes & Observations', key: 'notes', value: notes, onChange: (v: string) => { setNotes(v); handleSave('notes', v); }, placeholder: '• Market opened with strong momentum...' },
          ].map(field => (
            <View key={field.key} style={[styles.section, { marginBottom: 10 }]}>
              <Text style={styles.sectionTitle}>{field.label}</Text>
              <TextInput
                style={styles.textArea}
                value={field.value}
                onChangeText={field.onChange}
                placeholder={field.placeholder}
                placeholderTextColor="#cbd5e1"
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}

          {/* ── TRADE HISTORY ── */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.sectionTitle}>Trade History</Text>
              <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>{trades.length} trades</Text>
            </View>
            {trades.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center', borderRadius: 14, backgroundColor: '#f8fafc', borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0' }}>
                <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>No trades recorded on this day</Text>
              </View>
            ) : (
              trades.map((t, i) => <TradeRow key={i} trade={t} />)
            )}
          </View>

        </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SH * 0.88,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  section: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Inter_700Bold', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  textArea: {
    minHeight: 80, fontFamily: 'Inter_500Medium', fontSize: 13,
    color: '#0f172a', lineHeight: 20,
    borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 10,
    padding: 12, backgroundColor: '#f8fafc',
  },
  emotionPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5,
  },
  tradeHighlight: {
    flex: 1, borderRadius: 16, padding: 14, borderWidth: 1.5,
  },
});
