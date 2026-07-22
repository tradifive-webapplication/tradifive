import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../app/utils/supabase';

export type DbSession = any;
export type DbCoachMessage = any;

export interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  isImage?: boolean;
  imageUrl?: string;
  isAudio?: boolean;
  isOutOfCredits?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  persona: string;
  messages: Message[];
}

export function useAICoachData(userId: string | undefined) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // ── Server-side Credits System ────────────────────────────────────────────
  // Credits are stored in Supabase profiles table, NOT localStorage
  // This prevents client-side tampering via DevTools
  const [creditsLeft, setCreditsLeft] = useState(10);
  const [maxCredits, setMaxCredits] = useState(10);
  const [userPlan, setUserPlan] = useState('starter');
  const [creditsLoading, setCreditsLoading] = useState(false);

  // Load credits from Supabase (server-side, tamper-proof)
  const loadCreditsFromServer = useCallback(async () => {
    if (!userId) return;
    setCreditsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Call server-side RPC to get current credit state
      const { data, error } = await supabase.rpc('get_ai_credits', {
        p_user_id: userId
      });

      if (!error && data) {
        setCreditsLeft(data.credits_remaining ?? 10);
        setMaxCredits(data.credits_max ?? 10);
      }

      // Also fetch plan for display
      // Note: Removed localStorage on mobile app
      const rawPlan = 'starter';
      const normalizedPlan = (() => {
        const s = rawPlan.toLowerCase().trim();
        if (s === 'pro' || s === 'intermediate') return 'pro';
        if (s === 'elite' || s === 'advanced') return 'elite';
        return 'starter';
      })();
      setUserPlan(normalizedPlan);

    } catch (err) {
      console.error('Error loading AI credits from server:', err);
      // Fallback to plan-based defaults if server unreachable
      // Note: Removed localStorage on mobile app
      const rawPlan = 'starter';
      const s = rawPlan.toLowerCase().trim();
      const max = s.includes('elite') || s.includes('advanced') ? 150
                : s.includes('pro') || s.includes('intermediate') ? 50
                : 10;
      setCreditsLeft(max);
      setMaxCredits(max);
    } finally {
      setCreditsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadCreditsFromServer();
    }
  }, [userId, loadCreditsFromServer]);

  // ── Consume credit server-side (called by the AI proxy Edge Function itself)
  // The ai-proxy Edge Function already calls consume_ai_credit() atomically.
  // This client-side function just updates the local UI state after a successful response.
  const updateCreditsAfterUse = useCallback(() => {
    if (!userId) return;
    setCreditsLeft(prev => {
      const newAmount = Math.max(0, prev - 1);
      return newAmount;
    });
  }, [userId]);

  // Legacy compatibility alias (called by TradifiveAI.tsx)
  const consumeCredit = useCallback(() => {
    updateCreditsAfterUse();
    return true;
  }, [updateCreditsAfterUse]);

  // refreshCredits: re-fetch from server (called when out_of_credits error received)
  const refreshCredits = useCallback(async () => {
    await loadCreditsFromServer();
  }, [loadCreditsFromServer]);

  // addCredits: only for plan upgrades, re-fetches from server
  const addCredits = useCallback(async () => {
    await loadCreditsFromServer();
  }, [loadCreditsFromServer]);

  // 1. Fetch all chat sessions for this user
  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_coach_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('AI coach sessions load error:', error);
        return;
      }

      if (data) {
        const formatted: ChatSession[] = data.map(s => {
          const contextObj = (s.context as any) || {};
          return {
            id: s.id,
            title: s.title || 'Strategy Session',
            lastMessage: contextObj.last_message || 'Consultation started',
            timestamp: s.last_message_at ? new Date(s.last_message_at) : new Date(s.created_at ?? ''),
            persona: contextObj.persona || 'Analytical Quant',
            messages: [] // loaded on demand
          };
        });
        setSessions(formatted);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId, fetchSessions]);

  // 2. Fetch messages for a specific session
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!userId || !sessionId) return [];
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_coach_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('AI messages load error:', error);
        return [];
      }

      const formatted: Message[] = (data ?? []).map(m => {
        const meta = (m.metadata as any) || {};
        return {
          role: m.role === 'assistant' ? 'ai' : 'user',
          content: m.content,
          timestamp: m.created_at ? new Date(m.created_at) : new Date(),
          isImage: meta.isImage,
          imageUrl: meta.imageUrl,
          isAudio: meta.isAudio
        };
      });

      setMessages(formatted);
      return formatted;
    } catch (err) {
      console.error('Error loading AI messages:', err);
      return [];
    } finally {
      setMessagesLoading(false);
    }
  }, [userId]);

  // 3. Create a brand new session
  const createSession = async (title: string, persona: string) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('ai_coach_sessions')
        .insert({
          user_id: userId,
          title: title.trim(),
          context: { persona, last_message: 'Consultation started' }
        })
        .select()
        .single();

      if (error) {
        console.error('Create AI session error:', error);
        return null;
      }

      await fetchSessions();
      return data.id;
    } catch (err) {
      console.error('Create session failed:', err);
      return null;
    }
  };

  // 4. Save a single message (user or assistant/ai) to the database
  const saveMessage = async (
    sessionId: string,
    role: 'user' | 'ai',
    content: string,
    metadata: any = {}
  ) => {
    if (!userId || !sessionId) return null;
    try {
      const { data, error } = await supabase
        .from('ai_coach_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          role: role === 'ai' ? 'assistant' : 'user',
          content: content.trim(),
          metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Save AI message error:', error);
        return null;
      }

      // Update session's last message time and teaser context
      await supabase
        .from('ai_coach_sessions')
        .update({
          last_message_at: new Date().toISOString(),
          context: {
            persona: metadata.persona || 'Analytical Quant',
            last_message: content.length > 45 ? content.substring(0, 45) + '...' : content
          }
        })
        .eq('id', sessionId);

      await fetchSessions();
      return data;
    } catch (err) {
      console.error('Save message failed:', err);
      return null;
    }
  };

  // 5. Delete a session (cascades and deletes all messages automatically)
  const deleteSession = async (sessionId: string) => {
    if (!userId || !sessionId) return false;
    try {
      const { error } = await supabase
        .from('ai_coach_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Delete session error:', error);
        return false;
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return true;
    } catch (err) {
      console.error('Delete session failed:', err);
      return false;
    }
  };

  return {
    sessions,
    messages,
    loading,
    messagesLoading,
    creditsLoading,
    fetchMessages,
    createSession,
    saveMessage,
    deleteSession,
    refetchSessions: fetchSessions,
    setMessages,
    creditsLeft,
    maxCredits,
    userPlan,
    consumeCredit,
    addCredits,
    refreshCredits,
  };
}
