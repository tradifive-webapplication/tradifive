-- ═══════════════════════════════════════════
-- RBAC Migration: Update admin_profiles for new role system
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════

-- 1. Change the role column from enum to TEXT for flexibility
ALTER TABLE public.admin_profiles 
ALTER COLUMN role TYPE TEXT USING role::TEXT;

-- 2. Set YOUR account as CEO (replace with your actual email)
UPDATE public.admin_profiles 
SET role = 'ceo' 
WHERE email = 'nikhilharake369@gmail.com';

-- 3. Ensure future signups default to support_executive
ALTER TABLE public.admin_profiles 
ALTER COLUMN role SET DEFAULT 'support_executive';
