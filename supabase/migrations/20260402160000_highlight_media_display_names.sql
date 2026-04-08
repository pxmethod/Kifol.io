-- Original filenames for display (parallel to media_urls). Storage paths stay unique (e.g. timestamp prefix).
ALTER TABLE public.highlights
ADD COLUMN IF NOT EXISTS media_display_names text[];

COMMENT ON COLUMN public.highlights.media_display_names IS 'User-facing file names aligned by index with media_urls; null/empty falls back to URL path';
