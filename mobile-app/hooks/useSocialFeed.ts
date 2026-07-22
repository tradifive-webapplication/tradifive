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
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export function useSocialFeed() {
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useStore(state => state.currentUser);

  const fetchFeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*, profiles(full_name, username, avatar_url)')
        .neq('post_type', 'story')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      let finalData = (data as FeedPost[]) || [];
      
      setFeeds(finalData);
    } catch (err) {
      console.error('Error fetching feeds:', err);
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

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
