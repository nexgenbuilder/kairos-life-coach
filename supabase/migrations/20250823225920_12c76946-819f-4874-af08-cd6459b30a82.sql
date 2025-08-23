-- Create people table for unified contact management
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lead','customer','friend','family','partner','vendor','coworker')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tags TEXT[],
  birthday DATE,
  notes TEXT,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table for business module
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  person_id UUID REFERENCES public.people(id),
  amount_cents BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new','qualified','proposal','negotiation','won','lost')),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  close_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interactions table for all modules
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  person_id UUID REFERENCES public.people(id),
  module TEXT NOT NULL CHECK (module IN ('business','professional','social','love')),
  channel TEXT CHECK (channel IN ('call','email','text','meeting','note')),
  summary TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive','neutral','negative')),
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create key_dates table for love module
CREATE TABLE public.key_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  person_id UUID REFERENCES public.people(id),
  title TEXT NOT NULL,
  date_value DATE NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('none','yearly','monthly')),
  reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relationship_rules table for social module
CREATE TABLE public.relationship_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  person_id UUID NOT NULL REFERENCES public.people(id),
  cadence_days INTEGER NOT NULL,
  next_nudge_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for people
CREATE POLICY "Users can view their own people" ON public.people
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own people" ON public.people
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own people" ON public.people
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own people" ON public.people
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for deals
CREATE POLICY "Users can view their own deals" ON public.deals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own deals" ON public.deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals" ON public.deals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deals" ON public.deals
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for interactions
CREATE POLICY "Users can view their own interactions" ON public.interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interactions" ON public.interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON public.interactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for key_dates
CREATE POLICY "Users can view their own key_dates" ON public.key_dates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own key_dates" ON public.key_dates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own key_dates" ON public.key_dates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own key_dates" ON public.key_dates
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for relationship_rules
CREATE POLICY "Users can view their own relationship_rules" ON public.relationship_rules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own relationship_rules" ON public.relationship_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own relationship_rules" ON public.relationship_rules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own relationship_rules" ON public.relationship_rules
  FOR DELETE USING (auth.uid() = user_id);

-- Create update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();