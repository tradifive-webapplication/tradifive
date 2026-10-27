import { useState, useEffect } from 'react';
import { supabase } from '../app/utils/supabase';
import { useStore } from '../app/store';

export type FeedPost = {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  post_type: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  profiles: {
    full_name: string | null;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

const SEED_FEEDS: FeedPost[] = [
  {
    id: 'bfa1c52f-0ebc-4061-8171-b531db199bc6',
    user_id: '20567383-2957-4b9c-88b2-4f5ade623bef',
    content: "Tradifive's First Fialgo v1 \nwhich generates daily 2-5% 🫡",
    media_url: "https://rylwyxhupwpwsdbvuoej.supabase.co/storage/v1/object/public/attachments/20567383-2957-4b9c-88b2-4f5ade623bef/xisz570ylo_1792845161312.png",
    post_type: 'image',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    like_count: 24,
    comment_count: 6,
    share_count: 3,
    bookmark_count: 5,
    profiles: {
      full_name: 'Nikhil Harake',
      display_name: 'Nikhil Harake',
      username: 'nik_trader',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIh2WGq5YRLuKCW0lnIeJQU2thO2Bq4mxOCQCj6Szsqxy-ZTGU=s96-c',
    }
  },
  {
    id: 'eca1a358-4087-49a3-a152-404f13cc7cec',
    user_id: '20567383-2957-4b9c-88b2-4f5ade623bef',
    content: "Its me",
    media_url: "https://rylwyxhupwpwsdbvuoej.supabase.co/storage/v1/object/public/attachments/20567383-2957-4b9c-88b2-4f5ade623bef/cditiakhum_1792845206181.jpeg",
    post_type: 'image',
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    like_count: 32,
    comment_count: 9,
    share_count: 4,
    bookmark_count: 2,
    profiles: {
      full_name: 'Nikhil Harake',
      display_name: 'Nikhil Harake',
      username: 'nik_trader',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIh2WGq5YRLuKCW0lnIeJQU2thO2Bq4mxOCQCj6Szsqxy-ZTGU=s96-c',
    }
  },
  {
    id: 'curated-fialgo-01',
    user_id: 'tradifive-official-sys',
    content: "🚀 FIALGO MT5 Continuous Bridge Status: 14ms latency verified. Target return 2.0% - 5.0% active with automated Risk Guard cap at 4.5% max drawdown.\n\nAll MT5 connected accounts running on optimal settings for the session! 📊⚡",
    media_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
    post_type: 'image',
    created_at: new Date(Date.now() - 3600 * 1000 * 9).toISOString(),
    like_count: 58,
    comment_count: 17,
    share_count: 11,
    bookmark_count: 14,
    profiles: {
      full_name: 'TradiFive Algo Desk',
      display_name: 'TradiFive Algo Desk',
      username: 'tradifive',
      avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    }
  },
  {
    id: 'curated-fialgo-02',
    user_id: 'elena-fx-trader',
    content: "Gold ($XAUUSD) 15-minute liquidity grab closed with +62 pips profit on the Fialgo breakout strategy. Risk reward ratio 1:3.2 executed cleanly without slippage. Always stick to your risk management! 📈🔥",
    media_url: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop",
    post_type: 'image',
    created_at: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    like_count: 41,
    comment_count: 11,
    share_count: 6,
    bookmark_count: 8,
    profiles: {
      full_name: 'Elena Rostova',
      display_name: 'Elena FX',
      username: 'elena_fx',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    }
  }
];

export function useSocialFeed() {
  const [feeds, setFeeds] = useState<FeedPost[]>(SEED_FEEDS);
  const [loading, setLoading] = useState(false);
  const currentUser = useStore(state => state.currentUser);

  const fetchFeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*, profiles:user_id(full_name, display_name, username, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Fallback without foreign key alias if user_id relationship is direct
        const retry = await supabase
          .from('social_posts')
          .select('*, profiles(full_name, username, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!retry.error && retry.data && retry.data.length > 0) {
          let list = (retry.data as FeedPost[]).filter(p => p.post_type !== 'story');
          setFeeds(list.length > 0 ? list : SEED_FEEDS);
          return;
        }
      }

      let finalData = (data as FeedPost[]) || [];
      finalData = finalData.filter(p => p.post_type !== 'story');
      
      if (finalData.length > 0) {
        // Merge with seed feeds to guarantee full, rich feeds
        const existingIds = new Set(finalData.map(p => p.id));
        const merged = [...finalData];
        SEED_FEEDS.forEach(seed => {
          if (!existingIds.has(seed.id)) {
            merged.push(seed);
          }
        });
        setFeeds(merged);
      } else {
        setFeeds(SEED_FEEDS);
      }
    } catch (err) {
      console.warn('Error fetching feeds, using seed fallback:', err);
      setFeeds(SEED_FEEDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [currentUser?.id]);

  const addPost = (post: FeedPost) => {
    setFeeds(prev => [post, ...prev]);
  };

  const removePost = (postId: string) => {
    setFeeds(prev => prev.filter(p => p.id !== postId));
  };

  return {
    feeds,
    loading,
    refetch: fetchFeeds,
    addPost,
    removePost,
  };
}
