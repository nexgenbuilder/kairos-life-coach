-- Create chat_threads table for thread-level mode persistence
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT,
  active_mode TEXT NOT NULL DEFAULT 'general' CHECK (active_mode IN ('general', 'perplexity', 'gemini')),
  modes_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feature_flags table for per-org/user AI permissions
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id, feature_name)
);

-- Create ai_usage_quotas table for tracking engine usage
CREATE TABLE IF NOT EXISTS public.ai_usage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engine TEXT NOT NULL CHECK (engine IN ('perplexity', 'gemini', 'lovable')),
  window_type TEXT NOT NULL DEFAULT 'hour' CHECK (window_type IN ('hour', 'day', 'month')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER NOT NULL DEFAULT 20,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() + INTERVAL '1 hour',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, engine, window_start)
);

-- RLS policies for chat_threads
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own threads"
  ON public.chat_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own threads"
  ON public.chat_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
  ON public.chat_threads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
  ON public.chat_threads FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feature flags"
  ON public.feature_flags FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Org admins can manage feature flags"
  ON public.feature_flags FOR ALL
  USING (
    organization_id IS NOT NULL 
    AND user_is_org_admin(organization_id)
  );

-- RLS policies for ai_usage_quotas
ALTER TABLE public.ai_usage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage quotas"
  ON public.ai_usage_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage quotas"
  ON public.ai_usage_quotas FOR ALL
  USING (auth.uid() = user_id);

-- Function to get current AI usage for a user
CREATE OR REPLACE FUNCTION public.get_ai_usage(
  p_user_id UUID,
  p_engine TEXT DEFAULT NULL
)
RETURNS TABLE (
  engine TEXT,
  used INTEGER,
  usage_limit INTEGER,
  window_end TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    q.engine,
    q.usage_count as used,
    q.usage_limit,
    q.window_end
  FROM ai_usage_quotas q
  WHERE q.user_id = p_user_id
    AND (p_engine IS NULL OR q.engine = p_engine)
    AND q.window_end > now()
  ORDER BY q.engine;
$$;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id UUID,
  p_engine TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get or create current usage window
  INSERT INTO ai_usage_quotas (user_id, engine, usage_count, usage_limit, window_start, window_end)
  VALUES (
    p_user_id, 
    p_engine, 
    0,
    CASE 
      WHEN p_engine = 'perplexity' THEN 20
      WHEN p_engine = 'gemini' THEN 30
      ELSE 50
    END,
    date_trunc('hour', now()),
    date_trunc('hour', now()) + INTERVAL '1 hour'
  )
  ON CONFLICT (user_id, engine, window_start) 
  DO NOTHING;

  -- Get current usage
  SELECT 
    aq.usage_count, 
    aq.usage_limit 
  INTO v_current_count, v_limit
  FROM ai_usage_quotas aq
  WHERE aq.user_id = p_user_id 
    AND aq.engine = p_engine
    AND aq.window_end > now()
  ORDER BY aq.window_start DESC
  LIMIT 1;

  -- Check if under limit
  IF v_current_count + p_amount > v_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment usage
  UPDATE ai_usage_quotas aq
  SET 
    usage_count = usage_count + p_amount,
    updated_at = now()
  WHERE aq.user_id = p_user_id 
    AND aq.engine = p_engine
    AND aq.window_end > now();

  RETURN TRUE;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON public.chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_space_id ON public.chat_threads(space_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_org_user ON public.feature_flags(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_quotas_user_engine ON public.ai_usage_quotas(user_id, engine);
CREATE INDEX IF NOT EXISTS idx_ai_usage_quotas_window ON public.ai_usage_quotas(window_start, window_end);
