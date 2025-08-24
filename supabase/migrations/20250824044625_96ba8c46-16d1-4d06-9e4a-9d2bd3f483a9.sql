-- Create crypto watchlist table
CREATE TABLE public.crypto_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  current_price_cents BIGINT DEFAULT 0,
  price_change_24h NUMERIC DEFAULT 0,
  market_cap_cents BIGINT DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Enable Row Level Security
ALTER TABLE public.crypto_watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own watchlist" 
ON public.crypto_watchlist 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlist items" 
ON public.crypto_watchlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items" 
ON public.crypto_watchlist 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items" 
ON public.crypto_watchlist 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_crypto_watchlist_updated_at
BEFORE UPDATE ON public.crypto_watchlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();