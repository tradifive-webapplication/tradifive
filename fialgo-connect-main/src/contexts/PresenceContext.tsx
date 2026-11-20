import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PresenceContextType {
  onlineUsers: Set<string>;
  lastSeenMap: Map<string, string>;
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: new Set(), lastSeenMap: new Map() });

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeenMap, setLastSeenMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let isCancelled = false;
    let channel: any = null;

    const initPresence = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || isCancelled) return;

        const existingChannels = supabase.getChannels().filter((c: any) => c.topic === 'realtime:global_presence');
        for (const c of existingChannels) {
          try {
            await supabase.removeChannel(c);
          } catch (_) {}
        }
        if (isCancelled) return;

        channel = supabase.channel('global_presence', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channel.on('presence', { event: 'sync' }, () => {
          if (isCancelled) return;
          const state = channel.presenceState();
          const activeIds = new Set<string>();
          for (const id of Object.keys(state)) {
            activeIds.add(id);
          }
          setOnlineUsers(prev => {
            const nowIso = new Date().toISOString();
            setLastSeenMap(currentMap => {
              const updated = new Map(currentMap);
              prev.forEach(id => {
                if (!activeIds.has(id)) {
                  updated.set(id, nowIso);
                }
              });
              return updated;
            });
            return activeIds;
          });
        });

        channel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED' && !isCancelled) {
            try {
              await channel.track({ online_at: new Date().toISOString() });
            } catch (_) {}
          }
        });
      } catch (err) {
        console.warn("Global presence init error:", err);
      }
    };

    initPresence();

    return () => {
      isCancelled = true;
      if (channel) {
        try {
          channel.untrack().catch(() => {});
          supabase.removeChannel(channel).catch(() => {});
        } catch (_) {}
      }
    };
  }, []);

  return <PresenceContext.Provider value={{ onlineUsers, lastSeenMap }}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => useContext(PresenceContext);
