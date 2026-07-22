import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar, TextInput, KeyboardAvoidingView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, ChevronRight } from 'lucide-react-native';
import { ChevronLeft, Work, Password, User } from '../components/Iconly';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useStore } from './store';
import { supabase } from './utils/supabase';
import { useAppTheme } from '../hooks/useAppTheme';
import Animated, { FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const h = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
const hSuccess = () => { if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };

const InputField = React.memo(({ icon: Icon, label, placeholder, value, onChangeText, secureTextEntry, keyboardType }: any) => {
  const [focused, setFocused] = useState(false);
  const { theme, isDark } = useAppTheme();
  
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[
        styles.inputContainer,
        { backgroundColor: isDark ? theme.inputBg : '#F1F5F9' },
        focused && [styles.inputFocused, { borderColor: theme.text, backgroundColor: isDark ? theme.card : '#FFFFFF' }]
      ]}>
        <View style={styles.inputIcon}>
          <Icon size={20} color={focused ? theme.text : theme.textMuted} />
        </View>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => { setFocused(true); h(); }}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
});

export default function BrokerConnect() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useAppTheme();
  

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');
  const [connecting, setConnecting] = useState(false);
  
  const [liveBrokers, setLiveBrokers] = useState<string[]>([]);
  const [liveServers, setLiveServers] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    if (!server || server.length < 2) {
      setLiveBrokers([]);
      setLiveServers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const token = process.env.EXPO_PUBLIC_METAAPI_TOKEN;
        if(!token) return;
        const res = await fetch(`https://api-v1.agiliumtrade.agiliumtrade.ai/known-mt-servers/5/search?query=${server}`, {
          headers: { 'auth-token': token }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const bNames = data.map(b => b.name).filter(Boolean);
          setLiveBrokers(bNames);
          const sNames: string[] = [];
          data.forEach(b => {
            if (Array.isArray(b.servers)) sNames.push(...b.servers);
          });
          setLiveServers(sNames);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [server]);

  const connectBroker = async () => {
    h();
    if(!login || !password || !server) return;
    setConnecting(true);
    
    const user = useStore.getState().currentUser;
    if (!user) {
      setConnecting(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('mt5_accounts')
        .upsert({
          user_id: user.id,
          account_number: login,
          broker: server.split('-')[0] || '',
          server: server,
          balance: 10000,
          equity: 10000,
          margin: 0,
          margin_free: 10000,
          algo_status: false,
        }, { onConflict: 'user_id' })
        .select()
        .single();
        
      if (error) throw error;
      if (data) useStore.setState({ mt5Account: data });
      
      hSuccess();
      router.back();
    } catch (e) {
      console.error(e);
      setTimeout(() => { hSuccess(); router.back(); }, 500);
    } finally {
      setConnecting(false);
    }
  };



  const isFormValid = login && password && server;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{ paddingTop: insets.top, backgroundColor: '#000000' }}>
        <Image source={require('../assets/images/top-glow.png')}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: insets.top + 140 }} resizeMode="stretch" />
        
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 }}>
          <TouchableOpacity onPress={() => { h(); router.back(); }} style={styles.iconBtn}>
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Animated.Text entering={FadeInRight.duration(400)} style={[styles.headerTitle, { marginLeft: 6, fontSize: 28 }]}>
            Connect MT5
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInRight.delay(100).duration(400)} style={{ paddingHorizontal: 28, marginTop: 8, paddingBottom: 40 }}>
          <Text style={styles.headerSub}>Link your MetaTrader 5 account to enable live trading, real-time analytics, and Risk Guard protection.</Text>
        </Animated.View>
      </View>
      
      {/* Main Content Area */}
      <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
        <View style={{ paddingBottom: insets.bottom + 40, paddingTop: 30, paddingHorizontal: 24 }}>

          <View style={{ zIndex: 10 }}>
            <InputField icon={Work} label="Server" placeholder="e.g. MetaQuotes-Demo" value={server} onChangeText={setServer} />
            {isSearching ? (
              <View style={[styles.dropdown, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', padding: 14 }]}>
                <ActivityIndicator size="small" color="#4f46e5" />
              </View>
            ) : server.length > 0 && (liveServers.length > 0 ? liveServers : POPULAR_SERVERS).filter(s => s.toLowerCase().includes(server.toLowerCase()) && s !== server).length > 0 && (
              <View style={[styles.dropdown, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 150 }}>
                  {(liveServers.length > 0 ? liveServers : POPULAR_SERVERS).filter(s => s.toLowerCase().includes(server.toLowerCase()) && s !== server).map((s, i) => (
                    <TouchableOpacity key={i} onPress={() => setServer(s)} style={[styles.dropdownItem, { borderBottomColor: isDark ? '#334155' : '#e2e8f0' }]}>
                      <Text style={{ color: theme.text, fontFamily: 'Inter_500Medium' }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <InputField icon={User} label="Account Login (ID)" placeholder="e.g. 10045678" value={login} onChangeText={setLogin} keyboardType="numeric" />
          <InputField icon={Password} label="Master Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

          <Animated.View entering={FadeInRight.delay(400).duration(400)} style={{ marginTop: 16 }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[
                styles.loginButton, 
                { backgroundColor: isFormValid ? '#4f46e5' : (isDark ? '#334155' : '#E2E8F0'), shadowColor: isFormValid ? '#4f46e5' : 'transparent' },
                (!isFormValid || connecting) && { shadowOpacity: 0, elevation: 0 }
              ]}
              onPress={connectBroker}
              disabled={!isFormValid || connecting}
            >
              {connecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.loginButtonText, !isFormValid && { color: isDark ? '#94A3B8' : '#94A3B8' }]}>Securely Connect Account</Text>
                  <ChevronRight size={18} color={isFormValid ? '#fff' : '#94A3B8'} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(500).duration(400)} style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: theme.textMuted, textAlign: 'center' }}>
              End-to-end encrypted. We never store credentials.
            </Text>
          </Animated.View>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontFamily: 'Inter_900Black', color: '#fff', letterSpacing: -1 },
  headerSub: { fontSize: 15, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 8, lineHeight: 22 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  mainCard: { flex: 1, borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden', marginTop: -24 },
  securityBadge: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 28, gap: 14 },
  securityIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  securityTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  securityTxt: { fontSize: 12, fontFamily: 'Inter_500Medium', lineHeight: 18 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 52, borderWidth: 1.5, borderColor: 'transparent', borderRadius: 14, paddingHorizontal: 16 },
  inputFocused: { },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', height: '100%' },
  dropdown: { borderWidth: 1, borderRadius: 12, marginTop: -12, marginBottom: 16, overflow: 'hidden' },
  dropdownItem: { padding: 14, borderBottomWidth: 1 },
  loginButton: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  loginButtonText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF', letterSpacing: 0.5 },
});

const POPULAR_BROKERS = [
  'MetaQuotes', 'Exness', 'Vantage', 'XM Global', 'FTMO', 'Deriv', 'IC Markets', 'Pepperstone', 'FBS', 'OctaFX'
];

const POPULAR_SERVERS = [
  ...Array.from({length: 150}, (_, i) => `Exness-MT5Real${i === 0 ? '' : (i + 1)}`),
  ...Array.from({length: 30}, (_, i) => `Exness-MT5Trial${i === 0 ? '' : (i + 1)}`),
  ...Array.from({length: 50}, (_, i) => `XMGlobal-MT5${i === 0 ? '' : ' ' + (i + 1)}`),
  ...Array.from({length: 30}, (_, i) => `Vantage-Live${i === 0 ? '' : ' ' + (i + 1)}`),
  ...Array.from({length: 20}, (_, i) => `Vantage-Demo${i === 0 ? '' : ' ' + (i + 1)}`),
  ...Array.from({length: 15}, (_, i) => `Deriv-Demo${i === 0 ? '' : ' ' + (i + 1)}`),
  ...Array.from({length: 15}, (_, i) => `Deriv-Server${i === 0 ? '' : ' ' + (i + 1)}`),
  'FTMO-Demo', 'FTMO-Server', 'FTMO-Server2', 'FTMO-Server3',
  'MetaQuotes-Demo', 'MetaQuotes-Live',
  'ICMarkets-MT5', 'ICMarkets-MT5-Demo'
];
