-- Backfill custom highlights from legacy achievement+category storage.
-- Prereqs below are idempotent if 20260402120000_highlight_custom_type_date_range.sql already ran.

ALTER TABLE public.highlights
  ADD COLUMN IF NOT EXISTS custom_type_label text;

-- Allow type = 'custom' (required for the UPDATE below)
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

ALTER TABLE public.highlights ADD CONSTRAINT highlights_type_check
  CHECK (type IN (
    'achievement', 'creative_work', 'milestone', 'activity', 'volunteer_work',
    'reflection_note', 'custom'
  ));

-- Normalize rows that stored the custom label in category
UPDATE public.highlights
SET
  type = 'custom',
  custom_type_label = CASE
    WHEN trim(category) = 'Custom' THEN NULL
    ELSE trim(category)
  END,
  category = NULL
WHERE type = 'achievement'
  AND category IS NOT NULL
  AND trim(category) <> ''
  AND trim(category) <> 'milestone';
