-- 1. Profiles Table Policies
-- Enable Row Level Security on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Anyone (public or authenticated) can read profiles so they can view names/avatars/bios
CREATE POLICY "Anyone can view profiles" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Authenticated users can insert their own profile row
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can edit details like display_name, bio, avatar_url, banner_url, username, and preferences for their own profile
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- 2. Social Posts Table Policies
-- Enable Row Level Security on social_posts if not already enabled
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Anyone can view posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.social_posts;

-- Anyone (public or authenticated) can view posts in their social feed
CREATE POLICY "Anyone can view posts" 
    ON public.social_posts FOR SELECT 
    USING (true);

-- Users can only insert posts representing themselves
CREATE POLICY "Users can insert their own posts" 
    ON public.social_posts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own posts
CREATE POLICY "Users can delete their own posts" 
    ON public.social_posts FOR DELETE 
    USING (auth.uid() = user_id);
