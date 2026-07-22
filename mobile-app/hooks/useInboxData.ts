import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../app/utils/supabase';
import { getAvatarUrl } from '../app/utils/avatar';
import { useStore } from '../app/store';

export interface Conversation {
  id: string;
  name: string;
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
  favorite?: boolean;
}

export function useInboxData(activeConvId: string | null = null) {
  const currentUser = useStore(state => state.currentUser);
  const userId = currentUser?.id;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('dm_conversations')
        .select(`
          *,
          user1:profiles!dm_conversations_user1_id_fkey(id, username, display_name, avatar_url, is_verified, trading_style),
          user2:profiles!dm_conversations_user2_id_fkey(id, username, display_name, avatar_url, is_verified, trading_style),
          last_message:direct_messages!dm_conversations_last_message_id_fkey(content, created_at, message_type)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map((conv: any) => {
          const isUser1 = conv.user1_id === userId;
          const partner = isUser1 ? conv.user2 : conv.user1;
          const lm = conv.last_message;

          let displayTime = 'No messages';
          if (lm?.created_at) {
            const date = new Date(lm.created_at);
            const now = new Date();
            if (date.toDateString() === now.toDateString()) {
              displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
              displayTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
          }

          let previewContent = lm?.content || 'Started a conversation';
          if (lm?.message_type === 'image') previewContent = '📷 Image';
          if (lm?.message_type === 'file') previewContent = '📎 Attachment';

          const unreadCount = isUser1 ? conv.user1_unread_count : conv.user2_unread_count;

          return {
            id: conv.id,
            partnerId: partner?.id || '',
            name: partner?.display_name || partner?.username || 'Unknown User',
            designation: partner?.trading_style || 'Member',
            department: 'Community',
            roleTag: partner?.trading_style?.toUpperCase() || 'TRADER',
            unread: unreadCount || 0,
            time: displayTime,
            content: previewContent,
            avatar: getAvatarUrl(partner?.avatar_url, undefined, partner?.username || partner?.display_name),
            verified: partner?.is_verified || false,
            status: 'Offline', // Simplified for mobile for now
            email: '',
            timezone: 'UTC'
          };
        }) as Conversation[];

        let finalConvs = formatted || [];
        setConversations(finalConvs);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    try {
      const { data: convData, error: convError } = await supabase
        .from('dm_conversations')
        .select('user1_id, user2_id')
        .eq('id', convId)
        .single();

      if (convError || !convData) throw new Error('Conversation not found');

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${convData.user1_id},receiver_id.eq.${convData.user2_id}),and(sender_id.eq.${convData.user2_id},receiver_id.eq.${convData.user1_id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Mark as read
      if (userId && data && data.length > 0) {
        await markConversationAsRead(convId);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [userId]);

  const markConversationAsRead = async (convId: string) => {
    if (!userId) return;
    try {
      const { data: conv } = await supabase
        .from('dm_conversations')
        .select('user1_id, user2_id')
        .eq('id', convId)
        .single();

      if (!conv) return;

      const updateData = conv.user1_id === userId 
        ? { user1_unread_count: 0 } 
        : { user2_unread_count: 0 };

      await supabase
        .from('dm_conversations')
        .update(updateData)
        .eq('id', convId);

      const partnerId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

      // Also update direct_messages is_read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      // Local state update
      setConversations(prev => prev.map(c => 
        c.id === convId ? { ...c, unread: 0 } : c
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const sendMessage = async (convId: string, receiverId: string, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: userId,
          receiver_id: receiverId,
          content,
          message_type: type,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local messages array
      setMessages(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channelName = `inbox_updates_${userId}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          fetchConversations();
          const activeConversation = conversations.find(c => c.id === activeConvId);
          if (activeConvId && payload.new && activeConversation) {
            const newMsg = payload.new as any;
            const isForActive = newMsg.sender_id === activeConversation.partnerId || newMsg.receiver_id === activeConversation.partnerId;
            if (isForActive) {
              setMessages(prev => [...prev, newMsg]);
              markConversationAsRead(activeConvId);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeConvId, fetchConversations, conversations]);
  const getOrCreateConversation = async (targetUserId: string) => {
    if (!userId) return null;
    
    // First, check local state
    const existing = conversations.find(c => c.partnerId === targetUserId);
    if (existing) return existing.id;
    
    // Otherwise, check DB
    try {
      const { data, error } = await supabase
        .from('dm_conversations')
        .select('id')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${userId})`)
        .single();
        
      if (data) return data.id;
    } catch (err: any) {
      if (err.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking existing conv:', err);
        return null;
      }
    }
    
    // Create new
    try {
      const { data, error } = await supabase
        .from('dm_conversations')
        .insert({
          user1_id: userId,
          user2_id: targetUserId,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      fetchConversations();
      return data.id;
    } catch (err) {
      console.error('Error creating conv:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId, fetchMessages]);

  return {
    conversations,
    messages,
    loading,
    messagesLoading,
    sendMessage,
    refetch: fetchConversations,
    getOrCreateConversation
  };
}

