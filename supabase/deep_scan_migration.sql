-- Migration: Create user_feedback table and update related schemas
-- Run this in your Supabase SQL Editor

-- 1. Create User Feedback Table
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    performance_rating INTEGER,
    setup_rating INTEGER,
    trust_rating INTEGER,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for user_feedback
CREATE POLICY "Users can create their own feedback" 
ON public.user_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" 
ON public.user_feedback FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

-- 2. Ensure Realtime is enabled for relevant tables to make the "Deep Scan" feel live
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mt5_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_feedback;
