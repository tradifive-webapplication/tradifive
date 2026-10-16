-- Fix get_ai_credits
DROP FUNCTION IF EXISTS public.get_ai_credits(uuid);
CREATE OR REPLACE FUNCTION public.get_ai_credits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_rec RECORD;
  max_cred INTEGER;
BEGIN
  SELECT ai_credits_remaining, ai_credits_max, ai_credits_last_reset, subscription_status
  INTO profile_rec
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('credits_remaining', 0, 'credits_max', 10);
  END IF;

  -- Treat NULL as an old date using COALESCE
  IF COALESCE(profile_rec.ai_credits_last_reset, '2000-01-01'::date) < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date THEN
    max_cred := 10;
    IF profile_rec.subscription_status IN ('pro', 'intermediate') THEN max_cred := 50;
    ELSIF profile_rec.subscription_status IN ('elite', 'advanced') THEN max_cred := 150;
    END IF;
    
    -- IMPORTANT: Actually persist the reset in the database
    UPDATE public.profiles
    SET ai_credits_remaining = max_cred,
        ai_credits_max = max_cred,
        ai_credits_last_reset = CURRENT_DATE
    WHERE id = p_user_id;

    RETURN jsonb_build_object('credits_remaining', max_cred, 'credits_max', max_cred);
  END IF;

  RETURN jsonb_build_object(
    'credits_remaining', COALESCE(profile_rec.ai_credits_remaining, 10),
    'credits_max', COALESCE(profile_rec.ai_credits_max, 10)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Fix consume_ai_credit
DROP FUNCTION IF EXISTS public.consume_ai_credit(uuid);
CREATE OR REPLACE FUNCTION public.consume_ai_credit(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_rec RECORD;
  new_credits INTEGER;
BEGIN
  SELECT ai_credits_remaining, ai_credits_max, ai_credits_last_reset, subscription_status
  INTO profile_rec
  FROM public.profiles
  WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  -- Reset credits if it's a new day or NULL
  IF COALESCE(profile_rec.ai_credits_last_reset, '2000-01-01'::date) < CURRENT_DATE THEN
    DECLARE
      max_cred INTEGER := 10;
    BEGIN
      IF profile_rec.subscription_status IN ('pro', 'intermediate') THEN
        max_cred := 50;
      ELSIF profile_rec.subscription_status IN ('elite', 'advanced') THEN
        max_cred := 150;
      END IF;

      UPDATE public.profiles
      SET ai_credits_remaining = max_cred,
          ai_credits_max = max_cred,
          ai_credits_last_reset = CURRENT_DATE
      WHERE id = p_user_id;

      profile_rec.ai_credits_remaining := max_cred;
      profile_rec.ai_credits_max := max_cred;
      profile_rec.ai_credits_last_reset := CURRENT_DATE;
    END;
  END IF;

  -- Check if credits available
  IF COALESCE(profile_rec.ai_credits_remaining, 0) <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'out_of_credits', 'credits_remaining', 0);
  END IF;

  -- Atomically decrement using COALESCE for safety
  UPDATE public.profiles
  SET ai_credits_remaining = COALESCE(ai_credits_remaining, 10) - 1
  WHERE id = p_user_id
  RETURNING ai_credits_remaining INTO new_credits;

  RETURN jsonb_build_object('success', true, 'credits_remaining', new_credits);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
