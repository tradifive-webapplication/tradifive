-- Fix: Add INSERT policy for user_xp_ledger
-- This allows the frontend to insert daily check-in rewards

CREATE POLICY "Users can insert own XP ledger" 
ON public.user_xp_ledger 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
