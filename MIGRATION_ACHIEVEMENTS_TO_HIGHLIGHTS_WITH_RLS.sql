-- Migration: Rename achievements table to highlights and add type column
-- This migration will:
-- 1. Rename the achievements table to highlights
-- 2. Add a type column with the new highlight types
-- 3. Migrate existing data with default type 'achievement'
-- 4. Update RLS policies for the new table name

-- Step 1: Add type column to achievements table
ALTER TABLE achievements 
ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'achievement';

-- Step 2: Add constraint to ensure type is one of the valid values
ALTER TABLE achievements 
ADD CONSTRAINT achievements_type_check 
CHECK (type IN ('achievement', 'creative_work', 'milestone', 'activity', 'reflection_note'));

-- Step 3: Rename the table from achievements to highlights
ALTER TABLE achievements RENAME TO highlights;

-- Step 4: Update RLS policies for the new highlights table
-- Drop existing policies on achievements (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON achievements;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON achievements;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON achievements;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON achievements;

-- Create new policies for highlights table
CREATE POLICY "Enable read access for all users" ON highlights FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON highlights FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON highlights FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Update any foreign key constraints that reference the old table name
-- (This may need to be done manually depending on your database setup)

-- Step 6: Update any indexes that reference the old table name
-- (This may need to be done manually depending on your database setup)

-- Verification queries:
-- SELECT * FROM highlights LIMIT 5;
-- SELECT DISTINCT type FROM highlights;
