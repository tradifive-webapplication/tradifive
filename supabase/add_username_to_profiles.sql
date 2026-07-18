-- Run this in your Supabase SQL Editor to add the missing username column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
