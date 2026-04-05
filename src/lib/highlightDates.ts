import type { Highlight } from '@/types/achievement';

/**
 * Parse YYYY-MM-DD or ISO date string as a local calendar day (avoids UTC off-by-one).
 */
export function parseHighlightDateLocal(iso: string): Date {
  const day = iso.includes('T') ? iso.split('T')[0] : iso.slice(0, 10);
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d || 1);
}

/** Display one day: Apr 4, 2026 */
export function formatHighlightCalendarDay(iso: string): string {
  return parseHighlightDateLocal(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Group key for sorting (newest months first via string sort): "2026-04" */
export function highlightDateToMonthSortKey(iso: string): string {
  const d = parseHighlightDateLocal(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Label for a month group key from highlightDateToMonthSortKey */
export function formatHighlightMonthYearFromSortKey(sortKey: string): string {
  const parts = sortKey.split('-');
  if (parts.length !== 2) return sortKey;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  if (Number.isNaN(y) || Number.isNaN(m)) return sortKey;
  return new Date(y, m, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Cards, modal, public portfolio: "Apr 4, 2026 - Apr 10, 2026" or "Apr 4, 2026 - present"
 */
export function formatHighlightDateDisplay(h: Pick<Highlight, 'date' | 'dateEnd' | 'ongoing'>): string {
  const start = formatHighlightCalendarDay(h.date);
  if (h.ongoing) {
    return `${start} - present`;
  }
  if (h.dateEnd) {
    return `${start} - ${formatHighlightCalendarDay(h.dateEnd)}`;
  }
  return start;
}

/** Compare YYYY-MM-DD strings as calendar order */
export function compareDateStrings(a: string, b: string): number {
  return parseHighlightDateLocal(a).getTime() - parseHighlightDateLocal(b).getTime();
}
