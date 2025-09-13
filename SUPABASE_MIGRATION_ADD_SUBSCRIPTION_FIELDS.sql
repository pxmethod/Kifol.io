-- Migration: Add subscription fields to users table
-- This migration adds the necessary fields to support Kifolio Premium subscriptions

-- Add subscription-related columns to users table
ALTER TABLE users 
ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'trial', 'premium')),
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN stripe_customer_id VARCHAR(255) NULL,
ADD COLUMN paypal_subscription_id VARCHAR(255) NULL,
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient subscription queries
CREATE INDEX idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_trial_ends_at ON users(trial_ends_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN users.subscription_plan IS 'User subscription plan: free, trial, or premium';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, canceled, past_due, or unpaid';
COMMENT ON COLUMN users.trial_started_at IS 'When the 14-day trial started (NULL for non-trial users)';
COMMENT ON COLUMN users.trial_ends_at IS 'When the 14-day trial ends (NULL for non-trial users)';
COMMENT ON COLUMN users.subscription_ends_at IS 'When the current subscription period ends';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN users.paypal_subscription_id IS 'PayPal subscription ID for payment processing';
