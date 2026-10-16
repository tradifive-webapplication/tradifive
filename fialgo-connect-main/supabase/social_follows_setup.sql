-- Create the social_follows table
CREATE TABLE IF NOT EXISTS public.social_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure a user can only follow someone once
    UNIQUE(follower_id, following_id)
);

-- Add an index to speed up counting followers and following
CREATE INDEX IF NOT EXISTS idx_social_follows_follower_id ON public.social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following_id ON public.social_follows(following_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.social_follows ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read follows
CREATE POLICY "Anyone can view follows" 
    ON public.social_follows FOR SELECT 
    USING (true);

-- Policy: Users can only follow others as themselves
CREATE POLICY "Users can insert their own follows" 
    ON public.social_follows FOR INSERT 
    WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can only unfollow as themselves
CREATE POLICY "Users can delete their own follows" 
    ON public.social_follows FOR DELETE 
    USING (auth.uid() = follower_id);

-- Enable real-time for the social_follows table
DO $$
BEGIN
  -- Check if the table is already in the publication before adding
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'social_follows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_follows;
  END IF;
END $$;
