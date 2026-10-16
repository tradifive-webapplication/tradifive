-- Create story_views table
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(story_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own views
CREATE POLICY "Users can insert their own story views"
ON public.story_views FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Allow story authors to select views for their stories
CREATE POLICY "Story authors can view who saw their stories"
ON public.story_views FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.social_posts
        WHERE social_posts.id = story_views.story_id
        AND social_posts.user_id = auth.uid()
    )
);

-- RPC for recording a view safely (handles UPSERT via ON CONFLICT)
CREATE OR REPLACE FUNCTION public.record_story_view(p_story_id UUID, p_viewer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.story_views (story_id, viewer_id, viewed_at)
    VALUES (p_story_id, p_viewer_id, NOW())
    ON CONFLICT (story_id, viewer_id) DO NOTHING;
END;
$$;
