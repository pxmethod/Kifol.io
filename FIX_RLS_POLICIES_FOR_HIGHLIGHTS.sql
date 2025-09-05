-- Fix RLS policies for highlights table
-- This script only updates the RLS policies since the table rename was already done

-- Drop any existing policies that might be referencing the old achievements table
-- (These will fail silently if they don't exist, which is fine)
DROP POLICY IF EXISTS "Enable read access for all users" ON achievements;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON achievements;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON achievements;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON achievements;

-- Create new policies for highlights table
CREATE POLICY "Enable read access for all users" ON highlights FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON highlights FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON highlights FOR DELETE USING (auth.uid() = user_id);

-- Verification queries:
-- SELECT * FROM highlights LIMIT 5;
-- SELECT DISTINCT type FROM highlights;
