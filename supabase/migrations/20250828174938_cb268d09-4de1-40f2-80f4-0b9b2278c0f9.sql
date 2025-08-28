-- Update the deals_stage_check constraint to include more comprehensive stage options
ALTER TABLE public.deals DROP CONSTRAINT deals_stage_check;

-- Add updated constraint with more stage options
ALTER TABLE public.deals ADD CONSTRAINT deals_stage_check 
CHECK (stage = ANY (ARRAY[
  'new'::text,
  'prospect'::text,
  'qualified'::text,
  'proposal'::text,
  'negotiation'::text,
  'won'::text,
  'lost'::text,
  'closed'::text
]));