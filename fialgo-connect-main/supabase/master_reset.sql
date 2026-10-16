-- ==========================================
-- MASTER RESET & TRIGGER SETUP SCRIPT (FIXED)
-- Run this in the Supabase SQL Editor
-- ==========================================

-- WIPE ALL PUBLIC DATA (Allows you to delete users safely)
-- Using the correct table names for your project
TRUNCATE TABLE public.social_post_likes CASCADE;
TRUNCATE TABLE public.social_post_comments CASCADE;
TRUNCATE TABLE public.social_posts CASCADE;
TRUNCATE TABLE public.social_follows CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- SETUP TRIGGERS FOR LIKES AND COMMENTS
-- This ensures the likes count works automatically!

-- Trigger function for likes
CREATE OR REPLACE FUNCTION public.update_social_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_posts
    SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for comments
CREATE OR REPLACE FUNCTION public.update_social_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts
    SET comment_count = COALESCE(comment_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_posts
    SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  -- Drop existing if any
  DROP TRIGGER IF EXISTS trigger_update_social_post_likes ON public.social_post_likes;
  DROP TRIGGER IF EXISTS trigger_update_social_post_comments ON public.social_post_comments;
  
  -- Create triggers
  CREATE TRIGGER trigger_update_social_post_likes
  AFTER INSERT OR DELETE ON public.social_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_social_post_likes();

  CREATE TRIGGER trigger_update_social_post_comments
  AFTER INSERT OR DELETE ON public.social_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_social_post_comments();
END $$;
