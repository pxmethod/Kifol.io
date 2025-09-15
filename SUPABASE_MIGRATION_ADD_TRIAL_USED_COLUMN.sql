-- Migration: Add trial_used column to users table
-- This migration adds the missing trial_used column

-- Add trial_used column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_used') THEN
        ALTER TABLE users ADD COLUMN trial_used BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added trial_used column to users table';
    ELSE
        RAISE NOTICE 'trial_used column already exists';
    END IF;
END $$;

-- Update existing users to have the default value
UPDATE users 
SET trial_used = false
WHERE trial_used IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.trial_used IS 'Whether the user has ever used their 14-day free trial';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_trial_used ON users(trial_used);
