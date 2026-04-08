import { mediaFileSizeAtIndex } from '@/lib/highlightMediaSizes';
import { mediaDisplayNameAtIndex } from '@/lib/highlightMediaDisplayNames';
import type { HighlightMedia } from '@/types/achievement';

/** Shared shape used when mapping DB highlight rows to portfolio achievement media. */
export function mapHighlightMediaForPortfolioView(highlight: {
  media_urls?: string[] | null;
  media_sizes?: number[] | null;
  media_display_names?: string[] | null;
}): HighlightMedia[] {
  return (highlight.media_urls || []).map((url: string, index: number): HighlightMedia => ({
    id: `media-${index}`,
    url,
    type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
    fileName: mediaDisplayNameAtIndex(highlight.media_display_names, index, url),
    fileSize: mediaFileSizeAtIndex(highlight.media_sizes, index),
  }));
}
