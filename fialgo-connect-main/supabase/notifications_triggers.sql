-- ==========================================
-- NOTIFICATIONS TRIGGER SETUP SCRIPT
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Trigger for New Follower
CREATE OR REPLACE FUNCTION public.handle_new_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get the display name of the follower
  SELECT COALESCE(display_name, username, 'Someone') INTO follower_name
  FROM public.profiles
  WHERE id = NEW.follower_id;

  -- Insert the notification for the person being followed
  INSERT INTO public.notifications (user_id, type, title, message, priority, is_read)
  VALUES (
    NEW.following_id,
    'follow',
    'New Follower',
    follower_name || ' started following you!',
    'normal',
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for New Direct Message
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get the display name of the sender
  SELECT COALESCE(display_name, username, 'Someone') INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Insert the notification for the receiver
  INSERT INTO public.notifications (user_id, type, title, message, priority, is_read)
  VALUES (
    NEW.receiver_id,
    'message',
    'New Message',
    sender_name || ' sent you a message.',
    'high',
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  -- Drop existing if any
  DROP TRIGGER IF EXISTS trigger_new_follow_notification ON public.social_follows;
  DROP TRIGGER IF EXISTS trigger_new_message_notification ON public.direct_messages;
  
  -- Create triggers
  CREATE TRIGGER trigger_new_follow_notification
  AFTER INSERT ON public.social_follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow_notification();

  CREATE TRIGGER trigger_new_message_notification
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();
END $$;
