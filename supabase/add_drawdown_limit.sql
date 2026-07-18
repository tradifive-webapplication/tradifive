-- Update Migration: Add Drawdown Limit
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS max_drawdown_limit DECIMAL(5,2) DEFAULT 5.00; -- Default 5% drawdown limit
