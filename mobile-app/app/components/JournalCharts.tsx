import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Line, Text as SvgText, Circle } from 'react-native-svg';
import DailyJournalModal from './DailyJournalModal';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useStore } from '../store';

const SW = Dimensions.get('window').width;

// ─────────────────────────────────────────────────────────────────────────────
// CHART CARD WRAPPER — Matches web's premium card style
// ─────────────────────────────────────────────────────────────────────────────
export function ChartCardWrapper({
  title, legend, children, filterValue, onFilter, filters,
}: {
  title: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  filterValue?: string;
  onFilter?: (v: string) => void;
  filters?: string[];
}) {
  const { isDark, theme } = useAppTheme();
  return (
    <View style={{
      backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, padding: 20, marginBottom: 14, borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff',
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a', letterSpacing: -0.3 }}>{title}</Text>
          {legend && <View style={{ marginTop: 6 }}>{legend}</View>}
        </View>
        {filters && (
          <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9', borderRadius: 10, padding: 2, gap: 2 }}>
            {filters.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => onFilter?.(f)}
                style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                  backgroundColor: filterValue === f ? (isDark ? '#2b2b2b' : '#ffffff') : 'transparent',
                  shadowColor: filterValue === f ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
                }}
              >
                <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: filterValue === f ? (isDark ? '#ffffff' : '#0f172a') : '#94a3b8' }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGEND ROW
// ─────────────────────────────────────────────────────────────────────────────
export function LegendRow({ items }: { items: { color: string; label: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {items.map(item => (
        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
          <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG AREA CHART (Cumulative P&L, Account Balance, Drawdown)
// ─────────────────────────────────────────────────────────────────────────────
export function SvgAreaChart({
  data,
  color = '#3b82f6',
  gradId = 'areaGrad',
  height = 160,
  showZeroLine = true,
}: {
  data: { label: string; value: number }[];
  color?: string;
  gradId?: string;
  height?: number;
  showZeroLine?: boolean;
}) {
  const { isDark } = useAppTheme();
  if (!data || data.length < 2) return null;
  const W = SW - 72;
  const padT = 8, padB = 24, padL = 0, padR = 0;
  const chartW = W - padL - padR;
  const chartH = height - padT - padB;

  const vals = data.map(d => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => padT + (1 - (v - minV) / range) * chartH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.value)}`).join(' ');
  const fillPath = `${linePath} L${toX(data.length - 1)},${height - padB} L${toX(0)},${height - padB} Z`;

  const zeroY = toY(0);
  const showZero = showZeroLine && minV < 0 && maxV > 0;

  const labelStep = Math.max(1, Math.floor(data.length / 5));
  const labelItems = data.filter((_, i) => i % labelStep === 0 || i === data.length - 1);

  return (
    <Svg width={W} height={height}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.18} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <Line key={i} x1={0} y1={padT + f * chartH} x2={W} y2={padT + f * chartH} stroke={isDark ? '#1c1c1c' : '#f1f5f9'} strokeWidth={1} />
      ))}
      {showZero && (
        <Line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,4" />
      )}
      <Path d={fillPath} fill={`url(#${gradId})`} />
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {labelItems.map((d, idx) => {
        const origIdx = data.indexOf(d);
        return (
          <SvgText key={idx} x={toX(origIdx)} y={height - 4} fontSize={9} fontWeight="500" fill="#94a3b8" textAnchor="middle">
            {d.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG BAR CHART (Net Daily P&L, Duration Performance)
// ─────────────────────────────────────────────────────────────────────────────
export function SvgBarChart({
  data,
  height = 160,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const { isDark } = useAppTheme();
  if (!data || data.length === 0) return null;
  const W = SW - 72;
  const padT = 8, padB = 24;
  const chartH = height - padT - padB;

  const vals = data.map(d => d.value);
  const maxAbsV = Math.max(...vals.map(Math.abs), 1);
  const zeroY = padT + chartH / 2;
  const barW = Math.max(8, (W / data.length) * 0.55);
  const barGap = W / data.length;

  return (
    <Svg width={W} height={height}>
      {[-1, -0.5, 0, 0.5, 1].map((f, i) => (
        <Line key={i} x1={0} y1={padT + (1 - (f + 1) / 2) * chartH} x2={W} y2={padT + (1 - (f + 1) / 2) * chartH} stroke={isDark ? '#1c1c1c' : '#f1f5f9'} strokeWidth={1} />
      ))}
      <Line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,4" />
      {data.map((d, i) => {
        const bh = (Math.abs(d.value) / maxAbsV) * (chartH / 2 - 4);
        const x = i * barGap + barGap / 2 - barW / 2;
        const y = d.value >= 0 ? zeroY - bh : zeroY;
        const barColor = d.value >= 0 ? '#10b981' : '#ef4444';
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={barW} height={Math.max(bh, 3)} fill={barColor} rx={4} ry={4} />
            <SvgText x={x + barW / 2} y={height - 4} fontSize={9} fontWeight="500" fill="#94a3b8" textAnchor="middle">
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIN RATE GAUGE (compact, matches web donut)
// ─────────────────────────────────────────────────────────────────────────────
export function WinRateRing({ wins, losses }: { wins: number; losses: number }) {
  const { isDark } = useAppTheme();
  const total = wins + losses || 1;
  const pct = Math.round((wins / total) * 100);
  return (
    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 24, borderWidth: 4, borderColor: isDark ? '#1c1c1c' : '#f1f5f9' }} />
      <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 24, borderWidth: 4, borderColor: '#10b981', borderRightColor: 'transparent', borderBottomColor: pct < 75 ? 'transparent' : '#10b981', borderLeftColor: pct < 50 ? 'transparent' : '#10b981', transform: [{ rotate: '-45deg' }] }} />
      <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: '#10b981' }}>{pct}%</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFIT FACTOR GAUGE
// ─────────────────────────────────────────────────────────────────────────────
export function ProfitFactorGauge({ value }: { value: number }) {
  const { isDark } = useAppTheme();
  const color = value >= 1 ? '#10b981' : '#ef4444';
  return (
    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 22, borderWidth: 4, borderColor: isDark ? '#1c1c1c' : '#f1f5f9' }} />
      <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 22, borderWidth: 4, borderColor: color, borderRightColor: 'transparent', borderBottomColor: value >= 1.5 ? color : 'transparent', transform: [{ rotate: '-45deg' }] }} />
      <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color }}>{value.toFixed(2)}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIN/LOSS BAR
// ─────────────────────────────────────────────────────────────────────────────
export function WinLossBar({ avgWin, avgLoss, blurred, symbol = '$' }: {
  avgWin: number; avgLoss: number; blurred?: boolean; symbol?: string;
}) {
  const { isDark } = useAppTheme();
  const total = avgWin + Math.abs(avgLoss) || 1;
  const winW = (avgWin / total) * 100;
  return (
    <View style={{ width: '100%' }}>
      <View style={{ flexDirection: 'row', height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: isDark ? '#1c1c1c' : '#f1f5f9' }}>
        <View style={{ width: `${winW}%` as any, backgroundColor: '#10b981', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }} />
        <View style={{ flex: 1, backgroundColor: '#ef4444', borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
        <Text style={[{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#10b981' }, blurred && { opacity: 0.2 }]}>{symbol}{avgWin.toFixed(0)}</Text>
        <Text style={[{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#ef4444' }, blurred && { opacity: 0.2 }]}>-{symbol}{Math.abs(avgLoss).toFixed(0)}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRADING CALENDAR — Full web parity with click-through daily journal
// ─────────────────────────────────────────────────────────────────────────────
export function TradingCalendar() {
  const { isDark, theme } = useAppTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();

  const storeTrades = useStore(state => state.trades);

  const demoData: Record<number, number> = {};
  storeTrades.forEach(trade => {
    const d = new Date(trade.created_at || (trade as any).open_time);
    if (d.getFullYear() === year && d.getMonth() === month) {
       const day = d.getDate();
       demoData[day] = (demoData[day] || 0) + (trade.profit || 0);
    }
  });

  const getDemoTrades = (d: number) => {
    return storeTrades.filter(trade => {
      const td = new Date(trade.created_at || (trade as any).open_time);
      return td.getFullYear() === year && td.getMonth() === month && td.getDate() === d;
    });
  };

  const weeks: (number | null)[][] = [];
  const weeklyPnl: number[] = [];
  const weeklyDays: number[] = [];
  let day = 1;
  for (let w = 0; w < 6 && day <= daysInMonth; w++) {
    const week: (number | null)[] = [];
    let wPnl = 0;
    let wDays = 0;
    for (let d = 0; d < 7; d++) {
      if (w === 0 && d < startDay) { week.push(null); }
      else if (day > daysInMonth) { week.push(null); }
      else {
        week.push(day);
        if (demoData[day] !== undefined) { wPnl += demoData[day]; wDays++; }
        day++;
      }
    }
    weeks.push(week);
    weeklyPnl.push(wPnl);
    weeklyDays.push(wDays);
  }

  const monthlyTotal = Object.values(demoData).reduce((a, b) => a + b, 0);
  const tradingDays = Object.keys(demoData).length;
  const winningDays = Object.values(demoData).filter(v => v > 0).length;
  const bestDay = Object.entries(demoData).reduce((best, [d, v]) => v > best.pnl ? { day: Number(d), pnl: v } : best, { day: 0, pnl: -Infinity });
  const worstDay = Object.entries(demoData).reduce((worst, [d, v]) => v < worst.pnl ? { day: Number(d), pnl: v } : worst, { day: 0, pnl: Infinity });

  const handleDayPress = (d: number) => {
    const date = new Date(year, month, d);
    setSelectedDate(date);
    setModalOpen(true);
  };

  // Card margins (16*2) + Grid padding (8*2) + Gaps (7*3) + Weekly width (32) = 101
  const cellW = Math.floor((SW - 101) / 7);

  return (
    <>
      <View style={{
        backgroundColor: isDark ? '#111111' : '#fafafa', borderRadius: 24, marginBottom: 14,
        borderWidth: 2, borderColor: isDark ? '#222222' : '#ffffff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
        overflow: 'hidden',
      }}>
        {/* ── HEADER ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 14, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9',
          backgroundColor: isDark ? 'rgba(17,17,17,0.8)' : 'rgba(248,250,252,0.8)',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
              style={{ padding: 6, borderRadius: 8, backgroundColor: isDark ? '#1c1c1e' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#1c1c1c' : '#f1f5f9' }}
            >
              <ChevronLeft size={14} color="#64748b" />
            </TouchableOpacity>
            <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a', minWidth: 130, textAlign: 'center', letterSpacing: -0.3 }}>
              {monthLabel}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
              style={{ padding: 6, borderRadius: 8, backgroundColor: isDark ? '#1c1c1e' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#1c1c1c' : '#f1f5f9' }}
            >
              <ChevronRight size={14} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentDate(new Date())}
              style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#222222' : '#e2e8f0', backgroundColor: isDark ? '#111111' : '#fff', marginLeft: 4 }}
            >
              <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Today</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Monthly</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Inter_900Black', color: monthlyTotal >= 0 ? '#10b981' : '#ef4444', letterSpacing: -0.3 }}>
                {monthlyTotal >= 0 ? '+' : ''}${monthlyTotal.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSettings(!showSettings)}
              style={{
                padding: 6, borderRadius: 8,
                backgroundColor: showSettings ? (isDark ? '#2b2b2b' : '#f1f5f9') : (isDark ? '#1c1c1e' : '#f8fafc'),
                borderWidth: 1, borderColor: isDark ? '#1c1c1c' : '#f1f5f9',
              }}
            >
              <Settings size={13} color={showSettings ? (isDark ? '#ffffff' : '#0f172a') : '#94a3b8'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── DAY HEADERS ── */}
        <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', paddingHorizontal: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <View key={d} style={{ width: cellW, alignItems: 'center' }}>
              <Text style={{ fontSize: 8, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 }}>{d}</Text>
            </View>
          ))}
          <View style={{ width: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 8, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>Wkly</Text>
          </View>
        </View>

        {/* ── CALENDAR ROWS ── */}
        <View style={{ padding: 8, gap: 3 }}>
          {weeks.map((week, wIdx) => (
            <View key={wIdx} style={{ flexDirection: 'row', gap: 3 }}>
              {week.map((d, dIdx) => {
                const pnl = d !== null ? demoData[d] : undefined;
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const hasTrades = pnl !== undefined;

                let cellBg = isDark ? 'rgba(40,40,44,0.7)' : 'rgba(244,244,244,0.7)';
                let cellBorder = isDark ? 'rgba(50,50,54,0.9)' : 'rgba(231,231,231,0.9)';
                if (d === null) { cellBg = 'transparent'; cellBorder = 'rgba(200,200,200,0.15)'; }
                else if (pnl !== undefined && pnl > 0) { cellBg = isDark ? '#042f1a' : '#f0fdf4'; cellBorder = isDark ? '#065f46' : 'rgba(194,240,221,0.95)'; }
                else if (pnl !== undefined && pnl < 0) { cellBg = isDark ? '#4c0519' : '#fff0f0'; cellBorder = isDark ? '#881337' : 'rgba(252,209,209,0.95)'; }

                return (
                  <TouchableOpacity
                    key={dIdx}
                    disabled={d === null}
                    onPress={() => d !== null && handleDayPress(d)}
                    activeOpacity={0.75}
                    style={[{
                      width: cellW, minHeight: 52, alignSelf: 'stretch', borderRadius: 11,
                      backgroundColor: cellBg,
                      borderWidth: d !== null ? 1.5 : 1,
                      borderColor: cellBorder,
                      borderStyle: d === null ? 'dashed' : 'solid',
                      padding: 5, justifyContent: 'space-between',
                    }]}
                  >
                    {d !== null && (
                      <>
                        <View style={{ width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: isToday ? (isDark ? '#ffffff' : '#0f172a') : 'transparent' }}>
                          <Text style={{ fontSize: 9, fontFamily: isToday ? 'Inter_700Bold' : 'Inter_600SemiBold', color: isToday ? (isDark ? '#0f172a' : '#fff') : '#64748b' }}>{d}</Text>
                        </View>
                        {hasTrades && pnl !== undefined && (
                          <Text style={{ fontSize: 7, fontFamily: 'Inter_700Bold', color: pnl >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }} numberOfLines={1}>
                            {pnl >= 0 ? '+' : ''}{pnl}
                          </Text>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
              {/* Weekly pill */}
              <View style={{
                width: 32, minHeight: 52, alignSelf: 'stretch', borderRadius: 11,
                backgroundColor: isDark ? '#111111' : '#ffffff', borderWidth: 1.5, borderColor: isDark ? '#222222' : '#e7e7e7',
                alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
              }}>
                <Text style={{ fontSize: 7, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 }}>Wk {wIdx + 1}</Text>
                <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: weeklyPnl[wIdx] >= 0 ? '#10b981' : '#ef4444' }} numberOfLines={1}>
                  {weeklyPnl[wIdx] !== 0 ? `${weeklyPnl[wIdx] >= 0 ? '+' : ''}$${Math.abs(weeklyPnl[wIdx])}` : '₹0'}
                </Text>
                <Text style={{ fontSize: 6, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', marginTop: 1 }}>{weeklyDays[wIdx]}d</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── SETTINGS / INSIGHTS PANEL ── */}
        {showSettings && (
          <View style={{ margin: 8, padding: 14, backgroundColor: isDark ? '#1c1c1e' : '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: isDark ? '#222222' : '#f1f5f9' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Info size={11} color="#94a3b8" />
                <Text style={{ fontSize: 9, fontFamily: 'Inter_900Black', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Calendar Stats & Legend</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 8, fontFamily: 'Inter_900Black', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Color Legend</Text>
            <View style={{ flexDirection: 'row', gap: 5, marginBottom: 10 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(16,185,129,0.07)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#10b981' }} />
                <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a' }}>Profitable</Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(239,68,68,0.07)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#ef4444' }} />
                <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: isDark ? theme.text : '#0f172a' }}>Losing</Text>
              </View>
            </View>

            <Text style={{ fontSize: 8, fontFamily: 'Inter_900Black', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Monthly Insights</Text>
            <View style={{ flexDirection: 'row', gap: 5, marginBottom: 6 }}>
              {bestDay.pnl !== -Infinity && (
                <View style={{ flex: 1, padding: 9, borderRadius: 11, backgroundColor: 'rgba(16,185,129,0.05)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.18)' }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Inter_700Bold', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Best Day</Text>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_900Black', color: '#10b981' }}>+${bestDay.pnl}</Text>
                  <Text style={{ fontSize: 7, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', marginTop: 2 }}>Day {bestDay.day}</Text>
                </View>
              )}
              {worstDay.pnl !== Infinity && (
                <View style={{ flex: 1, padding: 9, borderRadius: 11, backgroundColor: 'rgba(239,68,68,0.05)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.18)' }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Inter_700Bold', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Worst Day</Text>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_900Black', color: '#ef4444' }}>${worstDay.pnl}</Text>
                  <Text style={{ fontSize: 7, fontFamily: 'Inter_600SemiBold', color: '#94a3b8', marginTop: 2 }}>Day {worstDay.day}</Text>
                </View>
              )}
            </View>
            <View style={{ padding: 9, borderRadius: 11, backgroundColor: isDark ? '#1a1a1e' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#222222' : '#f1f5f9', gap: 5 }}>
              {[
                { label: 'Avg Daily P&L', value: `${monthlyTotal >= 0 ? '+' : ''}$${tradingDays > 0 ? (monthlyTotal / tradingDays).toFixed(2) : '0.00'}`, color: monthlyTotal >= 0 ? '#10b981' : '#ef4444' },
                { label: 'Winning Days', value: `${winningDays} / ${tradingDays} (${tradingDays > 0 ? Math.round((winningDays / tradingDays) * 100) : 0}%)`, color: isDark ? theme.text : '#0f172a' },
                { label: 'Active Trading Days', value: `${tradingDays}`, color: isDark ? theme.text : '#0f172a' },
              ].map(item => (
                <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 }}>{item.label}</Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter_900Black', color: item.color }}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ── DAILY JOURNAL MODAL ── */}
      <DailyJournalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedDate}
        trades={selectedDate ? getDemoTrades(selectedDate.getDate()) : []}
      />
    </>
  );
}

// Default export to prevent Expo Router crash
export default function JournalCharts() {
  return null;
}
