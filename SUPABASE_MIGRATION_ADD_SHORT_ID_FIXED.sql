-- Migration: Add short_id to portfolios table (Fixed Version)
-- Run this in your Supabase SQL Editor

-- Step 1: Clean up any existing short_id column and constraints
ALTER TABLE public.portfolios DROP COLUMN IF EXISTS short_id;
DROP INDEX IF EXISTS idx_portfolios_short_id;

-- Step 2: Add short_id column without any constraints
ALTER TABLE public.portfolios 
ADD COLUMN short_id TEXT;

-- Step 3: Create a function to generate unique short IDs
CREATE OR REPLACE FUNCTION generate_unique_short_id()
RETURNS TEXT AS $$
DECLARE
    new_short_id TEXT;
    attempts INTEGER := 0;
    max_attempts INTEGER := 1000;
BEGIN
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
            RETURN new_short_id;
        END IF;
        
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Failed to generate unique short_id after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update all portfolios with unique short IDs
UPDATE public.portfolios 
SET short_id = generate_unique_short_id()
WHERE short_id IS NULL;

-- Step 5: Add UNIQUE constraint after all records are populated
ALTER TABLE public.portfolios 
ADD CONSTRAINT portfolios_short_id_key UNIQUE (short_id);

-- Step 6: Add NOT NULL constraint
ALTER TABLE public.portfolios 
ALTER COLUMN short_id SET NOT NULL;

-- Step 7: Create index for faster lookups
CREATE INDEX idx_portfolios_short_id ON public.portfolios(short_id);

-- Step 8: Clean up the function
DROP FUNCTION generate_unique_short_id();
