/**
 * Human-readable names for highlight attachments (parallel to media_urls).
 * Storage object keys may include timestamps; these names are what we show in the UI.
 */

export function filenameFromStorageUrl(url: string): string {
  try {
    const path = new URL(url).pathname.split('/').pop() || 'file';
    return decodeURIComponent(path);
  } catch {
    const part = url.split('/').pop() || 'file';
    return decodeURIComponent(part);
  }
}

export function mediaDisplayNameAtIndex(
  displayNames: string[] | null | undefined,
  index: number,
  url: string
): string {
  const entry = displayNames?.[index];
  if (typeof entry === 'string' && entry.trim()) return entry.trim();
  return filenameFromStorageUrl(url);
}

/** Build a display-name array the same length as urls (for persistence). */
export function alignMediaDisplayNamesToUrls(
  urls: string[],
  names: (string | null | undefined)[]
): string[] {
  return urls.map((url, i) => {
    const n = names[i];
    if (typeof n === 'string' && n.trim()) return n.trim();
    return filenameFromStorageUrl(url);
  });
}
