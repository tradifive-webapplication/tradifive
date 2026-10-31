import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { Database } from '@/integrations/supabase/types';
import { usePresence } from '@/contexts/PresenceContext';


export type DbConversation = Database['public']['Tables']['dm_conversations']['Row'] & {
  user1: Database['public']['Tables']['profiles']['Row'] | null;
  user2: Database['public']['Tables']['profiles']['Row'] | null;
  last_message: {
    content: string;
    created_at: string | null;
    message_type: string | null;
  } | null;
};

export type DbMessage = Database['public']['Tables']['direct_messages']['Row'];

export interface Conversation {
  id: string;
  name: string;
  username: string;
  designation: string;
  department: string;
  roleTag: string;
  unread: number;
  time: string;
  content: string;
  avatar: string;
  verified: boolean;
  status: "Online" | "Away" | "Offline" | "Bot";
  ticketId?: string;
  ticketStatus?: "Open" | "In-Progress" | "Resolved";
  email: string;
  timezone: string;
  partnerId: string;
  lastSeen?: string;
  winRate?: number | null;
  totalTrades?: number | null;
  preferredMarket?: string | null;
  riskAppetite?: string | null;
  planType?: string | null;
  location?: string | null;
}

export function useInboxData(userId: string | undefined, activeConvId: string | null) {
  const { onlineUsers } = usePresence();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // 1. Fetch Conversations list
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {


      const { data, error } = await supabase
        .from('dm_conversations')
        .select(`
          *,
          user1:profiles!dm_conversations_user1_id_fkey(id, username, display_name, avatar_url, is_verified, trading_style, updated_at, email, win_rate, total_trades, preferred_market, risk_appetite, plan_type, role, location),
          user2:profiles!dm_conversations_user2_id_fkey(id, username, display_name, avatar_url, is_verified, trading_style, updated_at, email, win_rate, total_trades, preferred_market, risk_appetite, plan_type, role, location),
          last_message:direct_messages!dm_conversations_last_message_id_fkey(content, created_at, message_type)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Conversations fetch error:', error);
        return;
      }

      if (data) {
        const formatted: Conversation[] = data.map((row: any) => {
          const isUser1 = String(row.user1_id).toLowerCase() === String(userId).toLowerCase();
          let partnerObj = isUser1 ? row.user2 : row.user1;

          // Handle potential array returns from PostgREST just in case
          if (Array.isArray(partnerObj)) {
            partnerObj = partnerObj.length > 0 ? partnerObj[0] : null;
          }

          const partnerId = partnerObj?.id || (isUser1 ? row.user2_id : row.user1_id) || '';

          const partnerUsername = partnerObj?.username || '';
          const realEmail = partnerObj?.email && !partnerObj.email.includes('fundedtraders.net')
            ? partnerObj.email
            : (partnerUsername ? `${partnerUsername}@tradifive.com` : 'trader@tradifive.com');
          const tradingStyle = partnerObj?.trading_style || 'Gold & Forex Specialist';
          const preferredMarket = partnerObj?.preferred_market || 'XAUUSD (Gold)';
          const roleTag = partnerObj?.role === 'admin'
            ? 'ADMIN'
            : partnerObj?.is_verified
              ? 'VERIFIED TRADER'
              : partnerObj?.plan_type
                ? `${partnerObj.plan_type.toUpperCase()} TRADER`
                : 'TRADER';

          return {
            id: row.id,
            name: partnerObj?.display_name || partnerUsername || 'Trader Peer',
            username: partnerUsername,
            designation: tradingStyle,
            department: preferredMarket,
            roleTag,
            unread: isUser1 ? (row.user1_unread_count ?? 0) : (row.user2_unread_count ?? 0),
            time: row.last_message_at
              ? new Date(row.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : '',
            content: row.last_message?.content || 'No messages yet.',
            avatar: partnerObj?.avatar_url || "/default-avatar.svg",
            verified: partnerObj?.is_verified ?? false,
            status: onlineUsers.has(partnerId) ? 'Online' : 'Offline',
            email: realEmail,
            timezone: partnerObj?.location || 'Mumbai (IST)',
            partnerId,
            lastSeen: partnerObj?.updated_at 
              ? new Date(partnerObj.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recently',
            winRate: partnerObj?.win_rate ?? null,
            totalTrades: partnerObj?.total_trades ?? null,
            preferredMarket,
            riskAppetite: partnerObj?.risk_appetite || null,
            planType: partnerObj?.plan_type || 'Standard',
            location: partnerObj?.location || 'Mumbai (IST)'
          };
        });

        setConversations(formatted);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, onlineUsers]);

  // Update online status reactively without refetching from DB
  useEffect(() => {
    setConversations(prev => prev.map(conv => {
      if (conv.status === 'Bot') return conv;
      const isOnline = onlineUsers.has(conv.partnerId);
      const newStatus = isOnline ? 'Online' : 'Offline';
      if (conv.status !== newStatus) {
        return { ...conv, status: newStatus };
      }
      return conv;
    }));
  }, [onlineUsers]);

  // Load conversations on mount
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  // Get active partner ID
  const activeConversation = conversations.find(c => c.id === activeConvId);
  const activePartnerId = activeConversation?.partnerId;

  // 2. Fetch Messages for active conversation
  useEffect(() => {
    if (!userId || !activeConvId || !activePartnerId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setMessagesLoading(true);





      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${activePartnerId}),and(sender_id.eq.${activePartnerId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Messages fetch error:', error);
          return;
        }

        setMessages(data ?? []);

        // Mark messages as read and clear unread count in metadata
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .eq('sender_id', activePartnerId)
          .eq('receiver_id', userId)
          .eq('is_read', false);

        // Reset unread count for current user
        const activeRow = conversations.find(c => c.id === activeConvId);
        if (activeRow) {
          const isUser1 = activeRow.partnerId === activeRow.email.split('@')[0]; // simple match or query
          const updateField = userId < activePartnerId ? { user1_unread_count: 0 } : { user2_unread_count: 0 };
          await supabase
            .from('dm_conversations')
            .update(updateField)
            .eq('id', activeConvId);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();

    // 3. Subscription to direct_messages updates for this thread
    const subscriptionChannel = supabase.channel(`inbox_thread_${activeConvId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages'
      }, (payload) => {
        const newMsg = payload.new as DbMessage;
        const isParticipant =
          (newMsg.sender_id === userId && newMsg.receiver_id === activePartnerId) ||
          (newMsg.sender_id === activePartnerId && newMsg.receiver_id === userId);

        if (isParticipant) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          fetchConversations();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [userId, activeConvId, activePartnerId, fetchConversations]);

  // 4. Send direct message
  const sendMessage = async (content: string) => {
    if (!userId || !activeConvId || !activePartnerId || !content.trim()) return null;

    if (activeConvId.startsWith('demo-')) {
      const newMsg = {
        id: `mock-${Date.now()}`,
        conversation_id: activeConvId,
        sender_id: userId, // Current logged-in user
        receiver_id: activePartnerId,
        content: content.trim(),
        created_at: new Date().toISOString(),
        is_read: true,
        message_type: 'text'
      };

      setMessages(prev => [...prev, newMsg as any]);

      // Auto-reply mock
      setTimeout(() => {
        const reply = {
          id: `mock-${Date.now() + 1}`,
          conversation_id: activeConvId,
          sender_id: activePartnerId, // The mock partner
          receiver_id: userId,
          content: 'This is an automated demo response.',
          created_at: new Date().toISOString(),
          is_read: false,
          message_type: 'text'
        };
        setMessages(prev => [...prev, reply as any]);
      }, 1500);

      return newMsg;
    }

    try {
      // 1. Insert message
      const { data: msgData, error: msgError } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: userId,
          receiver_id: activePartnerId,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (msgError) {
        console.error('Send direct message error:', msgError);
        return null;
      }

      // 2. Update conversation last message details
      const updateData: any = {
        last_message_id: msgData.id,
        last_message_at: new Date().toISOString()
      };

      // Increment unread count for partner
      if (userId < activePartnerId) {
        // Current user is user1, so partner is user2
        const currentConv = conversations.find(c => c.id === activeConvId);
        // We need to fetch current count if we want to increment
        const { data: cData } = await supabase
          .from('dm_conversations')
          .select('user2_unread_count')
          .eq('id', activeConvId)
          .single();
        updateData.user2_unread_count = (cData?.user2_unread_count ?? 0) + 1;
      } else {
        // Current user is user2, so partner is user1
        const { data: cData } = await supabase
          .from('dm_conversations')
          .select('user1_unread_count')
          .eq('id', activeConvId)
          .single();
        updateData.user1_unread_count = (cData?.user1_unread_count ?? 0) + 1;
      }

      await supabase
        .from('dm_conversations')
        .update(updateData)
        .eq('id', activeConvId);

      // Trigger local fetch
      fetchConversations();

      return msgData;
    } catch (err) {
      console.error('Send DM failed:', err);
      return null;
    }
  };

  // 5. Start new conversation
  const startConversation = async (partnerId: string) => {
    if (!userId || !partnerId) return null;
    try {
      const user1_id = userId < partnerId ? userId : partnerId;
      const user2_id = userId > partnerId ? userId : partnerId;

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('dm_conversations')
        .select('id')
        .eq('user1_id', user1_id)
        .eq('user2_id', user2_id)
        .maybeSingle();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: created, error } = await supabase
        .from('dm_conversations')
        .insert({
          user1_id,
          user2_id,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      fetchConversations();
      return created.id;
    } catch (err) {
      console.error('Start conversation failed:', err);
      return null;
    }
  };

  return {
    conversations,
    messages,
    loading,
    messagesLoading,
    sendMessage,
    startConversation,
    refetchConversations: fetchConversations
  };
}
