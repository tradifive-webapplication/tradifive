import { useState, useEffect } from 'react';
import { supabase } from '../app/utils/supabase';
import { useStore } from '../app/store';

export type ChannelType = any;
export type MessageType = any;

export function useChannelData(activeChannelId: string | null = null) {
  const currentUser = useStore(state => state.currentUser);
  const userId = currentUser?.id;
  
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  const fetchChannels = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setChannels((data as ChannelType[]) || []);
    } catch (err) {
      console.error('Channels load error:', err);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [userId]);

  useEffect(() => {
    if (!userId || !activeChannelId) {
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('channel_messages')
          .select('*')
          .eq('channel_id', activeChannelId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const rawMessages = data ?? [];
        const userIds = [...new Set(rawMessages.map((m: any) => m.user_id).filter(Boolean))];
        let profilesMap: Record<string, any> = {};

        if (userIds.length > 0) {
          try {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, username')
              .in('id', userIds);

            if (profilesData) {
              profilesMap = profilesData.reduce((acc: any, p: any) => {
                acc[p.id] = p;
                return acc;
              }, {});
            }
          } catch (pe) {
            console.warn('Profiles load error in channel:', pe);
          }
        }
        
        const validMessages = rawMessages
          .filter((m: any) => {
            try { return !m.content.includes('"type":"deleted"'); } catch { return true; }
          })
          .map((m: any) => ({
            ...m,
            profiles: profilesMap[m.user_id] ?? null
          }));

        setMessages(validMessages);
        
        const { data: memberData } = await supabase
          .from('channel_members')
          .select('id')
          .eq('channel_id', activeChannelId)
          .eq('user_id', userId)
          .maybeSingle();
          
        setIsMember(!!memberData);
      } catch (err) {
        console.error('Channel messages load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const subscriptionChannel = supabase.channel(`channel_realtime_${activeChannelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'channel_messages', 
        filter: `channel_id=eq.${activeChannelId}` 
      }, async (payload) => {
        try { if (payload.new.content.includes('"type":"deleted"')) return; } catch {}

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username')
          .eq('id', payload.new.user_id)
          .maybeSingle();

        const fullMsg = {
          ...payload.new as any,
          profiles: profile ?? null
        };

        setMessages(prev => {
          if (prev.some(m => m.id === fullMsg.id)) return prev;
          return [...prev, fullMsg];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [userId, activeChannelId]);

  const sendMessage = async (content: string) => {
    if (!userId || !activeChannelId || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from('channel_messages')
        .insert({
          channel_id: activeChannelId,
          user_id: userId,
          content: content.trim()
        })
        .select('*')
        .single();

      if (error) throw error;

      let authorProfile = null;
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username')
          .eq('id', userId)
          .maybeSingle();
        authorProfile = prof;
      } catch (e) {
        console.warn('Profile fetch warning:', e);
      }

      const fullMsg = {
        ...(data as any),
        profiles: authorProfile
      };
      
      if (data) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, fullMsg];
        });
      }
      return fullMsg;
    } catch (err) {
      console.error('Send message failed:', err);
      return null;
    }
  };

  return {
    channels,
    messages,
    loading,
    isMember,
    sendMessage,
    refetch: fetchChannels
  };
}
