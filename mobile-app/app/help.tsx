import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, KeyboardAvoidingView, Platform, FlatList, StatusBar, Image, DeviceEventEmitter, Animated, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Search, MessageSquare, Ticket, ChevronRight, Phone, Mail, HelpCircle, AlertCircle, BookOpen, CreditCard, ShieldCheck, UserCog, LayoutGrid, UserCheck, LineChart, Gift, Server, Plus, Send, X, Paperclip } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getHeaderStyle, HeaderStyle } from './utils/headerStore';
import { useStore } from './store';
import { supabase } from './utils/supabase';

const { width } = Dimensions.get('window');

const h = (s: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(s);
    } catch (e) { }
  }
};

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  created_at: string;
}

interface ChatReply {
  id: string;
  ticket_id: string;
  message: string;
  admin_id: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: '1', title: 'Payments', desc: 'Deposit/Withdrawal issues, Internal transfer, Token/Blockchain error.', icon: CreditCard, color: '#f59e0b', bg: '#fffbeb' },
  { id: '2', title: 'Account & Security', desc: 'Change information, Access issues, SMS & Emails, Security.', icon: UserCog, color: '#3b82f6', bg: '#eff6ff' },
  { id: '3', title: 'Tradifive Platforms', desc: 'Web App, API connections, Algo configuration, Social trading.', icon: LayoutGrid, color: '#10b981', bg: '#f0fdf4' },
  { id: '4', title: 'Account Verification', desc: 'KYC status, Proof of Identity, Residence documents.', icon: UserCheck, color: '#6366f1', bg: '#eef2ff' },
  { id: '5', title: 'Trading', desc: 'Exchange connection, Slippage complaints, Wrong charges.', icon: LineChart, color: '#ec4899', bg: '#fdf2f8' },
  { id: '6', title: 'Programs & Rewards', desc: 'Partnership benefits, Affiliates, General reward inquiries.', icon: Gift, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: '7', title: 'VPS Management', desc: 'Terminal updates, High ping, Password issues, Logging in.', icon: Server, color: '#14b8a6', bg: '#f0fdfa' },
];

const INITIAL_TICKETS: SupportTicket[] = [];

const INITIAL_REPLIES: Record<string, ChatReply[]> = {};

const FAQS = [
  { id: '1', q: 'How do I connect my broker?', a: 'Go to Settings > Broker Integrations and enter your MT5 server details or scan the QR code.' },
  { id: '2', q: 'My algo stopped trading. What should I do?', a: 'Check the Risk Guard — your Kill Switch may have triggered. Verify your broker connection in Settings > Integrations.' },
  { id: '3', q: 'How do I adjust my daily drawdown limit?', a: 'Go to Risk Guard settings and update the Max Daily Drawdown. Changes take effect at the next session.' },
  { id: '4', q: 'Why is my account verification pending?', a: 'KYC verification takes up to 48 hours. Ensure your ID and proof of residence are clear and valid.' },
];

export default function HelpCentre() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyle>(getHeaderStyle());
  
  // Track if this screen was launched directly into a sub-mode (e.g. from Settings)
  const launchedFromExternal = !!params.mode && params.mode !== 'hub';

  const [viewMode, setViewMode] = useState<'hub' | 'ticket_step_contacted' | 'ticket_step1' | 'ticket_step2' | 'ticket_detail' | 'live_chat'>((params.mode as any) || 'hub');
  const currentHeaderStyle = viewMode === 'hub' ? headerStyle : 'simple';

  const [search, setSearch] = useState('');
  const [contactedBefore, setContactedBefore] = useState<'yes' | 'no' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [ticketReplies, setTicketReplies] = useState<Record<string, ChatReply[]>>(INITIAL_REPLIES);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    if (!currentUser?.id) return;

    const loadTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          // Fallback to user_feedback if support_tickets does not exist or empty
          const { data: fbData } = await supabase
            .from('user_feedback')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
          if (fbData && fbData.length > 0) {
            setTickets(fbData.map(f => ({
              id: `FB-${f.id}`,
              subject: 'User Feedback',
              category: 'General',
              description: f.feedback_text,
              status: 'open',
              created_at: f.created_at
            })));
          }
          return;
        }
        if (data && data.length > 0) {
          setTickets(data.map((t: any) => ({
            id: t.id.toString(),
            subject: t.description ? (t.description.substring(0, 30) + '...') : 'Support Ticket',
            category: t.category || 'General',
            description: t.description || '',
            status: t.status || 'open',
            created_at: t.created_at
          })));
        }
      } catch (err) {
        console.error('Error fetching support tickets:', err);
      }
    };

    loadTickets();
  }, [currentUser]);

  useEffect(() => {
    if (params.ticketId && tickets.length > 0 && tickets !== INITIAL_TICKETS) {
      const ticket = tickets.find(t => t.id === params.ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
        setViewMode('ticket_detail');
      }
    }
  }, [params.ticketId, tickets]);

  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [ticketInput, setTicketInput] = useState('');
  const [botInput, setBotInput] = useState('');

  const [botMessages, setBotMessages] = useState<any[]>([
    { id: '1', role: 'ai', text: "Hello! I am Tradifive's Intelligent Assistant. How can I help you today?", time: new Date() }
  ]);

  const replyScrollRef = useRef<ScrollView>(null);
  const botScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const l1 = DeviceEventEmitter.addListener('headerStyleChanged', (style: HeaderStyle) => setHeaderStyleState(style));
    return () => { l1.remove(); };
  }, []);

  useEffect(() => {
    if (viewMode === 'ticket_detail') {
      setTimeout(() => replyScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [viewMode, ticketReplies, selectedTicket]);

  useEffect(() => {
    if (viewMode === 'live_chat') {
      setTimeout(() => botScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [viewMode, botMessages]);

  const handleOpenTicket = (ticket: SupportTicket) => {
    h(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTicket(ticket);
    setViewMode('ticket_detail');
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newDesc.trim()) return;
    h(Haptics.ImpactFeedbackStyle.Medium);

    const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      id: newId,
      subject: newSubject,
      category: selectedCategory,
      description: newDesc,
      status: 'open',
      created_at: new Date().toISOString()
    };

    setTickets(prev => [newTicket, ...prev]);
    setTicketReplies(prev => ({
      ...prev,
      [newId]: []
    }));

    const subject = newSubject;
    const desc = newDesc;
    const cat = selectedCategory;

    setNewSubject('');
    setNewDesc('');
    setSelectedCategory('');
    setContactedBefore(null);

    setSelectedTicket(newTicket);
    setViewMode('ticket_detail');

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: currentUser?.id,
          description: desc,
          category: cat,
          status: 'open'
        }]);

      if (error) {
        const { error: fbErr } = await supabase
          .from('user_feedback')
          .insert([{
            user_id: currentUser?.id,
            feedback_text: desc,
            category: cat
          }]);
        if (fbErr) throw fbErr;
      }
    } catch (err) {
      console.log('Error creating ticket in database:', err);
    }
  };

  const handleSendTicketReply = () => {
    if (!ticketInput.trim() || !selectedTicket) return;
    h(Haptics.ImpactFeedbackStyle.Light);

    const replyMsg = ticketInput.trim();
    setTicketInput('');

    const newReply: ChatReply = {
      id: Math.random().toString(),
      ticket_id: selectedTicket.id,
      message: replyMsg,
      admin_id: null,
      created_at: new Date().toISOString()
    };

    setTicketReplies(prev => ({
      ...prev,
      [selectedTicket.id]: [...(prev[selectedTicket.id] || []), newReply]
    }));

    setTimeout(() => {
      const adminReply: ChatReply = {
        id: Math.random().toString(),
        ticket_id: selectedTicket.id,
        message: 'Thank you for the update. Our operations team has been notified and we are investigating the details. We will update you here shortly.',
        admin_id: 'admin_agent',
        created_at: new Date().toISOString()
      };
      setTicketReplies(prev => ({
        ...prev,
        [selectedTicket.id]: [...(prev[selectedTicket.id] || []), adminReply]
      }));
    }, 2000);
  };

  const handleSendBotMessage = () => {
    if (!botInput.trim()) return;
    h(Haptics.ImpactFeedbackStyle.Light);

    const userMsg = botInput.trim();
    setBotInput('');

    setBotMessages(prev => [...prev, {
      id: Math.random().toString(),
      role: 'user',
      text: userMsg,
      time: new Date()
    }]);

    setTimeout(() => {
      setBotMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'ai',
        text: `I have received your request regarding "${userMsg}". You can link a human representative at any time, or look up our knowledge categories below.`,
        time: new Date()
      }]);
    }, 1200);
  };

  const escalateBotToTicket = () => {
    h(Haptics.ImpactFeedbackStyle.Medium);
    setViewMode('ticket_step_contacted');
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      DeviceEventEmitter.emit('scrollUpdate', value);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const handleBack = () => {
    h();
    if (viewMode === 'hub') {
      router.back();
    } else if (viewMode === 'ticket_step_contacted' || viewMode === 'live_chat') {
      if (launchedFromExternal) {
        router.back();
      } else {
        setViewMode('hub');
      }
    } else if (viewMode === 'ticket_step1') {
      setViewMode('ticket_step_contacted');
    } else if (viewMode === 'ticket_step2') {
      setViewMode('ticket_step1');
    } else if (viewMode === 'ticket_detail') {
      if (launchedFromExternal) {
        router.back();
      } else {
        setViewMode('hub');
        setSelectedTicket(null);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentHeaderStyle === 'simple' ? '#f4f4f6' : '#000000' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={currentHeaderStyle === 'simple' ? "dark-content" : "light-content"} />

      <Image
        source={require('../assets/images/top-glow.png')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 150, opacity: currentHeaderStyle === 'simple' ? 0 : 0.8 }}
        resizeMode="stretch"
      />

      {/* ── STATIC HEADER ── */}
      <Animated.View style={{ 
        height: currentHeaderStyle === 'simple' ? insets.top + 56 : insets.top + 92, 
        backgroundColor: currentHeaderStyle === 'simple' ? '#ffffff' : 'transparent', 
        borderBottomWidth: currentHeaderStyle === 'simple' ? 1 : 0, 
        borderBottomColor: '#e2e8f0', 
        position: 'relative', 
        zIndex: 1000, 
        transform: currentHeaderStyle === 'simple' ? [] : [
          { scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.85], extrapolate: 'clamp' }) }, 
          { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -60], extrapolate: 'clamp' }) }
        ] 
      }}>
        <Animated.View style={{ 
          position: 'absolute', 
          bottom: currentHeaderStyle === 'simple' ? 12 : 38, 
          left: 0, 
          right: 0, 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 20, 
          opacity: currentHeaderStyle === 'simple' ? 1 : scrollY.interpolate({ inputRange: [0, 140], outputRange: [1, 0], extrapolate: 'clamp' }) 
        }}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
          >
            <ChevronLeft size={26} color={currentHeaderStyle === 'simple' ? '#000000' : '#ffffff'} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentHeaderStyle === 'simple' ? '#000000' : '#ffffff' }]}>
            {viewMode === 'hub' ? 'Help Centre' :
              viewMode === 'live_chat' ? 'Assistant' :
                viewMode === 'ticket_detail' ? `Ticket #${selectedTicket?.id}` : 'Open a Ticket'}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* ── CONTENT CONTAINER ── */}
      <Animated.View style={[
        styles.mainCard, 
        { 
          marginTop: currentHeaderStyle === 'simple' ? 0 : scrollY.interpolate({ inputRange: [0, 150], outputRange: [-34, -184], extrapolate: 'clamp' }), 
          borderTopLeftRadius: currentHeaderStyle === 'simple' ? 0 : 40, 
          borderTopRightRadius: currentHeaderStyle === 'simple' ? 0 : 40 
        }
      ]}>
        {viewMode === 'hub' && (
          <Animated.ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
            scrollEventThrottle={16}
          >
            <Animated.View style={currentHeaderStyle === 'simple' ? [] : { transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 150], outputRange: [0, 150], extrapolate: 'clamp' }) }] }}>

              {/* PREMIUM HERO */}
              <View style={[styles.heroCardContainer, { elevation: 4, shadowColor: '#3b82f6', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }]}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.heroCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Decorative Elements */}
                  <View style={styles.heroDecoCircle1} />
                  <View style={styles.heroDecoCircle2} />
                  
                  <Text style={styles.heroTitle}>How can we help you?</Text>
                  <Text style={styles.heroSub}>Search our knowledge base or reach our team</Text>
                  
                  <View style={styles.searchBox}>
                    <Search size={17} color="#94a3b8" />
                    <TextInput
                      style={[styles.searchInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
                      placeholder="Search for help, guides, topics..."
                    placeholderTextColor="#94a3b8"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                      <X size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
                </LinearGradient>
              </View>

              {/* QUICK ACTIONS — 2×2 grid */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Get Support</Text>
                <View style={styles.actionGrid}>
                  <TouchableOpacity style={styles.actionCard} onPress={() => { h(Haptics.ImpactFeedbackStyle.Medium); setViewMode('live_chat'); }} activeOpacity={0.85}>
                    <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
                      <MessageSquare size={22} color="#2563eb" />
                    </View>
                    <Text style={styles.actionTitle}>Live Assistant</Text>
                    <Text style={styles.actionDesc}>Chat with AI support</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={() => { h(Haptics.ImpactFeedbackStyle.Medium); setViewMode('ticket_step_contacted'); }} activeOpacity={0.85}>
                    <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
                      <Ticket size={22} color="#16a34a" />
                    </View>
                    <Text style={styles.actionTitle}>Open Ticket</Text>
                    <Text style={styles.actionDesc}>Submit a request</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={() => Linking.openURL('mailto:support@tradifive.in')} activeOpacity={0.85}>
                    <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                      <Mail size={22} color="#d97706" />
                    </View>
                    <Text style={styles.actionTitle}>Email Us</Text>
                    <Text style={styles.actionDesc}>support@tradifive.in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={() => Linking.openURL('tel:0008001004378')} activeOpacity={0.85}>
                    <View style={[styles.actionIcon, { backgroundColor: '#fce7f3' }]}>
                      <Phone size={22} color="#db2777" />
                    </View>
                    <Text style={styles.actionTitle}>Call Support</Text>
                    <Text style={styles.actionDesc}>000-800-100-4378</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* MY TICKETS */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>My Tickets</Text>
                {tickets.length === 0 ? (
                  <View style={styles.emptyTickets}>
                    <View style={styles.emptyIconWrap}>
                      <Ticket size={24} color="#94a3b8" />
                    </View>
                    <Text style={styles.emptyTicketsTitle}>No active tickets</Text>
                    <Text style={styles.emptyTicketsText}>You have no open support requests.</Text>
                  </View>
                ) : (
                  <View style={styles.ticketList}>
                    {tickets.map(ticket => (
                      <TouchableOpacity key={ticket.id} style={styles.ticketItem} onPress={() => handleOpenTicket(ticket)} activeOpacity={0.85}>
                        <View style={[
                          styles.ticketAccent,
                          ticket.status === 'resolved' ? { backgroundColor: '#16a34a' } :
                          ticket.status === 'in-progress' ? { backgroundColor: '#d97706' } : { backgroundColor: '#2563eb' }
                        ]} />
                        <View style={styles.ticketContent}>
                          <View style={styles.ticketHeader}>
                            <Text style={styles.ticketId}>#{ticket.id}</Text>
                            <View style={[styles.statusBadge, ticket.status === 'resolved' ? styles.statusResolved : ticket.status === 'in-progress' ? styles.statusProgress : styles.statusOpen]}>
                              <Text style={[styles.statusText, ticket.status === 'resolved' ? { color: '#16a34a' } : ticket.status === 'in-progress' ? { color: '#d97706' } : { color: '#2563eb' }]}>{ticket.status}</Text>
                            </View>
                          </View>
                          <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                          <Text style={styles.ticketMeta}>{ticket.category} · {new Date(ticket.created_at).toLocaleDateString()}</Text>
                        </View>
                        <ChevronRight size={16} color="#cbd5e1" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* FAQS */}
              <View style={[styles.section, { marginBottom: 60 }]}>
                <Text style={styles.sectionTitle}>Common Questions</Text>
                <View style={styles.faqCard}>
                  {FAQS.map((faq, idx) => (
                    <TouchableOpacity key={faq.id} style={[styles.faqItem, idx === FAQS.length - 1 && { borderBottomWidth: 0 }]} onPress={() => h()} activeOpacity={0.7}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.faqQ}>{faq.q}</Text>
                        <Text style={styles.faqA}>{faq.a}</Text>
                      </View>
                      <ChevronRight size={16} color="#cbd5e1" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </Animated.View>
          </Animated.ScrollView>
        )}

        {/* STEP 0: CONTACTED BEFORE CHECK */}
        {viewMode === 'ticket_step_contacted' && (
          <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.noticeBox}>
              <AlertCircle size={18} color="#3b82f6" />
              <Text style={styles.noticeText}>
                Submitting multiple tickets for the same issue slows down response times.
              </Text>
            </View>

            <Text style={styles.stepLabel}>Have you reached out about this matter previously?</Text>

            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioItem, contactedBefore === 'yes' && styles.radioActive]}
                onPress={() => { h(); setContactedBefore('yes'); }}
              >
                <View style={[styles.radioCircle, contactedBefore === 'yes' && styles.radioCircleActive]} />
                <Text style={styles.radioLabel}>Yes, I want to follow up on a previous ticket</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioItem, contactedBefore === 'no' && styles.radioActive]}
                onPress={() => { h(); setContactedBefore('no'); }}
              >
                <View style={[styles.radioCircle, contactedBefore === 'no' && styles.radioCircleActive]} />
                <Text style={styles.radioLabel}>No, this is a completely new issue</Text>
              </TouchableOpacity>
            </View>

            {contactedBefore === 'yes' && (
              <View style={styles.existingTicketBox}>
                <Text style={styles.inputLabel}>Select Previous Ticket</Text>
                {tickets.length === 0 ? (
                  <Text style={styles.warningText}>No previous tickets found.</Text>
                ) : (
                  <View style={styles.simpleList}>
                    {tickets.map(t => (
                      <TouchableOpacity
                        key={t.id}
                        style={styles.simpleListItem}
                        onPress={() => handleOpenTicket(t)}
                      >
                        <Text style={styles.simpleListSubject}>#{t.id} - {t.subject}</Text>
                        <ChevronRight size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => { h(); setViewMode('hub'); setContactedBefore(null); }}
              >
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnPrimary, (!contactedBefore || contactedBefore === 'yes') && { opacity: 0.5 }]}
                disabled={!contactedBefore || contactedBefore === 'yes'}
                onPress={() => { h(); setViewMode('ticket_step1'); }}
              >
                <Text style={styles.btnPrimaryText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* STEP 1: CATEGORY SELECTION */}
        {viewMode === 'ticket_step1' && (
          <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepLabel}>Select a Support Category</Text>
            <Text style={styles.stepSub}>Choose the topic closest to your inquiry:</Text>

            <View style={styles.categoryList}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.title;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catSelectCard, isSelected && styles.catSelectActive]}
                    onPress={() => { h(); setSelectedCategory(cat.title); }}
                  >
                    <View style={[styles.catIconBoxWrap, { backgroundColor: cat.bg }]}>
                      <cat.icon size={22} color={cat.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={styles.catSelectTitle}>{cat.title}</Text>
                      <Text style={styles.catSelectDesc}>{cat.desc}</Text>
                    </View>
                    <View style={[styles.catCheck, isSelected && styles.catCheckActive]} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => { h(); setViewMode('ticket_step_contacted'); }}
              >
                <Text style={styles.btnSecondaryText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnPrimary, !selectedCategory && { opacity: 0.5 }]}
                disabled={!selectedCategory}
                onPress={() => { h(); setViewMode('ticket_step2'); }}
              >
                <Text style={styles.btnPrimaryText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* STEP 2: DETAILS FORM */}
        {viewMode === 'ticket_step2' && (
          <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={styles.stepLabel}>Inquiry Details</Text>
            <Text style={styles.stepSub}>Selected Category: <Text style={{ fontFamily: 'Inter_700Bold', color: '#0f172a' }}>{selectedCategory}</Text></Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={[styles.textInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
                placeholder="Brief summary of the issue..."
                placeholderTextColor="#94a3b8"
                value={newSubject}
                onChangeText={setNewSubject}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Detailed Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
                placeholder="Explain the issues, replication steps, account numbers..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={6}
                value={newDesc}
                onChangeText={setNewDesc}
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => { h(); setViewMode('ticket_step1'); }}
              >
                <Text style={styles.btnSecondaryText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnPrimary, (!newSubject.trim() || !newDesc.trim()) && { opacity: 0.5 }]}
                disabled={!newSubject.trim() || !newDesc.trim()}
                onPress={handleCreateTicket}
              >
                <Text style={styles.btnPrimaryText}>Submit Ticket</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* TICKET CHAT DETAIL */}
        {viewMode === 'ticket_detail' && selectedTicket && (
          <View style={styles.chatContainer}>
            <View style={styles.ticketBanner}>
              <Text style={styles.bannerCategory}>{selectedTicket.category.toUpperCase()}</Text>
              <Text style={styles.bannerSubject}>{selectedTicket.subject}</Text>
              <Text style={styles.bannerDesc}>{selectedTicket.description}</Text>
            </View>

            <ScrollView
              ref={replyScrollRef}
              contentContainerStyle={styles.chatScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* System init message */}
              <View style={styles.systemMessage}>
                <Text style={styles.systemMessageText}>Ticket successfully generated on {new Date(selectedTicket.created_at).toLocaleString()}</Text>
              </View>

              {/* Replies */}
              {(ticketReplies[selectedTicket.id] || []).map((reply) => {
                const isAdmin = reply.admin_id !== null;
                return (
                  <View
                    key={reply.id}
                    style={[styles.bubbleWrapper, isAdmin ? { justifyContent: 'flex-start' } : { justifyContent: 'flex-end' }]}
                  >
                    <View style={[
                      styles.chatBubble,
                      isAdmin ? styles.adminBubble : styles.userBubble
                    ]}>
                      <Text style={[styles.bubbleText, isAdmin ? { color: '#0f172a' } : { color: '#ffffff' }]}>
                        {reply.message}
                      </Text>
                      <Text style={[styles.bubbleTime, isAdmin ? { color: '#94a3b8' } : { color: 'rgba(255,255,255,0.6)' }]}>
                        {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* REPLY BAR */}
            {selectedTicket.status !== 'resolved' ? (
              <View style={styles.inputBar}>
                <TextInput
                  style={[styles.chatInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
                  placeholder="Type your message..."
                  placeholderTextColor="#94a3b8"
                  value={ticketInput}
                  onChangeText={setTicketInput}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !ticketInput.trim() && { opacity: 0.5 }]}
                  disabled={!ticketInput.trim()}
                  onPress={handleSendTicketReply}
                >
                  <Send size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.resolvedBar}>
                <Text style={styles.resolvedText}>This ticket is resolved and closed.</Text>
              </View>
            )}
          </View>
        )}

        {/* LIVE ASSISTANT CHAT */}
        {viewMode === 'live_chat' && (
          <View style={styles.chatContainer}>
            <ScrollView
              ref={botScrollRef}
              contentContainerStyle={styles.chatScroll}
              showsVerticalScrollIndicator={false}
            >
              {botMessages.map((msg) => {
                const isAi = msg.role === 'ai';
                return (
                  <View
                    key={msg.id}
                    style={[styles.bubbleWrapper, isAi ? { justifyContent: 'flex-start' } : { justifyContent: 'flex-end' }]}
                  >
                    <View style={[
                      styles.chatBubble,
                      isAi ? styles.adminBubble : styles.userBubble
                    ]}>
                      <Text style={[styles.bubbleText, isAi ? { color: '#0f172a' } : { color: '#ffffff' }]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.bubbleTime, isAi ? { color: '#94a3b8' } : { color: 'rgba(255,255,255,0.6)' }]}>
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Quick Action Suggestion */}
            <View style={styles.quickOptionsPanel}>
              <TouchableOpacity style={styles.quickOptionChip} onPress={escalateBotToTicket}>
                <Text style={styles.quickOptionText}>Escalate to Live Agent</Text>
              </TouchableOpacity>
            </View>

            {/* INPUT BAR */}
            <View style={styles.inputBar}>
              <TextInput
                style={[styles.chatInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
                placeholder="Ask a question..."
                placeholderTextColor="#94a3b8"
                value={botInput}
                onChangeText={setBotInput}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !botInput.trim() && { opacity: 0.5 }]}
                disabled={!botInput.trim()}
                onPress={handleSendBotMessage}
              >
                <Send size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { backgroundColor: 'transparent', zIndex: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 16 },
  backBtn: { alignItems: 'center', justifyContent: 'center', marginRight: 8, paddingVertical: 4, paddingHorizontal: 4 },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#ffffff', letterSpacing: -0.5 },

  mainCard: { flex: 1, backgroundColor: '#f4f4f6', overflow: 'hidden' },
  scrollContent: { paddingBottom: 100, paddingTop: 4 },

  // ── HERO ──
  heroCardContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 24,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecoCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    top: -80,
    right: -60,
  },
  heroDecoCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    bottom: -30,
    left: -20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef2ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.1)',
  },
  heroBadgeText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#4f46e5', letterSpacing: 0.3 },
  heroTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 6, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#64748b', marginBottom: 22, lineHeight: 20 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff',
    paddingHorizontal: 16, 
    height: 54, 
    borderRadius: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: '#0f172a', paddingVertical: 0 },

  // ── SECTIONS ──
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { 
    fontSize: 10, 
    fontFamily: 'Inter_700Bold', 
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingLeft: 4,
  },

  // ── QUICK ACTIONS GRID ──
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fafafa',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 2 },
  actionDesc: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 14 },

  // ── CHANNEL CARDS (legacy, kept for safety) ──
  channelRow: { flexDirection: 'row', gap: 12 },
  channelCard: { 
    flex: 1, 
    backgroundColor: '#fafafa', 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2,
  },
  channelIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  channelName: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 4 },
  channelDesc: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 17, marginBottom: 12 },
  channelBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  channelBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#2563eb', letterSpacing: 0.3 },

  // ── TICKETS ──
  emptyTickets: { 
    backgroundColor: '#fafafa', 
    padding: 28, 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2,
  },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTicketsTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 4 },
  emptyTicketsText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#94a3b8', textAlign: 'center' },

  ticketList: { gap: 10 },
  ticketItem: { 
    backgroundColor: '#fafafa', 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ticketAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2, marginRight: 12, marginLeft: 16, marginVertical: 14 },
  ticketContent: { flex: 1, paddingVertical: 14, paddingRight: 4 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  ticketIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ticketId: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#94a3b8' },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statusOpen: { backgroundColor: '#eff6ff' },
  statusProgress: { backgroundColor: '#fffbeb' },
  statusResolved: { backgroundColor: '#f0fdf4' },
  statusText: { fontSize: 9, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  ticketSubject: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0f172a', marginBottom: 4 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketMeta: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#94a3b8' },

  // ── KNOWLEDGE BASE ──
  kbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kbCard: { 
    width: (width - 50) / 2, 
    backgroundColor: '#fafafa', 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2,
  },
  kbIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kbCardTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 4 },
  kbCardDesc: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 16 },

  // ── FAQ ──
  faqCard: { 
    backgroundColor: '#fafafa', 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    paddingHorizontal: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2,
  },
  faqItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  faqQ: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0f172a', marginBottom: 4 },
  faqA: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 18 },

  // ── URGENT CARD ──
  urgentCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgentLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  urgentIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  urgentTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#ffffff', marginBottom: 2 },
  urgentSub: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  urgentBtn: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  urgentBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a' },

  // ── LEGACY PHONE STYLES (kept for safety) ──
  phoneBanner: { marginHorizontal: 16, marginTop: 0, backgroundColor: '#fafafa', borderRadius: 24, padding: 20, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center' },
  phoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  phoneIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  phoneTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0f172a' },
  phoneSub: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 2 },
  phoneBtn: { backgroundColor: '#0f172a', width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  phoneBtnTxt: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },

  // Step UI Styles
  stepContainer: { flex: 1, padding: 16 },
  noticeBox: { flexDirection: 'row', gap: 10, backgroundColor: '#eff6ff', padding: 14, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  noticeText: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium', color: '#1e40af', lineHeight: 16 },
  stepLabel: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 16 },
  stepSub: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#94a3b8', marginBottom: 20 },

  radioGroup: { gap: 10, marginBottom: 24 },
  radioItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#fafafa', 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2 
  },
  radioActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12 },
  radioCircleActive: { borderColor: '#3b82f6', backgroundColor: '#3b82f6' },
  radioLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0f172a', flex: 1 },

  existingTicketBox: { marginTop: 10, marginBottom: 24 },
  inputLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  warningText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#b45309', marginTop: 4 },
  simpleList: { 
    backgroundColor: '#fafafa', 
    borderRadius: 24, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2 
  },
  simpleListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  simpleListSubject: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#0f172a' },

  categoryList: { gap: 10, marginBottom: 24 },
  catSelectCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    backgroundColor: '#fafafa', 
    borderRadius: 24, 
    borderWidth: 2, 
    borderColor: '#ffffff',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2 
  },
  catSelectActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  catIconBoxWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catSelectTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 2 },
  catSelectDesc: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94a3b8', lineHeight: 18 },
  catCheck: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#cbd5e1' },
  catCheckActive: { borderColor: '#3b82f6', backgroundColor: '#3b82f6' },

  formGroup: { marginBottom: 16 },
  textInput: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1.5, borderColor: '#cbd5e1', paddingHorizontal: 16, height: 52, fontSize: 15, fontFamily: 'Inter_500Medium', color: '#0f172a' },
  textArea: { height: 120, paddingVertical: 12, textAlignVertical: 'top' },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btnSecondary: { flex: 1, height: 50, borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#64748b' },
  btnPrimary: { flex: 1.5, height: 50, borderRadius: 16, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#ffffff' },

  // Chat/Conversation Styles
  chatContainer: { flex: 1, backgroundColor: '#f8fafc' },
  ticketBanner: { backgroundColor: '#ffffff', padding: 18, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  bannerCategory: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#3b82f6', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  bannerSubject: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0f172a', marginBottom: 6 },
  bannerDesc: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 18 },

  chatScroll: { padding: 16, gap: 12 },
  systemMessage: { alignSelf: 'center', marginVertical: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#e2e8f0' },
  systemMessageText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#64748b' },

  bubbleWrapper: { flexDirection: 'row', width: '100%', marginVertical: 4 },
  chatBubble: { paddingHorizontal: 20, paddingVertical: 14, maxWidth: '80%' },
  userBubble: { backgroundColor: '#0f172a', alignSelf: 'flex-end', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 4 },
  adminBubble: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 4, borderBottomRightRadius: 24 },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 20 },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4, fontFamily: 'Inter_500Medium' },

  inputBar: { flexDirection: 'row', gap: 10, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1.5, borderColor: '#cbd5e1', paddingHorizontal: 16, height: 48, fontSize: 14, fontFamily: 'Inter_500Medium', color: '#0f172a' },
  sendBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  resolvedBar: { backgroundColor: '#f1f5f9', padding: 16, alignItems: 'center', justifyContent: 'center' },
  resolvedText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#94a3b8' },

  quickOptionsPanel: { flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  quickOptionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#cbd5e1' },
  quickOptionText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#3b82f6' }
});
