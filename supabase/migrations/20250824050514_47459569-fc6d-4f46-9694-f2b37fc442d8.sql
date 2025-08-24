-- Create stocks portfolio table
CREATE TABLE public.stocks_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_buy_price_cents BIGINT NOT NULL DEFAULT 0,
  total_invested_cents BIGINT NOT NULL DEFAULT 0,
  current_price_cents BIGINT DEFAULT 0,
  exchange TEXT,
  sector TEXT,
  notes TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stocks watchlist table
CREATE TABLE public.stocks_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  current_price_cents BIGINT DEFAULT 0,
  price_change_24h NUMERIC DEFAULT 0,
  market_cap_cents BIGINT DEFAULT 0,
  sector TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Enable Row Level Security
ALTER TABLE public.stocks_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks_watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies for stocks_portfolio
CREATE POLICY "Users can view their own stocks portfolio" 
ON public.stocks_portfolio 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stocks portfolio items" 
ON public.stocks_portfolio 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stocks portfolio items" 
ON public.stocks_portfolio 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stocks portfolio items" 
ON public.stocks_portfolio 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for stocks_watchlist
CREATE POLICY "Users can view their own stocks watchlist" 
ON public.stocks_watchlist 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stocks watchlist items" 
ON public.stocks_watchlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stocks watchlist items" 
ON public.stocks_watchlist 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stocks watchlist items" 
ON public.stocks_watchlist 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_stocks_portfolio_updated_at
BEFORE UPDATE ON public.stocks_portfolio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stocks_watchlist_updated_at
BEFORE UPDATE ON public.stocks_watchlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();