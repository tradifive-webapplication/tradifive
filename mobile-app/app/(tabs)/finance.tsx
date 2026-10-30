import React, { useState, useEffect, useCallback } from 'react';
import ComingSoonVeil from '../../components/ComingSoonVeil';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Image, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ArrowUpRight, ArrowDownLeft, CreditCard,
  Clock, CheckCircle, XCircle, Download, Wallet, Receipt, PackageOpen
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';
import { useStore } from '../store';

const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

const FILTERS = ['All', 'Deposits', 'Withdrawals', 'Subscriptions'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  completed: { label: 'Completed', color: '#10b981', bg: '#dcfce7', icon: CheckCircle },
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fef9c3', icon: Clock },
  failed:    { label: 'Failed',    color: '#ef4444', bg: '#fee2e2', icon: XCircle },
  paid:      { label: 'Paid',      color: '#10b981', bg: '#dcfce7', icon: CheckCircle },
};

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  deposit:      { icon: ArrowDownLeft, color: '#10b981', bg: '#dcfce7' },
  withdrawal:   { icon: ArrowUpRight,  color: '#ef4444', bg: '#fee2e2' },
  subscription: { icon: CreditCard,    color: '#6366f1', bg: '#eef2ff' },
};

interface Transaction {
  id: string;
  type: string;
  label: string;
  amount: string;
  date: string;
  status: string;
  method: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function formatAmount(amount: number, type: string) {
  const abs = Math.abs(amount).toFixed(2);
  return type === 'deposit' ? `+$${abs}` : `-$${abs}`;
}

const EmptyState = ({ isDark, label }: { isDark: boolean; label: string }) => (
  <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
    <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: isDark ? '#1e2535' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
      <PackageOpen size={28} color={isDark ? '#475569' : '#94a3b8'} />
    </View>
    <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>
      No {label} yet
    </Text>
    <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: isDark ? '#475569' : '#cbd5e1', textAlign: 'center', maxWidth: 240, lineHeight: 20 }}>
      Your {label.toLowerCase()} history will appear here once activity is recorded.
    </Text>
  </View>
);

export default function Finance() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useAppTheme();

  const mt5Account = useStore(state => state.mt5Account);
  const profile    = useStore(state => state.currentUser);

  const [activeTab, setActiveTab]   = useState<'Transactions' | 'Payouts'>('Transactions');
  const [filter, setFilter]         = useState('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!profile?.id) { setLoading(false); return; }
    try {
      // Fetch from billing_history table which exists in Supabase
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped: Transaction[] = (data || []).map((row: any) => ({
        id:     row.id,
        type:   row.type || 'subscription',
        label:  row.description || row.plan_name || 'Subscription',
        amount: formatAmount(row.amount || 0, row.type || 'subscription'),
        date:   formatDate(row.created_at),
        status: row.status || 'completed',
        method: row.payment_method || 'Card',
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error('[Finance] Error fetching billing history:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const onRefresh = () => { setRefreshing(true); fetchTransactions(); };

  const filteredTxns = transactions.filter(t => {
    if (filter === 'All') return true;
    const filterType = filter.toLowerCase().replace(/s$/, '');
    return t.type === filterType || t.type === filter.toLowerCase();
  });

  // Balance from MT5 account
  const balance       = mt5Account?.balance   ?? 0;
  const equity        = mt5Account?.equity    ?? 0;
  const totalDeposits = transactions.filter(t => t.type === 'deposit').length > 0
    ? transactions.filter(t => t.type === 'deposit').reduce((acc, t) => {
        const num = parseFloat(t.amount.replace(/[^0-9.]/g, ''));
        return acc + (isNaN(num) ? 0 : num);
      }, 0)
    : null;

  const s = React.useMemo(() => {
    if (!isDark) return globalStyles;
    const shadowed: any = {};
    for (const key in globalStyles) {
      shadowed[key] = { ...(globalStyles as any)[key] };
      const bg = shadowed[key].backgroundColor;
      if (bg === '#fff' || bg === '#ffffff' || bg === '#fafafa') shadowed[key].backgroundColor = theme.card;
      else if (bg === '#f4f4f6' || bg === '#f8fafc') shadowed[key].backgroundColor = theme.background;
      const c = shadowed[key].color;
      if (c === '#0f172a' || c === '#1e293b') shadowed[key].color = theme.text;
      const bc = shadowed[key].borderColor;
      if (bc === '#f1f5f9' || bc === '#e2e8f0' || bc === '#f8fafc') shadowed[key].borderColor = theme.cardBorder;
    }
    if (shadowed.filterPillActive)    { shadowed.filterPillActive.backgroundColor = theme.text; shadowed.filterPillActive.borderColor = theme.text; }
    if (shadowed.tabActive)           { shadowed.tabActive.backgroundColor = theme.text; }
    if (shadowed.filterPillTxtActive) shadowed.filterPillTxtActive.color = theme.background;
    if (shadowed.tabTxtActive)        shadowed.tabTxtActive.color = theme.background;
    return shadowed;
  }, [isDark, theme]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { paddingTop: insets.top + 20 }]}>
        <Image source={require('../../assets/images/top-glow.png')} style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: insets.top + 200 }} resizeMode="stretch" />
        <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="#fff" />
            </View>
            <Text style={s.headerTitle}>Finance</Text>
          </View>

          {/* Balance Card — real MT5 balance */}
          <View style={s.balanceCard}>
            <Text style={s.balanceLabel}>MT5 Account Balance</Text>
            <Text style={s.balanceAmount}>
              {mt5Account ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </Text>
            {mt5Account && equity !== balance && (
              <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                Equity: ${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            )}
            {!mt5Account && (
              <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                Connect your broker to see balance
              </Text>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <TouchableOpacity style={s.balanceBtn} onPress={() => { h(); Alert.alert('Deposit', 'Contact your broker directly to deposit funds.'); }}>
                <ArrowDownLeft size={16} color="#fff" />
                <Text style={s.balanceBtnTxt}>Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.balanceBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={() => { h(); Alert.alert('Withdraw', 'Contact your broker directly to withdraw funds.'); }}>
                <ArrowUpRight size={16} color="#fff" />
                <Text style={s.balanceBtnTxt}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          {totalDeposits !== null && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <View style={s.miniStat}>
                <Receipt size={14} color="#10b981" />
                <View>
                  <Text style={s.miniStatLabel}>Billing Records</Text>
                  <Text style={[s.miniStatValue, { color: '#10b981' }]}>{transactions.length}</Text>
                </View>
              </View>
              <View style={s.miniStat}>
                <CreditCard size={14} color="#6366f1" />
                <View>
                  <Text style={s.miniStatLabel}>Total Billed</Text>
                  <Text style={[s.miniStatValue, { color: '#6366f1' }]}>${totalDeposits.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={s.mainCard}>
        {/* Tabs */}
        <View style={s.tabRow}>
          {(['Transactions', 'Payouts'] as const).map(t => (
            <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => { h(); setActiveTab(t); }}>
              <Text style={[s.tabTxt, activeTab === t && s.tabTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Transactions' && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f} style={[s.filterPill, filter === f && s.filterPillActive]} onPress={() => { h(); setFilter(f); }}>
                  <Text style={[s.filterPillTxt, filter === f && s.filterPillTxtActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loading ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ marginTop: 12, fontSize: 14, fontFamily: 'Inter_500Medium', color: isDark ? '#64748b' : '#94a3b8' }}>Loading transactions...</Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
              >
                {filteredTxns.length === 0 ? (
                  <EmptyState isDark={isDark} label="Transactions" />
                ) : (
                  filteredTxns.map((txn, idx) => {
                    const typeConf   = TYPE_CONFIG[txn.type]   ?? TYPE_CONFIG.subscription;
                    const statusConf = STATUS_CONFIG[txn.status] ?? STATUS_CONFIG.completed;
                    const IconT = typeConf.icon;
                    return (
                      <View key={txn.id} style={[s.txnRow, idx < filteredTxns.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? theme.cardBorder : '#f8fafc' }]}>
                        <View style={[s.txnIcon, { backgroundColor: typeConf.bg }]}><IconT size={18} color={typeConf.color} /></View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                          <Text style={s.txnLabel}>{txn.label}</Text>
                          <Text style={s.txnMeta}>{txn.date} · {txn.method}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Text style={[s.txnAmount, { color: txn.type === 'deposit' ? '#10b981' : txn.type === 'withdrawal' ? '#ef4444' : '#6366f1' }]}>{txn.amount}</Text>
                          <View style={[s.statusBadge, { backgroundColor: statusConf.bg }]}>
                            <Text style={[s.statusTxt, { color: statusConf.color }]}>{statusConf.label}</Text>
                          </View>
                        </View>
      <ComingSoonVeil
        featureTitle="Finance & Payouts"
        subtitle="Integrated trading wallet, automated profit payouts and financial reports are launching soon."
      />
    </View>
  );
})
                )}
                {filteredTxns.length > 0 && (
                  <TouchableOpacity style={s.exportBtn} onPress={() => { h(); Alert.alert('Export', 'CSV export coming soon!'); }}>
                    <Download size={16} color="#64748b" />
                    <Text style={s.exportTxt}>Export CSV</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </>
        )}

        {activeTab === 'Payouts' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120, paddingTop: 16 }}>
            <TouchableOpacity style={s.requestPayoutBtn} onPress={() => { h(); Alert.alert('Request Payout', 'Payout requests will be available soon. Contact support for manual payouts.'); }}>
              <ArrowUpRight size={18} color="#fff" />
              <Text style={s.requestPayoutTxt}>Request Payout</Text>
            </TouchableOpacity>
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Payout History</Text>
            <EmptyState isDark={isDark} label="Payouts" />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const globalStyles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#000' },
  header:            { backgroundColor: 'transparent', zIndex: 10 },
  headerTitle:       { fontSize: 26, fontFamily: 'Inter_900Black', color: '#fff' },
  balanceCard:       { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginTop: 16 },
  balanceLabel:      { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  balanceAmount:     { fontSize: 38, fontFamily: 'Inter_900Black', color: '#fff' },
  balanceBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flex: 1, justifyContent: 'center' },
  balanceBtnTxt:     { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
  miniStat:          { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12 },
  miniStatLabel:     { fontSize: 10, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  miniStatValue:     { fontSize: 14, fontFamily: 'Inter_800ExtraBold' },
  mainCard:          { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden' },
  tabRow:            { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, gap: 8 },
  tab:               { flex: 1, paddingVertical: 10, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center' },
  tabActive:         { backgroundColor: '#0f172a' },
  tabTxt:            { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#94a3b8' },
  tabTxtActive:      { color: '#fff' },
  filterPill:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  filterPillActive:  { backgroundColor: '#0f172a' },
  filterPillTxt:     { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' },
  filterPillTxtActive: { color: '#fff' },
  txnRow:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  txnIcon:           { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txnLabel:          { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#0f172a' },
  txnMeta:           { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginTop: 2 },
  txnAmount:         { fontSize: 15, fontFamily: 'Inter_800ExtraBold' },
  statusBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTxt:         { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  exportBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 8 },
  exportTxt:         { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#64748b' },
  requestPayoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0f172a', borderRadius: 20, paddingVertical: 16 },
  requestPayoutTxt:  { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  sectionTitle:      { fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#0f172a', marginBottom: 12 },
});
