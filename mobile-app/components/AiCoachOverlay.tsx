import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, Platform, ActivityIndicator, Animated, Keyboard, Modal, ScrollView, KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, ArrowUp, Plus, ChevronDown, History, ShieldCheck, Brain, Search, X, Zap, Mic, CheckCheck, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../app/store';
import { useAppTheme } from '../hooks/useAppTheme';
import { TimeCircle, ArrowDown, Send } from '../components/Iconly';
import { useAICoachData, Message as AIMessage, ChatSession } from '../hooks/useAICoachData';
import { supabase } from '../app/utils/supabase';
import ComingSoonVeil from './ComingSoonVeil';

const { width } = Dimensions.get('window');

const h = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  }
};

// Animated typing placeholder removed for cleaner UI

function ThinkingDots() {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])).start();
    anims.forEach((a, i) => animate(a, i * 150));
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 8, paddingHorizontal: 4 }}>
      {anims.map((a, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#6366f1', transform: [{ translateY: a }] }} />
      ))}
    </View>
  );
}

// Simple Markdown parser for React Native text
const parseMarkdown = (text: string, isUser: boolean, isDark: boolean) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={{ fontFamily: 'Inter_700Bold', color: isUser ? '#ffffff' : (isDark ? '#e8e8e8' : '#0f172a') }}>
          {part.slice(2, -2)}
        </Text>
      );
    } else if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <Text key={i} style={{ fontStyle: 'italic', color: isUser ? '#ffffff' : (isDark ? '#e8e8e8' : '#0f172a') }}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
};

function MessageBubble({ msg }: { msg: AIMessage }) {
  const { isDark } = useAppTheme();
  const isUser = msg.role === 'user';
  return (
    <View style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      {!isUser && (
        <View style={[s.aiAvatar, isDark && { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' }]}>
          <Sparkles size={14} color="#f59e0b" strokeWidth={2.5} />
        </View>
      )}
      <View style={{ maxWidth: width * 0.72 }}>
        <View style={[s.msgBubble, isUser ? s.msgBubbleMe : [s.msgBubbleThem, isDark && { backgroundColor: '#111111', borderColor: '#222222' }]]}>
          <Text style={[s.msgText, isUser ? { color: '#ffffff' } : (isDark && { color: '#e8e8e8' })]}>
            {parseMarkdown(msg.content, isUser, isDark)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 3, paddingHorizontal: 4 }}>
          <Text style={s.msgTime}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isUser && <CheckCheck size={13} color="#3b82f6" />}
        </View>
      </View>
    </View>
  );
}

export default function AiCoachOverlay({ onClose }: { onClose: () => void }) {
  const { isDark, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const currentUser = useStore((state: any) => state.currentUser);
  
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const flatRef = useRef<FlatList>(null);

  // AI Coach Backend Data Hook
  const {
    messages, setMessages, sessions, creditsLeft,
    createSession, saveMessage, fetchMessages, consumeCredit, refreshCredits
  } = useAICoachData(currentUser?.id);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<"Analytical Quant" | "Strict Guard" | "Mindset Partner">("Analytical Quant");
  
  const [showHistory, setShowHistory] = useState(false);
  const [showPersonas, setShowPersonas] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Load latest session on mount
  useEffect(() => {
    if (sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
      fetchMessages(sessions[0].id);
    }
  }, [sessions, currentSessionId, fetchMessages]);

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || thinking) return;
    
    if (creditsLeft <= 0) {
      alert("Out of credits! Please upgrade your plan to continue using the AI Coach.");
      return;
    }

    h('medium');
    Keyboard.dismiss();
    
    const userMsg: AIMessage = { role: 'user', content: userText, timestamp: new Date() };
    setMessages((prev: any) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
      const title = userText.length > 25 ? userText.substring(0, 25) + "..." : userText;
      targetSessionId = await createSession(title, activePersona);
      setCurrentSessionId(targetSessionId);
    }

    if (targetSessionId) {
      await saveMessage(targetSessionId, 'user', userText, { persona: activePersona });
    }

    let aiContent = '';

    try {
      const systemInstruction = `You are the TradiFive AI Coach.
CRITICAL INSTRUCTION: DO NOT introduce yourself. NEVER say "I am your TradiFive AI Strategy Coach". Just start answering directly and naturally.
ACTIVE PERSONA: "${activePersona}"
USER CONTEXT: Mobile App User. KEEP RESPONSES VERY SHORT. Max 2-3 sentences.`;

      const apiMessages = [
        ...messages.map(m => ({
          role: m.role === "ai" ? "model" : "user",
          parts: [{ text: m.content }]
        })),
        { role: "user", parts: [{ text: userText }] }
      ];

      const sessionData = await supabase.auth.getSession();
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionData?.data?.session?.access_token) {
        headers['Authorization'] = `Bearer ${sessionData.data.session.access_token}`;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ messages: apiMessages, systemInstruction })
      });

      if (response.status === 402) {
        await refreshCredits();
        aiContent = "You've used all your AI coaching credits for today. Credits reset at midnight.";
      } else if (response.status === 429) {
        aiContent = "Too many requests. Please wait a moment before trying again.";
      } else {
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          aiContent = data.candidates[0].content.parts[0].text;
          consumeCredit();
        } else if (data.error) {
          aiContent = `**System Error:** ${data.error.message || data.error}`;
        } else {
          aiContent = "I couldn't generate a response at this time.";
        }
      }
    } catch (e) {
      console.error("AI Proxy Request Failed:", e);
      aiContent = "Network error while connecting to the AI Coach.";
    }

    const aiMsg: AIMessage = { role: 'ai', content: aiContent, timestamp: new Date() };
    setMessages((prev: any) => [...prev, aiMsg]);
    setThinking(false);

    if (targetSessionId) {
      await saveMessage(targetSessionId, 'ai', aiContent, { persona: activePersona });
    }

    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const selectSession = (id: string) => {
    setCurrentSessionId(id);
    fetchMessages(id);
    setShowHistory(false);
    h();
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowHistory(false);
    h();
  };

  const renderEmpty = () => (
    <View style={[s.emptyContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#1e1e1e' : '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Sparkles size={32} color={isDark ? '#e8e8e8' : '#0f172a'} strokeWidth={1.5} />
        </View>
        <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a', textAlign: 'center' }}>
          TradiFive AI
        </Text>
        <Text style={{ fontSize: 15, fontFamily: 'Inter_500Medium', color: '#64748b', textAlign: 'center', marginTop: 8 }}>
          Your personal trading assistant
        </Text>
      </View>

      <View style={{ width: '100%', gap: 10 }}>
        {[
          'Analyze my recent performance',
          'Review my risk management',
          'Help me build a trading strategy',
        ].map((label, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => sendMessage(label)}
            style={{ padding: 16, backgroundColor: isDark ? '#111111' : '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#222222' : '#e2e8f0', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View
        style={{
          flex: 1,
          marginTop: insets.top + 20,
          backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 30,
          elevation: 25,
        }}
      >
        <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
          {/* Top-Right Dismiss Button positioned above blur */}
          <TouchableOpacity
            onPress={() => {
              h();
              onClose();
            }}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              zIndex: 1000001,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>

          {/* Full Screen Coming Soon Blur Veil */}
          <ComingSoonVeil
            featureTitle="AI Trading Coach"
            subtitle="Automated real-time trade feedback, smart journaling analysis & risk guardian coaching are launching soon."
            topOffset={0}
          />
      
      {/* Header */}
      <View style={[s.header, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderBottomColor: isDark ? '#1a1a1a' : '#f1f5f9' }]}>
        <View style={s.headerRow}>
          
          <TouchableOpacity onPress={() => setShowPersonas(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles size={22} color={isDark ? '#e8e8e8' : '#0f172a'} strokeWidth={2} />
            <Text style={{ color: isDark ? '#e8e8e8' : '#0f172a', fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 }}>AI Coach</Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setShowHistory(true)} style={[s.resetBtn, isDark && { backgroundColor: '#111111', borderColor: '#222222' }]}>
              <TimeCircle size={18} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={[s.resetBtn, isDark && { backgroundColor: '#111111', borderColor: '#222222' }]}>
              <ArrowDown size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

        </View>
      </View>

      {/* Messages Card */}
      <View style={[s.card, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }]}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(i, index) => index.toString()}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          contentContainerStyle={[s.messageList, messages.length === 0 && { flex: 1 }]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Thinking */}
        {thinking && (
          <View style={s.thinkingRow}>
            <View style={[s.aiAvatar, isDark && { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' }]}><Sparkles size={14} color="#f59e0b" strokeWidth={2.5} /></View>
            <View style={[s.msgBubble, s.msgBubbleThem, isDark && { backgroundColor: '#111111', borderColor: '#222222' }]}><ThinkingDots /></View>
          </View>
        )}

        {/* Floating Input & Credits Container */}
        <View style={{ paddingHorizontal: 16, paddingBottom: keyboardHeight > 0 ? 10 : Math.max(insets.bottom + 10, 20), paddingTop: 12, backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }}>
          <View style={{ backgroundColor: isDark ? '#111111' : '#f8fafc', borderRadius: 24, padding: 12, borderWidth: 1, borderColor: isDark ? '#222222' : '#e2e8f0' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Credits: {creditsLeft} / 10</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Zap size={12} color="#6366f1" fill="#6366f1" />
                <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#6366f1' }}>Need extra credits? Upgrade plan</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
              <TouchableOpacity style={s.chatAttachBtn} onPress={() => h()}>
                <Plus size={22} color={isDark ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
              
              <View style={[s.chatInputFieldContainer, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#2a2a2a' : '#e2e8f0', borderRadius: 20 }]}>
                <TextInput
                  style={[s.chatInputField, { color: isDark ? '#e8e8e8' : '#0f172a' }]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask a trading question..."
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  keyboardAppearance={isDark ? "dark" : "light"}
                  multiline
                  maxLength={500}
                  onSubmitEditing={() => sendMessage()}
                />
                {thinking ? (
                  <View style={[s.chatSendBtn, { backgroundColor: isDark ? '#2a2a2a' : '#e2e8f0' }]}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[s.chatSendBtn, { backgroundColor: input.trim() ? (isDark ? '#fff' : '#0f172a') : (isDark ? '#2a2a2a' : '#e2e8f0') }]}
                    onPress={() => {
                      if (input.trim()) {
                        sendMessage();
                      } else {
                        h('medium');
                      }
                    }}
                    disabled={thinking}
                  >
                    {input.trim() ? (
                      <Send set="bulk" size={16} color={isDark ? '#000' : '#fff'} style={{ marginLeft: -2 }} />
                    ) : (
                      <Mic size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ height: '70%', backgroundColor: isDark ? '#111' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#000' }}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={createNewSession} style={{ backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 }}>+ New Coaching Session</Text>
            </TouchableOpacity>
            <ScrollView>
              {sessions.map((s: any) => (
                <TouchableOpacity key={s.id} onPress={() => selectSession(s.id)} style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#222' : '#f1f5f9' }}>
                  <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: isDark ? '#fff' : '#000' }}>{s.title}</Text>
                  <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.lastMessage}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Persona Selector Modal */}
      <Modal visible={showPersonas} animationType="fade" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: isDark ? '#111' : '#fff', borderRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#000' }}>Select Persona</Text>
              <TouchableOpacity onPress={() => setShowPersonas(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            {["Analytical Quant", "Strict Guard", "Mindset Partner"].map(p => (
              <TouchableOpacity 
                key={p} 
                onPress={() => { setActivePersona(p as any); setShowPersonas(false); h(); }} 
                style={{ padding: 16, backgroundColor: activePersona === p ? '#4f46e5' : (isDark ? '#222' : '#f8fafc'), borderRadius: 12, marginBottom: 10 }}
              >
                <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: activePersona === p ? '#fff' : (isDark ? '#e8e8e8' : '#0f172a') }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resetBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  card: { flex: 1, overflow: 'hidden' },
  messageList: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginTop: 4, borderWidth: 1, borderColor: '#f1f5f9', alignSelf: 'flex-end', backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' },
  msgBubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  msgBubbleMe: { backgroundColor: '#0f172a', borderBottomRightRadius: 5 },
  msgBubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  msgText: { fontSize: 14.5, fontFamily: 'Inter_400Regular', color: '#0f172a', lineHeight: 22 },
  msgTime: { fontSize: 10.5, fontFamily: 'Inter_500Medium', color: '#94a3b8' },
  thinkingRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, position: 'relative' },
  chatInputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8, borderTopWidth: 1 },
  chatAttachBtn: { width: 28, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  chatInputFieldContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4 },
  chatInputField: { flex: 1, maxHeight: 120, fontSize: 14.5, fontFamily: 'Inter_500Medium', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: Platform.OS === 'ios' ? 8 : 4, textAlignVertical: 'center' },
  chatSendBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }
});
