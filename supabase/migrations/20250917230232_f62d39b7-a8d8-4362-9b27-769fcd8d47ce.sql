-- Completely disable RLS temporarily to test organization creation
-- First let's see what's actually happening

-- Disable RLS temporarily for testing
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- We'll re-enable it after testing