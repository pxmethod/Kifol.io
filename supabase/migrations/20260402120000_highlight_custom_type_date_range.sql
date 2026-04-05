-- Custom highlight type, optional date range, custom type label; legacy rows use ongoing=true

ALTER TABLE public.highlights
  ADD COLUMN IF NOT EXISTS date_end text,
  ADD COLUMN IF NOT EXISTS ongoing boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_type_label text;

COMMENT ON COLUMN public.highlights.date_end IS 'End date (YYYY-MM-DD); null when ongoing is true';
COMMENT ON COLUMN public.highlights.ongoing IS 'When true, treat as open-ended (no end date); legacy highlights backfilled to true';
COMMENT ON COLUMN public.highlights.custom_type_label IS 'User label when type is custom';

-- Replace type check to include custom
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

-- Existing highlights: keep single date as start; treat as "currently working" (open-ended)
UPDATE public.highlights SET ongoing = true WHERE ongoing IS NOT DISTINCT FROM false;
