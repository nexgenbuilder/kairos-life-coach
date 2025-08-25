-- Add ad spend tracking to content platforms
ALTER TABLE public.content_platforms 
ADD COLUMN ad_spend_cents bigint DEFAULT 0;

-- Add ad spend tracking to individual content pieces
ALTER TABLE public.content_catalog 
ADD COLUMN ad_spend_cents bigint DEFAULT 0;