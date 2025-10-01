-- Add category, location, and pricing fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS pricing_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS price_amount_cents bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS subscription_interval text;

-- Add check constraint for pricing_type
ALTER TABLE organizations
ADD CONSTRAINT organizations_pricing_type_check 
CHECK (pricing_type IN ('free', 'paid'));

-- Add check constraint for subscription_interval
ALTER TABLE organizations
ADD CONSTRAINT organizations_subscription_interval_check 
CHECK (subscription_interval IS NULL OR subscription_interval IN ('one_time', 'monthly', 'yearly'));

-- Add index for category and location for faster filtering
CREATE INDEX IF NOT EXISTS idx_organizations_category ON organizations(category);
CREATE INDEX IF NOT EXISTS idx_organizations_location ON organizations(location);
CREATE INDEX IF NOT EXISTS idx_organizations_pricing_type ON organizations(pricing_type);

-- Add comment describing valid categories
COMMENT ON COLUMN organizations.category IS 'Valid categories: business, non_profit, church, community, entertainment, dating, other';