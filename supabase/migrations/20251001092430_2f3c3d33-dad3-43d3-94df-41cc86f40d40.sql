-- Add unique constraint to connection_categories
ALTER TABLE public.connection_categories
ADD CONSTRAINT connection_categories_user_connection_unique 
UNIQUE (user_id, connection_user_id);

-- Now fix the orphaned organizations by adding their missing memberships and contexts
INSERT INTO public.organization_memberships (organization_id, user_id, role, is_active, joined_at)
VALUES 
  ('93af6204-f7d2-4a0a-8031-46b68126e164', 'a986568a-4720-4d87-a0e0-dfdbe30c0303', 'owner', true, now()),
  ('73d9ceb0-77c3-40f2-a849-3fb79deb96ba', 'a986568a-4720-4d87-a0e0-dfdbe30c0303', 'owner', true, now()),
  ('68dac780-6fde-4bac-a138-55b4ee53a376', 'a986568a-4720-4d87-a0e0-dfdbe30c0303', 'owner', true, now()),
  ('a7cffc73-049d-423c-a729-f7ebca668f52', 'a986568a-4720-4d87-a0e0-dfdbe30c0303', 'owner', true, now()),
  ('8b09957d-6a1b-4d6e-8ffd-ab3f29b002e2', 'a986568a-4720-4d87-a0e0-dfdbe30c0303', 'owner', true, now())
ON CONFLICT (organization_id, user_id) DO NOTHING;

INSERT INTO public.user_contexts (user_id, group_id, is_active, last_accessed)
VALUES 
  ('a986568a-4720-4d87-a0e0-dfdbe30c0303', '93af6204-f7d2-4a0a-8031-46b68126e164', false, now()),
  ('a986568a-4720-4d87-a0e0-dfdbe30c0303', '73d9ceb0-77c3-40f2-a849-3fb79deb96ba', false, now()),
  ('a986568a-4720-4d87-a0e0-dfdbe30c0303', '68dac780-6fde-4bac-a138-55b4ee53a376', false, now()),
  ('a986568a-4720-4d87-a0e0-dfdbe30c0303', 'a7cffc73-049d-423c-a729-f7ebca668f52', false, now()),
  ('a986568a-4720-4d87-a0e0-dfdbe30c0303', '8b09957d-6a1b-4d6e-8ffd-ab3f29b002e2', false, now())
ON CONFLICT (user_id, group_id) DO NOTHING;