import { HIGHLIGHT_TYPES, type HighlightType } from '@/types/achievement';

const KNOWN_TYPES = new Set<HighlightType>(HIGHLIGHT_TYPES.map((t) => t.id));

/**
 * Maps a highlights table row to app `type` + `customTypeLabel`.
 *
 * Legacy fallback inserts (when `custom` enum/columns were unavailable) stored
 * user-defined types as `type = 'achievement'` with the label in `category`.
 */
export function deriveTypeAndCustomLabelFromHighlightRow(row: {
  type?: string | null;
  category?: string | null;
  custom_type_label?: string | null;
}): { type: HighlightType; customTypeLabel: string | null } {
  const rawType = row.type ?? '';
  const cat = row.category?.trim() || null;
  const label = row.custom_type_label?.trim() || null;

  if (rawType === 'custom') {
    if (!label && cat && cat !== 'milestone' && cat !== 'Custom') {
      return { type: 'custom', customTypeLabel: cat };
    }
    return { type: 'custom', customTypeLabel: label || null };
  }

  if (rawType === 'achievement' && cat && cat !== 'milestone') {
    if (cat === 'Custom') {
      return { type: 'custom', customTypeLabel: null };
    }
    return { type: 'custom', customTypeLabel: cat };
  }

  if (rawType === 'achievement' && label) {
    return { type: 'custom', customTypeLabel: label };
  }

  if (rawType && KNOWN_TYPES.has(rawType as HighlightType)) {
    return { type: rawType as HighlightType, customTypeLabel: null };
  }

  return { type: 'achievement', customTypeLabel: label };
}
