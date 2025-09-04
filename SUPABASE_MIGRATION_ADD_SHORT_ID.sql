-- Migration: Add short_id to portfolios table
-- Run this in your Supabase SQL Editor

-- Add short_id column to portfolios table (without UNIQUE constraint initially)
ALTER TABLE public.portfolios 
ADD COLUMN short_id TEXT;

-- Create index for faster lookups
CREATE INDEX idx_portfolios_short_id ON public.portfolios(short_id);

-- Generate short IDs for existing portfolios with collision handling
-- This function ensures unique short IDs are generated
DO $$
DECLARE
    portfolio_record RECORD;
    new_short_id TEXT;
    attempts INTEGER;
    max_attempts INTEGER := 100;
BEGIN
    FOR portfolio_record IN SELECT id FROM public.portfolios WHERE short_id IS NULL LOOP
        attempts := 0;
        
        LOOP
            -- Generate a 6-character alphanumeric code
            new_short_id := (
                SELECT string_agg(
                    substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 
                           floor(random() * 62)::int + 1, 1), 
                    ''
                )
                FROM generate_series(1, 6)
            );
            
            -- Check if this short_id already exists
            IF NOT EXISTS (SELECT 1 FROM public.portfolios WHERE short_id = new_short_id) THEN
                -- Update the portfolio with the new short_id
                UPDATE public.portfolios 
                SET short_id = new_short_id 
                WHERE id = portfolio_record.id;
                EXIT; -- Exit the inner loop
            END IF;
            
            attempts := attempts + 1;
            IF attempts >= max_attempts THEN
                RAISE EXCEPTION 'Failed to generate unique short_id for portfolio % after % attempts', portfolio_record.id, max_attempts;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Add UNIQUE constraint after populating all records
ALTER TABLE public.portfolios 
ADD CONSTRAINT portfolios_short_id_key UNIQUE (short_id);

-- Add NOT NULL constraint after populating existing records
ALTER TABLE public.portfolios 
ALTER COLUMN short_id SET NOT NULL;
