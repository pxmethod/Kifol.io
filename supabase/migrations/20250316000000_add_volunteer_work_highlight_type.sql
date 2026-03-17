-- Add 'volunteer_work' as a valid highlight type for the highlights table
-- Drops existing type check constraint (if any) and adds new one with volunteer_work

-- Drop any existing check constraint on the type column
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.highlights'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%type%'
  ) LOOP
    EXECUTE format('ALTER TABLE public.highlights DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- Add check constraint with all valid types including volunteer_work
ALTER TABLE public.highlights ADD CONSTRAINT highlights_type_check
  CHECK (type IN ('achievement', 'creative_work', 'milestone', 'activity', 'volunteer_work', 'reflection_note'));
