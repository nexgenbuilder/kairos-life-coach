-- Add organization_id columns to all module tables that don't have it yet

-- Business module tables
ALTER TABLE public.business_expenses ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.payroll ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.pto_requests ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Content module tables  
ALTER TABLE public.content_platforms ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.content_income ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.content_expenses ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.livestream_schedules ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.travel_schedules ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Health module tables
ALTER TABLE public.medications ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.medication_logs ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Crypto module tables
ALTER TABLE public.crypto_portfolio ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.crypto_watchlist ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Stocks module tables
ALTER TABLE public.stocks_portfolio ADD COLUMN organization_id UUID REFERENCES public.organizations(id);