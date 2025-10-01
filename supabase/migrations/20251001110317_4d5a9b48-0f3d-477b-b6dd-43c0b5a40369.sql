-- PHASE 1: CRITICAL SECURITY FIXES - Clean and Complete

-- 1. Fix Organizations Table RLS (CRITICAL)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Drop and recreate rate limiting tables to ensure clean state
DROP TABLE IF EXISTS public.rate_limits CASCADE;
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Drop and recreate failed auth tracking table
DROP TABLE IF EXISTS public.failed_auth_attempts CASCADE;
CREATE TABLE public.failed_auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.failed_auth_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage failed auth"
ON public.failed_auth_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Create indexes for performance
CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint, window_start);
CREATE INDEX idx_failed_auth_identifier ON public.failed_auth_attempts(identifier, created_at);

-- 5. Replace public organizations policy with more restrictive version
DROP POLICY IF EXISTS "Anyone can view public discoverable spaces" ON public.organizations;

CREATE POLICY "Authenticated users can view public spaces"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  (visibility = 'public' AND discoverable = true) OR
  user_can_access_organization(id)
);