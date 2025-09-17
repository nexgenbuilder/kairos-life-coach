-- Update the first user profile to admin for testing
-- You may need to replace this with your actual user_id
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = (SELECT user_id FROM profiles ORDER BY created_at ASC LIMIT 1);