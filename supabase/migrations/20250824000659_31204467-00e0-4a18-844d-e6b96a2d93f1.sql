-- Create content_platforms table
CREATE TABLE public.content_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_name TEXT NOT NULL, -- youtube, instagram, tiktok, twitter, etc.
  account_handle TEXT NOT NULL,
  account_display_name TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  account_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_catalog table
CREATE TABLE public.content_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_id UUID REFERENCES public.content_platforms(id),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- video, photo, carousel, story, livestream, vlog, stitch, video_response, short, reel, podcast
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, published, archived
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  content_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  hashtags TEXT[],
  duration_seconds INTEGER, -- for videos
  file_size_mb NUMERIC,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  revenue_generated_cents BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_expenses table
CREATE TABLE public.content_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID REFERENCES public.content_catalog(id),
  platform_id UUID REFERENCES public.content_platforms(id),
  description TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  expense_category TEXT NOT NULL, -- equipment, software, travel, talent, marketing, props, location
  date DATE NOT NULL,
  receipt_url TEXT,
  vendor TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT, -- monthly, weekly, yearly
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_income table
CREATE TABLE public.content_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID REFERENCES public.content_catalog(id),
  platform_id UUID REFERENCES public.content_platforms(id),
  description TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  income_source TEXT NOT NULL, -- ad_revenue, sponsorship, affiliate, merchandise, donations, subscriptions, brand_deal
  date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT, -- monthly, weekly, yearly
  tax_deductible BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, overdue
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create livestream_schedules table
CREATE TABLE public.livestream_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_id UUID REFERENCES public.content_platforms(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  stream_url TEXT,
  stream_key TEXT,
  max_viewers INTEGER DEFAULT 0,
  average_viewers INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_followers_gained INTEGER DEFAULT 0,
  revenue_generated_cents BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel_schedules table
CREATE TABLE public.travel_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  purpose TEXT, -- content_creation, event, meeting, collaboration
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  accommodation TEXT,
  transportation TEXT,
  budget_cents BIGINT,
  actual_cost_cents BIGINT,
  currency TEXT DEFAULT 'USD',
  content_planned TEXT[],
  collaborators TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creator_events table
CREATE TABLE public.creator_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- conference, workshop, collaboration, meetup, photoshoot, interview
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  attendees TEXT[],
  cost_cents BIGINT DEFAULT 0,
  revenue_cents BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  content_opportunities TEXT[],
  status TEXT DEFAULT 'planned', -- planned, confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_platforms
CREATE POLICY "Users can view their own platforms" ON public.content_platforms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own platforms" ON public.content_platforms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own platforms" ON public.content_platforms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own platforms" ON public.content_platforms FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for content_catalog
CREATE POLICY "Users can view their own content" ON public.content_catalog FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own content" ON public.content_catalog FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content" ON public.content_catalog FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON public.content_catalog FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for content_expenses
CREATE POLICY "Users can view their own content expenses" ON public.content_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own content expenses" ON public.content_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content expenses" ON public.content_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content expenses" ON public.content_expenses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for content_income
CREATE POLICY "Users can view their own content income" ON public.content_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own content income" ON public.content_income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content income" ON public.content_income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content income" ON public.content_income FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for livestream_schedules
CREATE POLICY "Users can view their own livestreams" ON public.livestream_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own livestreams" ON public.livestream_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own livestreams" ON public.livestream_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own livestreams" ON public.livestream_schedules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for travel_schedules
CREATE POLICY "Users can view their own travel" ON public.travel_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own travel" ON public.travel_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own travel" ON public.travel_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own travel" ON public.travel_schedules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for creator_events
CREATE POLICY "Users can view their own creator events" ON public.creator_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own creator events" ON public.creator_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own creator events" ON public.creator_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own creator events" ON public.creator_events FOR DELETE USING (auth.uid() = user_id);

-- Create update triggers
CREATE TRIGGER update_content_platforms_updated_at BEFORE UPDATE ON public.content_platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_catalog_updated_at BEFORE UPDATE ON public.content_catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_expenses_updated_at BEFORE UPDATE ON public.content_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_income_updated_at BEFORE UPDATE ON public.content_income FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_livestream_schedules_updated_at BEFORE UPDATE ON public.livestream_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_travel_schedules_updated_at BEFORE UPDATE ON public.travel_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_creator_events_updated_at BEFORE UPDATE ON public.creator_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();