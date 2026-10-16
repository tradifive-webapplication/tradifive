-- ================================================================
-- Department Access Keys
-- Allows HR to generate secret keys for department heads
-- to log into their respective department without personal email
-- ================================================================

CREATE TABLE IF NOT EXISTS public.department_access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  label TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE public.department_access_keys ENABLE ROW LEVEL SECURITY;

-- Only allow reads from authenticated admin users (all logged-in users of the admin table)
CREATE POLICY "Allow read for authenticated"
ON public.department_access_keys FOR SELECT
USING (auth.role() = 'authenticated');

-- Only allow inserts / updates from authenticated users
CREATE POLICY "Allow insert for authenticated"
ON public.department_access_keys FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated"
ON public.department_access_keys FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated"
ON public.department_access_keys FOR DELETE
USING (auth.role() = 'authenticated');

-- RPC: Validate a department key and return department info
CREATE OR REPLACE FUNCTION public.validate_dept_key(p_key_code TEXT)
RETURNS TABLE (
  id UUID,
  department TEXT,
  label TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_used_at and use_count
  UPDATE public.department_access_keys
  SET last_used_at = NOW(), use_count = use_count + 1
  WHERE key_code = p_key_code AND is_active = true;

  RETURN QUERY
  SELECT dk.id, dk.department, dk.label, dk.is_active
  FROM public.department_access_keys dk
  WHERE dk.key_code = p_key_code AND dk.is_active = true;
END;
$$;

-- ================================================================
-- 3. Load your 5 Master Keys
-- ================================================================
INSERT INTO public.department_access_keys (key_code, department, label) VALUES
  ('TDF-CEO-NIKIL', 'ceo', 'CEO - Nikil'),
  ('TDF-CEO-NAVEEN', 'ceo', 'CEO - Naveen'),
  ('TDF-HR-MASTER', 'hr', 'HR Director'),
  ('TDF-OPS-MASTER', 'operations', 'Operations Head'),
  ('TDF-FIN-MASTER', 'finance', 'Finance Manager')
ON CONFLICT (key_code) DO NOTHING;
