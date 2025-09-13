-- Migration: Add subscription fields to users table (Fixed version)
-- This migration adds the necessary fields to support Kifolio Premium subscriptions
-- Handles existing columns gracefully

-- Add subscription-related columns to users table (only if they don't exist)
DO $$ 
BEGIN
    -- Add subscription_plan column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_plan') THEN
        ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'trial', 'premium'));
    END IF;

    -- Add subscription_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid'));
    END IF;

    -- Add trial_started_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_started_at') THEN
        ALTER TABLE users ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE NULL;
    END IF;

    -- Add trial_ends_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE NULL;
    END IF;

    -- Add subscription_ends_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_ends_at') THEN
        ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE NULL;
    END IF;

    -- Add stripe_customer_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) NULL;
    END IF;

    -- Add paypal_subscription_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'paypal_subscription_id') THEN
        ALTER TABLE users ADD COLUMN paypal_subscription_id VARCHAR(255) NULL;
    END IF;

    -- Add updated_at column (only if it doesn't exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for efficient subscription queries (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_users_subscription_ends_at ON users(subscription_ends_at);

-- Create function to update updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN users.subscription_plan IS 'User subscription plan: free, trial, or premium';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, canceled, past_due, or unpaid';
COMMENT ON COLUMN users.trial_started_at IS 'When the 14-day trial started (NULL for non-trial users)';
COMMENT ON COLUMN users.trial_ends_at IS 'When the 14-day trial ends (NULL for non-trial users)';
COMMENT ON COLUMN users.subscription_ends_at IS 'When the current subscription period ends';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN users.paypal_subscription_id IS 'PayPal subscription ID for payment processing';
