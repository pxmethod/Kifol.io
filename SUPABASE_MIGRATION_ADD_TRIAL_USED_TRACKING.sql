-- Migration: Add trial_used tracking to prevent multiple trials
-- This migration adds a field to track if a user has ever used their 14-day trial

-- Add trial_used column to users table (only if it doesn't exist)
DO $$ 
BEGIN
    -- Add trial_used column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_used') THEN
        ALTER TABLE users ADD COLUMN trial_used BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing users who have trial_started_at set to mark them as having used their trial
UPDATE users 
SET trial_used = true 
WHERE trial_started_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.trial_used IS 'Whether the user has ever used their 14-day free trial';
