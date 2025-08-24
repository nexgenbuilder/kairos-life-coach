-- Create payroll table for business module
CREATE TABLE public.payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  employee_email TEXT,
  pay_rate_cents BIGINT NOT NULL,
  pay_frequency TEXT NOT NULL CHECK (pay_frequency IN ('hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'annual')),
  hours_worked NUMERIC(5,2),
  gross_pay_cents BIGINT NOT NULL,
  taxes_cents BIGINT DEFAULT 0,
  deductions_cents BIGINT DEFAULT 0,
  net_pay_cents BIGINT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  notes TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crypto portfolio table
CREATE TABLE public.crypto_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC(20,8) NOT NULL DEFAULT 0,
  average_buy_price_cents BIGINT NOT NULL DEFAULT 0,
  total_invested_cents BIGINT NOT NULL DEFAULT 0,
  current_price_cents BIGINT DEFAULT 0,
  exchange TEXT,
  wallet_address TEXT,
  notes TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stocks portfolio table
CREATE TABLE public.stocks_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  average_buy_price_cents BIGINT NOT NULL DEFAULT 0,
  total_invested_cents BIGINT NOT NULL DEFAULT 0,
  current_price_cents BIGINT DEFAULT 0,
  sector TEXT,
  market TEXT DEFAULT 'NYSE',
  dividend_yield NUMERIC(5,4),
  notes TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news feed table
CREATE TABLE public.news_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT NOT NULL,
  url TEXT,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[],
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_bookmarked BOOLEAN NOT NULL DEFAULT false,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_feed ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payroll
CREATE POLICY "Users can view their own payroll" 
ON public.payroll 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payroll" 
ON public.payroll 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payroll" 
ON public.payroll 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payroll" 
ON public.payroll 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for crypto_portfolio
CREATE POLICY "Users can view their own crypto portfolio" 
ON public.crypto_portfolio 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto portfolio" 
ON public.crypto_portfolio 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto portfolio" 
ON public.crypto_portfolio 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crypto portfolio" 
ON public.crypto_portfolio 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for stocks_portfolio
CREATE POLICY "Users can view their own stocks portfolio" 
ON public.stocks_portfolio 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stocks portfolio" 
ON public.stocks_portfolio 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stocks portfolio" 
ON public.stocks_portfolio 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stocks portfolio" 
ON public.stocks_portfolio 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for news_feed
CREATE POLICY "Users can view their own news feed" 
ON public.news_feed 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own news feed" 
ON public.news_feed 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news feed" 
ON public.news_feed 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news feed" 
ON public.news_feed 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_payroll_updated_at
BEFORE UPDATE ON public.payroll
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_portfolio_updated_at
BEFORE UPDATE ON public.crypto_portfolio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stocks_portfolio_updated_at
BEFORE UPDATE ON public.stocks_portfolio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_feed_updated_at
BEFORE UPDATE ON public.news_feed
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();