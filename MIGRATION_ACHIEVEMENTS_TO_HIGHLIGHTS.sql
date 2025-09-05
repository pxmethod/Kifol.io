-- Migration: Rename achievements table to highlights and add type column
-- This migration will:
-- 1. Rename the achievements table to highlights
-- 2. Add a type column with the new highlight types
-- 3. Migrate existing data with default type 'achievement'

-- Step 1: Add type column to achievements table
ALTER TABLE achievements 
ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'achievement';

-- Step 2: Add constraint to ensure type is one of the valid values
ALTER TABLE achievements 
ADD CONSTRAINT achievements_type_check 
CHECK (type IN ('achievement', 'creative_work', 'milestone', 'activity', 'reflection_note'));

-- Step 3: Rename the table from achievements to highlights
ALTER TABLE achievements RENAME TO highlights;

-- Step 4: Update any foreign key constraints that reference the old table name
-- (This may need to be done manually depending on your database setup)

-- Step 5: Update any indexes that reference the old table name
-- (This may need to be done manually depending on your database setup)

-- Step 6: Update RLS policies if they exist
-- (This may need to be done manually depending on your RLS setup)

-- Verification queries:
-- SELECT * FROM highlights LIMIT 5;
-- SELECT DISTINCT type FROM highlights;
