-- Byte sizes for each media_urls entry (same order). Null for legacy rows until re-saved.
ALTER TABLE public.highlights
ADD COLUMN IF NOT EXISTS media_sizes bigint[];

COMMENT ON COLUMN public.highlights.media_sizes IS 'File sizes in bytes, aligned by index with media_urls';
