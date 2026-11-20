import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';


export type ProfileShort = Database['public']['Tables']['profiles']['Row'] & {
  followers_count?: number;
  following_count?: number;
};
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
    setLoading(true);

    try {
      // 1. Mentors (is_pro = true)
      let mentorQuery = supabase
        .from('profiles')
        .select('*')
        .eq('is_pro', true)
        .order('created_at', { ascending: false })
        .limit(12);
      if (userId) mentorQuery = mentorQuery.neq('id', userId);
      const { data: mentorData, error: mentorErr } = await mentorQuery;
      if (mentorErr) console.error('Discover mentors fetch error:', mentorErr);

      // 2. Channels
      const { data: chanData, error: chanErr } = await supabase
        .from('channels')
        .select('*, channel_members(count)')
        .order('created_at', { ascending: false })
        .limit(12);

      if (chanErr) console.error('Discover channels fetch error:', chanErr);

      const channelsWithCount = (chanData ?? []).map(ch => ({
        ...ch,
        // @ts-ignore - Supabase returns this as an array with count
        memberCount: ch.channel_members?.[0]?.count || 0
      }));
      setChannels(channelsWithCount as any);

      // 3. Top Traders (ordered by win_rate descending, then newest)
      let traderQuery = supabase
        .from('profiles')
        .select('*')
        .order('win_rate', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(12);
      if (userId) traderQuery = traderQuery.neq('id', userId);
      const { data: traderData, error: traderErr } = await traderQuery;
      if (traderErr) console.error('Discover traders fetch error:', traderErr);

      // 4. People (newest registered users first so new users always appear immediately)
      let peopleQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (userId) peopleQuery = peopleQuery.neq('id', userId);
      const { data: peopleData, error: peopleErr } = await peopleQuery;
      if (peopleErr) console.error('Discover people fetch error:', peopleErr);

      // 5. Real Followers & Following Counts from social_follows table
      const { data: allFollows, error: followsErr } = await supabase
        .from('social_follows')
        .select('follower_id, following_id');

      if (followsErr) console.error('Discover social_follows fetch error:', followsErr);

      const followerCountMap: Record<string, number> = {};
      const followingCountMap: Record<string, number> = {};

      if (allFollows) {
        for (const row of allFollows) {
          if (row.following_id) {
            followerCountMap[row.following_id] = (followerCountMap[row.following_id] || 0) + 1;
          }
          if (row.follower_id) {
            followingCountMap[row.follower_id] = (followingCountMap[row.follower_id] || 0) + 1;
          }
        }
      }

      const attachCounts = (list: any[] | null) => {
        return (list ?? []).map(p => ({
          ...p,
          followers_count: followerCountMap[p.id] ?? 0,
          following_count: followingCountMap[p.id] ?? 0,
        }));
      };

      setMentors(attachCounts(mentorData));
      setTraders(attachCounts(traderData));
      setPeople(attachCounts(peopleData));
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
    const cleanQ = searchQuery.trim().replace(/^@+/, '');
    if (!cleanQ) {
      setSearchResults([]);
      return;
    }

    const triggerSearch = async () => {
      setSearching(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${cleanQ}%,display_name.ilike.%${cleanQ}%,username.ilike.%${cleanQ}%,first_name.ilike.%${cleanQ}%,last_name.ilike.%${cleanQ}%`)
          .order('created_at', { ascending: false })
          .limit(25);

        if (error) console.error('Profile search error:', error);

        // Fetch real follow counts for search results
        const { data: searchFollows } = await supabase
          .from('social_follows')
          .select('follower_id, following_id');

        const searchFollowerMap: Record<string, number> = {};
        const searchFollowingMap: Record<string, number> = {};

        if (searchFollows) {
          for (const row of searchFollows) {
            if (row.following_id) searchFollowerMap[row.following_id] = (searchFollowerMap[row.following_id] || 0) + 1;
            if (row.follower_id) searchFollowingMap[row.follower_id] = (searchFollowingMap[row.follower_id] || 0) + 1;
          }
        }

        const enrichedSearch = (data ?? []).map(s => ({
          ...s,
          followers_count: searchFollowerMap[s.id] ?? 0,
          following_count: searchFollowingMap[s.id] ?? 0,
        }));

        setSearchResults(enrichedSearch);
      } catch (err) {
        console.error('Discover search failed:', err);
      } finally {
        setSearching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      triggerSearch();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, userId]);

  return { mentors, channels, traders, people, searchResults, loading, searching, refetch: fetchAll };
}
