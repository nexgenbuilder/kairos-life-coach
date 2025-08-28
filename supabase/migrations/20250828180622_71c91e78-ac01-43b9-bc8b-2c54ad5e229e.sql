
-- Add actual_revenue_cents column to deals table
ALTER TABLE public.deals ADD COLUMN actual_revenue_cents bigint DEFAULT 0;

-- Update the deals_stage_check constraint to include all the stages used in the UI
ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_stage_check;

ALTER TABLE public.deals ADD CONSTRAINT deals_stage_check 
CHECK (stage = ANY (ARRAY[
  'new'::text,
  'prospect'::text,
  'meeting'::text,
  'proposal'::text,
  'commit'::text,
  'negotiation'::text,
  'qualified'::text,
  'won'::text,
  'lost'::text,
  'closed'::text
]));
