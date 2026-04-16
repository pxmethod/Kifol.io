-- Account holder display name (synced from auth signup metadata via handle_new_user trigger).
-- Safe if your project already created public.users with name from the main schema.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name text;
