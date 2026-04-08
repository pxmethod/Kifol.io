/**
 * Byte size for a highlight media item at index (aligns with media_urls / media_sizes).
 */
export function mediaFileSizeAtIndex(
  mediaSizes: number[] | string[] | null | undefined,
  index: number
): number {
  if (!mediaSizes || index < 0 || index >= mediaSizes.length) return 0;
  const n = Number(mediaSizes[index]);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.trunc(n), Number.MAX_SAFE_INTEGER);
}

/** Build a size array parallel to URLs (pad/truncate to match url length). */
export function alignMediaSizesToUrls(urls: string[], sizes: number[]): number[] {
  return urls.map((_, i) => {
    const v = sizes[i];
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) return 0;
    return Math.min(Math.trunc(v), Number.MAX_SAFE_INTEGER);
  });
}
