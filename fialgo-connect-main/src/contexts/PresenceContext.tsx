import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PresenceContextType {
  onlineUsers: Set<string>;
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: new Set() });

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let channel: any;
    
    const initPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ensure single connection channel for all users across the platform
      channel = supabase.channel('global_presence', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });
      
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeIds = new Set<string>();
        for (const id of Object.keys(state)) {
           activeIds.add(id);
        }
        setOnlineUsers(activeIds);
      });

      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Track this user as online
          await channel.track({ online_at: new Date().toISOString() });
        }
      });
    };

    initPresence();

    return () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return <PresenceContext.Provider value={{ onlineUsers }}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => useContext(PresenceContext);
