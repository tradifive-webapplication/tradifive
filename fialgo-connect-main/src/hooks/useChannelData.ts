import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';


export type ChannelType = Database['public']['Tables']['channels']['Row'];
export type MessageType = Database['public']['Tables']['channel_messages']['Row'] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
};

// --- Persistent deleted IDs tracker (survives refresh) ---
const DELETED_KEY = 'fialgo_deleted_msgs';

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function addDeletedIds(ids: string[]) {
  const set = getDeletedIds();
  ids.forEach(id => set.add(id));
  localStorage.setItem(DELETED_KEY, JSON.stringify([...set]));
}

function isDeleted(id: string): boolean {
  return getDeletedIds().has(id);
}

function isSoftDeleted(content: string): boolean {
  try {
    return content.includes('"type":"deleted"');
  } catch { return false; }
}
// --- end tracker ---

export function useChannelData(userId: string, activeChannelId: string) {
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  const fetchChannels = async () => {
    if (!userId) return;



    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) console.error('Channels load error:', error);
    
    let finalChannels = data ?? [];
    setChannels(finalChannels);
  };

  // 1. Fetch Channels list on mount
  useEffect(() => {
    fetchChannels();
  }, [userId]);

  // 2. Fetch Messages for active channel on change
  useEffect(() => {
    if (!userId || !activeChannelId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);



      const { data, error } = await supabase
        .from('channel_messages')
        .select('*, profiles(full_name, avatar_url, username)')
        .eq('channel_id', activeChannelId)
        .order('created_at', { ascending: true });

      if (error) console.error('Channel messages load error:', error);
      
      // Filter out both soft-deleted and locally-deleted messages
      const validMessages = (data ?? []).filter(m => 
        !isDeleted(m.id) && !isSoftDeleted(m.content)
      );
      
      let finalMessages = validMessages;

      setMessages(finalMessages);
      
      // Check if current user is member
      const { data: memberData } = await supabase
        .from('channel_members')
        .select('id')
        .eq('channel_id', activeChannelId)
        .eq('user_id', userId)
        .maybeSingle();
        
      setIsMember(!!memberData);
      setLoading(false);
    };

    fetchMessages();

    // 3. Realtime messages subscription
    const subscriptionChannel = supabase.channel(`channel_realtime_${activeChannelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'channel_messages', 
        filter: `channel_id=eq.${activeChannelId}` 
      }, async (payload) => {
        // Skip if this message was locally deleted
        if (isDeleted(payload.new.id)) return;
        if (isSoftDeleted(payload.new.content)) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username')
          .eq('id', payload.new.user_id)
          .maybeSingle();

        const fullMsg: MessageType = {
          ...payload.new as any,
          profiles: profile ?? null
        };

        setMessages(prev => {
          if (prev.some(m => m.id === fullMsg.id)) return prev;
          return [...prev, fullMsg];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'channel_messages',
        filter: `channel_id=eq.${activeChannelId}`
      }, (payload) => {
        if (isDeleted(payload.new.id)) return;
        if (isSoftDeleted(payload.new.content)) {
            addDeletedIds([payload.new.id]);
            setMessages(prev => prev.filter(m => m.id !== payload.new.id));
        } else {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'channel_messages',
        filter: `channel_id=eq.${activeChannelId}`
      }, (payload) => {
        addDeletedIds([payload.old.id]);
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [userId, activeChannelId]);

  // 4. Send Message function
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
        .select('*, profiles(full_name, avatar_url, username)')
        .single();

      if (error) {
        console.error('Send message error details:', JSON.stringify(error, null, 2));
        alert('Database Error: ' + error.message);
        return null;
      }
      
      // Optimistic state update in case realtime is slow
      if (data) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
      
      return data;
    } catch (err: any) {
      console.error('Send message failed:', err);
      alert('Network Error: ' + (err.message || 'Failed to send message'));
      return null;
    }
  };

  const updateMessage = (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
  };

  const markAsSeen = async (messageId: string, currentContent: string) => {
    try {
      let parsedObj: any = {};
      try {
        const parsed = JSON.parse(currentContent);
        if (parsed && typeof parsed === 'object') {
          parsedObj = { ...parsed };
        } else {
          parsedObj = { type: 'text', text: currentContent };
        }
      } catch(e) {
        parsedObj = { type: 'text', text: currentContent };
      }

      if (!parsedObj.seen_by) parsedObj.seen_by = [];
      
      // If user already saw it, skip
      if (parsedObj.seen_by.includes(userId)) return;

      parsedObj.seen_by.push(userId);
      parsedObj.views = parsedObj.seen_by.length;
      
      const newContent = JSON.stringify(parsedObj);
      
      // Optimistic update
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
      
      // DB update (fire and forget to not block)
      supabase.from('channel_messages').update({ content: newContent }).eq('id', messageId).then();
    } catch(e) {}
  };

  const deleteMessage = async (messageId: string) => {
    // 1. Persist to localStorage FIRST so it survives refresh
    addDeletedIds([messageId]);
    // 2. Optimistic UI removal
    setMessages(prev => prev.filter(m => m.id !== messageId));
    // 3. Try hard delete
    const { data, error } = await supabase.from('channel_messages').delete().eq('id', messageId).select();
    if (error || !data || data.length === 0) {
       // 4. Fallback: soft delete via update
       await supabase.from('channel_messages').update({ content: JSON.stringify({ type: 'deleted' }) }).eq('id', messageId);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
    await supabase.from('channel_messages').update({ content: newContent }).eq('id', messageId);
  };

  const clearHistory = async () => {
    // 1. Persist ALL current message IDs to localStorage
    const currentIds = messages.map(m => m.id);
    addDeletedIds(currentIds);
    // 2. Optimistic UI clear
    setMessages([]);
    // 3. Try hard delete
    const { data, error } = await supabase.from('channel_messages').delete().eq('channel_id', activeChannelId).select();
    if (error || !data || data.length === 0) {
        // 4. Fallback: soft delete all
        await supabase.from('channel_messages').update({ content: JSON.stringify({ type: 'deleted' }) }).eq('channel_id', activeChannelId);
    }
  };

  const leaveChannel = async () => {
    await supabase.from('channel_members').delete().eq('channel_id', activeChannelId).eq('user_id', userId);
    setIsMember(false);
  };

  return { channels, messages, loading, sendMessage, updateMessage, deleteMessage, editMessage, clearHistory, markAsSeen, refetchChannels: fetchChannels, isMember, joinChannel: async () => { await supabase.from('channel_members').insert({ channel_id: activeChannelId, user_id: userId, role: 'member' }); setIsMember(true); }, leaveChannel };
}
