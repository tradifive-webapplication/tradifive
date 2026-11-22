import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';

export type ProfileShort = Database['public']['Tables']['profiles']['Row'] & {
  followers_count?: number;
  following_count?: number;
};
export type ChannelItem = Database['public']['Tables']['channels']['Row'];

interface DiscoverCacheData {
  mentors: ProfileShort[];
  channels: ChannelItem[];
  traders: ProfileShort[];
  people: ProfileShort[];
  timestamp: number;
}

let memoryDiscoverCache: DiscoverCacheData | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function getCachedDiscoverData(): DiscoverCacheData | null {
  if (memoryDiscoverCache && Date.now() - memoryDiscoverCache.timestamp < CACHE_TTL_MS) {
    return memoryDiscoverCache;
  }
  try {
    const raw = sessionStorage.getItem('tradifive_discover_cache_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryDiscoverCache = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function setCachedDiscoverData(data: Omit<DiscoverCacheData, 'timestamp'>) {
  const entry: DiscoverCacheData = { ...data, timestamp: Date.now() };
  memoryDiscoverCache = entry;
  try {
    sessionStorage.setItem('tradifive_discover_cache_v1', JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}

export function useDiscoverData(userId: string, searchQuery: string) {
  const initialCache = getCachedDiscoverData();

  const [mentors, setMentors] = useState<ProfileShort[]>(initialCache?.mentors ?? []);
  const [channels, setChannels] = useState<ChannelItem[]>(initialCache?.channels ?? []);
  const [traders, setTraders] = useState<ProfileShort[]>(initialCache?.traders ?? []);
  const [people, setPeople] = useState<ProfileShort[]>(initialCache?.people ?? []);
  const [searchResults, setSearchResults] = useState<ProfileShort[]>([]);
  // Instant open: if cache exists, loading starts as false immediately!
  const [loading, setLoading] = useState(initialCache === null);
  const [searching, setSearching] = useState(false);

  const isFetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchAll = async (isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Only set loading if there is no cached data to display
    if (!isBackground && !memoryDiscoverCache) {
      setLoading(true);
    }

    try {
      // 1. Mentors (is_pro = true)
      let mentorQuery = supabase
        .from('profiles')
        .select('*')
        .eq('is_pro', true)
        .order('created_at', { ascending: false })
        .limit(12);
      if (userId) mentorQuery = mentorQuery.neq('id', userId);

      // 2. Channels
      const channelQuery = supabase
        .from('channels')
        .select('*, channel_members(count)')
        .order('created_at', { ascending: false })
        .limit(12);

      // 3. Top Traders (ordered by win_rate descending, then newest)
      let traderQuery = supabase
        .from('profiles')
        .select('*')
        .order('win_rate', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(12);
      if (userId) traderQuery = traderQuery.neq('id', userId);

      // 4. People (newest registered users first)
      let peopleQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (userId) peopleQuery = peopleQuery.neq('id', userId);

      // 5. Follows
      const followsQuery = supabase
        .from('social_follows')
        .select('follower_id, following_id');

      // Execute all 5 queries concurrently in parallel!
      const [
        { data: mentorData, error: mentorErr },
        { data: chanData, error: chanErr },
        { data: traderData, error: traderErr },
        { data: peopleData, error: peopleErr },
        { data: allFollows, error: followsErr }
      ] = await Promise.all([
        mentorQuery,
        channelQuery,
        traderQuery,
        peopleQuery,
        followsQuery
      ]);

      if (mentorErr) console.error('Discover mentors fetch error:', mentorErr);
      if (chanErr) console.error('Discover channels fetch error:', chanErr);
      if (traderErr) console.error('Discover traders fetch error:', traderErr);
      if (peopleErr) console.error('Discover people fetch error:', peopleErr);
      if (followsErr) console.error('Discover social_follows fetch error:', followsErr);

      const channelsWithCount = (chanData ?? []).map(ch => ({
        ...ch,
        // @ts-ignore - Supabase returns this as an array with count
        memberCount: ch.channel_members?.[0]?.count || 0
      }));

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

      const resolvedMentors = attachCounts(mentorData);
      const resolvedTraders = attachCounts(traderData);
      const resolvedPeople = attachCounts(peopleData);
      const resolvedChannels = channelsWithCount as any;

      setMentors(resolvedMentors);
      setChannels(resolvedChannels);
      setTraders(resolvedTraders);
      setPeople(resolvedPeople);

      // Save to cache for instant future loads
      setCachedDiscoverData({
        mentors: resolvedMentors,
        channels: resolvedChannels,
        traders: resolvedTraders,
        people: resolvedPeople,
      });
    } catch (err) {
      console.error('Discover page loading failed:', err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only re-fetch if userId changed or no cache
    if (lastUserIdRef.current !== userId || !memoryDiscoverCache) {
      lastUserIdRef.current = userId;
      fetchAll(Boolean(memoryDiscoverCache));
    }
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
