-- Create the social_follow_requests table
CREATE TABLE IF NOT EXISTS public.social_follow_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure a user can only have one pending request to someone at a time
    UNIQUE(requester_id, target_id)
);

-- Add an index to speed up finding requests
CREATE INDEX IF NOT EXISTS idx_social_follow_requests_target_id ON public.social_follow_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_social_follow_requests_requester_id ON public.social_follow_requests(requester_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.social_follow_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view requests they sent OR requests sent to them
CREATE POLICY "Users can view their own sent or received requests" 
    ON public.social_follow_requests FOR SELECT 
    USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- Policy: Users can only send requests as themselves
CREATE POLICY "Users can insert their own requests" 
    ON public.social_follow_requests FOR INSERT 
    WITH CHECK (auth.uid() = requester_id);

-- Policy: Users can cancel their own requests OR reject requests sent to them
CREATE POLICY "Users can delete requests involving them" 
    ON public.social_follow_requests FOR DELETE 
    USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- Enable real-time for the social_follow_requests table
DO $$
BEGIN
  -- Check if the table is already in the publication before adding
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'social_follow_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_follow_requests;
  END IF;
END $$;
