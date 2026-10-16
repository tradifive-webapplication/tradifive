import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';


export type ProfileShort = Database['public']['Tables']['profiles']['Row'];
export type ChannelItem = Database['public']['Tables']['channels']['Row'];

export function useDiscoverData(userId: string, searchQuery: string) {
  const [mentors, setMentors] = useState<ProfileShort[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [traders, setTraders] = useState<ProfileShort[]>([]);
  const [people, setPeople] = useState<ProfileShort[]>([]);
  const [searchResults, setSearchResults] = useState<ProfileShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchAll = async () => {
    if (!userId) return;
    setLoading(true);
    setLoading(true);
    

    try {
      // 1. Mentors (is_pro = true)
      const { data: mentorData, error: mentorErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_pro', true)
        .neq('id', userId)
        .limit(4);

      if (mentorErr) console.error('Discover mentors fetch error:', mentorErr);
      setMentors(mentorData ?? []);

      // 2. Channels
      const { data: chanData, error: chanErr } = await supabase
        .from('channels')
        .select('*, channel_members(count)')
        .limit(6);

      if (chanErr) console.error('Discover channels fetch error:', chanErr);

      const channelsWithCount = (chanData ?? []).map(ch => ({
        ...ch,
        // @ts-ignore - Supabase returns this as an array with count
        memberCount: ch.channel_members?.[0]?.count || 0
      }));
      const allChannels = channelsWithCount;
      setChannels(allChannels as any);
      // 3. Top Traders (ordered by win_rate descending)
      const { data: traderData, error: traderErr } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .order('win_rate', { ascending: false })
        .limit(4);

      if (traderErr) console.error('Discover traders fetch error:', traderErr);
      setTraders(traderData ?? []);

      // 4. People (other active users)
      const { data: peopleData, error: peopleErr } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .limit(6);

      if (peopleErr) console.error('Discover people fetch error:', peopleErr);
      const allPeople = peopleData ?? [];
      setPeople(allPeople);
    } catch (err) {
      console.error('Discover page loading failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [userId]);

  // Handle Search Input Query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const triggerSearch = async () => {
      setSearching(true);


      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', userId)
          .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
          .limit(10);

        if (error) console.error('Profile search error:', error);
        setSearchResults(data ?? []);
      } catch (err) {
        console.error('Discover search failed:', err);
      } finally {
        setSearching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      triggerSearch();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, userId]);

  return { mentors, channels, traders, people, searchResults, loading, searching, refetch: fetchAll };
}
