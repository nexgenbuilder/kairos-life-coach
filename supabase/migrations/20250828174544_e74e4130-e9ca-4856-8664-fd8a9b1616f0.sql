-- Update the people_type_check constraint to include professional module types
ALTER TABLE public.people DROP CONSTRAINT people_type_check;

-- Add updated constraint with professional types
ALTER TABLE public.people ADD CONSTRAINT people_type_check 
CHECK (type = ANY (ARRAY[
  'lead'::text, 
  'customer'::text, 
  'friend'::text, 
  'family'::text, 
  'partner'::text, 
  'vendor'::text, 
  'coworker'::text,
  -- Add professional module types
  'colleague'::text,
  'manager'::text,
  'hr'::text,
  'client'::text,
  -- Add other missing types from other modules
  'work'::text,
  'romantic'::text,
  'school'::text,
  'neighbor'::text,
  'acquaintance'::text,
  'spouse'::text,
  'relative'::text,
  'supplier'::text,
  'contact'::text
]));