-- Update auth settings to disable email confirmation for easier testing
-- This is a development convenience setting
UPDATE auth.config SET email_confirm = false WHERE true;